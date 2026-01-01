import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportWordCountRequest {
  organizationId: string;
  wordCount: number;
  templateType?: string;
  modelUsed?: string;
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

    // Parse request
    const body: ReportWordCountRequest = await req.json();
    const { organizationId, wordCount, templateType, modelUsed } = body;

    console.log(`[report-word-count] User: ${user.id}, Org: ${organizationId}, Words: ${wordCount}, Model: ${modelUsed || 'unknown'}`);

    if (!organizationId || typeof wordCount !== 'number' || wordCount < 0) {
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Token calculation: ~1.33 tokens per word (750,000 words ≈ 1,000,000 tokens)
    const estimatedTokens = Math.ceil(wordCount * 1.33);
    const creditsToDeduct = Math.max(1, estimatedTokens);

    // Use the deduct_credits database function for atomic deduction
    const { data: deductResult, error: deductError } = await supabase
      .rpc('deduct_credits', { 
        org_id: organizationId, 
        credits_amount: creditsToDeduct 
      });

    if (deductError) {
      console.error('[report-word-count] Failed to deduct credits:', deductError);
      return new Response(JSON.stringify({ error: 'Failed to deduct credits' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if deduction was successful
    if (!(deductResult as any)?.success) {
      console.error('[report-word-count] Credit deduction failed:', deductResult);
      return new Response(JSON.stringify({ 
        error: (deductResult as any)?.error || 'Failed to deduct credits',
        remaining_credits: (deductResult as any)?.remaining_credits || 0,
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log usage with estimated token counts
    const estimatedOutputTokens = estimatedTokens;
    await supabase.from('credit_usage').insert({
      organization_id: organizationId,
      user_id: user.id,
      credits_consumed: creditsToDeduct,
      model_used: modelUsed || 'unknown',
      template_type: templateType || null,
      tokens_input: 0,
      tokens_output: estimatedOutputTokens,
    });

    const remainingCredits = (deductResult as any)?.remaining_credits || 0;
    console.log(`[report-word-count] Deducted ${creditsToDeduct} credits (${wordCount} words ≈ ${estimatedOutputTokens} tokens) from org ${organizationId}, remaining: ${remainingCredits}, model: ${modelUsed || 'unknown'}`);

    return new Response(JSON.stringify({ 
      success: true,
      creditsDeducted: creditsToDeduct,
      wordCount,
      remainingCredits,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[report-word-count] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
