-- Create table for AI provider settings
CREATE TABLE public.ai_provider_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  provider_slug text NOT NULL UNIQUE,
  api_key_encrypted text,
  api_endpoint text,
  default_model text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage AI settings
CREATE POLICY "Admins can manage AI provider settings"
ON public.ai_provider_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_ai_provider_settings_updated_at
  BEFORE UPDATE ON public.ai_provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default providers (without API keys)
INSERT INTO public.ai_provider_settings (provider_name, provider_slug, api_endpoint, default_model, is_active) VALUES
  ('Lovable AI', 'lovable', 'https://ai.gateway.lovable.dev/v1/chat/completions', 'google/gemini-2.5-flash', true),
  ('OpenAI', 'openai', 'https://api.openai.com/v1/chat/completions', 'gpt-4o', false),
  ('Google AI', 'google', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', 'gemini-2.0-flash', false),
  ('Anthropic Claude', 'anthropic', 'https://api.anthropic.com/v1/messages', 'claude-sonnet-4-20250514', false),
  ('DeepSeek', 'deepseek', 'https://api.deepseek.com/v1/chat/completions', 'deepseek-chat', false),
  ('OpenRouter', 'openrouter', 'https://openrouter.ai/api/v1/chat/completions', 'openai/gpt-4o', false),
  ('Mistral', 'mistral', 'https://api.mistral.ai/v1/chat/completions', 'mistral-large-latest', false),
  ('Bytez', 'bytez', 'https://api.bytez.com/models/v2', 'Qwen/Qwen2.5-72B-Instruct', false);