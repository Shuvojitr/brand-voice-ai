import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get origin from request or use a default
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || supabaseUrl.replace(".supabase.co", ".lovable.app");
    
    // Extract the base URL (remove any path)
    const baseUrl = new URL(origin).origin;

    console.log("Generating sitemap for:", baseUrl);

    // Fetch all published pages
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (pagesError) {
      console.error("Error fetching pages:", pagesError);
      throw pagesError;
    }

    console.log(`Found ${pages?.length || 0} published pages`);

    // Static routes that should always be in the sitemap
    const staticRoutes = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/login", priority: "0.5", changefreq: "monthly" },
      { loc: "/signup", priority: "0.5", changefreq: "monthly" },
      { loc: "/docs", priority: "0.7", changefreq: "weekly" },
    ];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static routes
    for (const route of staticRoutes) {
      sitemap += `  <url>
    <loc>${baseUrl}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
    }

    // Add dynamic pages
    if (pages && pages.length > 0) {
      for (const page of pages) {
        const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
        sitemap += `  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    console.log("Sitemap generated successfully");

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        headers: corsHeaders,
        status: 200,
      }
    );
  }
});
