-- Create themes table to store predefined themes
CREATE TABLE public.themes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT false,
  colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  fonts jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Anyone can read themes
CREATE POLICY "Anyone can read themes"
ON public.themes
FOR SELECT
USING (true);

-- Only admins can manage themes
CREATE POLICY "Admins can manage themes"
ON public.themes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON public.themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default themes
INSERT INTO public.themes (name, slug, description, is_active, colors, fonts) VALUES
(
  'Creative Playful',
  'creative-playful',
  'Vibrant and fun with coral, purple, and yellow accents',
  true,
  '{
    "primary": "12 95% 65%",
    "primary-foreground": "0 0% 100%",
    "secondary": "267 84% 81%",
    "accent": "45 93% 58%",
    "background": "40 33% 98%",
    "foreground": "240 10% 10%",
    "muted": "40 20% 94%",
    "muted-foreground": "240 5% 45%",
    "card": "0 0% 100%",
    "card-foreground": "240 10% 10%",
    "border": "40 20% 90%"
  }'::jsonb,
  '{"heading": "Space Grotesk", "body": "Outfit"}'::jsonb
),
(
  'Ocean Blue',
  'ocean-blue',
  'Calm and professional with blue tones',
  false,
  '{
    "primary": "210 100% 50%",
    "primary-foreground": "0 0% 100%",
    "secondary": "200 80% 70%",
    "accent": "180 70% 50%",
    "background": "210 20% 98%",
    "foreground": "220 20% 10%",
    "muted": "210 15% 94%",
    "muted-foreground": "220 10% 45%",
    "card": "0 0% 100%",
    "card-foreground": "220 20% 10%",
    "border": "210 15% 90%"
  }'::jsonb,
  '{"heading": "Inter", "body": "Inter"}'::jsonb
),
(
  'Forest Green',
  'forest-green',
  'Natural and earthy with green accents',
  false,
  '{
    "primary": "142 70% 40%",
    "primary-foreground": "0 0% 100%",
    "secondary": "120 40% 70%",
    "accent": "45 80% 55%",
    "background": "90 20% 98%",
    "foreground": "150 20% 10%",
    "muted": "90 15% 94%",
    "muted-foreground": "150 10% 45%",
    "card": "0 0% 100%",
    "card-foreground": "150 20% 10%",
    "border": "90 15% 90%"
  }'::jsonb,
  '{"heading": "Poppins", "body": "Open Sans"}'::jsonb
),
(
  'Midnight Purple',
  'midnight-purple',
  'Elegant and modern with purple gradients',
  false,
  '{
    "primary": "270 70% 55%",
    "primary-foreground": "0 0% 100%",
    "secondary": "290 60% 70%",
    "accent": "320 70% 60%",
    "background": "270 15% 98%",
    "foreground": "270 20% 10%",
    "muted": "270 10% 94%",
    "muted-foreground": "270 10% 45%",
    "card": "0 0% 100%",
    "card-foreground": "270 20% 10%",
    "border": "270 10% 90%"
  }'::jsonb,
  '{"heading": "Montserrat", "body": "Lato"}'::jsonb
),
(
  'Sunset Orange',
  'sunset-orange',
  'Warm and energetic with orange and red tones',
  false,
  '{
    "primary": "25 95% 55%",
    "primary-foreground": "0 0% 100%",
    "secondary": "35 90% 65%",
    "accent": "15 85% 50%",
    "background": "30 25% 98%",
    "foreground": "25 20% 10%",
    "muted": "30 15% 94%",
    "muted-foreground": "25 10% 45%",
    "card": "0 0% 100%",
    "card-foreground": "25 20% 10%",
    "border": "30 15% 90%"
  }'::jsonb,
  '{"heading": "DM Sans", "body": "DM Sans"}'::jsonb
),
(
  'Minimal Slate',
  'minimal-slate',
  'Clean and minimal with neutral grays',
  false,
  '{
    "primary": "220 15% 25%",
    "primary-foreground": "0 0% 100%",
    "secondary": "220 10% 70%",
    "accent": "220 80% 55%",
    "background": "0 0% 100%",
    "foreground": "220 15% 10%",
    "muted": "220 10% 96%",
    "muted-foreground": "220 10% 45%",
    "card": "0 0% 100%",
    "card-foreground": "220 15% 10%",
    "border": "220 10% 92%"
  }'::jsonb,
  '{"heading": "Geist", "body": "Geist"}'::jsonb
);