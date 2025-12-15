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
    
    // Create client with service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "stats";

    if (action === "stats") {
      // Get total users count
      const { count: usersCount } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total words generated
      const { data: wordsData } = await supabaseAdmin
        .from("documents")
        .select("initial_word_count");

      const totalWords = wordsData?.reduce((sum, doc) => sum + (doc.initial_word_count || 0), 0) || 0;

      // Get total documents count
      const { count: docsCount } = await supabaseAdmin
        .from("documents")
        .select("*", { count: "exact", head: true });

      // Get total organizations
      const { count: orgsCount } = await supabaseAdmin
        .from("organizations")
        .select("*", { count: "exact", head: true });

      return new Response(JSON.stringify({
        totalUsers: usersCount || 0,
        totalWords: totalWords,
        totalDocuments: docsCount || 0,
        totalOrganizations: orgsCount || 0,
        totalRevenue: 0, // Mock for now
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "recent-signups") {
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "all-users") {
      // Get all profiles
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, created_at, is_banned")
        .order("created_at", { ascending: false });

      // Get user roles
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role");

      // Get organization memberships with credits
      const { data: memberships } = await supabaseAdmin
        .from("organization_members")
        .select(`
          user_id,
          organizations (
            id,
            monthly_credits,
            credits_used
          )
        `);

      // Combine data
      const users = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const membership = memberships?.find(m => m.user_id === profile.id);
        const org = membership?.organizations as any;
        
        return {
          ...profile,
          role: userRole?.role || "user",
          credits_remaining: org ? (org.monthly_credits - org.credits_used) : 0,
          organization_id: org?.id,
        };
      }) || [];

      return new Response(JSON.stringify(users), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
