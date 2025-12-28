-- Add column for multi-size favicons (JSON object with different sizes)
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS favicon_sizes JSONB DEFAULT NULL;

-- Comment explaining the structure
COMMENT ON COLUMN public.site_settings.favicon_sizes IS 'Stores URLs for different favicon sizes: { "16": "url", "32": "url", "48": "url", "180": "url" }';