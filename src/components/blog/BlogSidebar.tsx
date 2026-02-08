import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Search, TrendingUp } from "lucide-react";
import { BlogPost } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { useState, useMemo } from "react";

interface BlogSidebarProps {
  allPosts: BlogPost[];
  currentPostId?: string;
}

export function BlogSidebar({ allPosts, currentPostId }: BlogSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out current post from sidebar lists
  const otherPosts = useMemo(
    () => allPosts?.filter((p) => p.id !== currentPostId) || [],
    [allPosts, currentPostId]
  );

  // Popular posts — featured first, then most recent (top 4)
  const popularPosts = useMemo(
    () =>
      [...otherPosts]
        .sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (
            new Date(b.published_at || b.created_at || "").getTime() -
            new Date(a.published_at || a.created_at || "").getTime()
          );
        })
        .slice(0, 4),
    [otherPosts]
  );

  // Recent posts — latest 4
  const recentPosts = useMemo(
    () =>
      [...otherPosts]
        .sort(
          (a, b) =>
            new Date(b.published_at || b.created_at || "").getTime() -
            new Date(a.published_at || a.created_at || "").getTime()
        )
        .slice(0, 4),
    [otherPosts]
  );

  // Unique categories with counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    allPosts?.forEach((p) => {
      if (p.category) {
        map.set(p.category, (map.get(p.category) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allPosts]);

  // Search filter
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return otherPosts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, otherPosts]);

  return (
    <aside className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Search
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/40 border-border/60 focus-visible:ring-primary/30"
          />
        </div>

        {/* Search Results */}
        {filteredPosts.length > 0 && (
          <div className="mt-3 space-y-2">
            {filteredPosts.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="block text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {p.title}
              </Link>
            ))}
          </div>
        )}
        {searchQuery.trim() && filteredPosts.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">No results found.</p>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular Posts
          </h3>
          <div className="space-y-4">
            {popularPosts.map((p) => (
              <SidebarPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-border/50" />

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Posts
          </h3>
          <div className="space-y-4">
            {recentPosts.map((p) => (
              <SidebarPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-border/50" />

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Categories
          </h3>
          <div className="space-y-2">
            {categories.map(([cat, count]) => (
              <Link
                key={cat}
                to={`/blog/category/${encodeURIComponent(cat)}`}
                className="flex items-center justify-between group py-1.5 px-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {cat}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 min-w-[1.5rem] justify-center font-medium"
                >
                  {count}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── Compact post card for sidebar ── */

function SidebarPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="flex gap-3 group"
    >
      {/* Thumbnail */}
      {post.featured_image ? (
        <img
          src={post.featured_image}
          alt={post.title}
          className="h-16 w-20 flex-shrink-0 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="h-16 w-20 flex-shrink-0 rounded-lg bg-muted/60 flex items-center justify-center">
          <span className="text-lg font-bold text-muted-foreground/30">
            {post.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h4>
        {post.published_at && (
          <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(post.published_at), "MMM d, yyyy")}
          </span>
        )}
      </div>
    </Link>
  );
}
