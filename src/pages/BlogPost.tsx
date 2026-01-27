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
  ArrowLeft,
  ArrowRight,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  Bookmark,
  Heart,
} from "lucide-react";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");
  const { data: allPosts } = useBlogPosts();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
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
        {/* Skeleton Hero */}
        <div className="relative w-full h-[60vh] min-h-[400px]">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="container max-w-3xl -mt-24 relative z-10">
          <div className="bg-background rounded-2xl p-8 shadow-xl">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-3/4 mb-6" />
            <div className="flex gap-4 mb-8">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Bookmark className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild size="lg">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const authorInitials = post.author_name
    ? post.author_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

  return (
    <Layout>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-primary via-violet to-cyan transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article>
        {/* Hero Section with Featured Image */}
        <div className="relative w-full h-[50vh] min-h-[400px] lg:h-[60vh]">
          {post.featured_image ? (
            <>
              <img
                src={post.featured_image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet/20 to-cyan/20" />
          )}

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-10">
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="backdrop-blur-sm bg-background/80 hover:bg-background"
            >
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Container */}
        <div className="container max-w-4xl -mt-32 relative z-10 pb-16">
          {/* Article Header Card */}
          <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border/50 mb-12">
            {/* Category & Reading Time */}
            <div className="flex items-center gap-3 mb-6">
              {post.category && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {post.category}
                </Badge>
              )}
              {post.read_time_minutes && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.read_time_minutes} min read
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                {post.excerpt}
              </p>
            )}

            {/* Author & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={post.author_avatar || undefined} alt={post.author_name || "Author"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author_name || "Admin"}</p>
                  {post.published_at && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(post.published_at), "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">Share:</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shareOnTwitter}
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                  title="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shareOnFacebook}
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                  title="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shareOnLinkedIn}
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
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

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-6 pt-6 border-t border-border/50">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs rounded-full">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none px-4 md:px-8">
            {post.content ? (
              <MarkdownRenderer content={post.content} />
            ) : (
              <p className="text-muted-foreground italic text-center py-12">No content available.</p>
            )}
          </div>

          {/* Bottom Share & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16 pt-8 border-t border-border/50">
            <p className="text-muted-foreground text-sm">Enjoyed this article? Share it with others</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnTwitter}
                className="rounded-full"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnLinkedIn}
                className="rounded-full"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="rounded-full"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted/30 py-16 md:py-24">
            <div className="container max-w-6xl">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">
                  Continue Reading
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Related <span className="gradient-text">Articles</span>
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden border-border/50 bg-background hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {relatedPost.featured_image ? (
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10 flex items-center justify-center">
                            <span className="text-5xl font-bold text-muted-foreground/20">
                              {relatedPost.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        {relatedPost.category && (
                          <Badge className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background">
                            {relatedPost.category}
                          </Badge>
                        )}
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <CardDescription className="line-clamp-2 mb-4">
                          {relatedPost.excerpt}
                        </CardDescription>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          {relatedPost.published_at && (
                            <span>{format(new Date(relatedPost.published_at), "MMM d, yyyy")}</span>
                          )}
                          {relatedPost.read_time_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {relatedPost.read_time_minutes} min
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-3xl">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10">
              <div className="absolute inset-0 bg-grid-pattern opacity-5" />
              <CardContent className="relative p-8 md:p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to create amazing content?
                </h3>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Join thousands of creators using our AI-powered platform to generate high-quality content in seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button variant="gradient" size="lg" asChild>
                    <Link to="/signup">
                      Start Creating Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/templates">
                      Explore Templates
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </article>
    </Layout>
  );
}
