import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { data: expiredOrgs, error: fetchError } = await supabase
      .from('organizations')
      .select('id, name, subscription_tier, subscription_ends_at, monthly_credits, credits_used')
      .not('subscription_ends_at', 'is', null)
      .lt('subscription_ends_at', new Date().toISOString())
      .neq('subscription_tier', 'free');

    if (fetchError) {
      console.error('[expire-subscriptions] Error fetching expired orgs:', fetchError);
      throw fetchError;
    }

    console.log(`[expire-subscriptions] Found ${expiredOrgs?.length || 0} expired subscriptions`);

    if (expiredOrgs && expiredOrgs.length > 0) {
      for (const org of expiredOrgs) {
        console.log(`[expire-subscriptions] Expiring subscription for org: ${org.name} (${org.id})`);
        console.log(`  - Previous tier: ${org.subscription_tier}`);
        console.log(`  - Credits being reset: ${org.monthly_credits - org.credits_used} remaining`);

        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            subscription_tier: 'free',
            monthly_credits: 0,
            credits_used: 0,
            subscription_ends_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', org.id);

        if (updateError) {
          console.error(`[expire-subscriptions] Error updating org ${org.id}:`, updateError);
        } else {
          console.log(`[expire-subscriptions] Successfully expired subscription for org ${org.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${expiredOrgs?.length || 0} expired subscriptions`,
        expiredCount: expiredOrgs?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[expire-subscriptions] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
