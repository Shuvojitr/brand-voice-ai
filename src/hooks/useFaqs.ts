import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number | null;
}

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as FAQ[];
    },
  });
}
