-- Create a table for live chat settings
CREATE TABLE public.live_chat_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled boolean NOT NULL DEFAULT true,
  business_hours_start time NOT NULL DEFAULT '09:00:00',
  business_hours_end time NOT NULL DEFAULT '17:00:00',
  business_days integer[] NOT NULL DEFAULT '{1,2,3,4,5}', -- Monday=1 to Sunday=7
  timezone text NOT NULL DEFAULT 'UTC',
  offline_message text NOT NULL DEFAULT 'Our support team is currently offline. Please submit a support ticket and we will get back to you as soon as possible.',
  auto_reply_enabled boolean NOT NULL DEFAULT true,
  auto_reply_delay_seconds integer NOT NULL DEFAULT 120,
  auto_reply_message text NOT NULL DEFAULT 'Thank you for waiting. Our team is currently busy. You can also submit a support ticket for faster assistance.',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_chat_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for the widget)
CREATE POLICY "Anyone can read live chat settings"
  ON public.live_chat_settings
  FOR SELECT
  USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage live chat settings"
  ON public.live_chat_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings row
INSERT INTO public.live_chat_settings (id) VALUES ('00000000-0000-0000-0000-000000000001');