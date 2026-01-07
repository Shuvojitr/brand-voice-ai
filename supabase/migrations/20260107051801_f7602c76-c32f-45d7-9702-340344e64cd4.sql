-- Rename features to features_monthly (preserving existing data)
ALTER TABLE public.plans RENAME COLUMN features TO features_monthly;

-- Add features_yearly column with same type
ALTER TABLE public.plans ADD COLUMN features_yearly TEXT[] NOT NULL DEFAULT '{}'::text[];

-- Copy existing monthly features to yearly as a starting point
UPDATE public.plans SET features_yearly = features_monthly;

-- Add comments
COMMENT ON COLUMN public.plans.features_monthly IS 'Features list for monthly subscription';
COMMENT ON COLUMN public.plans.features_yearly IS 'Features list for yearly subscription';