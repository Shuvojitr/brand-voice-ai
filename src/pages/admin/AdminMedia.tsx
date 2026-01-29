import { useState, useRef, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useMedia, formatFileSize, MediaItem } from "@/hooks/useMedia";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  MoreVertical,
  FileImage,
  Search,
  X,
  Check,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminMedia() {
  const { mediaItems, isLoading, uploadFile, deleteMedia, updateMedia, isUploading, isDeleting } = useMedia();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [editTarget, setEditTarget] = useState<MediaItem | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      await uploadFile({ file });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    []
  );

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMedia(deleteTarget);
    setDeleteTarget(null);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    await updateMedia({ id: editTarget.id, altText: editAltText });
    setEditTarget(null);
  };

  const openEdit = (item: MediaItem) => {
    setEditTarget(item);
    setEditAltText(item.alt_text || "");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
            <p className="text-muted-foreground">
              Manage all uploaded images and files
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <FileImage className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop images here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline"
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
              </Card>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 text-lg font-medium">No media files</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No files match your search"
                : "Upload images to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <Card
                key={item.id}
                className="group relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => setSelectedMedia(item)}
              >
                <AspectRatio ratio={1}>
                  <img
                    src={item.url}
                    alt={item.alt_text || item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
                <CardContent className="p-2">
                  <p className="text-xs font-medium truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.size_bytes)}
                  </p>
                </CardContent>
                <div
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Alt Text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(item)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia?.name}</DialogTitle>
              <DialogDescription>
                Uploaded {selectedMedia && format(new Date(selectedMedia.created_at), "PPP")}
              </DialogDescription>
            </DialogHeader>
            {selectedMedia && (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt_text || selectedMedia.name}
                    className="w-full max-h-[400px] object-contain"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="ml-2">
                      {selectedMedia.width && selectedMedia.height
                        ? `${selectedMedia.width} × ${selectedMedia.height}px`
                        : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-2">{formatFileSize(selectedMedia.size_bytes)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2">{selectedMedia.mime_type || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alt Text:</span>
                    <span className="ml-2">{selectedMedia.alt_text || "Not set"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={selectedMedia.url}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedMedia.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMedia(null)}>
                Close
              </Button>
              <Button onClick={() => selectedMedia && copyToClipboard(selectedMedia.url)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Alt Text Dialog */}
        <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Alt Text</DialogTitle>
              <DialogDescription>
                Add descriptive alt text for accessibility and SEO
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {editTarget && (
                <div className="rounded-lg overflow-hidden bg-muted max-h-32">
                  <img
                    src={editTarget.url}
                    alt={editTarget.alt_text || editTarget.name}
                    className="w-full h-32 object-contain"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe this image..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                <Check className="mr-2 h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteTarget?.name}"? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
