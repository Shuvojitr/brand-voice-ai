import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorToolbar } from "./EditorToolbar";
import { FloatingMenu } from "./FloatingMenu";
import { ExportDropdown } from "./ExportDropdown";
import { getWordCount } from "@/lib/export-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedEditorProps {
  documentId?: string;
  organizationId: string;
  userId: string;
  initialContent?: string;
  initialTitle?: string;
  placeholder?: string;
  onContentChange?: (html: string) => void;
  onTitleChange?: (title: string) => void;
  className?: string;
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function AdvancedEditor({
  documentId,
  organizationId,
  userId,
  initialContent = "",
  initialTitle = "Untitled",
  placeholder = "Start writing your content...",
  onContentChange,
  onTitleChange,
  className,
}: AdvancedEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [wordCount, setWordCount] = useState(0);
  const [currentDocId, setCurrentDocId] = useState(documentId);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef(initialContent);
  const lastSavedTitleRef = useRef(initialTitle);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content: initialContent,
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
      const html = editor.getHTML();
      setWordCount(getWordCount(html));
      onContentChange?.(html);
      
      // Mark as unsaved if content changed
      if (html !== lastSavedContentRef.current) {
        setSaveStatus("unsaved");
        scheduleAutoSave(html, title);
      }
    },
  });

  // Update word count on mount
  useEffect(() => {
    if (editor && initialContent) {
      setWordCount(getWordCount(initialContent));
    }
  }, [editor, initialContent]);

  const saveDocument = useCallback(async (content: string, docTitle: string) => {
    // Don't save if nothing changed
    if (content === lastSavedContentRef.current && docTitle === lastSavedTitleRef.current) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");

    try {
      const documentData = {
        title: docTitle,
        content_html: content,
        content: content.replace(/<[^>]+>/g, "").substring(0, 500), // Plain text preview
        word_count: getWordCount(content),
        updated_at: new Date().toISOString(),
      };

      if (currentDocId) {
        // Update existing document
        const { error } = await supabase
          .from("documents")
          .update(documentData)
          .eq("id", currentDocId);

        if (error) throw error;
      } else {
        // Create new document
        const { data, error } = await supabase
          .from("documents")
          .insert({
            ...documentData,
            organization_id: organizationId,
            user_id: userId,
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data) setCurrentDocId(data.id);
      }

      lastSavedContentRef.current = content;
      lastSavedTitleRef.current = docTitle;
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save document:", error);
      setSaveStatus("error");
      toast.error("Failed to save document");
    }
  }, [currentDocId, organizationId, userId]);

  const scheduleAutoSave = useCallback((content: string, docTitle: string) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule new save in 5 seconds
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(content, docTitle);
    }, 5000);
  }, [saveDocument]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange?.(newTitle);
    
    if (newTitle !== lastSavedTitleRef.current) {
      setSaveStatus("unsaved");
      scheduleAutoSave(editor?.getHTML() || "", newTitle);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </Badge>
        );
      case "saved":
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Check className="h-3 w-3" />
            Saved
          </Badge>
        );
      case "unsaved":
        return (
          <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400">
            <Cloud className="h-3 w-3" />
            Unsaved changes
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            Save failed
          </Badge>
        );
    }
  };

  return (
    <div className={cn("flex flex-col rounded-lg border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="flex-1 bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Document title..."
        />
        <div className="flex items-center gap-3">
          {renderSaveStatus()}
          <span className="text-xs text-muted-foreground">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <ExportDropdown editor={editor} filename={title || "document"} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border p-2">
        <EditorToolbar editor={editor} />
      </div>

      {/* Editor */}
      <div className="relative flex-1 overflow-auto">
        <FloatingMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
