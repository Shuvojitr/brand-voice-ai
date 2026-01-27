import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Clock, User, ArrowRight, ChevronLeft, ChevronRight, BookOpen, TrendingUp } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique categories from posts
  const categories = useMemo(() => {
    if (!posts) return [];
    const cats = new Set(posts.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [posts]);

  // Get featured post (first featured or first post)
  const featuredPost = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return posts.find((p) => p.is_featured) || posts[0];
  }, [posts]);

  // Get secondary featured posts (next 2 posts after featured)
  const secondaryPosts = useMemo(() => {
    if (!posts || posts.length < 2) return [];
    const remaining = posts.filter((p) => p.id !== featuredPost?.id);
    return remaining.slice(0, 2);
  }, [posts, featuredPost]);

  // Filter posts based on search and category (excluding featured when showing all)
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      // Exclude featured and secondary posts from main grid when no filters are applied
      if (searchQuery === "" && selectedCategory === "all") {
        const excludeIds = [featuredPost?.id, ...secondaryPosts.map(p => p.id)].filter(Boolean);
        if (excludeIds.includes(post.id)) return false;
      }

      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory, featuredPost, secondaryPosts]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const showFeaturedSection = searchQuery === "" && selectedCategory === "all" && featuredPost;

  return (
    <Layout>
      {/* Minimal Header */}
      <section className="border-b border-border/40 bg-background">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Blog</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Latest Articles
              </h1>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 mt-8 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-10 md:py-14">
        {/* Featured Section - Magazine Layout */}
        {showFeaturedSection && !isLoading && (
          <div className="mb-14">
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Main Featured Post - Takes 3 columns */}
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="lg:col-span-3 group"
              >
                <Card className="h-full overflow-hidden border-0 bg-transparent shadow-none">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                    {featuredPost.featured_image ? (
                      <img
                        src={featuredPost.featured_image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground border-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                        {featuredPost.category && (
                          <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                            {featuredPost.category}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-primary-foreground/90 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/80 line-clamp-2 text-base md:text-lg mb-4 max-w-2xl">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        {featuredPost.author_name && (
                          <div className="flex items-center gap-2">
                            {featuredPost.author_avatar ? (
                              <img
                                src={featuredPost.author_avatar}
                                alt={featuredPost.author_name}
                                className="h-6 w-6 rounded-full object-cover ring-2 ring-white/30"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                                <User className="h-3 w-3" />
                              </div>
                            )}
                            <span>{featuredPost.author_name}</span>
                          </div>
                        )}
                        {featuredPost.published_at && (
                          <span>{format(new Date(featuredPost.published_at), "MMM d, yyyy")}</span>
                        )}
                        {featuredPost.read_time_minutes && (
                          <span>{featuredPost.read_time_minutes} min read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Secondary Posts - Takes 2 columns */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {secondaryPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group flex-1"
                  >
                    <Card className="h-full overflow-hidden border-0 bg-transparent shadow-none">
                      <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full overflow-hidden rounded-2xl">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/50 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          {post.category && (
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm mb-2">
                              {post.category}
                            </Badge>
                          )}
                          <h3 className="text-lg md:text-xl font-semibold text-white leading-snug line-clamp-2 group-hover:text-primary-foreground/90 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
                            {post.published_at && (
                              <span>{format(new Date(post.published_at), "MMM d")}</span>
                            )}
                            {post.read_time_minutes && (
                              <span>{post.read_time_minutes} min</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-foreground">
              {showFeaturedSection ? "More Articles" : "Articles"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
            </span>
          </div>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : paginatedPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group"
              >
                <article className="h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/50 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Category & Date */}
                    <div className="flex items-center gap-2 mb-2">
                      {post.category && (
                        <span className="text-xs font-medium text-primary">
                          {post.category}
                        </span>
                      )}
                      {post.category && post.published_at && (
                        <span className="text-muted-foreground">·</span>
                      )}
                      {post.published_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.published_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Author & Read Time */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {post.author_avatar ? (
                          <img
                            src={post.author_avatar}
                            alt={post.author_name || "Author"}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-2.5 w-2.5" />
                          </div>
                        )}
                        <span>{post.author_name || "Admin"}</span>
                      </div>
                      {post.read_time_minutes && (
                        <>
                          <span>·</span>
                          <span>{post.read_time_minutes} min read</span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-muted mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              We couldn't find any articles matching your search.
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="rounded-lg"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "rounded-lg h-9 w-9 text-sm",
                      page === currentPage && "pointer-events-none"
                    )}
                  >
                    {page}
                  </Button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-1 text-muted-foreground text-sm">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
