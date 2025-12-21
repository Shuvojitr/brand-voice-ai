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

    const { plan } = await req.json();
    
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

    // Define plan credits
    const planCredits: Record<string, number> = {
      starter: 50000,
      pro: 100000,
      enterprise: 500000,
    };

    // Get current organization credits to preserve remaining balance
    const { data: currentOrg, error: orgError } = await supabaseClient
      .from("organizations")
      .select("monthly_credits, credits_used")
      .eq("id", membership.organization_id)
      .single();

    if (orgError || !currentOrg) {
      console.error("Org fetch error:", orgError);
      return new Response(JSON.stringify({ error: "Failed to fetch organization" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate remaining credits and add new plan credits
    const remainingCredits = Math.max(0, (currentOrg.monthly_credits || 0) - (currentOrg.credits_used || 0));
    const newTotalCredits = remainingCredits + planCredits[plan];

    console.log(`Upgrading to ${plan}: remaining=${remainingCredits}, adding=${planCredits[plan]}, total=${newTotalCredits}`);

    // Update organization subscription - add new credits to remaining balance
    const { error: updateError } = await supabaseClient
      .from("organizations")
      .update({
        subscription_tier: plan,
        monthly_credits: newTotalCredits,
        credits_used: 0, // Reset used counter since we've already factored in remaining
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan,
        credits: newTotalCredits,
        previousRemaining: remainingCredits,
        added: planCredits[plan],
        message: `Dev Mode: Upgraded to ${plan} successfully! ${remainingCredits} existing credits preserved.`
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
