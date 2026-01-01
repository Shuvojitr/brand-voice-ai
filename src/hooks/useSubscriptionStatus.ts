import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  valid: boolean;
  error?: string;
  status: 'active' | 'expired' | 'none' | 'no_credits';
  remaining_credits?: number;
  ends_at?: string;
}

export function useSubscriptionStatus() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { valid: false, error: "Not authenticated", status: 'none' };
      }

      // Get user's organization
      const { data: membership, error: memberError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError || !membership) {
        return { valid: false, error: "No organization found", status: 'none' };
      }

      // Check subscription status using the database function
      const { data: statusResult, error: statusError } = await supabase
        .rpc('check_subscription_status', { org_id: membership.organization_id });

      if (statusError) {
        console.error("Subscription status check failed:", statusError);
        return { valid: false, error: "Failed to check subscription status", status: 'none' };
      }

      // Parse the JSON result from the RPC function
      const result = statusResult as unknown as SubscriptionStatus;
      return result;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    queryClient.invalidateQueries({ queryKey: ["organization"] });
  };

  return { 
    subscriptionStatus: data, 
    isLoading, 
    error, 
    refetch,
    invalidate,
    isActive: data?.valid === true,
    isExpired: data?.status === 'expired',
    hasNoCredits: data?.status === 'no_credits',
  };
}
