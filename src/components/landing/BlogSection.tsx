import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { useFeaturedBlogPosts } from "@/hooks/useBlogPosts";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function BlogSection() {
  const { data: posts, isLoading } = useFeaturedBlogPosts(3);

  // Don't render section if no posts
  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="outline" className="mb-4">Blog</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Latest from our{" "}
              <span className="gradient-text">Blog</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted/50 animate-pulse" />
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted/50 animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted/50 animate-pulse rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 md:py-28 border-t border-border">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">Blog</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Latest from our{" "}
            <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Tips, tutorials, and insights to help you create better content.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all duration-300"
            >
              {/* Featured Image */}
              {post.featured_image ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {post.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-primary/90">
                      Featured
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground/20">
                    {post.title.charAt(0)}
                  </span>
                  {post.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-primary/90">
                      Featured
                    </Badge>
                  )}
                </div>
              )}

              <CardHeader className="pb-2">
                {/* Category & Tags */}
                <div className="flex items-center gap-2 mb-2">
                  {post.category && (
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">
                  {post.excerpt}
                </CardDescription>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author_name || "Admin"}</span>
                  </div>
                  {post.read_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.read_time_minutes} min read</span>
                    </div>
                  )}
                  {post.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Read More Link */}
                <Link 
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/blog">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
