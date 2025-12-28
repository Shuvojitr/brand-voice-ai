import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

function withCacheBusting(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

export function useFavicon() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const faviconSizes = settings?.favicon_sizes;
    const faviconUrl = settings?.favicon_url;

    // If no favicon data, skip
    if (!faviconSizes && !faviconUrl) return;

    // Update or create favicon links for each size
    const updateFaviconLink = (id: string, rel: string, sizes: string | null, href: string) => {
      let link = document.querySelector<HTMLLinkElement>(`#${id}`);
      
      if (!link) {
        link = document.createElement("link");
        link.id = id;
        document.head.appendChild(link);
      }

      link.rel = rel;
      link.type = "image/png";
      if (sizes) link.setAttribute("sizes", sizes);
      link.href = withCacheBusting(href);
    };

    // If we have multi-size favicons, use them
    if (faviconSizes) {
      if (faviconSizes["16"]) {
        updateFaviconLink("favicon-16", "icon", "16x16", faviconSizes["16"]);
      }
      if (faviconSizes["32"]) {
        updateFaviconLink("favicon-32", "icon", "32x32", faviconSizes["32"]);
      }
      if (faviconSizes["48"]) {
        updateFaviconLink("favicon-48", "icon", "48x48", faviconSizes["48"]);
      }
      if (faviconSizes["180"]) {
        updateFaviconLink("apple-touch-icon", "apple-touch-icon", "180x180", faviconSizes["180"]);
      }

      // Also set the default favicon to 32px version (most common)
      const defaultUrl = faviconSizes["32"] || faviconSizes["16"] || faviconUrl;
      if (defaultUrl) {
        updateFaviconLink("app-favicon", "icon", null, defaultUrl);
        updateFaviconLink("app-shortcut-icon", "shortcut icon", null, defaultUrl);
      }
    } else if (faviconUrl) {
      // Fallback to single favicon URL
      updateFaviconLink("app-favicon", "icon", null, faviconUrl);
      updateFaviconLink("app-shortcut-icon", "shortcut icon", null, faviconUrl);
    }
  }, [settings?.favicon_url, settings?.favicon_sizes]);
}
