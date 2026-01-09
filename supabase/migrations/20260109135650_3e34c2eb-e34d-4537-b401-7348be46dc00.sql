-- Update handle_new_user function to start users with "No Plan" state
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

  -- Create personal organization with No Plan state (0 credits, can claim free plan later)
  INSERT INTO public.organizations (name, slug, subscription_tier, subscription_status, monthly_credits, credits_used, remaining_credits, has_used_free_plan)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'My Organization'),
    org_slug,
    NULL,
    'none',
    0,
    0,
    0,
    false
  )
  RETURNING id INTO new_org_id;

  -- Add user as owner of the organization
  INSERT INTO public.organization_members (user_id, organization_id, role)
  VALUES (NEW.id, new_org_id, 'owner');

  RETURN NEW;
END;
$function$;