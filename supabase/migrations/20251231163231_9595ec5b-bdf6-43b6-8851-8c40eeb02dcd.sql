-- Add subscription expiration date column to organizations
ALTER TABLE public.organizations 
ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create function to expire subscriptions
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update organizations where subscription has expired
  UPDATE public.organizations
  SET 
    subscription_tier = 'free',
    monthly_credits = 0,
    credits_used = 0,
    subscription_ends_at = NULL,
    updated_at = now()
  WHERE 
    subscription_ends_at IS NOT NULL 
    AND subscription_ends_at < now()
    AND subscription_tier != 'free';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.expire_subscriptions() TO service_role;