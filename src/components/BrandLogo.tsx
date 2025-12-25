import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Height class for the logo (default: h-8) */
  height?: string;
  /** Whether to show text fallback when no logo */
  showText?: boolean;
  /** Custom class for the wrapper */
  className?: string;
  /** Custom class for the image */
  imageClassName?: string;
  /** Custom class for the text */
  textClassName?: string;
  /** Whether to link to home page */
  linkTo?: string | null;
  /** Type of logo to use: 'default' | 'header' | 'footer' */
  variant?: "default" | "header" | "footer";
  /** For light backgrounds (auth pages left panel) - shows white text */
  inverted?: boolean;
}

export function BrandLogo({
  height = "h-8",
  showText = true,
  className,
  imageClassName,
  textClassName,
  linkTo = "/",
  variant = "default",
  inverted = false,
}: BrandLogoProps) {
  const { settings, isLoading } = useSiteSettings();

  // Determine which logo URL to use based on variant
  const getLogoUrl = () => {
    if (!settings) return null;
    
    switch (variant) {
      case "header":
        return settings.header_logo_url || settings.logo_url;
      case "footer":
        return settings.footer_logo_url || settings.logo_url;
      default:
        return settings.logo_url;
    }
  };

  const logoUrl = getLogoUrl();
  const siteName = settings?.site_name || "";

  // Loading state - show skeleton placeholder
  if (isLoading) {
    const skeleton = (
      <div className={cn(height, "w-24 animate-pulse bg-muted/20 rounded")} />
    );

    if (linkTo) {
      return (
        <Link to={linkTo} className={cn("flex items-center gap-2", className)}>
          {skeleton}
        </Link>
      );
    }

    return (
      <div className={cn("flex items-center gap-2", className)}>
        {skeleton}
      </div>
    );
  }

  // Render text fallback (only site name from DB, no hardcoded branding)
  const renderTextLogo = () => {
    if (!siteName) return null;

    if (inverted) {
      return (
        <span className={cn("text-xl font-bold tracking-tight text-white", textClassName)}>
          {siteName}
        </span>
      );
    }

    // Check if site name ends with "AI" to apply gradient styling
    if (siteName.toUpperCase().endsWith("AI")) {
      const baseName = siteName.slice(0, -2);
      const aiPart = siteName.slice(-2);
      return (
        <span className={cn("text-xl font-bold tracking-tight", textClassName)}>
          {baseName}<span className="gradient-text">{aiPart}</span>
        </span>
      );
    }

    return (
      <span className={cn("text-xl font-bold tracking-tight", textClassName)}>
        {siteName}
      </span>
    );
  };

  const content = (
    <>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={siteName || "Logo"}
          className={cn(
            height,
            "w-auto max-w-[200px] object-contain",
            imageClassName
          )}
        />
      ) : showText ? (
        renderTextLogo()
      ) : null}
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={cn("flex items-center gap-2", className)}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {content}
    </div>
  );
}
