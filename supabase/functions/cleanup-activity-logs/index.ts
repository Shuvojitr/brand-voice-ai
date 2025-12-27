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
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for manual cleanup
    let daysToKeep = 30; // Default: keep 30 days
    let isManual = false;
    let adminUserId: string | null = null;

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      daysToKeep = body.daysToKeep || 30;
      isManual = body.manual === true;

      // If manual cleanup, verify admin authorization
      if (isManual) {
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
          .maybeSingle();

        if (roleError || !roleData) {
          return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        adminUserId = user.id;
      }
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    console.log(`Cleaning up activity logs older than ${daysToKeep} days (before ${cutoffDate.toISOString()})`);

    // Count logs to be deleted first
    const { count: toDeleteCount } = await supabaseAdmin
      .from("admin_activity_logs")
      .select("*", { count: "exact", head: true })
      .lt("created_at", cutoffDate.toISOString());

    // Delete old logs
    const { error: deleteError } = await supabaseAdmin
      .from("admin_activity_logs")
      .delete()
      .lt("created_at", cutoffDate.toISOString());

    if (deleteError) {
      console.error("Error deleting old logs:", deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deletedCount = toDeleteCount || 0;
    console.log(`Successfully deleted ${deletedCount} old activity logs`);

    // Log the cleanup action if it was manual
    if (isManual && adminUserId) {
      await supabaseAdmin.from("admin_activity_logs").insert({
        admin_user_id: adminUserId,
        action: "logs_cleanup",
        details: { 
          days_kept: daysToKeep, 
          logs_deleted: deletedCount,
          cutoff_date: cutoffDate.toISOString()
        },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deleted_count: deletedCount,
      cutoff_date: cutoffDate.toISOString(),
      days_kept: daysToKeep
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
