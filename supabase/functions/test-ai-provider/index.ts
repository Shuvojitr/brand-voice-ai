import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  providerId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: TestRequest = await req.json();
    const { providerId } = body;

    // Fetch provider settings
    const { data: provider, error: providerError } = await supabase
      .from('ai_provider_settings')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let apiKey: string;
    let endpoint: string;
    let model: string;

    if (provider.provider_slug === 'lovable') {
      apiKey = Deno.env.get('LOVABLE_API_KEY') || '';
      endpoint = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      model = provider.default_model || 'google/gemini-2.5-flash';
    } else {
      if (!provider.api_key_encrypted) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'No API key configured for this provider' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiKey = provider.api_key_encrypted;
      endpoint = provider.api_endpoint || '';
      model = provider.default_model || '';
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'API key is not configured' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[test-ai-provider] Testing ${provider.provider_slug} with model: ${model}`);

    const testMessages = [
      { role: 'user', content: 'Say "Hello, the API is working!" in exactly those words.' }
    ];

    let aiResponse: Response;
    const startTime = Date.now();

    try {
      if (provider.provider_slug === 'anthropic') {
        aiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: 50,
            messages: [{ role: 'user', content: testMessages[0].content }],
          }),
        });
      } else if (provider.provider_slug === 'bytez') {
        aiResponse = await fetch(`${endpoint}/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: testMessages,
            params: { temperature: 0.1 },
          }),
        });
      } else if (provider.provider_slug === 'google') {
        // Google Gemini via OpenAI-compatible endpoint
        aiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: testMessages,
            max_tokens: 50,
          }),
        });
      } else {
        // OpenAI-compatible API
        aiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: testMessages,
            max_tokens: 50,
          }),
        });
      }
    } catch (fetchError) {
      console.error('[test-ai-provider] Fetch error:', fetchError);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Connection failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseTime = Date.now() - startTime;

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[test-ai-provider] API error ${aiResponse.status}:`, errorText);
      
      let errorMessage = 'API request failed';
      if (aiResponse.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (aiResponse.status === 403) {
        errorMessage = 'API key lacks required permissions';
      } else if (aiResponse.status === 429) {
        errorMessage = 'Rate limited - too many requests';
      } else if (aiResponse.status === 402) {
        errorMessage = 'Insufficient credits or payment required';
      } else if (aiResponse.status === 404) {
        errorMessage = 'Model not found or endpoint incorrect';
      }

      return new Response(JSON.stringify({ 
        success: false,
        error: `${errorMessage} (HTTP ${aiResponse.status})`,
        details: errorText.substring(0, 200),
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiResponse.json();
    
    // Extract content based on provider format
    let content = '';
    if (provider.provider_slug === 'anthropic') {
      content = data.content?.[0]?.text || '';
    } else if (provider.provider_slug === 'google') {
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      content = data.choices?.[0]?.message?.content || '';
    }

    console.log(`[test-ai-provider] Success! Response: "${content.substring(0, 50)}..." (${responseTime}ms)`);

    return new Response(JSON.stringify({ 
      success: true,
      message: content.trim(),
      responseTime,
      model,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[test-ai-provider] Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
