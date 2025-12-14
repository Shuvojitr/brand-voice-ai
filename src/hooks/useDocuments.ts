import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import { useToast } from "@/hooks/use-toast";

export interface Document {
  id: string;
  title: string;
  content: string | null;
  template_type: string | null;
  folder: string | null;
  is_favorite: boolean | null;
  word_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useDocuments() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ["documents", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("id, title, content, template_type, folder, is_favorite, word_count, created_at, updated_at")
        .eq("organization_id", organization.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!organization?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been permanently deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from("documents")
        .update({ is_favorite: isFavorite })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return {
    documents: documents || [],
    isLoading,
    error,
    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    toggleFavorite: toggleFavoriteMutation.mutate,
  };
}
