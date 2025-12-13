import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BrandVoice = Tables<"brand_voices">;

export function useBrandVoices(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["brand-voices", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from("brand_voices")
        .select("*")
        .eq("organization_id", organizationId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BrandVoice[];
    },
    enabled: !!organizationId,
  });
}

export function useBrandVoice(voiceId: string | undefined) {
  return useQuery({
    queryKey: ["brand-voice", voiceId],
    queryFn: async () => {
      if (!voiceId) return null;
      
      const { data, error } = await supabase
        .from("brand_voices")
        .select("*")
        .eq("id", voiceId)
        .single();

      if (error) throw error;
      return data as BrandVoice;
    },
    enabled: !!voiceId,
  });
}

export function useDefaultBrandVoice(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["brand-voice-default", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from("brand_voices")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_default", true)
        .maybeSingle();

      if (error) throw error;
      return data as BrandVoice | null;
    },
    enabled: !!organizationId,
  });
}
