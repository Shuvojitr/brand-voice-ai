import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TemplateIcon {
  id: string;
  name: string;
  sort_order: number | null;
  is_active: boolean | null;
}

export function useTemplateIcons() {
  return useQuery({
    queryKey: ["template-icons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_icons")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TemplateIcon[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllTemplateIcons() {
  return useQuery({
    queryKey: ["template-icons", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_icons")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TemplateIcon[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
