-- Add SEO columns to site_settings table
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS seo_title text DEFAULT 'MyGenAI - AI Content Generator',
ADD COLUMN IF NOT EXISTS seo_description text DEFAULT 'AI-powered content creation platform that helps you create engaging content in seconds.',
ADD COLUMN IF NOT EXISTS seo_keywords text DEFAULT 'AI, content generator, writing assistant, AI writer',
ADD COLUMN IF NOT EXISTS og_image_url text,
ADD COLUMN IF NOT EXISTS twitter_handle text DEFAULT '@MyGenAI';