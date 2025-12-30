-- Add model column to templates table for per-template AI model selection
ALTER TABLE public.templates
ADD COLUMN model text DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.templates.model IS 'Optional AI model override for this template. If null, uses the default provider model.';