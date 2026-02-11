import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BlurImage } from "@/components/ui/blur-image";
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
} from "lucide-react";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";

export default function BlogPostPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");
  const { data: allPosts } = useBlogPosts();
  const [copied, setCopied] = useState(false);

  // Get related posts (same category or shared tags)
  const relatedPosts = useMemo(() => {
    if (!post || !allPosts) return [];

    return allPosts
      .filter((p) => {
        if (p.id === post.id) return false;
        // Same category
        if (p.category === post.category) return true;
        // Shared tags
        if (post.tags && p.tags) {
          return post.tags.some((tag) => p.tags?.includes(tag));
        }
        return false;
      })
      .slice(0, 3);
  }, [post, allPosts]);

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
        <div className="container py-12 md:py-20 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
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
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/30">
        <Progress value={scrollProgress} className="h-1 rounded-none bg-transparent [&>div]:bg-primary" />
      </div>

      <article className="container px-4 sm:px-6 lg:px-8 py-8 md:py-20">
        {/* Back Link */}
        <Link
          to="/blog"
          className="hidden lg:inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-8 md:mb-12 px-1">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs sm:text-sm text-muted-foreground">
            <Link
              to={`/blog/author/${encodeURIComponent(post.author_name || "Admin")}`}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              {post.author_avatar ? (
                <img src={post.author_avatar} alt={post.author_name || "Admin"} className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover" />
              ) : (
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              <span>{post.author_name || "Admin"}</span>
            </Link>
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
              </div>
            )}
            {post.read_time_minutes && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{post.read_time_minutes} min</span>
              </div>
            )}
            {post.category && (
              <Link
                to={`/blog/category/${encodeURIComponent(post.category)}`}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Badge variant="secondary" className="text-[10px] sm:text-xs hover:bg-secondary/80 transition-colors">
                  {post.category}
                </Badge>
              </Link>
            )}
          </div>
        </header>

        {/* Two-column layout: Content + Sidebar */}
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-10">
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video">
                  <BlurImage
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {post.content ? (
              <>
                <TableOfContents content={post.content} />
                <div
                  className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-2xl prose-h1:md:text-3xl prose-h1:mt-6 prose-h1:md:mt-8 prose-h1:mb-3 prose-h1:md:mb-4 prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-6 prose-h2:md:mt-8 prose-h2:mb-3 prose-h2:md:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-lg prose-h3:md:text-xl prose-h3:mt-5 prose-h3:md:mt-6 prose-h3:mb-2 prose-h3:md:mb-3 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-img:rounded-xl prose-img:shadow-lg prose-strong:font-semibold"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.content, {
                      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'br', 'blockquote', 'code', 'pre', 'div', 'span', 'img', 's', 'strike'],
                      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'loading']
                    })
                  }}
                />
              </>
            ) : (
              <p className="text-muted-foreground italic">No content available.</p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-10 mb-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="my-12" />

            {/* Share Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Share2 className="h-5 w-5" />
                <span className="font-medium">Share this article</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnTwitter}
                  title="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnFacebook}
                  title="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnLinkedIn}
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <BlogSidebar
                allPosts={allPosts || []}
                currentPostId={post.id}
              />
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">
                Related <span className="gradient-text">Posts</span>
              </h2>

              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Featured Image */}
                    {relatedPost.featured_image ? (
                      <div className="relative h-40 overflow-hidden">
                        <BlurImage
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10 flex items-center justify-center">
                        <span className="text-3xl font-bold text-muted-foreground/20">
                          {relatedPost.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      {relatedPost.category && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          {relatedPost.category}
                        </Badge>
                      )}
                      <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        <Link to={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="line-clamp-2 text-sm">
                        {relatedPost.excerpt}
                      </CardDescription>

                      <Link
                        to={`/blog/${relatedPost.slug}`}
                        className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                      >
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-violet/5 to-cyan/5 border-primary/20">
            <h3 className="text-xl font-bold mb-2">Want to create content like this?</h3>
            <p className="text-muted-foreground mb-6">
              Start generating high-quality content with our AI-powered platform.
            </p>
            <Button variant="gradient" size="lg" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </article>
    </Layout>
  );
}
