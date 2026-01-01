import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan, isYearly = false } = await req.json();
    
    if (!plan || !["free", "starter", "pro", "enterprise"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's organization
    const { data: membership, error: memberError } = await supabaseClient
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only admins/owners can upgrade
    if (!["admin", "owner"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Only admins can upgrade" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current organization
    const { data: org, error: orgError } = await supabaseClient
      .from("organizations")
      .select("*")
      .eq("id", membership.organization_id)
      .single();

    if (orgError || !org) {
      return new Response(JSON.stringify({ error: "Organization not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for one-time free plan restriction
    if (plan === "free") {
      if (org.has_used_free_plan) {
        return new Response(JSON.stringify({ 
          error: "Free plan can only be claimed once. Please choose a paid plan." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get plan credits from database
    const { data: planData } = await supabaseClient
      .from("plans")
      .select("credits, name")
      .eq("slug", plan)
      .maybeSingle();

    // Fallback credits if plan not found in DB
    const defaultPlanCredits: Record<string, number> = {
      free: 1000,
      starter: 50000,
      pro: 100000,
      enterprise: 500000,
    };

    const planCredits = planData?.credits ?? defaultPlanCredits[plan];

    // Calculate duration based on yearly/monthly
    const now = new Date();
    let newEndDate: Date;
    let newCredits: number;
    let rolloverApplied = false;

    // Check if user is renewing while still active (ROLLOVER)
    const isActive = org.subscription_status === 'active' && 
                     org.subscription_ends_at && 
                     new Date(org.subscription_ends_at) > now;

    if (isActive) {
      // ROLLOVER: Add credits and extend date
      newCredits = (org.remaining_credits || 0) + planCredits;
      const currentEndDate = new Date(org.subscription_ends_at);
      if (isYearly) {
        newEndDate = new Date(currentEndDate.setFullYear(currentEndDate.getFullYear() + 1));
      } else {
        newEndDate = new Date(currentEndDate.setMonth(currentEndDate.getMonth() + 1));
      }
      rolloverApplied = true;
      console.log(`[mock-subscribe] ROLLOVER: Adding ${planCredits} to existing ${org.remaining_credits}`);
    } else {
      // NEW or EXPIRED: Start fresh
      newCredits = planCredits;
      if (isYearly) {
        newEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        newEndDate = new Date(now.setMonth(now.getMonth() + 1));
      }
      console.log(`[mock-subscribe] NEW/EXPIRED: Setting credits to ${planCredits}`);
    }

    // Update organization subscription with new fields
    const { error: updateError } = await supabaseClient
      .from("organizations")
      .update({
        subscription_tier: plan,
        subscription_status: 'active',
        remaining_credits: newCredits,
        monthly_credits: planCredits,
        credits_used: 0,
        subscription_ends_at: newEndDate.toISOString(),
        has_used_free_plan: plan === 'free' ? true : org.has_used_free_plan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membership.organization_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planName = planData?.name || plan;
    const duration = isYearly ? 'yearly' : 'monthly';

    console.log(`[mock-subscribe] Plan upgraded for org ${membership.organization_id}: ${plan} (${duration})`);
    console.log(`[mock-subscribe] Credits: ${newCredits}, Ends at: ${newEndDate.toISOString()}, Rollover: ${rolloverApplied}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan,
        planName,
        credits: newCredits,
        added_credits: planCredits,
        ends_at: newEndDate.toISOString(),
        rollover_applied: rolloverApplied,
        message: rolloverApplied 
          ? `Upgraded to ${planName}! Added ${planCredits.toLocaleString()} credits to your existing balance. Plan extended to ${newEndDate.toLocaleDateString()}.`
          : `Upgraded to ${planName}! ${planCredits.toLocaleString()} credits added. Plan valid until ${newEndDate.toLocaleDateString()}.`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
