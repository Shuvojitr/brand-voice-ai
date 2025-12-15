import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { TemplateInputField } from "@/lib/types/ai";

export interface DatabaseTemplate {
  id: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  description_bn: string | null;
  category: string;
  icon: string | null;
  slug: string;
  system_prompt: string;
  form_schema_json: Json;
  estimated_credits: number | null;
  output_format: string | null;
  supported_languages: string[] | null;
  tags: string[] | null;
  is_active: boolean | null;
}

export interface ParsedTemplate extends Omit<DatabaseTemplate, 'form_schema_json'> {
  inputs: TemplateInputField[];
}

function parseFormSchema(json: Json): TemplateInputField[] {
  if (!json || !Array.isArray(json)) return [];
  return json as unknown as TemplateInputField[];
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return (data || []).map(t => ({
        ...t,
        inputs: parseFormSchema(t.form_schema_json),
      })) as ParsedTemplate[];
    },
  });
}

export function useTemplateBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["template", slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return {
        ...data,
        inputs: parseFormSchema(data.form_schema_json),
      } as ParsedTemplate;
    },
    enabled: !!slug,
  });
}
