import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ThemeColors {
  primary: string;
  "primary-foreground": string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  "muted-foreground": string;
  card: string;
  "card-foreground": string;
  border: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  colors: ThemeColors;
  fonts: ThemeFonts;
  created_at: string;
  updated_at: string;
}

export function useThemes() {
  const queryClient = useQueryClient();

  const { data: themes, isLoading, error } = useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as unknown as Theme[];
    },
  });

  const { data: activeTheme } = useQuery({
    queryKey: ["active-theme"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Theme | null;
    },
  });

  const setActiveTheme = useMutation({
    mutationFn: async (themeId: string) => {
      // First, deactivate all themes
      const { error: deactivateError } = await supabase
        .from("themes")
        .update({ is_active: false })
        .neq("id", "");

      if (deactivateError) throw deactivateError;

      // Then activate the selected theme
      const { error: activateError } = await supabase
        .from("themes")
        .update({ is_active: true })
        .eq("id", themeId);

      if (activateError) throw activateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["active-theme"] });
      toast.success("Theme activated successfully");
    },
    onError: (error) => {
      toast.error("Failed to activate theme: " + error.message);
    },
  });

  return {
    themes,
    activeTheme,
    isLoading,
    error,
    setActiveTheme,
  };
}
