import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ThirdPartyIntegration {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  head_code: string | null;
  body_start_code: string | null;
  body_end_code: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useThirdPartyIntegrations() {
  const queryClient = useQueryClient();

  const { data: integrations, isLoading, error } = useQuery({
    queryKey: ["third-party-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("third_party_integrations")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ThirdPartyIntegration[];
    },
  });

  const updateIntegration = useMutation({
    mutationFn: async (updates: Partial<ThirdPartyIntegration> & { id: string }) => {
      const { id, ...rest } = updates;
      const { data, error } = await supabase
        .from("third_party_integrations")
        .update(rest)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-party-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["active-integrations"] });
      toast.success("Integration updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update integration: " + error.message);
    },
  });

  const createIntegration = useMutation({
    mutationFn: async (newIntegration: Omit<ThirdPartyIntegration, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("third_party_integrations")
        .insert(newIntegration)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-party-integrations"] });
      toast.success("Integration created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create integration: " + error.message);
    },
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("third_party_integrations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-party-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["active-integrations"] });
      toast.success("Integration deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete integration: " + error.message);
    },
  });

  return {
    integrations,
    isLoading,
    error,
    updateIntegration,
    createIntegration,
    deleteIntegration,
  };
}

// Hook to get only active integrations (for injecting scripts)
export function useActiveIntegrations() {
  return useQuery({
    queryKey: ["active-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("third_party_integrations")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ThirdPartyIntegration[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
