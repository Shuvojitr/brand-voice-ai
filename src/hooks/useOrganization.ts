import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, isPast, parseISO } from "date-fns";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_tier: "free" | "starter" | "pro" | "enterprise" | null;
  subscription_status: string;
  subscription_ends_at: string | null;
  remaining_credits: number;
  monthly_credits: number | null;
  credits_used: number | null;
  has_used_free_plan: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SubscriptionStatus {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number | null;
  expiryDate: Date | null;
}

export function getSubscriptionStatus(organization: Organization | null): SubscriptionStatus {
  if (!organization || !organization.subscription_ends_at) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysUntilExpiry: null,
      expiryDate: null,
    };
  }

  const expiryDate = parseISO(organization.subscription_ends_at);
  const isExpired = isPast(expiryDate);
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 7;

  return {
    isExpired,
    isExpiringSoon,
    daysUntilExpiry: isExpired ? 0 : daysUntilExpiry,
    expiryDate,
  };
}

export function useOrganization() {
  const queryClient = useQueryClient();

  const { data: organization, isLoading, error } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: membership, error: memberError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) throw memberError;
      
      // Return null if user has no organization yet
      if (!membership) return null;

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", membership.organization_id)
        .single();

      if (orgError) throw orgError;
      return org as Organization;
    },
  });

  const subscriptionStatus = getSubscriptionStatus(organization ?? null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["organization"] });
  };

  return { organization, isLoading, error, invalidate, subscriptionStatus };
}
