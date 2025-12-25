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
  const siteName = settings?.site_name || "MyGenAI";

  // Render text fallback with gradient styling for "AI" suffix
  const renderTextLogo = () => {
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
          alt={siteName}
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

  // Show nothing during initial load to prevent flicker
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(height, "w-24 animate-pulse bg-muted rounded")} />
      </div>
    );
  }

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
