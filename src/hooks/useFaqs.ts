import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

export function useFaqs(includeInactive = false) {
  return useQuery({
    queryKey: ["faqs", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FAQ[];
    },
  });
}
