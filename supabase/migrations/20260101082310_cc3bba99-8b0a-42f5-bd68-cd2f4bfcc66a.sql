-- Add subscription_status column to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none';

-- Add remaining_credits column (replacing the credits_used approach)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS remaining_credits integer NOT NULL DEFAULT 0;

-- Rename has_used_free_plan to has_claimed_free_trial for clarity (optional, keeping both for compatibility)
-- The existing has_used_free_plan column will continue to work

-- Update existing organizations to have proper status based on current data
UPDATE public.organizations
SET subscription_status = CASE 
  WHEN subscription_tier = 'free' THEN 'active'
  WHEN subscription_ends_at IS NOT NULL AND subscription_ends_at > now() THEN 'active'
  WHEN subscription_ends_at IS NOT NULL AND subscription_ends_at <= now() THEN 'expired'
  ELSE 'none'
END,
remaining_credits = COALESCE(monthly_credits, 0) - COALESCE(credits_used, 0);

-- Create a function to check and update subscription status
CREATE OR REPLACE FUNCTION public.check_subscription_status(org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_record RECORD;
  result jsonb;
BEGIN
  -- Get the organization
  SELECT * INTO org_record FROM public.organizations WHERE id = org_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Organization not found');
  END IF;
  
  -- Check if subscription has expired
  IF org_record.subscription_ends_at IS NOT NULL 
     AND org_record.subscription_ends_at < now() 
     AND org_record.subscription_status = 'active' THEN
    -- Expire the subscription
    UPDATE public.organizations
    SET subscription_status = 'expired',
        remaining_credits = 0,
        updated_at = now()
    WHERE id = org_id;
    
    RETURN jsonb_build_object(
      'valid', false, 
      'error', 'Plan expired. Please renew your subscription.',
      'status', 'expired'
    );
  END IF;
  
  -- Check if expired status
  IF org_record.subscription_status = 'expired' THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'error', 'Plan expired. Please renew your subscription.',
      'status', 'expired'
    );
  END IF;
  
  -- Check if no active subscription
  IF org_record.subscription_status = 'none' THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'error', 'No active subscription. Please subscribe to a plan.',
      'status', 'none'
    );
  END IF;
  
  -- Check remaining credits
  IF org_record.remaining_credits <= 0 THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'error', 'No credits remaining. Please upgrade or wait for renewal.',
      'status', 'no_credits',
      'remaining_credits', 0
    );
  END IF;
  
  -- Subscription is valid
  RETURN jsonb_build_object(
    'valid', true,
    'status', org_record.subscription_status,
    'remaining_credits', org_record.remaining_credits,
    'ends_at', org_record.subscription_ends_at
  );
END;
$$;

-- Create a function to process subscription purchase/renewal
CREATE OR REPLACE FUNCTION public.process_subscription(
  org_id uuid,
  plan_slug text,
  plan_credits integer,
  is_yearly boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_record RECORD;
  new_end_date timestamptz;
  new_credits integer;
  duration_interval interval;
BEGIN
  -- Get the organization
  SELECT * INTO org_record FROM public.organizations WHERE id = org_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Organization not found');
  END IF;
  
  -- Check for free plan restrictions
  IF plan_slug = 'free' THEN
    IF org_record.has_used_free_plan THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Free plan can only be claimed once. Please choose a paid plan.'
      );
    END IF;
  END IF;
  
  -- Calculate duration
  IF is_yearly THEN
    duration_interval := interval '1 year';
  ELSE
    duration_interval := interval '1 month';
  END IF;
  
  -- Calculate new credits and end date based on current status
  IF org_record.subscription_status = 'active' 
     AND org_record.subscription_ends_at IS NOT NULL 
     AND org_record.subscription_ends_at > now() THEN
    -- ROLLOVER: User renewing while still active
    new_credits := COALESCE(org_record.remaining_credits, 0) + plan_credits;
    new_end_date := org_record.subscription_ends_at + duration_interval;
  ELSE
    -- NEW or EXPIRED: Start fresh
    new_credits := plan_credits;
    new_end_date := now() + duration_interval;
  END IF;
  
  -- Update the organization
  UPDATE public.organizations
  SET subscription_tier = plan_slug::subscription_tier,
      subscription_status = 'active',
      remaining_credits = new_credits,
      monthly_credits = plan_credits,
      credits_used = 0,
      subscription_ends_at = new_end_date,
      has_used_free_plan = CASE WHEN plan_slug = 'free' THEN true ELSE has_used_free_plan END,
      updated_at = now()
  WHERE id = org_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'remaining_credits', new_credits,
    'ends_at', new_end_date,
    'rollover_applied', (org_record.subscription_status = 'active' AND org_record.subscription_ends_at > now())
  );
END;
$$;

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(org_id uuid, credits_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_record RECORD;
  status_check jsonb;
BEGIN
  -- First check subscription status
  status_check := check_subscription_status(org_id);
  
  IF NOT (status_check->>'valid')::boolean THEN
    RETURN status_check;
  END IF;
  
  -- Get current credits
  SELECT remaining_credits INTO org_record FROM public.organizations WHERE id = org_id;
  
  IF org_record.remaining_credits < credits_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'remaining_credits', org_record.remaining_credits,
      'required', credits_amount
    );
  END IF;
  
  -- Deduct credits
  UPDATE public.organizations
  SET remaining_credits = remaining_credits - credits_amount,
      credits_used = credits_used + credits_amount,
      updated_at = now()
  WHERE id = org_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'remaining_credits', org_record.remaining_credits - credits_amount,
    'deducted', credits_amount
  );
END;
$$;