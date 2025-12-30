import { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { getWordCount, downloadAsMarkdown, downloadAsText, downloadAsHtml } from "@/lib/export-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Copy, 
  Download, 
  Save, 
  Check, 
  Loader2, 
  FileText,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentEditorProps {
  content: string;
  isGenerating: boolean;
  organizationId: string | null;
  userId: string | undefined;
  templateId: string | undefined;
  autoSave?: boolean;
  onAutoSaveComplete?: () => void;
  onCreditsDeducted?: () => void;
  modelUsed?: string;
}

export function ContentEditor({
  content,
  isGenerating,
  organizationId,
  userId,
  templateId,
  autoSave = false,
  onAutoSaveComplete,
  onCreditsDeducted,
  modelUsed,
}: ContentEditorProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [creditsReported, setCreditsReported] = useState(false);
  const [previousContent, setPreviousContent] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Your generated content will appear here...",
      }),
      Underline,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none",
          "min-h-[400px] p-4 focus:outline-none",
          "prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:leading-relaxed prose-li:leading-relaxed"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      setWordCount(getWordCount(editor.getHTML()));
      setIsSaved(false);
    },
  });

  // Update editor content when AI generates new content
  useEffect(() => {
    if (editor && content) {
      // Convert markdown-style content to HTML if needed
      const htmlContent = convertToHtml(content);
      editor.commands.setContent(htmlContent);
      const newWordCount = getWordCount(htmlContent);
      setWordCount(newWordCount);
      
      // Reset credits reported flag when new content is generated
      if (content !== previousContent) {
        setCreditsReported(false);
        setPreviousContent(content);
      }
    }
  }, [content, editor, previousContent]);

  // Report word count to backend for credit deduction after generation completes
  useEffect(() => {
    const reportWordCount = async () => {
      if (!organizationId || !wordCount || creditsReported || isGenerating) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/report-word-count`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              organizationId,
              wordCount,
              templateType: templateId,
              modelUsed: modelUsed || 'unknown',
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`[ContentEditor] Credits deducted: ${data.creditsDeducted} for ${data.wordCount} words`);
          setCreditsReported(true);
          onCreditsDeducted?.();
        } else {
          console.error('[ContentEditor] Failed to report word count:', await response.text());
        }
      } catch (error) {
        console.error('[ContentEditor] Error reporting word count:', error);
      }
    };

    // Only report after generation is complete and we have content
    if (autoSave && !isGenerating && content && wordCount > 0 && !creditsReported) {
      reportWordCount();
    }
  }, [autoSave, isGenerating, content, wordCount, creditsReported, organizationId, templateId, onCreditsDeducted]);

  // Auto-save when generation completes
  useEffect(() => {
    if (autoSave && editor && content && !isGenerating && !isSaved && organizationId && userId) {
      const performAutoSave = async () => {
        setIsSaving(true);
        try {
          const html = editor.getHTML();
          const plainText = editor.getText().substring(0, 500);
          
          const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
          const title = titleMatch 
            ? titleMatch[1].replace(/<[^>]+>/g, "").substring(0, 100)
            : `Generated Content - ${new Date().toLocaleDateString()}`;

          const { error } = await supabase.from("documents").insert({
            title,
            content: plainText,
            content_html: html,
            word_count: wordCount,
            initial_word_count: wordCount, // Lock in original word count for permanent tracking
            organization_id: organizationId,
            user_id: userId,
            template_type: templateId,
          });

          if (error) throw error;

          setIsSaved(true);
          onAutoSaveComplete?.();
          toast.success("Document auto-saved!");
        } catch (error) {
          console.error("Auto-save error:", error);
          toast.error("Auto-save failed. Please save manually.");
        } finally {
          setIsSaving(false);
        }
      };
      
      performAutoSave();
    }
  }, [autoSave, editor, content, isGenerating, isSaved, organizationId, userId, templateId, wordCount, onAutoSaveComplete]);

  const handleCopy = async () => {
    if (!editor) return;
    
    const text = editor.getText();
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Content copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!editor || !organizationId || !userId) {
      toast.error("Unable to save. Please try again.");
      return;
    }

    setIsSaving(true);
    try {
      const html = editor.getHTML();
      const plainText = editor.getText().substring(0, 500);
      
      // Extract first heading as title or use template
      const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const title = titleMatch 
        ? titleMatch[1].replace(/<[^>]+>/g, "").substring(0, 100)
        : `Generated Content - ${new Date().toLocaleDateString()}`;

      const { error } = await supabase.from("documents").insert({
        title,
        content: plainText,
        content_html: html,
        word_count: wordCount,
        initial_word_count: wordCount, // Lock in original word count for permanent tracking
        organization_id: organizationId,
        user_id: userId,
        template_type: templateId,
      });

      if (error) throw error;

      setIsSaved(true);
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (format: "md" | "txt" | "html") => {
    if (!editor) return;
    
    const html = editor.getHTML();
    const filename = `content-${Date.now()}`;
    
    switch (format) {
      case "md":
        downloadAsMarkdown(html, filename);
        break;
      case "txt":
        downloadAsText(html, filename);
        break;
      case "html":
        downloadAsHtml(html, filename);
        break;
    }
    
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Toolbar Header */}
      <CardHeader className="flex-none pb-3 space-y-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!editor?.getText()}
            >
              {isCopied ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              Copy
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!editor?.getText()}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover">
                <DropdownMenuItem onClick={() => handleDownload("md")}>
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("txt")}>
                  Plain Text (.txt)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("html")}>
                  HTML (.html)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!editor?.getText() || isSaving || !organizationId}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : isSaved ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          </div>
        </div>

        <Separator className="mt-3" />

        {/* Formatting Toolbar */}
        <div className="pt-2">
          <EditorToolbar editor={editor} />
        </div>
      </CardHeader>

      {/* Editor Content */}
      <CardContent className="flex-1 overflow-auto p-0">
        {!content && !isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">
              Ready to generate
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Fill in the content settings on the left and click "Generate Content" to create your content.
            </p>
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </CardContent>
    </Card>
  );
}

// Helper to convert markdown-style content to basic HTML
function convertToHtml(content: string): string {
  if (!content) return "";
  
  // If already HTML, return as-is
  if (content.trim().startsWith("<")) return content;

  // Basic markdown to HTML conversion
  let html = content
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Lists
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
    // Paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  // Wrap in paragraph tags
  if (!html.startsWith("<")) {
    html = `<p>${html}</p>`;
  }

  // Wrap consecutive li elements in ul
  html = html.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

  return html;
}
