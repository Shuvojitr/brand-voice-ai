import type { Editor } from "@tiptap/react";

export type ExportFormat = "md" | "txt" | "html";

interface ExportOptions {
  editor: Editor;
  format: ExportFormat;
  filename?: string;
}

function htmlToMarkdown(html: string): string {
  let markdown = html;
  
  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  
  // Convert bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  markdown = markdown.replace(/<u[^>]*>(.*?)<\/u>/gi, "_$1_");
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n") + "\n";
  });
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${index++}. $1\n`) + "\n";
  });
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  
  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, "");
  
  // Decode HTML entities
  markdown = markdown.replace(/&nbsp;/g, " ");
  markdown = markdown.replace(/&amp;/g, "&");
  markdown = markdown.replace(/&lt;/g, "<");
  markdown = markdown.replace(/&gt;/g, ">");
  markdown = markdown.replace(/&quot;/g, '"');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, "\n\n");
  
  return markdown.trim();
}

function htmlToPlainText(html: string): string {
  let text = html;
  
  // Add line breaks for block elements
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/ul>/gi, "\n");
  text = text.replace(/<\/ol>/gi, "\n");
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, "");
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  
  return text.trim();
}

export function exportContent({ editor, format, filename = "document" }: ExportOptions): void {
  const html = editor.getHTML();
  let content: string;
  let mimeType: string;
  let extension: string;
  
  switch (format) {
    case "md":
      content = htmlToMarkdown(html);
      mimeType = "text/markdown";
      extension = "md";
      break;
    case "txt":
      content = htmlToPlainText(html);
      mimeType = "text/plain";
      extension = "txt";
      break;
    case "html":
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { font-size: 2rem; margin-top: 1.5rem; }
    h2 { font-size: 1.5rem; margin-top: 1.25rem; }
    h3 { font-size: 1.25rem; margin-top: 1rem; }
    ul, ol { padding-left: 1.5rem; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
      mimeType = "text/html";
      extension = "html";
      break;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getWordCount(html: string): number {
  const text = htmlToPlainText(html);
  const words = text.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

// Standalone download functions
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsMarkdown(html: string, filename: string): void {
  const content = htmlToMarkdown(html);
  downloadBlob(content, `${filename}.md`, "text/markdown");
}

export function downloadAsText(html: string, filename: string): void {
  const content = htmlToPlainText(html);
  downloadBlob(content, `${filename}.txt`, "text/plain");
}

export function downloadAsHtml(html: string, filename: string): void {
  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { font-size: 2rem; margin-top: 1.5rem; }
    h2 { font-size: 1.5rem; margin-top: 1.25rem; }
    h3 { font-size: 1.25rem; margin-top: 1rem; }
    ul, ol { padding-left: 1.5rem; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  downloadBlob(content, `${filename}.html`, "text/html");
}
