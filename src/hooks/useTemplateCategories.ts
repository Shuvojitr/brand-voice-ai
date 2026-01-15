import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TemplateCategory {
  id: string;
  value: string;
  label: string;
  icon: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

export function useTemplateCategories() {
  return useQuery({
    queryKey: ["template-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TemplateCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllTemplateCategories() {
  return useQuery({
    queryKey: ["template-categories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TemplateCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
