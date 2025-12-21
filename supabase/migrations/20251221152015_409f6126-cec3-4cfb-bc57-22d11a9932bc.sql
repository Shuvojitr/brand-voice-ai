-- Create site_settings table for managing header/footer appearance
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url text,
  site_name text NOT NULL DEFAULT 'MyGenAI',
  site_description text DEFAULT 'AI-powered content creation platform that helps you create engaging content in seconds.',
  header_nav jsonb NOT NULL DEFAULT '[{"label": "Home", "href": "/"}, {"label": "Templates", "href": "/templates"}, {"label": "Pricing", "href": "/pricing"}]'::jsonb,
  footer_nav jsonb NOT NULL DEFAULT '[{"title": "Product", "links": [{"label": "Templates", "href": "/templates"}, {"label": "Pricing", "href": "/pricing"}]}, {"title": "Resources", "links": [{"label": "Documentation", "href": "/docs"}, {"label": "Blog", "href": "/blog"}]}, {"title": "Company", "links": [{"label": "About", "href": "/about"}, {"label": "Contact", "href": "/contact"}]}, {"title": "Legal", "links": [{"label": "Privacy", "href": "/privacy"}, {"label": "Terms", "href": "/terms"}]}]'::jsonb,
  social_links jsonb NOT NULL DEFAULT '[{"platform": "twitter", "url": ""}, {"platform": "linkedin", "url": ""}, {"platform": "github", "url": ""}]'::jsonb,
  copyright_text text DEFAULT '© 2025 MyGenAI. All rights reserved.',
  bottom_tagline text DEFAULT 'Made with ❤️ for content creators.',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (public)
CREATE POLICY "Anyone can read site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can manage site settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings row
INSERT INTO public.site_settings (site_name, site_description, copyright_text, bottom_tagline)
VALUES ('MyGenAI', 'AI-powered content creation platform that helps you create engaging content in seconds.', '© 2025 MyGenAI. All rights reserved.', 'Made with ❤️ for content creators.');

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();