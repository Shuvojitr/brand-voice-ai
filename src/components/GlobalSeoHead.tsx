import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface GlobalSeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function GlobalSeoHead({ title, description, image, noIndex }: GlobalSeoHeadProps) {
  const { settings } = useSiteSettings();

  // Use provided values or fall back to site settings
  const seoTitle = title || settings?.seo_title || settings?.site_name || "MyGenAI";
  const seoDescription = description || settings?.seo_description || settings?.site_description || "AI-powered content creation platform";
  const seoKeywords = settings?.seo_keywords || "AI, content generator, writing assistant";
  const ogImage = image || settings?.og_image_url;
  const twitterHandle = settings?.twitter_handle || "@MyGenAI";
  const siteName = settings?.site_name || "MyGenAI";

  // Generate title with template if not overridden
  const fullTitle = title && settings?.site_name 
    ? `${title} | ${settings.site_name}` 
    : seoTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:site_name" content={siteName} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seoDescription} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
