import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log("Checking for scheduled posts to publish...");

    // Find posts that are scheduled to be published and the time has passed
    const now = new Date().toISOString();
    
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, title, slug, scheduled_publish_at")
      .eq("is_published", false)
      .not("scheduled_publish_at", "is", null)
      .lte("scheduled_publish_at", now);

    if (fetchError) {
      console.error("Error fetching scheduled posts:", fetchError);
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log("No scheduled posts ready to publish");
      return new Response(
        JSON.stringify({ message: "No scheduled posts to publish", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${scheduledPosts.length} post(s) to publish:`, scheduledPosts.map(p => p.title));

    // Publish each scheduled post
    const postIds = scheduledPosts.map((p) => p.id);
    
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({
        is_published: true,
        published_at: now,
        scheduled_publish_at: null,
        updated_at: now,
      })
      .in("id", postIds);

    if (updateError) {
      console.error("Error publishing scheduled posts:", updateError);
      throw updateError;
    }

    const publishedTitles = scheduledPosts.map((p) => p.title);
    console.log("Successfully published:", publishedTitles);

    return new Response(
      JSON.stringify({
        message: `Published ${scheduledPosts.length} post(s)`,
        count: scheduledPosts.length,
        posts: publishedTitles,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in publish-scheduled-posts:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
