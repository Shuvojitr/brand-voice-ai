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
  header_logo_url: string | null;
  footer_logo_url: string | null;
  favicon_url: string | null;
  site_name: string;
  site_description: string | null;
  header_nav: NavLink[];
  footer_nav: FooterColumn[];
  social_links: SocialLink[];
  copyright_text: string | null;
  bottom_tagline: string | null;
  is_api_feature_enabled: boolean;
  // SEO fields
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image_url: string | null;
  twitter_handle: string | null;
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

      // Cast to any to access columns not yet in the auto-generated types
      const rawData = data as any;

      return {
        id: rawData.id,
        logo_url: rawData.logo_url,
        header_logo_url: rawData.header_logo_url,
        footer_logo_url: rawData.footer_logo_url,
        favicon_url: rawData.favicon_url,
        site_name: rawData.site_name,
        site_description: rawData.site_description,
        header_nav: (rawData.header_nav as NavLink[]) || [],
        footer_nav: (rawData.footer_nav as FooterColumn[]) || [],
        social_links: (rawData.social_links as SocialLink[]) || [],
        copyright_text: rawData.copyright_text,
        bottom_tagline: rawData.bottom_tagline,
        is_api_feature_enabled: rawData.is_api_feature_enabled ?? true,
        // SEO fields
        seo_title: rawData.seo_title,
        seo_description: rawData.seo_description,
        seo_keywords: rawData.seo_keywords,
        og_image_url: rawData.og_image_url,
        twitter_handle: rawData.twitter_handle,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at,
      } as SiteSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<SiteSettings, "id" | "created_at" | "updated_at">>) => {
      if (!settings?.id) {
        throw new Error("No settings found to update");
      }

      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.logo_url !== undefined) updatePayload.logo_url = updates.logo_url;
      if (updates.header_logo_url !== undefined) updatePayload.header_logo_url = updates.header_logo_url;
      if (updates.footer_logo_url !== undefined) updatePayload.footer_logo_url = updates.footer_logo_url;
      if (updates.favicon_url !== undefined) updatePayload.favicon_url = updates.favicon_url;
      if (updates.site_name !== undefined) updatePayload.site_name = updates.site_name;
      if (updates.site_description !== undefined) updatePayload.site_description = updates.site_description;
      if (updates.header_nav !== undefined) updatePayload.header_nav = updates.header_nav as unknown as Json;
      if (updates.footer_nav !== undefined) updatePayload.footer_nav = updates.footer_nav as unknown as Json;
      if (updates.social_links !== undefined) updatePayload.social_links = updates.social_links as unknown as Json;
      if (updates.copyright_text !== undefined) updatePayload.copyright_text = updates.copyright_text;
      if (updates.bottom_tagline !== undefined) updatePayload.bottom_tagline = updates.bottom_tagline;
      if (updates.is_api_feature_enabled !== undefined) updatePayload.is_api_feature_enabled = updates.is_api_feature_enabled;
      // SEO fields
      if (updates.seo_title !== undefined) updatePayload.seo_title = updates.seo_title;
      if (updates.seo_description !== undefined) updatePayload.seo_description = updates.seo_description;
      if (updates.seo_keywords !== undefined) updatePayload.seo_keywords = updates.seo_keywords;
      if (updates.og_image_url !== undefined) updatePayload.og_image_url = updates.og_image_url;
      if (updates.twitter_handle !== undefined) updatePayload.twitter_handle = updates.twitter_handle;

      const { data, error } = await supabase
        .from("site_settings")
        .update(updatePayload)
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
