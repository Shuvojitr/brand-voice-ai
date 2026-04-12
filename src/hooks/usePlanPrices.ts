import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlanPrice {
  id: string;
  plan_id: string;
  provider_id: string;
  price_identifier: string | null;
  price_identifier_yearly: string | null;
  currency: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePlanPrices(planId?: string) {
  return useQuery({
    queryKey: ["plan_prices", planId],
    queryFn: async () => {
      let query = supabase
        .from("plan_prices")
        .select("*")
        .order("created_at", { ascending: true });

      if (planId) {
        query = query.eq("plan_id", planId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PlanPrice[];
    },
  });
}

export function useUpsertPlanPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (price: Omit<PlanPrice, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("plan_prices")
        .upsert(price, { onConflict: "plan_id,provider_id,currency" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan_prices"] });
    },
  });
}

export function useDeletePlanPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plan_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan_prices"] });
    },
  });
}
