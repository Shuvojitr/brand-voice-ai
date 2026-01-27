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
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { useMemo } from "react";

export default function BlogCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { data: allPosts, isLoading } = useBlogPosts();

  // Filter posts by category (case-insensitive)
  const filteredPosts = useMemo(() => {
    if (!allPosts || !category) return [];
    return allPosts.filter(
      (post) => post.category?.toLowerCase() === decodeURIComponent(category).toLowerCase()
    );
  }, [allPosts, category]);

  // Get unique categories for navigation
  const allCategories = useMemo(() => {
    if (!allPosts) return [];
    const categories = new Set<string>();
    allPosts.forEach((post) => {
      if (post.category) categories.add(post.category);
    });
    return Array.from(categories).sort();
  }, [allPosts]);

  const displayCategory = category ? decodeURIComponent(category) : "";

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 md:py-20">
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

  return (
    <Layout>
      <div className="container py-12 md:py-20">
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
          <Badge variant="secondary" className="mb-4">
            Category
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {displayCategory}
          </h1>
          <p className="text-lg text-muted-foreground">
            {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"} in this category
          </p>
        </header>

        {/* Category Navigation */}
        {allCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {allCategories.map((cat) => (
              <Link key={cat} to={`/blog/category/${encodeURIComponent(cat)}`}>
                <Badge
                  variant={cat.toLowerCase() === displayCategory.toLowerCase() ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {cat}
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
                {/* Featured Image */}
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
                  {/* Meta info */}
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
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2 mb-4">
                    {post.excerpt}
                  </CardDescription>

                  {/* Author */}
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
