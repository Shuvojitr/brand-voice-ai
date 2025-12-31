-- Add column to track if organization has used free plan
ALTER TABLE public.organizations 
ADD COLUMN has_used_free_plan boolean NOT NULL DEFAULT false;

-- Set existing organizations to true since they've already used free plan on signup
UPDATE public.organizations SET has_used_free_plan = true;

-- Update the handle_new_user function to mark free plan as used
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id uuid;
  org_slug text;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  -- Generate unique slug from email
  org_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::text, 1, 8);

  -- Create personal organization with free plan marked as used
  INSERT INTO public.organizations (name, slug, subscription_tier, monthly_credits, credits_used, has_used_free_plan)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'My Organization'),
    org_slug,
    'free',
    1000,
    0,
    true
  )
  RETURNING id INTO new_org_id;

  -- Add user as owner of the organization
  INSERT INTO public.organization_members (user_id, organization_id, role)
  VALUES (NEW.id, new_org_id, 'owner');

  RETURN NEW;
END;
$function$;

-- Update the expire_subscriptions function to not give credits if free plan was used
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update organizations where subscription has expired
  -- If they've used free plan before, they get 0 credits
  UPDATE public.organizations
  SET 
    subscription_tier = 'free',
    monthly_credits = CASE WHEN has_used_free_plan THEN 0 ELSE 1000 END,
    credits_used = 0,
    subscription_ends_at = NULL,
    has_used_free_plan = true,
    updated_at = now()
  WHERE 
    subscription_ends_at IS NOT NULL 
    AND subscription_ends_at < now()
    AND subscription_tier != 'free';
END;
$function$;