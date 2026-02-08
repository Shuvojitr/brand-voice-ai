import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Calendar,
  Clock,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  List,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPost {
  title: string;
  author_name?: string | null;
  author_avatar?: string | null;
  published_at?: string | null;
  read_time_minutes?: number | null;
  category?: string | null;
  tags?: string[] | null;
  content?: string | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  featured_image?: string | null;
}

interface BlogPostSidebarProps {
  post: BlogPost;
  relatedPosts: RelatedPost[];
}

function extractHeadings(html: string): TableOfContentsItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h1, h2, h3");
  const items: TableOfContentsItem[] = [];

  headings.forEach((heading, index) => {
    const id = heading.id || `heading-${index}`;
    const text = heading.textContent || "";
    const level = parseInt(heading.tagName.charAt(1));
    if (text.trim()) {
      items.push({ id, text: text.trim(), level });
    }
  });

  return items;
}

export function BlogPostSidebar({ post, relatedPosts }: BlogPostSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${post.title} - Check out this article!`;

  const tocItems = useMemo(() => {
    if (!post.content) return [];
    return extractHeadings(post.content);
  }, [post.content]);

  // Track active heading for TOC highlight
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems]);

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

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const authorInitials = (post.author_name || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="space-y-6">
      {/* Author Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author_avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                to={`/blog/author/${encodeURIComponent(post.author_name || "Admin")}`}
                className="font-semibold hover:text-primary transition-colors text-sm"
              >
                {post.author_name || "Admin"}
              </Link>
              <p className="text-xs text-muted-foreground">Author</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(post.published_at), "MMM d, yyyy")}
              </span>
            )}
            {post.read_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.read_time_minutes} min
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      {tocItems.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <List className="h-4 w-4 text-primary" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <nav className="space-y-1">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left text-xs leading-relaxed py-1 transition-colors rounded-sm hover:text-primary ${
                    item.level === 3 ? "pl-4" : item.level === 2 ? "pl-2" : ""
                  } ${
                    activeHeadingId === item.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      )}

      {/* Share */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Share2 className="h-4 w-4 text-primary" />
            Share
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnTwitter} title="Share on Twitter">
              <Twitter className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnFacebook} title="Share on Facebook">
              <Facebook className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnLinkedIn} title="Share on LinkedIn">
              <Linkedin className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyLink} title="Copy link">
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Link2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold">Related Posts</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {relatedPosts.slice(0, 4).map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.slug}`}
                className="group flex items-start gap-3"
              >
                {relatedPost.featured_image ? (
                  <img
                    src={relatedPost.featured_image}
                    alt={relatedPost.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">
                      {relatedPost.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </p>
                  {relatedPost.category && (
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {relatedPost.category}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-violet/5 to-cyan/5">
        <CardContent className="p-5 text-center">
          <h3 className="text-sm font-bold mb-1.5">Create content like this</h3>
          <p className="text-xs text-muted-foreground mb-3">
            AI-powered content generation platform.
          </p>
          <Button variant="gradient" size="sm" className="w-full" asChild>
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
