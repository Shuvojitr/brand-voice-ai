import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  visible?: boolean;
}

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  site_name: string;
  site_description: string | null;
  header_nav: NavLink[];
  footer_nav: FooterColumn[];
  social_links: SocialLink[];
  copyright_text: string | null;
  bottom_tagline: string | null;
  created_at: string;
  updated_at: string;
}

export function useSiteSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      return {
        ...data,
        header_nav: (data.header_nav as unknown as NavLink[]) || [],
        footer_nav: (data.footer_nav as unknown as FooterColumn[]) || [],
        social_links: (data.social_links as unknown as SocialLink[]) || [],
      } as SiteSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<SiteSettings, "id" | "created_at" | "updated_at">>) => {
      if (!settings?.id) {
        throw new Error("No settings found to update");
      }

      const { data, error } = await supabase
        .from("site_settings")
        .update({
          logo_url: updates.logo_url,
          site_name: updates.site_name,
          site_description: updates.site_description,
          header_nav: updates.header_nav as unknown as Json,
          footer_nav: updates.footer_nav as unknown as Json,
          social_links: updates.social_links as unknown as Json,
          copyright_text: updates.copyright_text,
          bottom_tagline: updates.bottom_tagline,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "Settings saved",
        description: "Site appearance settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
}
