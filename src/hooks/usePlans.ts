import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  price_yearly: number | null;
  currency: string;
  interval: "month" | "year" | "forever";
  stripe_price_id: string | null;
  stripe_price_id_yearly: string | null;
  features_monthly: string[];
  features_yearly: string[];
  credits: number;
  credits_yearly: number | null;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  cta_text: string | null;
  yearly_discount: number;
  monthly_discount: number;
  created_at: string;
  updated_at: string;
}

export function usePlans(includeInactive = false) {
  return useQuery({
    queryKey: ["plans", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Plan[];
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Omit<Plan, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("plans")
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...plan }: Partial<Plan> & { id: string }) => {
      const { data, error } = await supabase
        .from("plans")
        .update(plan)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}
