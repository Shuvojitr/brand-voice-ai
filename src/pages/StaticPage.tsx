import { useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = usePage(slug || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !page) {
    return <Navigate to="/404" replace />;
  }

  // Convert content to HTML (support basic markdown-like formatting)
  const renderContent = (content: string | null) => {
    if (!content) return null;

    // Check if content looks like HTML
    if (content.includes("<") && content.includes(">")) {
      // Sanitize HTML content to prevent XSS attacks
      const sanitizedContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br', 'blockquote', 'code', 'pre', 'div', 'span', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id']
      });
      
      return (
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      );
    }

    // Otherwise treat as plain text with basic paragraph support
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {content.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <Helmet>
        <title>{page.title}</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
        {renderContent(page.content)}
      </div>
    </Layout>
  );
}
