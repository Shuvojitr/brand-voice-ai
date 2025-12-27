import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

function withCacheBusting(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

export function useFavicon() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!settings?.favicon_url) return;

    const href = withCacheBusting(settings.favicon_url);

    const icon = document.querySelector<HTMLLinkElement>("#app-favicon");
    const shortcut = document.querySelector<HTMLLinkElement>("#app-shortcut-icon");

    if (icon) {
      icon.rel = "icon";
      icon.type = "image/png";
      icon.href = href;
    }

    if (shortcut) {
      shortcut.rel = "shortcut icon";
      shortcut.type = "image/png";
      shortcut.href = href;
    }

    // Fallback: if the IDs don't exist for some reason, ensure at least one icon tag is present.
    if (!icon && !shortcut) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.href = href;
      document.head.appendChild(link);
    }
  }, [settings?.favicon_url]);
}
