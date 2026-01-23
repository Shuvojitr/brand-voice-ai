-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_third_party_integrations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for third-party integrations/tracking codes
CREATE TABLE public.third_party_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'analytics',
  description TEXT,
  head_code TEXT,
  body_start_code TEXT,
  body_end_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.third_party_integrations ENABLE ROW LEVEL SECURITY;

-- Public read access for active integrations (needed to inject scripts)
CREATE POLICY "Anyone can read active integrations"
ON public.third_party_integrations
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage integrations"
ON public.third_party_integrations
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_third_party_integrations_updated_at
BEFORE UPDATE ON public.third_party_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_third_party_integrations_timestamp();

-- Insert common integrations as templates (inactive by default)
INSERT INTO public.third_party_integrations (name, slug, category, description, sort_order) VALUES
('Google Analytics (GA4)', 'google-analytics', 'analytics', 'Track page views, user behavior, and conversions with Google Analytics 4', 1),
('Google Tag Manager', 'google-tag-manager', 'analytics', 'Manage all your tracking tags from one place', 2),
('Google AdSense', 'google-adsense', 'advertising', 'Display ads and monetize your website', 3),
('Google Search Console', 'google-search-console', 'seo', 'Verify site ownership for Google Search Console', 4),
('Facebook Pixel', 'facebook-pixel', 'analytics', 'Track conversions and retarget users on Facebook/Meta platforms', 5),
('Microsoft Clarity', 'microsoft-clarity', 'analytics', 'Free heatmaps and session recordings', 6),
('Hotjar', 'hotjar', 'analytics', 'Heatmaps, recordings, and feedback tools', 7),
('Bing Webmaster', 'bing-webmaster', 'seo', 'Verify site ownership for Bing Webmaster Tools', 8),
('Pinterest Tag', 'pinterest-tag', 'analytics', 'Track conversions from Pinterest', 9),
('Twitter/X Pixel', 'twitter-pixel', 'analytics', 'Track conversions from Twitter/X', 10),
('LinkedIn Insight Tag', 'linkedin-insight', 'analytics', 'Track conversions from LinkedIn', 11),
('TikTok Pixel', 'tiktok-pixel', 'analytics', 'Track conversions from TikTok', 12),
('Intercom', 'intercom', 'support', 'Live chat and customer support widget', 13),
('Crisp Chat', 'crisp-chat', 'support', 'Live chat widget for customer support', 14),
('Mailchimp', 'mailchimp', 'marketing', 'Email marketing and popup forms', 15),
('Custom Script', 'custom-script', 'custom', 'Add any custom tracking or script code', 99);