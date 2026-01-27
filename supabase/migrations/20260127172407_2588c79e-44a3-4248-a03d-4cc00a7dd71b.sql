-- Add confirmation fields to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation_token ON public.newsletter_subscribers(confirmation_token);

-- Update policy to allow updates for confirmation (public can confirm their own subscription via token)
CREATE POLICY "Anyone can confirm their subscription via token" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (true)
WITH CHECK (
  -- Only allow updating confirmation fields
  is_confirmed = true AND confirmed_at IS NOT NULL
);