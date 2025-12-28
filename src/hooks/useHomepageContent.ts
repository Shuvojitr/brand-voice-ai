import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface HomepageSection {
  id: string;
  section_key: string;
  content: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface HomepageSectionInput {
  section_key: string;
  content: Record<string, any>;
  is_active?: boolean;
  sort_order?: number;
}

export function useHomepageContent() {
  return useQuery({
    queryKey: ["homepage-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HomepageSection[];
    },
  });
}

export function useHomepageSection(sectionKey: string) {
  return useQuery({
    queryKey: ["homepage-content", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .eq("section_key", sectionKey)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as HomepageSection | null;
    },
  });
}

export function useUpsertHomepageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HomepageSectionInput) => {
      // Check if section exists
      const { data: existing } = await supabase
        .from("homepage_content")
        .select("id")
        .eq("section_key", input.section_key)
        .single();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from("homepage_content")
          .update({
            content: input.content,
            is_active: input.is_active ?? true,
            sort_order: input.sort_order ?? 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("homepage_content")
          .insert({
            section_key: input.section_key,
            content: input.content,
            is_active: input.is_active ?? true,
            sort_order: input.sort_order ?? 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-content"] });
      toast({ title: "Section saved successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to save section",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteHomepageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("homepage_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-content"] });
      toast({ title: "Section deleted" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete section",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
