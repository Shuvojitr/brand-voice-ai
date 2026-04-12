import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentProvider {
  id: string;
  name: string;
  slug: string;
  provider_type: string;
  description: string | null;
  logo_url: string | null;
  api_key_encrypted: string | null;
  api_secret_encrypted: string | null;
  webhook_secret_encrypted: string | null;
  webhook_url: string | null;
  mode: "test" | "live";
  is_active: boolean;
  config: Record<string, any>;
  supported_currencies: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function usePaymentProviders(includeInactive = false) {
  return useQuery({
    queryKey: ["payment_providers", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("payment_providers")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentProvider[];
    },
  });
}

export function useUpdatePaymentProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaymentProvider> & { id: string }) => {
      const { data, error } = await supabase
        .from("payment_providers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_providers"] });
    },
  });
}

export function useCreatePaymentProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: Omit<PaymentProvider, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("payment_providers")
        .insert(provider)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_providers"] });
    },
  });
}

export function useDeletePaymentProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_providers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_providers"] });
    },
  });
}
