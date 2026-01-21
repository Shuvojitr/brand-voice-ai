-- Create analytics_events table for comprehensive tracking
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Session & User Identification
  session_id text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  anonymous_id text, -- For non-logged in users
  is_new_visitor boolean DEFAULT true,
  
  -- Event Details
  event_type text NOT NULL, -- 'page_view', 'click', 'form_submit', 'signup', 'subscription', 'content_generate'
  event_name text, -- Specific event name like 'signup_completed', 'plan_upgraded'
  
  -- Page Information
  page_path text,
  page_title text,
  previous_page_path text,
  
  -- Acquisition Data
  referrer text,
  referrer_domain text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  traffic_source text, -- 'organic', 'paid', 'social', 'referral', 'direct', 'email'
  
  -- Device & Browser
  device_type text, -- 'desktop', 'mobile', 'tablet'
  browser text,
  browser_version text,
  operating_system text,
  screen_width integer,
  screen_height integer,
  
  -- Location (derived from IP in edge function)
  country text,
  city text,
  region text,
  
  -- Engagement Metrics
  time_on_page integer, -- in seconds
  scroll_depth integer, -- percentage 0-100
  
  -- Conversion Data
  conversion_type text, -- 'signup', 'subscription', 'content_generation'
  conversion_value numeric,
  
  -- Additional Data
  properties jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_page_path ON public.analytics_events(page_path);
CREATE INDEX idx_analytics_events_traffic_source ON public.analytics_events(traffic_source);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public can insert analytics events (from tracking script)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admins can view all analytics"
ON public.analytics_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete old analytics (cleanup)
CREATE POLICY "Admins can delete analytics"
ON public.analytics_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create aggregated analytics views for performance
CREATE TABLE public.analytics_daily_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,
  
  -- Visitor Stats
  total_visitors integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  new_visitors integer DEFAULT 0,
  returning_visitors integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  
  -- Engagement Stats
  total_page_views integer DEFAULT 0,
  avg_session_duration integer DEFAULT 0, -- seconds
  avg_pages_per_session numeric DEFAULT 0,
  bounce_rate numeric DEFAULT 0, -- percentage
  
  -- Traffic Sources
  organic_visits integer DEFAULT 0,
  paid_visits integer DEFAULT 0,
  social_visits integer DEFAULT 0,
  referral_visits integer DEFAULT 0,
  direct_visits integer DEFAULT 0,
  email_visits integer DEFAULT 0,
  
  -- Device Stats
  desktop_visits integer DEFAULT 0,
  mobile_visits integer DEFAULT 0,
  tablet_visits integer DEFAULT 0,
  
  -- Conversion Stats
  signups integer DEFAULT 0,
  subscriptions integer DEFAULT 0,
  content_generations integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for daily stats
ALTER TABLE public.analytics_daily_stats ENABLE ROW LEVEL SECURITY;

-- Only admins can access daily stats
CREATE POLICY "Admins can manage daily stats"
ON public.analytics_daily_stats
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for analytics events
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;