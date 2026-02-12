-- Add author_user_id column to blog_posts referencing profiles
ALTER TABLE public.blog_posts
ADD COLUMN author_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_blog_posts_author_user_id ON public.blog_posts(author_user_id);
