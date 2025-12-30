import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TemplateInputField, TemplateCategory } from "@/lib/types/ai";
import type { Json } from "@/integrations/supabase/types";

export interface DatabaseTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  form_schema_json: Json;
  system_prompt: string;
  output_format: string | null;
  estimated_credits: number | null;
  supported_languages: string[] | null;
  tags: string[] | null;
  is_active: boolean | null;
  sort_order: number | null;
}

// Helper to safely cast form_schema_json to TemplateInputField[]
export function getFormFields(template: DatabaseTemplate): TemplateInputField[] {
  return template.form_schema_json as unknown as TemplateInputField[];
}

export function useTemplates(includeInactive = false) {
  return useQuery({
    queryKey: ["templates", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DatabaseTemplate[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplate(slug: string | undefined) {
  return useQuery({
    queryKey: ["template", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as DatabaseTemplate;
    },
    enabled: !!slug,
  });
}

export function useTemplatesByCategory(category: TemplateCategory | "all") {
  return useQuery({
    queryKey: ["templates", "category", category],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DatabaseTemplate[];
    },
  });
}

// Helper to get all unique categories
export function getAllCategories(): { category: TemplateCategory; label: string; icon: string }[] {
  return [
    { category: 'blog', label: 'Blog & Articles', icon: 'FileText' },
    { category: 'social', label: 'Social Media', icon: 'Share2' },
    { category: 'ads', label: 'Advertisements', icon: 'Target' },
    { category: 'email', label: 'Email Marketing', icon: 'Mail' },
    { category: 'product', label: 'Product Content', icon: 'Package' },
    { category: 'seo', label: 'SEO', icon: 'Search' },
  ];
}
