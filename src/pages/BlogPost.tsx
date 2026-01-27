import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  ArrowRight,
  Share2,
  ChevronRight,
} from "lucide-react";
import { useBlogPost, useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { format } from "date-fns";
import { useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractTableOfContents(content: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    toc.push({ id, text, level });
  }

  return toc;
}

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On This Page
      </h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block text-sm py-1 border-l-2 transition-colors",
              item.level === 1 && "pl-3",
              item.level === 2 && "pl-3",
              item.level === 3 && "pl-6",
              activeId === item.id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
            )}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

function RelatedPostsSidebar({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Read Next
      </h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="block group"
          >
            <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
              {post.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {post.published_at && format(new Date(post.published_at), "MMM d")}
              {post.read_time_minutes && ` • ${post.read_time_minutes} min read`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Breadcrumbs({ category, tags }: { category?: string | null; tags?: string[] | null }) {
  const breadcrumbItems = useMemo(() => {
    const items: string[] = [];
    if (category) items.push(category);
    if (tags && tags.length > 0) {
      items.push(...tags.slice(0, 2));
    }
    return items;
  }, [category, tags]);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-xs font-medium mb-4">
      {breadcrumbItems.map((item, index) => (
        <span key={item} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
          <span
            className={cn(
              "uppercase tracking-wide",
              index === breadcrumbItems.length - 1
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground transition-colors"
            )}
          >
            {item}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");
  const { data: allPosts } = useBlogPosts();
  const [activeHeading, setActiveHeading] = useState("");

  const tableOfContents = useMemo(() => {
    if (!post?.content) return [];
    return extractTableOfContents(post.content);
  }, [post?.content]);

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

  // Track active heading on scroll
  const handleScroll = useCallback(() => {
    if (tableOfContents.length === 0) return;

    const headings = tableOfContents.map((item) => ({
      id: item.id,
      element: document.getElementById(item.id),
    }));

    const scrollPosition = window.scrollY + 120;

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading.element && heading.element.offsetTop <= scrollPosition) {
        setActiveHeading(heading.id);
        return;
      }
    }

    if (headings[0]?.id) {
      setActiveHeading(headings[0].id);
    }
  }, [tableOfContents]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 md:py-16">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12 max-w-6xl mx-auto">
            <div>
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-12 w-1/2 mb-8" />
              <div className="flex items-center gap-3 mb-12">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-48 w-full" />
            </div>
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
            <Link to="/blog">Back to Blog</Link>
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
      <article className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Breadcrumbs */}
            <Breadcrumbs category={post.category} tags={post.tags} />

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-8">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author_avatar || undefined} alt={post.author_name || "Author"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {post.author_name || "Admin"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {post.category && (
                      <>
                        <span>{post.category}</span>
                        <span>•</span>
                      </>
                    )}
                    {post.published_at && (
                      <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-10 rounded-xl overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {post.content ? (
                <MarkdownRenderer content={post.content} />
              ) : (
                <p className="text-muted-foreground italic">No content available.</p>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-12 pt-8 border-t">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Related Posts - Mobile */}
            {relatedPosts.length > 0 && (
              <section className="mt-12 pt-8 border-t lg:hidden">
                <h2 className="text-lg font-semibold mb-6">Read Next</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.slice(0, 2).map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                    >
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {relatedPost.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(relatedPost.published_at), "MMM d")}
                          </span>
                        )}
                        {relatedPost.read_time_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {relatedPost.read_time_minutes} min
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <div className="mt-12 pt-8 border-t">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                <h3 className="text-lg font-semibold mb-2">Want to create content like this?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start generating high-quality content with our AI-powered platform.
                </p>
                <Button variant="gradient" asChild>
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <TableOfContents items={tableOfContents} activeId={activeHeading} />
              <RelatedPostsSidebar posts={relatedPosts} />
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
}
