import { useEffect, useState, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline, Heading1, Heading2, Heading3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  editor: Editor | null;
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { from, to, empty } = editor.state.selection;
      
      // Only show when there's a selection
      if (empty) {
        setIsVisible(false);
        return;
      }

      // Get the selection coordinates
      const view = editor.view;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      
      // Calculate position above the selection
      const menuWidth = menuRef.current?.offsetWidth || 200;
      const left = Math.max(10, (start.left + end.left) / 2 - menuWidth / 2);
      const top = start.top - 50;

      setPosition({ top, left });
      setIsVisible(true);
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("focus", updateMenu);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", updateMenu);
      editor.off("focus", updateMenu);
      editor.off("blur", () => setIsVisible(false));
    };
  }, [editor]);

  if (!editor || !isVisible) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-50 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg",
        "animate-in fade-in-0 zoom-in-95"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className="h-8 w-8"
        aria-label="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className="h-8 w-8"
        aria-label="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className="h-8 w-8"
        aria-label="Underline"
      >
        <Underline className="h-3.5 w-3.5" />
      </Toggle>
      <div className="mx-1 h-4 w-px bg-border" />
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className="h-8 w-8"
        aria-label="Heading 1"
      >
        <Heading1 className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="h-8 w-8"
        aria-label="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className="h-8 w-8"
        aria-label="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </Toggle>
    </div>
  );
}
