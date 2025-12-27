import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageInput {
  title: string;
  slug: string;
  content?: string;
  is_published?: boolean;
}

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Page[];
    },
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as Page | null;
    },
    enabled: !!slug,
  });
}

export function usePageById(id: string) {
  return useQuery({
    queryKey: ["page-by-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Page;
    },
    enabled: !!id,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PageInput) => {
      const { data, error } = await supabase
        .from("pages")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create page: ${error.message}`);
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: PageInput & { id: string }) => {
      const { data, error } = await supabase
        .from("pages")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update page: ${error.message}`);
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete page: ${error.message}`);
    },
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
