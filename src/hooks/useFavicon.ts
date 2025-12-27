import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

export function useFavicon() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.favicon_url) {
      // Remove any existing favicon links first
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(link => link.remove());
      
      // Create a new favicon link with cache-busting
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = `${settings.favicon_url}?v=${Date.now()}`;
      document.head.appendChild(link);
    }
  }, [settings?.favicon_url]);
}
