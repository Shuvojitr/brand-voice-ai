import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { BlogPost } from "@/hooks/useBlogPosts";

function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["blog-category-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

function useActiveCategories() {
  return useQuery({
    queryKey: ["blog-categories-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

function usePostsByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["blog-posts-by-category", categoryId],
    queryFn: async () => {
      // Get post IDs from pivot table
      const { data: pivotRows, error: pivotError } = await supabase
        .from("post_categories")
        .select("post_id")
        .eq("category_id", categoryId!);
      if (pivotError) throw pivotError;

      const postIds = pivotRows?.map((r) => r.post_id) || [];
      if (postIds.length === 0) return [];

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .in("id", postIds)
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BlogPost[];
    },
    enabled: !!categoryId,
  });
}

export default function BlogCategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const decodedSlug = categorySlug ? decodeURIComponent(categorySlug) : "";

  const { data: category, isLoading: catLoading } = useCategoryBySlug(decodedSlug);
  const { data: allCategories = [] } = useActiveCategories();
  const { data: filteredPosts = [], isLoading: postsLoading } = usePostsByCategory(category?.id);

  const isLoading = catLoading || postsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 md:py-10">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-1/2 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px]" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-6 md:py-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Category not found</h1>
          <p className="text-muted-foreground mb-8">This category doesn't exist or is inactive.</p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse all articles
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <Badge variant="secondary" className="mb-4">Category</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-muted-foreground mb-2">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"} in this category
          </p>
        </header>

        {/* Category Navigation */}
        {allCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {allCategories.map((cat) => (
              <Link key={cat.id} to={`/blog/category/${encodeURIComponent(cat.slug)}`}>
                <Badge
                  variant={cat.slug === decodedSlug ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">No articles found</h2>
            <p className="text-muted-foreground mb-8">
              There are no published articles in this category yet.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse all articles
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all duration-300 flex flex-col"
              >
                {post.featured_image ? (
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                ) : (
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-muted-foreground/20">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  </Link>
                )}

                <CardHeader className="pb-2 flex-grow">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {post.read_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.read_time_minutes} min read</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2 mb-4">{post.excerpt}</CardDescription>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      {post.author_avatar ? (
                        <img
                          src={post.author_avatar}
                          alt={post.author_name || "Author"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <span className="text-sm font-medium">{post.author_name || "Admin"}</span>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Read
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
