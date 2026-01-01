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

    const planCredits = planData?.credits ?? defaultPlanCredits[plan];

    // Use the process_subscription database function for proper handling
    const { data: result, error: processError } = await supabaseClient
      .rpc("process_subscription", {
        org_id: membership.organization_id,
        plan_slug: plan,
        plan_credits: planCredits,
        is_yearly: false, // Default to monthly for dev mode
      });

    if (processError) {
      console.error("Process subscription error:", processError);
      return new Response(JSON.stringify({ error: processError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!result?.success) {
      return new Response(JSON.stringify({ error: result?.error || "Subscription failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Plan upgraded for org ${membership.organization_id}: ${plan} with ${planCredits} credits. Result:`, result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan,
        credits: result.remaining_credits,
        ends_at: result.ends_at,
        rollover_applied: result.rollover_applied,
        message: `Dev Mode: Upgraded to ${plan} successfully!`
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
