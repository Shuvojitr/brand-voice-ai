import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Clock, User, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Mail, Loader2, CheckCircle } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Newsletter form state
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubscribing) return;

    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, source: "blog" });

      if (error) {
        // Check for unique constraint violation (already subscribed)
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "This email is already on our list!",
          });
          setIsSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: "Successfully subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
      }
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

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

  // Filter posts based on search and category (excluding featured when showing all)
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      // Exclude featured post from main grid when no filters are applied
      if (
        searchQuery === "" &&
        selectedCategory === "all" &&
        featuredPost &&
        post.id === featuredPost.id
      ) {
        return false;
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
  }, [posts, searchQuery, selectedCategory, featuredPost]);

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

  const showFeaturedHero = searchQuery === "" && selectedCategory === "all" && featuredPost;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan/10 blur-3xl" />
        </div>

        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-6">
              Insights & <span className="gradient-text">Inspiration</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Discover tips, tutorials, and the latest trends to help you create exceptional content with AI.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-14 text-base rounded-2xl bg-background/80 backdrop-blur border-border/50 shadow-lg"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange("all")}
                className="rounded-full"
              >
                All Posts
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        {/* Featured Post Hero */}
        {showFeaturedHero && !isLoading && (
          <Link
            to={`/blog/${featuredPost.slug}`}
            className="group block mb-16"
          >
            <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-64 md:h-[420px] overflow-hidden">
                  {featuredPost.featured_image ? (
                    <img
                      src={featuredPost.featured_image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-violet/20 to-cyan/20 flex items-center justify-center">
                      <span className="text-8xl font-bold text-muted-foreground/10">
                        {featuredPost.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent md:hidden" />
                </div>

                {/* Content Section */}
                <div className="relative p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Badge variant="glow" className="text-sm">
                        Featured
                      </Badge>
                      {featuredPost.category && (
                        <Badge variant="outline" className="text-sm">
                          {featuredPost.category}
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="text-muted-foreground text-lg line-clamp-3">
                      {featuredPost.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {featuredPost.author_name && (
                        <div className="flex items-center gap-2">
                          {featuredPost.author_avatar ? (
                            <img
                              src={featuredPost.author_avatar}
                              alt={featuredPost.author_name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium">{featuredPost.author_name}</span>
                        </div>
                      )}
                      {featuredPost.published_at && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(featuredPost.published_at), "MMM d, yyyy")}</span>
                        </div>
                      )}
                      {featuredPost.read_time_minutes && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{featuredPost.read_time_minutes} min read</span>
                        </div>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      Read Article
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Results count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">
              {showFeaturedHero ? "Latest Articles" : "Results"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
            </p>
          </div>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : paginatedPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden rounded-2xl mb-5">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10 flex items-center justify-center">
                        <span className="text-5xl font-bold text-muted-foreground/20">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Category & Date */}
                    <div className="flex items-center gap-3 mb-3 text-sm">
                      {post.category && (
                        <Badge variant="secondary" className="rounded-full font-medium">
                          {post.category}
                        </Badge>
                      )}
                      {post.published_at && (
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(post.published_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Author & Read Time */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        {post.author_avatar ? (
                          <img
                            src={post.author_avatar}
                            alt={post.author_name || "Author"}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {post.author_name || "Admin"}
                        </span>
                      </div>
                      {post.read_time_minutes && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.read_time_minutes} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any articles matching your search. Try adjusting your filters or search terms.
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="rounded-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
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
                        "rounded-full",
                        page === currentPage && "pointer-events-none"
                      )}
                    >
                      {page}
                    </Button>
                  );
                }
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Newsletter Subscription Section */}
        <section className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-violet/5 to-cyan/10 border border-border/50">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
          </div>

          <div className="relative px-6 py-16 md:px-12 md:py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Stay in the <span className="gradient-text">Loop</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
              Get the latest articles, tips, and insights delivered straight to your inbox. No spam, unsubscribe anytime.
            </p>

            {isSubscribed ? (
              <div className="flex items-center justify-center gap-3 text-primary">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-medium">Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-background/80 backdrop-blur border-border/50"
                />
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  disabled={isSubscribing}
                  className="h-12 px-8"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
