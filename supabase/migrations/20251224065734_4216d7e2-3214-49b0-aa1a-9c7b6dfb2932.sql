-- Add separate header and footer logo columns
ALTER TABLE public.site_settings 
ADD COLUMN header_logo_url TEXT,
ADD COLUMN footer_logo_url TEXT;

-- Migrate existing logo_url to both header and footer
UPDATE public.site_settings 
SET header_logo_url = logo_url, footer_logo_url = logo_url 
WHERE logo_url IS NOT NULL;