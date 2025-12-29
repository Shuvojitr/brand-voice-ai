import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  templateId: string;
  inputs: Record<string, string | number | boolean>;
  brandVoiceId?: string;
  language?: 'en' | 'bn';
  organizationId: string;
  model?: string;
  temperature?: number;
  stream?: boolean;
  skipCreditDeduction?: boolean;
}

interface AiProviderSettings {
  provider_slug: string;
  api_key_encrypted: string | null;
  api_endpoint: string | null;
  default_model: string | null;
}

async function callAnthropicApi(
  apiKey: string,
  endpoint: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  stream: boolean
) {
  // Anthropic has a different API format
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMessage?.content || '',
      messages: userMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      stream,
    }),
  });

  return response;
}

async function callOpenAICompatibleApi(
  apiKey: string,
  endpoint: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  stream: boolean
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream,
    }),
  });

  return response;
}

async function callBytezApi(
  apiKey: string,
  endpoint: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  stream: boolean
) {
  // Bytez has a different endpoint format
  const response = await fetch(`${endpoint}/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      params: { temperature },
      stream,
    }),
  });

  return response;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is banned
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[generate-content] Profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to verify account status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile?.is_banned) {
      console.log(`[generate-content] Banned user attempted generation: ${user.id}`);
      return new Response(JSON.stringify({ error: 'Your account has been suspended. Please contact support.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const body: GenerateRequest = await req.json();
    const { 
      templateId, 
      inputs, 
      brandVoiceId, 
      language = 'en', 
      organizationId,
      temperature = 0.7,
      stream = true,
    } = body;

    console.log(`[generate-content] User: ${user.id}, Template: ${templateId}, Org: ${organizationId}`);

    // Fetch active AI provider settings
    const { data: activeProvider, error: providerError } = await supabase
      .from('ai_provider_settings')
      .select('provider_slug, api_key_encrypted, api_endpoint, default_model')
      .eq('is_active', true)
      .single();

    if (providerError) {
      console.error('[generate-content] Failed to fetch AI provider settings:', providerError);
    }

    const provider: AiProviderSettings = activeProvider || {
      provider_slug: 'lovable',
      api_key_encrypted: null,
      api_endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
      default_model: 'google/gemini-2.5-flash',
    };

    // Use request model or fall back to provider default
    const model = body.model || provider.default_model || 'google/gemini-2.5-flash';

    console.log(`[generate-content] Using provider: ${provider.provider_slug}, model: ${model}`);

    // Fetch template from database
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('system_prompt, estimated_credits, is_active')
      .eq('slug', templateId)
      .single();

    if (templateError || !template) {
      console.error('[generate-content] Template not found:', templateId);
      return new Response(JSON.stringify({ error: `Unknown template: ${templateId}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!template.is_active) {
      return new Response(JSON.stringify({ error: 'This template is currently disabled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = template.system_prompt;

    // Verify user is member of organization
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Not a member of this organization' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check organization credits
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('monthly_credits, credits_used')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const creditsAvailable = (org.monthly_credits || 0) - (org.credits_used || 0);
    const skipCreditDeduction = body.skipCreditDeduction === true;

    // Check if user has at least some credits before starting
    if (!skipCreditDeduction && creditsAvailable <= 0) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient credits',
        creditsNeeded: 1,
        creditsAvailable,
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch brand voice if specified
    let brandVoiceInstructions = '';
    if (brandVoiceId) {
      const { data: brandVoice } = await supabase
        .from('brand_voices')
        .select('name, tone_keywords, style_instructions, sample_text, language')
        .eq('id', brandVoiceId)
        .eq('organization_id', organizationId)
        .single();

      if (brandVoice) {
        const toneText = brandVoice.tone_keywords?.length 
          ? `Tone: ${brandVoice.tone_keywords.join(', ')}.` 
          : '';
        
        brandVoiceInstructions = `

---
BRAND VOICE GUIDELINES - FOLLOW THESE CAREFULLY:
Voice Name: "${brandVoice.name}"
${toneText}
${brandVoice.style_instructions ? `
STYLE INSTRUCTIONS:
${brandVoice.style_instructions}
` : ''}
${brandVoice.sample_text ? `
REFERENCE SAMPLE (mimic this style):
"${brandVoice.sample_text.substring(0, 800)}"
` : ''}
---
Write in a style that matches these brand voice guidelines. Maintain consistency with the defined tone and style throughout your response.`;
      }
    }

    // Build user prompt from inputs
    const userPromptParts: string[] = [];
    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined && value !== '') {
        userPromptParts.push(`${key}: ${value}`);
      }
    }

    // Language instruction - explicit for Bangla
    let languageInstruction = '';
    if (language === 'bn') {
      languageInstruction = `

CRITICAL LANGUAGE REQUIREMENT:
You are a helpful assistant. Your ENTIRE output MUST be in Bengali language (বাংলা).
- All text, headings, and content must be written in Bangla script.
- Do not use English words unless they are technical terms with no Bangla equivalent.
- Maintain proper Bangla grammar and sentence structure.
- Use culturally appropriate expressions and idioms.`;
    } else {
      languageInstruction = '\n\nWrite your response in clear, fluent English.';
    }

    const userPrompt = userPromptParts.join('\n') + languageInstruction;

    // Prepare messages for AI
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt + brandVoiceInstructions 
      },
      { 
        role: 'user', 
        content: userPrompt 
      },
    ];

    // Determine API key and endpoint based on provider
    let apiKey: string;
    let endpoint: string;

    if (provider.provider_slug === 'lovable') {
      // Use Lovable AI Gateway
      apiKey = Deno.env.get('LOVABLE_API_KEY') || '';
      endpoint = 'https://ai.gateway.lovable.dev/v1/chat/completions';
    } else {
      // Use configured provider
      if (!provider.api_key_encrypted) {
        return new Response(JSON.stringify({ 
          error: `No API key configured for ${provider.provider_slug}. Please configure it in Admin > AI Settings.` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiKey = provider.api_key_encrypted;
      endpoint = provider.api_endpoint || '';
    }

    if (!apiKey) {
      throw new Error('AI API key is not configured');
    }

    console.log(`[generate-content] Calling ${provider.provider_slug} API with model: ${model}`);

    // Call the appropriate API based on provider
    let aiResponse: Response;

    if (provider.provider_slug === 'anthropic') {
      aiResponse = await callAnthropicApi(apiKey, endpoint, model, messages, temperature, stream);
    } else if (provider.provider_slug === 'bytez') {
      aiResponse = await callBytezApi(apiKey, endpoint, model, messages, temperature, stream);
    } else {
      // OpenAI-compatible API (OpenAI, Google, DeepSeek, OpenRouter, Mistral, Lovable)
      aiResponse = await callOpenAICompatibleApi(apiKey, endpoint, model, messages, temperature, stream);
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[generate-content] AI API error: ${aiResponse.status}`, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please check your API key or contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid API key. Please check your AI provider configuration.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    // NOTE: Credit deduction is now handled by the frontend calling report-word-count
    console.log(`[generate-content] Content generation started. Credits will be deducted by frontend after editor renders.`);

    // Handle streaming response
    if (stream) {
      const reader = aiResponse.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      const decoder = new TextDecoder();

      const transformedStream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              controller.enqueue(value);

              const text = decoder.decode(value, { stream: true });
              const lines = text.split('\n');
              for (const line of lines) {
                if (!line.trim() || line.startsWith(':')) continue;
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  // Handle both OpenAI and Anthropic formats
                  const content = parsed.choices?.[0]?.delta?.content || 
                                  parsed.delta?.text ||
                                  parsed.content_block?.text;
                  if (content) {
                    fullContent += content;
                  }
                } catch {
                  // Incomplete JSON, skip
                }
              }
            }
            
            controller.close();
            console.log(`[generate-content] Stream complete. Content length: ${fullContent.length} chars`);
          } catch (error) {
            console.error('[generate-content] Stream processing error:', error);
            controller.error(error);
          }
        }
      });

      return new Response(transformedStream, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const data = await aiResponse.json();
    // Handle both OpenAI and Anthropic response formats
    const content = data.choices?.[0]?.message?.content || 
                    data.content?.[0]?.text || 
                    '';
    
    console.log(`[generate-content] Non-streaming complete. Content length: ${content.length} chars`);

    return new Response(JSON.stringify({ 
      content,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-content] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
