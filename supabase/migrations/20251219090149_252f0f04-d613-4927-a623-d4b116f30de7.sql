-- Add monthly_discount column to plans table
ALTER TABLE public.plans 
ADD COLUMN monthly_discount INTEGER NOT NULL DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.plans.monthly_discount IS 'Discount percentage applied to monthly billing';