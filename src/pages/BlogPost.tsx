import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { useState, useMemo, useEffect } from "react";
import DOMPurify from "dompurify";
import { BlogPostSidebar } from "@/components/blog/BlogPostSidebar";

/**
 * Add IDs to heading elements so the Table of Contents can link to them.
 */
function addHeadingIds(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h1, h2, h3");

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
  });

  return doc.body.innerHTML;
}

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
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");
  const { data: allPosts } = useBlogPosts();

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
      .slice(0, 4);
  }, [post, allPosts]);

  const processedContent = useMemo(() => {
    if (!post?.content) return "";
    const sanitized = DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'br', 'blockquote', 'code', 'pre', 'div', 'span', 'img', 's', 'strike'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id']
    });
    return addHeadingIds(sanitized);
  }, [post?.content]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 md:py-20 max-w-7xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
            <div>
              <Skeleton className="h-64 w-full mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="space-y-6 hidden lg:block">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
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

      <article className="container py-12 md:py-20 max-w-7xl">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        {/* Header - Full width centered */}
        <header className="max-w-3xl mb-12">
          {post.category && (
            <Link to={`/blog/category/${encodeURIComponent(post.category)}`}>
              <Badge variant="secondary" className="mb-4 hover:bg-secondary/80 transition-colors">
                {post.category}
              </Badge>
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>
        </header>

        {/* Featured Image - Full width */}
        {post.featured_image && (
          <div className="mb-10">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          </div>
        )}

        {/* Two-column layout: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start">
          {/* Main Content */}
          <div className="min-w-0">
            {processedContent ? (
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-img:rounded-xl prose-img:shadow-lg prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            ) : (
              <p className="text-muted-foreground italic">No content available.</p>
            )}
          </div>

          {/* Sidebar - Sticky on desktop, stacks below on mobile */}
          <div className="lg:sticky lg:top-20 order-first lg:order-last">
            <BlogPostSidebar post={post} relatedPosts={relatedPosts} />
          </div>
        </div>
      </article>
    </Layout>
  );
}
