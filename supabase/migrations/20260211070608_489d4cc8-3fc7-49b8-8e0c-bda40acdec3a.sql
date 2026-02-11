
-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on lowercase name for case-insensitive uniqueness
CREATE UNIQUE INDEX idx_blog_categories_name_lower ON public.blog_categories (LOWER(name));

-- Create index on slug
CREATE INDEX idx_blog_categories_slug ON public.blog_categories (slug);

-- Create index on parent_id for hierarchy queries
CREATE INDEX idx_blog_categories_parent_id ON public.blog_categories (parent_id);

-- Create post_categories pivot table for many-to-many
CREATE TABLE public.post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, category_id)
);

-- Create indexes on pivot table
CREATE INDEX idx_post_categories_post_id ON public.post_categories (post_id);
CREATE INDEX idx_post_categories_category_id ON public.post_categories (category_id);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- blog_categories RLS policies
CREATE POLICY "Admins can manage blog categories"
  ON public.blog_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can manage blog categories"
  ON public.blog_categories FOR ALL
  USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Anyone can read active blog categories"
  ON public.blog_categories FOR SELECT
  USING (is_active = true);

-- post_categories RLS policies
CREATE POLICY "Admins can manage post categories"
  ON public.post_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can manage post categories"
  ON public.post_categories FOR ALL
  USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Anyone can read post categories"
  ON public.post_categories FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
