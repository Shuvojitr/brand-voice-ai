import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  documentsCount: number;
  wordsGenerated: number;
  brandVoicesCount: number;
  creditsUsed: number;
  creditsTotal: number;
}

export interface RecentDocument {
  id: string;
  title: string;
  template_type: string | null;
  word_count: number | null;
  created_at: string | null;
}

export function useDashboardStats(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard-stats", organizationId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!organizationId) {
        return {
          documentsCount: 0,
          wordsGenerated: 0,
          brandVoicesCount: 0,
          creditsUsed: 0,
          creditsTotal: 1000,
        };
      }

      // Fetch documents count and total words (using initial_word_count for permanent tracking)
      const { data: documents, error: docsError } = await supabase
        .from("documents")
        .select("initial_word_count")
        .eq("organization_id", organizationId);

      if (docsError) throw docsError;

      const documentsCount = documents?.length || 0;
      // Use initial_word_count so edits don't decrease the "Words Generated" stat
      const wordsGenerated = documents?.reduce((sum, doc) => sum + (doc.initial_word_count || 0), 0) || 0;

      // Fetch brand voices count
      const { count: brandVoicesCount, error: voicesError } = await supabase
        .from("brand_voices")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);

      if (voicesError) throw voicesError;

      // Fetch organization credits
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("credits_used, monthly_credits")
        .eq("id", organizationId)
        .single();

      if (orgError) throw orgError;

      return {
        documentsCount,
        wordsGenerated,
        brandVoicesCount: brandVoicesCount || 0,
        creditsUsed: org?.credits_used ?? 0,
        creditsTotal: org?.monthly_credits ?? 0,
      };
    },
    enabled: !!organizationId,
  });
}

export function useRecentDocuments(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["recent-documents", organizationId],
    queryFn: async (): Promise<RecentDocument[]> => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("id, title, template_type, word_count, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
  });
}
