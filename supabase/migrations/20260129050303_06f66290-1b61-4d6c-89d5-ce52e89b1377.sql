-- Add scheduled_publish_at column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for efficient querying of scheduled posts
CREATE INDEX idx_blog_posts_scheduled_publish 
ON public.blog_posts (scheduled_publish_at) 
WHERE scheduled_publish_at IS NOT NULL AND is_published = false;