import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  author_name: string | null;
  author_avatar: string | null;
  author_user_id: string | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  published_at: string | null;
  read_time_minutes: number | null;
  tags: string[] | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  // Draft revision fields
  draft_title: string | null;
  draft_excerpt: string | null;
  draft_content: string | null;
  draft_featured_image: string | null;
  has_pending_changes: boolean | null;
  // Scheduled publishing
  scheduled_publish_at: string | null;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category?: string;
  author_name?: string;
  author_avatar?: string;
  author_user_id?: string | null;
  is_published?: boolean;
  is_featured?: boolean;
  published_at?: string;
  read_time_minutes?: number;
  tags?: string[];
  sort_order?: number;
  // Draft revision fields
  draft_title?: string | null;
  draft_excerpt?: string | null;
  draft_content?: string | null;
  draft_featured_image?: string | null;
  has_pending_changes?: boolean;
  // Scheduled publishing
  scheduled_publish_at?: string | null;
}

// Fetch all published blog posts (for landing page)
export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

// Fetch featured blog posts (for landing page section)
export function useFeaturedBlogPosts(limit = 3) {
  return useQuery({
    queryKey: ["blog-posts", "featured", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

// Fetch all blog posts (for admin)
export function useAllBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

// Fetch single blog post by slug
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-posts", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
}

// Create blog post
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BlogPostInput) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Blog post created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to create blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update blog post
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: BlogPostInput & { id: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Blog post updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete blog post
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Blog post deleted" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
