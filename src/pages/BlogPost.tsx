import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  Tag,
  BookOpen,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");
  const { data: allPosts } = useBlogPosts();
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get related posts (same category or shared tags)
  const relatedPosts = useMemo(() => {
    if (!post || !allPosts) return [];

    return allPosts
      .filter((p) => {
        if (p.id === post.id) return false;
        if (p.category === post.category) return true;
        if (post.tags && p.tags) {
          return post.tags.some((tag) => p.tags?.includes(tag));
        }
        return false;
      })
      .slice(0, 3);
  }, [post, allPosts]);

  // Get popular posts
  const popularPosts = useMemo(() => {
    if (!allPosts) return [];
    return allPosts
      .filter((p) => p.id !== post?.id && p.is_featured)
      .slice(0, 4);
  }, [allPosts, post]);

  // Get all unique categories
  const categories = useMemo(() => {
    if (!allPosts) return [];
    const cats = [...new Set(allPosts.map((p) => p.category).filter(Boolean))];
    return cats.slice(0, 6);
  }, [allPosts]);

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!allPosts) return [];
    const tags = allPosts.flatMap((p) => p.tags || []);
    const uniqueTags = [...new Set(tags)];
    return uniqueTags.slice(0, 12);
  }, [allPosts]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = post ? `${post.title} - Check out this article!` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  if (isLoading) {
    return (
      <Layout>
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
          <div className="h-full bg-primary/50 w-0" />
        </div>

        <div className="container py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <Skeleton className="h-8 w-32 mb-6" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <aside className="lg:col-span-4">
              <Skeleton className="h-[300px] w-full rounded-2xl mb-6" />
              <Skeleton className="h-[200px] w-full rounded-2xl" />
            </aside>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted/50 z-50">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Header */}
            <header className="mb-8">
              {/* Category */}
              {post.category && (
                <Link to={`/blog?category=${post.category}`}>
                  <Badge variant="secondary" className="mb-4 hover:bg-secondary/80 transition-colors">
                    {post.category}
                  </Badge>
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Author & Meta */}
              <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-border/50">
                {/* Author */}
                <div className="flex items-center gap-3">
                  {post.author_avatar ? (
                    <img
                      src={post.author_avatar}
                      alt={post.author_name || "Author"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-border">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{post.author_name || "Admin"}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {post.published_at && (
                        <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
                      )}
                      {post.read_time_minutes && (
                        <>
                          <span>·</span>
                          <span>{post.read_time_minutes} min read</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={shareOnTwitter}
                    title="Share on Twitter"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={shareOnFacebook}
                    title="Share on Facebook"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={shareOnLinkedIn}
                    title="Share on LinkedIn"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyLink}
                    title="Copy link"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-10">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {post.content ? (
                <MarkdownRenderer content={post.content} />
              ) : (
                <p className="text-muted-foreground italic">No content available.</p>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Share Section */}
            <div className="mt-10 p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Enjoyed this article?</p>
                    <p className="text-sm text-muted-foreground">Share it with your network</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-12 pt-10 border-t border-border/50">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Related Articles
                </h2>

                <div className="grid gap-6 md:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden border-border/50 bg-card/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                        {relatedPost.featured_image ? (
                          <div className="relative h-32 overflow-hidden">
                            <img
                              src={relatedPost.featured_image}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                            <span className="text-3xl font-bold text-muted-foreground/20">
                              {relatedPost.title.charAt(0)}
                            </span>
                          </div>
                        )}

                        <CardHeader className="p-4 pb-2">
                          {relatedPost.category && (
                            <Badge variant="secondary" className="text-xs w-fit mb-2">
                              {relatedPost.category}
                            </Badge>
                          )}
                          <CardTitle className="text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {relatedPost.published_at && (
                              <span>{format(new Date(relatedPost.published_at), "MMM d")}</span>
                            )}
                            {relatedPost.read_time_minutes && (
                              <>
                                <span>·</span>
                                <span>{relatedPost.read_time_minutes} min</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Author Card */}
              <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                <CardContent className="pt-0 -mt-8">
                  <div className="flex flex-col items-center text-center">
                    {post.author_avatar ? (
                      <img
                        src={post.author_avatar}
                        alt={post.author_name || "Author"}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-background"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-4 ring-background">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <h3 className="font-semibold mt-3">{post.author_name || "Admin"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Content Writer</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link to="/blog">View all articles</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Posts */}
              {popularPosts.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Popular Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {popularPosts.map((popPost, index) => (
                      <Link
                        key={popPost.id}
                        to={`/blog/${popPost.slug}`}
                        className="flex gap-3 group"
                      >
                        <span className="text-2xl font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {popPost.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{popPost.read_time_minutes || 5} min read</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Link key={cat} to={`/blog?category=${cat}`}>
                          <Badge
                            variant={cat === post.category ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {cat}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags Cloud */}
              {allTags.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CTA Card */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Start Creating</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate high-quality content with our AI-powered platform.
                    </p>
                    <Button variant="gradient" size="sm" className="w-full" asChild>
                      <Link to="/signup">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
}