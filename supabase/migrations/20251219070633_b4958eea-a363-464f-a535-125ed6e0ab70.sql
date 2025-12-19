-- Create plans table for subscription plans management
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  interval text NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year', 'forever')),
  stripe_price_id text,
  features text[] NOT NULL DEFAULT '{}',
  credits integer NOT NULL DEFAULT 1000,
  is_active boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  cta_text text DEFAULT 'Get Started',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Public read access for active plans
CREATE POLICY "Anyone can view active plans"
ON public.plans
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage all plans"
ON public.plans
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Seed with current hardcoded plans
INSERT INTO public.plans (name, slug, description, price, currency, interval, features, credits, is_active, is_popular, sort_order, cta_text) VALUES
('Free', 'free', 'Perfect for trying out', 0, 'USD', 'forever', ARRAY['1,000 words/month', '5 templates', '1 brand voice'], 1000, true, false, 0, 'Get Started Free'),
('Starter', 'starter', 'For individuals', 19, 'USD', 'month', ARRAY['50,000 words/month', 'All templates', '3 brand voices', 'Email support'], 50000, true, false, 1, 'Start Starter'),
('Pro', 'pro', 'For professionals', 49, 'USD', 'month', ARRAY['100,000 words/month', 'All templates', 'Unlimited brand voices', 'Priority support', 'SEO optimization'], 100000, true, true, 2, 'Start Pro Trial'),
('Enterprise', 'enterprise', 'For teams', 149, 'USD', 'month', ARRAY['500,000 words/month', 'All Pro features', 'Unlimited team members', 'Custom templates', 'API access', 'Dedicated support'], 500000, true, false, 3, 'Contact Sales');