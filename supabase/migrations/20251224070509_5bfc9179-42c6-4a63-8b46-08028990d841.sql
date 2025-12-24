-- Add favicon_url column for browser tab icon customization
ALTER TABLE public.site_settings 
ADD COLUMN favicon_url TEXT;