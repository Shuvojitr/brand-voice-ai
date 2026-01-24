import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-lg dark:prose-invert max-w-none",
        // Headings
        "prose-headings:font-bold prose-headings:tracking-tight",
        "prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4",
        "prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2",
        "prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3",
        "prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2",
        // Paragraphs
        "prose-p:leading-relaxed prose-p:mb-4",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Lists
        "prose-ul:my-4 prose-ol:my-4",
        "prose-li:my-1",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic",
        // Code
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
        // Pre (code blocks handled by SyntaxHighlighter)
        "prose-pre:bg-transparent prose-pre:p-0",
        // Images
        "prose-img:rounded-xl prose-img:shadow-lg",
        // Tables
        "prose-table:border prose-table:border-border",
        "prose-th:bg-muted/50 prose-th:px-4 prose-th:py-2 prose-th:border prose-th:border-border",
        "prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-border",
        // Horizontal rules
        "prose-hr:border-border prose-hr:my-8",
        // Strong/bold
        "prose-strong:font-semibold",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !className;

            if (isInline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group my-6">
                {match && (
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs text-muted-foreground bg-muted/80 rounded-bl-lg rounded-tr-lg font-mono z-10">
                    {match[1]}
                  </div>
                )}
                <SyntaxHighlighter
                  style={oneDark}
                  language={match ? match[1] : "text"}
                  PreTag="div"
                  showLineNumbers={true}
                  wrapLines={true}
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "#282c34",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
          // Custom link component to open external links in new tab
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-primary hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Custom image component with loading state
          img({ src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="rounded-xl shadow-lg my-6"
                {...props}
              />
            );
          },
          // Custom table wrapper for horizontal scroll
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full" {...props}>
                  {children}
                </table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
