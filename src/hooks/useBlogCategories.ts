import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  post_count?: number;
  parent_name?: string;
}

export interface BlogCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  is_active?: boolean;
}

export function useBlogCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      // Fetch categories
      const { data: categories, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      // Fetch post counts per category
      const { data: postCounts, error: pcError } = await supabase
        .from("post_categories")
        .select("category_id");

      if (pcError) throw pcError;

      const countMap: Record<string, number> = {};
      postCounts?.forEach((pc: any) => {
        countMap[pc.category_id] = (countMap[pc.category_id] || 0) + 1;
      });

      // Build parent name map
      const catMap: Record<string, string> = {};
      categories?.forEach((c: any) => {
        catMap[c.id] = c.name;
      });

      return (categories || []).map((c: any) => ({
        ...c,
        post_count: countMap[c.id] || 0,
        parent_name: c.parent_id ? catMap[c.parent_id] || null : null,
      })) as BlogCategory[];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (input: BlogCategoryInput) => {
      const { data, error } = await supabase
        .from("blog_categories")
        .insert({
          name: input.name.trim(),
          slug: input.slug.trim().toLowerCase(),
          description: input.description?.trim() || null,
          parent_id: input.parent_id || null,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          if (error.message.includes("idx_blog_categories_name_lower")) {
            throw new Error("A category with this name already exists.");
          }
          if (error.message.includes("blog_categories_slug_key")) {
            throw new Error("A category with this slug already exists.");
          }
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast({ title: "Category created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...input }: BlogCategoryInput & { id: string }) => {
      // Prevent circular parent
      if (input.parent_id === id) {
        throw new Error("A category cannot be its own parent.");
      }

      // Check children to prevent circular hierarchy
      if (input.parent_id) {
        const allCats = categoriesQuery.data || [];
        const isDescendant = (parentId: string, targetId: string): boolean => {
          const children = allCats.filter((c) => c.parent_id === targetId);
          for (const child of children) {
            if (child.id === parentId) return true;
            if (isDescendant(parentId, child.id)) return true;
          }
          return false;
        };
        if (isDescendant(input.parent_id, id)) {
          throw new Error("Cannot set a descendant as the parent (circular hierarchy).");
        }
      }

      const { data, error } = await supabase
        .from("blog_categories")
        .update({
          name: input.name.trim(),
          slug: input.slug.trim().toLowerCase(),
          description: input.description?.trim() || null,
          parent_id: input.parent_id || null,
          is_active: input.is_active ?? true,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          if (error.message.includes("idx_blog_categories_name_lower")) {
            throw new Error("A category with this name already exists.");
          }
          if (error.message.includes("blog_categories_slug_key")) {
            throw new Error("A category with this slug already exists.");
          }
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.code === "23503") {
          throw new Error("Cannot delete this category because it has posts assigned. Reassign posts first.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .in("id", ids);

      if (error) {
        if (error.code === "23503") {
          throw new Error("Some categories have posts assigned and cannot be deleted.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast({ title: "Categories deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDelete,
  };
}
