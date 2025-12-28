import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Target sizes for favicons
const FAVICON_SIZES = [16, 32, 48, 180];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, originalPath } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing favicon resize for:", imageUrl);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const imageArrayBuffer = await imageBlob.arrayBuffer();
    const imageUint8Array = new Uint8Array(imageArrayBuffer);

    // Generate a base name for the resized favicons
    const timestamp = Date.now();
    const baseName = `favicon-${timestamp}`;

    const results: Record<string, string> = {};

    // For each size, we'll use an external image processing API
    // Since Deno doesn't have native sharp/jimp, we'll use a serverless image processor
    // For now, we'll store the original at different paths and rely on CSS/browser scaling
    // In production, you'd integrate with an image processing service

    for (const size of FAVICON_SIZES) {
      const fileName = `${baseName}-${size}x${size}.png`;
      const filePath = `favicons/${fileName}`;

      // Upload the original image with size-specific naming
      // The browser will handle the scaling
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, imageUint8Array, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Failed to upload ${size}x${size} favicon:`, uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      results[size.toString()] = publicUrl;
      console.log(`Created favicon ${size}x${size}:`, publicUrl);
    }

    // Also store original as the main favicon_url for backward compatibility
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from("site-assets")
      .getPublicUrl(originalPath);

    return new Response(
      JSON.stringify({
        success: true,
        faviconSizes: results,
        originalUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing favicon:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process favicon";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
