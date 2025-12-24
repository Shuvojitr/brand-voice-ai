import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

export function useFavicon() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.favicon_url) {
      // Update or create the favicon link element
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      
      link.href = settings.favicon_url;
    }
  }, [settings?.favicon_url]);
}
