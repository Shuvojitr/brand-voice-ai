-- Create template_categories table
CREATE TABLE public.template_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text DEFAULT 'Folder',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create template_icons table
CREATE TABLE public.template_icons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_icons ENABLE ROW LEVEL SECURITY;

-- RLS policies for template_categories
CREATE POLICY "Admins can manage template categories"
ON public.template_categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active template categories"
ON public.template_categories FOR SELECT
USING (is_active = true);

-- RLS policies for template_icons
CREATE POLICY "Admins can manage template icons"
ON public.template_icons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active template icons"
ON public.template_icons FOR SELECT
USING (is_active = true);

-- Insert default categories
INSERT INTO public.template_categories (value, label, icon, sort_order) VALUES
  ('blog', 'Blog', 'FileText', 1),
  ('social', 'Social Media', 'Share2', 2),
  ('ads', 'Ads', 'Target', 3),
  ('email', 'Email', 'Mail', 4),
  ('seo', 'SEO', 'Search', 5),
  ('product', 'Product', 'Package', 6),
  ('website', 'Website', 'Globe', 7);

-- Insert default icons
INSERT INTO public.template_icons (name, sort_order) VALUES
  ('FileText', 1),
  ('List', 2),
  ('Linkedin', 3),
  ('Twitter', 4),
  ('Instagram', 5),
  ('Target', 6),
  ('Facebook', 7),
  ('Mail', 8),
  ('Send', 9),
  ('Package', 10),
  ('Search', 11),
  ('MessageSquare', 12),
  ('Globe', 13),
  ('Zap', 14),
  ('Video', 15),
  ('Image', 16),
  ('Code', 17),
  ('Newspaper', 18),
  ('PenTool', 19),
  ('Sparkles', 20),
  ('MessageCircle', 21),
  ('Share2', 22),
  ('Megaphone', 23),
  ('TrendingUp', 24),
  ('BarChart', 25);

-- Add updated_at trigger for template_categories
CREATE TRIGGER update_template_categories_updated_at
  BEFORE UPDATE ON public.template_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();