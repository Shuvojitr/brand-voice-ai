import * as LucideIcons from "lucide-react";
import { type LucideIcon } from "lucide-react";

// Get icon component by name from Lucide
export function getIconByName(iconName: string | null): LucideIcon {
  if (!iconName) return LucideIcons.FileText;
  
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
  return icon || LucideIcons.FileText;
}

// Check if icon name is valid
export function isValidIconName(iconName: string): boolean {
  return iconName in LucideIcons && typeof (LucideIcons as unknown as Record<string, unknown>)[iconName] === 'function';
}
