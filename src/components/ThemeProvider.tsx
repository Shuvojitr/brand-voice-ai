import { useEffect } from "react";
import { useThemes, ThemeColors, ThemeFonts } from "@/hooks/useThemes";

// Font family mappings for Google Fonts
const fontFamilyMap: Record<string, string> = {
  "Space Grotesk": "'Space Grotesk', sans-serif",
  "Outfit": "'Outfit', sans-serif",
  "Inter": "'Inter', sans-serif",
  "Poppins": "'Poppins', sans-serif",
  "Open Sans": "'Open Sans', sans-serif",
  "Montserrat": "'Montserrat', sans-serif",
  "Lato": "'Lato', sans-serif",
  "DM Sans": "'DM Sans', sans-serif",
  "Geist": "'Geist', sans-serif",
};

// Google Fonts URLs
const fontUrls: Record<string, string> = {
  "Space Grotesk": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap",
  "Outfit": "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap",
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  "Poppins": "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap",
  "Montserrat": "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
  "Lato": "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
  "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap",
  "Geist": "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap",
};

function loadFont(fontName: string) {
  const url = fontUrls[fontName];
  if (!url) return;

  const existingLink = document.querySelector(`link[href="${url}"]`);
  if (existingLink) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

function applyThemeFonts(fonts: ThemeFonts) {
  const root = document.documentElement;
  
  // Load fonts
  loadFont(fonts.heading);
  loadFont(fonts.body);
  
  // Apply font families
  const headingFamily = fontFamilyMap[fonts.heading] || fonts.heading;
  const bodyFamily = fontFamilyMap[fonts.body] || fonts.body;
  
  root.style.setProperty("--font-heading", headingFamily);
  root.style.setProperty("--font-body", bodyFamily);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { activeTheme } = useThemes();

  useEffect(() => {
    if (activeTheme) {
      applyThemeColors(activeTheme.colors);
      applyThemeFonts(activeTheme.fonts);
    }
  }, [activeTheme]);

  return <>{children}</>;
}
