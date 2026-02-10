import { useMemo } from "react";
import { List } from "lucide-react";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const elements = doc.querySelectorAll("h1, h2, h3");
    const result: TocHeading[] = [];

    elements.forEach((el, index) => {
      const text = el.textContent?.trim() || "";
      if (!text) return;
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      result.push({ id: `${id}-${index}`, text, level: parseInt(el.tagName[1]) });
    });

    return result;
  }, [content]);

  if (headings.length < 2) return null;

  const handleClick = (id: string, index: number) => {
    const article = document.querySelector(".prose");
    if (!article) return;
    const articleHeadings = article.querySelectorAll("h1, h2, h3");
    const target = articleHeadings[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="mb-10 rounded-xl border border-border/60 bg-muted/30 p-5">
      <div className="flex items-center gap-2 mb-3">
        <List className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Table of Contents
        </h2>
      </div>
      <ul className="space-y-1.5">
        {headings.map((heading, index) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - minLevel) * 16}px` }}
          >
            <button
              onClick={() => handleClick(heading.id, index)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors text-left leading-relaxed"
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
