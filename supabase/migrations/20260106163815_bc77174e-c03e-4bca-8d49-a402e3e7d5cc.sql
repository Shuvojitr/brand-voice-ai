-- Add billing interval tracking to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS is_yearly_subscription BOOLEAN DEFAULT false;