import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function matching the frontend
const hashKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if API feature is enabled
    const { data: siteSettings, error: settingsError } = await supabase
      .from('site_settings')
      .select('is_api_feature_enabled')
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching site settings:', settingsError);
    }

    if (siteSettings && siteSettings.is_api_feature_enabled === false) {
      return new Response(
        JSON.stringify({ error: 'API is currently disabled by admin' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header. Expected: Bearer sk-mygenai-...' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '').trim();
    if (!apiKey.startsWith('sk-mygenai-')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the API key to look it up
    const keyHash = await hashKey(apiKey);

    // Look up the API key
    const { data: apiKeyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id, organization_id, is_active')
      .eq('key_hash', keyHash)
      .maybeSingle();

    if (keyError) {
      console.error('Database error looking up API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKeyRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKeyRecord.is_active) {
      return new Response(
        JSON.stringify({ error: 'API key has been revoked' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check organization credits
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, monthly_credits, credits_used')
      .eq('id', apiKeyRecord.organization_id)
      .single();

    if (orgError || !org) {
      console.error('Error fetching organization:', orgError);
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creditsRemaining = (org.monthly_credits || 0) - (org.credits_used || 0);
    if (creditsRemaining <= 0) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits. Please upgrade your plan.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { prompt, template, messages } = body;

    if (!prompt && !messages) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt or messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_used_at for the API key
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyRecord.id);

    // Call AI gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiMessages = messages || [
      { role: 'system', content: `You are a helpful AI assistant. ${template ? `Generate content suitable for a ${template}.` : ''}` },
      { role: 'user', content: prompt }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // Deduct credits (1 credit per 100 tokens, minimum 1)
    const creditsToDeduct = Math.max(1, Math.ceil(tokensUsed / 100));
    
    await supabase
      .from('organizations')
      .update({ credits_used: (org.credits_used || 0) + creditsToDeduct })
      .eq('id', org.id);

    // Log credit usage
    await supabase
      .from('credit_usage')
      .insert({
        user_id: apiKeyRecord.user_id,
        organization_id: apiKeyRecord.organization_id,
        tokens_input: aiData.usage?.prompt_tokens || 0,
        tokens_output: aiData.usage?.completion_tokens || 0,
        credits_consumed: creditsToDeduct,
        model_used: 'google/gemini-2.5-flash',
        template_type: template || 'api',
      });

    // Return response
    return new Response(
      JSON.stringify({
        content,
        usage: {
          prompt_tokens: aiData.usage?.prompt_tokens || 0,
          completion_tokens: aiData.usage?.completion_tokens || 0,
          total_tokens: tokensUsed,
          credits_used: creditsToDeduct,
        },
        model: 'google/gemini-2.5-flash',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API completion error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
