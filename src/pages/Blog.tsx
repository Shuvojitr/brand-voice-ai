import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Search, ArrowRight, Mail, Sparkles } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

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

  // Visible posts based on load more
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const hasMorePosts = visibleCount < filteredPosts.length;

  // Reset when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + POSTS_PER_PAGE);
  };

  const showFeaturedSection = searchQuery === "" && selectedCategory === "all" && featuredPost;

  return (
    <Layout>
      {/* Hero Header */}
      <section className="py-12 md:py-16 text-center">
        <div className="container">
          <Badge variant="outline" className="mb-6 text-xs font-medium tracking-wider uppercase">
            Engineering Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Words, <span className="italic font-serif">Reinvented.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Deep dives into Large Language Models, prompt engineering strategies, and the future of creative work.
          </p>
        </div>
      </section>

      {/* Featured Section */}
      {showFeaturedSection && !isLoading && (
        <section className="container mb-12">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Featured Post */}
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="lg:col-span-2 group"
            >
              <div className="relative h-full min-h-[400px] overflow-hidden rounded-2xl">
                {featuredPost.featured_image ? (
                  <img
                    src={featuredPost.featured_image}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    {featuredPost.category && (
                      <Badge className="bg-foreground/90 text-background hover:bg-foreground text-xs">
                        {featuredPost.category}
                      </Badge>
                    )}
                    {featuredPost.read_time_minutes && (
                      <span className="text-white/70 text-sm">
                        {featuredPost.read_time_minutes} min read
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 max-w-xl">
                    {featuredPost.title}
                  </h2>
                  
                  {featuredPost.author_name && (
                    <div className="flex items-center gap-3">
                      {featuredPost.author_avatar ? (
                        <img
                          src={featuredPost.author_avatar}
                          alt={featuredPost.author_name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
                          {featuredPost.author_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">{featuredPost.author_name}</p>
                        <p className="text-white/60 text-xs">Author</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Secondary Posts */}
            <div className="flex flex-col gap-6">
              {/* Text Card */}
              {secondaryPosts[0] && (
                <Link
                  to={`/blog/${secondaryPosts[0].slug}`}
                  className="group flex-1"
                >
                  <Card className="h-full p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <div>
                      {secondaryPosts[0].category && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                          {secondaryPosts[0].category}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold mt-2 leading-snug group-hover:text-primary transition-colors">
                        {secondaryPosts[0].title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      {secondaryPosts[0].published_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(secondaryPosts[0].published_at), "MMM d, yyyy")}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              )}

              {/* Dark Feature Card */}
              {secondaryPosts[1] && (
                <Link
                  to={`/blog/${secondaryPosts[1].slug}`}
                  className="group flex-1"
                >
                  <Card className="h-full p-6 bg-foreground text-background flex flex-col justify-between hover:bg-foreground/90 transition-colors">
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-primary-foreground/70">
                        New Feature
                      </span>
                      <h3 className="text-lg font-semibold mt-2 leading-snug">
                        {secondaryPosts[1].title}
                      </h3>
                      {secondaryPosts[1].excerpt && (
                        <p className="text-sm text-background/70 mt-3 line-clamp-2">
                          {secondaryPosts[1].excerpt}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <section className="container mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
                selectedCategory === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              All Posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-10 rounded-full bg-muted/50 border-border/50"
            />
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container pb-16">
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : visiblePosts.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group"
                >
                  <article>
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/50 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      {/* Category Badge */}
                      {post.category && (
                        <Badge className="absolute top-3 right-3 bg-background/90 text-foreground hover:bg-background text-xs shadow-sm">
                          {post.category}
                        </Badge>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      {post.published_at && (
                        <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
                      )}
                      {post.published_at && post.read_time_minutes && (
                        <span>•</span>
                      )}
                      {post.read_time_minutes && (
                        <span>{post.read_time_minutes} min read</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  </article>
                </Link>
              ))}

              {/* Newsletter Card - Shows after 5 posts */}
              {visiblePosts.length >= 5 && (
                <div className="sm:col-span-1">
                  <Card className="h-full p-6 border-dashed border-2 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Don't miss a prompt</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join 50k+ writers getting weekly tips.
                    </p>
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="rounded-lg"
                    />
                  </Card>
                </div>
              )}
            </div>

            {/* Load More */}
            {hasMorePosts && (
              <div className="flex justify-center mt-12">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="rounded-full px-8"
                >
                  Load older articles
                </Button>
              </div>
            )}
          </>
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
                className="rounded-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}
