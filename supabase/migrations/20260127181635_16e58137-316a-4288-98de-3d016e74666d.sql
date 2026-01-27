-- Add draft columns to blog_posts table for revision system
ALTER TABLE public.blog_posts
ADD COLUMN draft_title TEXT,
ADD COLUMN draft_excerpt TEXT,
ADD COLUMN draft_content TEXT,
ADD COLUMN draft_featured_image TEXT,
ADD COLUMN has_pending_changes BOOLEAN DEFAULT false;