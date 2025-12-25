-- Add feature flag for API to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN is_api_feature_enabled boolean NOT NULL DEFAULT true;