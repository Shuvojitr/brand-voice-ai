import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[expire-subscriptions] Starting subscription expiration check...');

    // Find and expire subscriptions that have passed their end date
    // Set to "No Plan" state (subscription_status = 'none', subscription_tier = null, 0 credits)
    // Do NOT mark has_used_free_plan so user can still claim free plan later
    const { data: expiredOrgs, error: fetchError } = await supabase
      .from('organizations')
      .select('id, name, subscription_tier')
      .eq('subscription_status', 'active')
      .not('subscription_tier', 'eq', 'free')
      .not('subscription_ends_at', 'is', null)
      .lt('subscription_ends_at', new Date().toISOString());

    if (fetchError) {
      console.error('[expire-subscriptions] Error fetching expired subscriptions:', fetchError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: fetchError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[expire-subscriptions] Found ${expiredOrgs?.length || 0} expired subscriptions`);

    // Update each expired organization to "No Plan" state
    for (const org of expiredOrgs || []) {
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          subscription_status: 'none',
          subscription_tier: null,
          monthly_credits: 0,
          credits_used: 0,
          remaining_credits: 0,
          stripe_subscription_id: null,
          // Do NOT set has_used_free_plan = true, so they can claim free later
        })
        .eq('id', org.id);

      if (updateError) {
        console.error(`[expire-subscriptions] Error updating org ${org.id}:`, updateError);
      } else {
        console.log(`[expire-subscriptions] Expired subscription for org: ${org.name} (${org.id})`);
      }
    }

    console.log('[expire-subscriptions] Successfully processed subscription expirations');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Subscription expiration check completed',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[expire-subscriptions] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
