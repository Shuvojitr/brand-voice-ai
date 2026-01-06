-- Add yearly pricing columns to plans table
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS price_yearly NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS credits_yearly INTEGER DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.plans.price_yearly IS 'Yearly price for the plan (total annual cost)';
COMMENT ON COLUMN public.plans.stripe_price_id_yearly IS 'Stripe Price ID for yearly billing';
COMMENT ON COLUMN public.plans.credits_yearly IS 'Credits for yearly subscription (null = 12x monthly)';