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

export function useTemplateBySlug(slugOrId: string | undefined) {
  return useQuery({
    queryKey: ["template", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;

      // First try to find by slug
      const { data: bySlug, error: slugError } = await supabase
        .from("templates")
        .select("*")
        .eq("slug", slugOrId)
        .eq("is_active", true)
        .maybeSingle();

      if (bySlug) {
        return {
          ...bySlug,
          inputs: parseFormSchema(bySlug.form_schema_json),
        } as ParsedTemplate;
      }

      // If not found by slug, try by ID (for UUID-style lookups)
      const { data: byId, error: idError } = await supabase
        .from("templates")
        .select("*")
        .eq("id", slugOrId)
        .eq("is_active", true)
        .maybeSingle();

      if (byId) {
        return {
          ...byId,
          inputs: parseFormSchema(byId.form_schema_json),
        } as ParsedTemplate;
      }

      // If still not found, log for debugging
      console.log(`[useTemplateBySlug] Template not found for: ${slugOrId}`);
      return null;
    },
    enabled: !!slugOrId,
  });
}
