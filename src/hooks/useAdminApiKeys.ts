import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminApiKey {
  id: string;
  user_id: string;
  organization_id: string;
  key_prefix: string;
  name: string;
  created_at: string | null;
  last_used_at: string | null;
  is_active: boolean | null;
  profiles: {
    email: string | null;
    full_name: string | null;
  } | null;
}

export interface ApiStats {
  totalActiveKeys: number;
  totalApiRequests: number;
  topApiUser: { email: string; requests: number } | null;
}

export function useAdminApiKeys() {
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["admin-api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select(`
          id,
          user_id,
          organization_id,
          key_prefix,
          name,
          created_at,
          last_used_at,
          is_active,
          profiles!api_keys_user_id_fkey (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AdminApiKey[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-api-stats"],
    queryFn: async () => {
      // Get total active keys
      const { count: activeKeys } = await supabase
        .from("api_keys")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get total API requests from credit_usage (template_type contains 'api' or model indicates API usage)
      const { data: usageData } = await supabase
        .from("credit_usage")
        .select("user_id, profiles!credit_usage_user_id_fkey(email)");

      const totalApiRequests = usageData?.length || 0;

      // Calculate top API user
      let topApiUser: { email: string; requests: number } | null = null;
      if (usageData && usageData.length > 0) {
        const userCounts: Record<string, { email: string; count: number }> = {};
        usageData.forEach((usage: any) => {
          const userId = usage.user_id;
          const email = usage.profiles?.email || "Unknown";
          if (!userCounts[userId]) {
            userCounts[userId] = { email, count: 0 };
          }
          userCounts[userId].count++;
        });

        const topUser = Object.values(userCounts).sort((a, b) => b.count - a.count)[0];
        if (topUser) {
          topApiUser = { email: topUser.email, requests: topUser.count };
        }
      }

      return {
        totalActiveKeys: activeKeys || 0,
        totalApiRequests,
        topApiUser,
      } as ApiStats;
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["admin-api-stats"] });
      toast.success("API key revoked successfully");
    },
    onError: (error) => {
      toast.error("Failed to revoke API key: " + error.message);
    },
  });

  const activateKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: true })
        .eq("id", keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["admin-api-stats"] });
      toast.success("API key activated successfully");
    },
    onError: (error) => {
      toast.error("Failed to activate API key: " + error.message);
    },
  });

  return {
    apiKeys,
    stats,
    isLoading,
    revokeKey: revokeKeyMutation.mutate,
    activateKey: activateKeyMutation.mutate,
    isRevoking: revokeKeyMutation.isPending,
    isActivating: activateKeyMutation.isPending,
  };
}
