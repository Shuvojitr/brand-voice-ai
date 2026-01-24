-- Create blog_posts table for landing page blog section
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT DEFAULT 'General',
  author_name TEXT DEFAULT 'Admin',
  author_avatar TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  read_time_minutes INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Published blog posts are viewable by everyone"
  ON public.blog_posts
  FOR SELECT
  USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage all blog posts"
  ON public.blog_posts
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Manager full access
CREATE POLICY "Managers can manage all blog posts"
  ON public.blog_posts
  FOR ALL
  USING (public.has_role(auth.uid(), 'manager'::app_role));

-- Create updated_at trigger using existing function
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Seed with sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, author_name, is_published, is_featured, published_at, read_time_minutes, tags)
VALUES
  ('Getting Started with AI Content Writing', 'getting-started-ai-content', 'Learn how to leverage AI to create compelling content that engages your audience and saves you hours of work.', 'Full article content here...', 'Tutorial', 'Admin', true, true, now(), 5, ARRAY['AI', 'Content Writing', 'Getting Started']),
  ('10 Tips for Better Blog Posts', '10-tips-better-blog-posts', 'Discover the secrets to writing blog posts that rank higher and keep readers engaged from start to finish.', 'Full article content here...', 'Tips & Tricks', 'Admin', true, true, now(), 7, ARRAY['Blogging', 'SEO', 'Writing Tips']),
  ('The Future of AI in Marketing', 'future-ai-marketing', 'Explore how artificial intelligence is transforming digital marketing and what it means for your business.', 'Full article content here...', 'Industry News', 'Admin', true, false, now(), 10, ARRAY['AI', 'Marketing', 'Future Trends']),
  ('How to Create Viral Social Media Content', 'viral-social-media-content', 'Master the art of creating shareable content that resonates with your audience across all platforms.', 'Full article content here...', 'Social Media', 'Admin', true, false, now(), 6, ARRAY['Social Media', 'Viral Content', 'Marketing']);