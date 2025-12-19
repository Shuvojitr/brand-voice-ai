-- Add yearly_discount column to plans table
ALTER TABLE public.plans ADD COLUMN yearly_discount integer NOT NULL DEFAULT 20;

-- Update existing plans with default discounts
UPDATE public.plans SET yearly_discount = 0 WHERE slug = 'free';
UPDATE public.plans SET yearly_discount = 15 WHERE slug = 'starter';
UPDATE public.plans SET yearly_discount = 20 WHERE slug = 'pro';
UPDATE public.plans SET yearly_discount = 25 WHERE slug = 'enterprise';