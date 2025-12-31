-- Insert AgentRouter AI provider
INSERT INTO public.ai_provider_settings (provider_name, provider_slug, api_endpoint, default_model, is_active)
VALUES (
  'AgentRouter',
  'agentrouter',
  'https://api.agentrouter.ai/v1/chat/completions',
  'google/gemini-2.5-flash',
  false
)
ON CONFLICT (provider_slug) DO NOTHING;