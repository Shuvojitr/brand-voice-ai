import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileCode, FileType } from "lucide-react";
import { exportContent, type ExportFormat } from "@/lib/export-utils";
import { toast } from "sonner";

interface ExportDropdownProps {
  editor: Editor | null;
  filename?: string;
}

const exportOptions: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { format: "md", label: "Markdown (.md)", icon: <FileText className="h-4 w-4" /> },
  { format: "txt", label: "Plain Text (.txt)", icon: <FileType className="h-4 w-4" /> },
  { format: "html", label: "HTML (.html)", icon: <FileCode className="h-4 w-4" /> },
];

export function ExportDropdown({ editor, filename = "document" }: ExportDropdownProps) {
  const handleExport = (format: ExportFormat) => {
    if (!editor) return;
    
    try {
      exportContent({ editor, format, filename });
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export document");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!editor}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
        {exportOptions.map(({ format, label, icon }) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            className="cursor-pointer"
          >
            {icon}
            <span className="ml-2">{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
