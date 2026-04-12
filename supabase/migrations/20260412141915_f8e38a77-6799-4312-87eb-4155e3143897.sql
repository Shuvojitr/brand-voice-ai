
-- Create payment_providers table
CREATE TABLE public.payment_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  provider_type text NOT NULL DEFAULT 'manual',
  description text,
  logo_url text,
  api_key_encrypted text,
  api_secret_encrypted text,
  webhook_secret_encrypted text,
  webhook_url text,
  mode text NOT NULL DEFAULT 'test' CHECK (mode IN ('test', 'live')),
  is_active boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  supported_currencies text[] NOT NULL DEFAULT ARRAY['USD']::text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment providers"
  ON public.payment_providers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active payment providers"
  ON public.payment_providers FOR SELECT
  USING (is_active = true);

-- Create plan_prices table (maps plans to provider-specific identifiers)
CREATE TABLE public.plan_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.payment_providers(id) ON DELETE CASCADE,
  price_identifier text,
  price_identifier_yearly text,
  currency text NOT NULL DEFAULT 'USD',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id, provider_id, currency)
);

ALTER TABLE public.plan_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage plan prices"
  ON public.plan_prices FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active plan prices"
  ON public.plan_prices FOR SELECT
  USING (is_active = true);

-- Remove Stripe-specific columns from plans table
ALTER TABLE public.plans DROP COLUMN IF EXISTS stripe_price_id;
ALTER TABLE public.plans DROP COLUMN IF EXISTS stripe_price_id_yearly;

-- Seed default provider templates (inactive by default)
INSERT INTO public.payment_providers (name, slug, provider_type, description, sort_order) VALUES
  ('Stripe', 'stripe', 'stripe', 'Accept credit cards, debit cards, and more via Stripe.', 1),
  ('Lemon Squeezy', 'lemon-squeezy', 'lemon_squeezy', 'Merchant of record for SaaS and digital products.', 2),
  ('Paddle', 'paddle', 'paddle', 'Complete payments infrastructure for SaaS.', 3),
  ('Razorpay', 'razorpay', 'razorpay', 'Payment gateway for Indian businesses.', 4),
  ('bKash', 'bkash', 'manual', 'Mobile financial service in Bangladesh.', 5),
  ('Bank Transfer', 'bank-transfer', 'manual', 'Direct bank transfer / wire payment.', 6);
