import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { useMemo } from "react";

export default function BlogAuthorPage() {
  const { name } = useParams<{ name: string }>();
  const { data: allPosts, isLoading } = useBlogPosts();

  const decodedName = name ? decodeURIComponent(name) : "";

  // Filter posts by author (case-insensitive)
  const filteredPosts = useMemo(() => {
    if (!allPosts || !decodedName) return [];
    return allPosts.filter(
      (post) => post.author_name?.toLowerCase() === decodedName.toLowerCase()
    );
  }, [allPosts, decodedName]);

  // Get author info from the first matching post
  const authorInfo = useMemo(() => {
    if (filteredPosts.length === 0) return null;
    const firstPost = filteredPosts[0];
    return {
      name: firstPost.author_name || "Unknown Author",
      avatar: firstPost.author_avatar,
    };
  }, [filteredPosts]);

  // Calculate total read time across all posts
  const totalReadTime = useMemo(() => {
    return filteredPosts.reduce((acc, post) => acc + (post.read_time_minutes || 0), 0);
  }, [filteredPosts]);

  // Get unique categories this author has written about
  const authorCategories = useMemo(() => {
    const categories = new Set<string>();
    filteredPosts.forEach((post) => {
      if (post.category) categories.add(post.category);
    });
    return Array.from(categories);
  }, [filteredPosts]);

  // Get all unique authors for navigation
  const allAuthors = useMemo(() => {
    if (!allPosts) return [];
    const authors = new Map<string, { name: string; avatar: string | null; count: number }>();
    allPosts.forEach((post) => {
      if (post.author_name) {
        const existing = authors.get(post.author_name);
        if (existing) {
          existing.count++;
        } else {
          authors.set(post.author_name, {
            name: post.author_name,
            avatar: post.author_avatar,
            count: 1,
          });
        }
      }
    });
    return Array.from(authors.values()).sort((a, b) => b.count - a.count);
  }, [allPosts]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 md:py-20">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="flex items-center gap-6 mb-12">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
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
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        {/* Author Profile Header */}
        {authorInfo ? (
          <header className="mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={authorInfo.avatar || undefined} alt={authorInfo.name} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {authorInfo.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">
                  Author
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  {authorInfo.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{totalReadTime} min total read time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories this author writes about */}
            {authorCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Writes about:</span>
                {authorCategories.map((cat) => (
                  <Link key={cat} to={`/blog/category/${encodeURIComponent(cat)}`}>
                    <Badge variant="outline" className="hover:bg-primary/10 transition-colors">
                      {cat}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>
        ) : (
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">
              Author
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {decodedName}
            </h1>
            <p className="text-muted-foreground">
              No articles found for this author.
            </p>
          </header>
        )}

        {/* Other Authors Navigation */}
        {allAuthors.length > 1 && (
          <div className="mb-10">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Other Authors</h2>
            <div className="flex flex-wrap gap-3">
              {allAuthors.map((author) => (
                <Link
                  key={author.name}
                  to={`/blog/author/${encodeURIComponent(author.name)}`}
                >
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
                      author.name.toLowerCase() === decodedName.toLowerCase()
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={author.avatar || undefined} alt={author.name} />
                      <AvatarFallback className="text-xs bg-muted">
                        {author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{author.name}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {author.count}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No articles found</h2>
            <p className="text-muted-foreground mb-8">
              This author hasn't published any articles yet.
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
                  {/* Category & Date */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    {post.category && (
                      <Link
                        to={`/blog/category/${encodeURIComponent(post.category)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors">
                          {post.category}
                        </Badge>
                      </Link>
                    )}
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
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

                  {/* Read Time */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    {post.read_time_minutes && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{post.read_time_minutes} min read</span>
                      </div>
                    )}

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
