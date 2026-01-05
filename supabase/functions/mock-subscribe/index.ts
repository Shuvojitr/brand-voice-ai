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
    
    if (!plan || !["starter", "pro", "enterprise"].includes(plan)) {
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

    // Get plan credits from database
    const { data: planData } = await supabaseClient
      .from("plans")
      .select("credits")
      .eq("slug", plan)
      .maybeSingle();

    // Fallback credits if plan not found in DB
    const defaultPlanCredits: Record<string, number> = {
      starter: 50000,
      pro: 100000,
      enterprise: 500000,
    };

    const newPlanCredits = planData?.credits ?? defaultPlanCredits[plan];

    // Get current organization credits and subscription info
    const { data: org, error: orgError } = await supabaseClient
      .from("organizations")
      .select("monthly_credits, credits_used, subscription_ends_at, subscription_status")
      .eq("id", membership.organization_id)
      .single();

    if (orgError || !org) {
      return new Response(JSON.stringify({ error: "Organization not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate remaining credits and add new plan credits
    const remainingCredits = Math.max(0, (org.monthly_credits || 0) - (org.credits_used || 0));
    const newMonthlyCredits = remainingCredits + newPlanCredits;

    // Calculate new subscription end date based on billing period
    const now = new Date();
    const periodMs = isYearly 
      ? 365 * 24 * 60 * 60 * 1000  // 365 days for yearly
      : 30 * 24 * 60 * 60 * 1000;  // 30 days for monthly
    let newSubscriptionEndsAt: Date;
    
    // If subscription is currently active and not expired, extend from current end date
    if (org.subscription_ends_at && new Date(org.subscription_ends_at) > now) {
      newSubscriptionEndsAt = new Date(new Date(org.subscription_ends_at).getTime() + periodMs);
    } else {
      // Otherwise, start fresh from now
      newSubscriptionEndsAt = new Date(now.getTime() + periodMs);
    }

    // Update organization subscription
    const { error: updateError } = await supabaseClient
      .from("organizations")
      .update({
        subscription_tier: plan,
        subscription_status: "active",
        monthly_credits: newMonthlyCredits,
        credits_used: 0, // Reset credits used since remaining are now in monthly_credits
        subscription_ends_at: newSubscriptionEndsAt.toISOString(),
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

    console.log(`Plan upgraded for org ${membership.organization_id}: ${plan} with ${newPlanCredits} new credits (total: ${newMonthlyCredits})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan,
        credits: newMonthlyCredits,
        added_credits: newPlanCredits,
        subscription_ends_at: newSubscriptionEndsAt.toISOString(),
        message: `Dev Mode: Upgraded to ${plan} successfully! Added ${newPlanCredits.toLocaleString()} credits.`
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
