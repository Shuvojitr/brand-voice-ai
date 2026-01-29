import { useState } from "react";
import { useMedia, formatFileSize, MediaItem } from "@/hooks/useMedia";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, Search, X, Check, ExternalLink } from "lucide-react";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  title = "Select Image",
}: MediaPickerDialogProps) {
  const { mediaItems, isLoading, uploadFile, isUploading } = useMedia("blog-images");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [activeTab, setActiveTab] = useState("library");

  const filteredMedia = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newMedia = await uploadFile({ file, targetBucket: "blog-images" });
    if (newMedia) {
      setSelectedItem(newMedia);
    }
    e.target.value = "";
  };

  const handleConfirm = () => {
    if (activeTab === "library" && selectedItem) {
      onSelect(selectedItem.url);
      onOpenChange(false);
      setSelectedItem(null);
    } else if (activeTab === "url" && externalUrl) {
      onSelect(externalUrl);
      onOpenChange(false);
      setExternalUrl("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedItem(null);
    setExternalUrl("");
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">
              <ImageIcon className="mr-2 h-4 w-4" />
              Media Library
            </TabsTrigger>
            <TabsTrigger value="url">
              <ExternalLink className="mr-2 h-4 w-4" />
              External URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 overflow-hidden flex flex-col mt-4">
            {/* Search & Upload */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
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
              <Button variant="outline" asChild className="relative">
                <label>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </Button>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-medium">No images found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? "No images match your search"
                      : "Upload images to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredMedia.map((item) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer overflow-hidden transition-all ${
                        selectedItem?.id === item.id
                          ? "ring-2 ring-primary"
                          : "hover:ring-1 hover:ring-muted-foreground/50"
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <AspectRatio ratio={1}>
                        <img
                          src={item.url}
                          alt={item.alt_text || item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {selectedItem?.id === item.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </AspectRatio>
                      <CardContent className="p-2">
                        <p className="text-xs truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.size_bytes)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Preview */}
            {selectedItem && (
              <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.alt_text || selectedItem.name}
                  className="h-16 w-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.width && selectedItem.height
                      ? `${selectedItem.width} × ${selectedItem.height}px · `
                      : ""}
                    {formatFileSize(selectedItem.size_bytes)}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="externalUrl">Image URL</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a direct link to an image file (JPG, PNG, GIF, WebP)
                </p>
              </div>

              {externalUrl && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">Preview</p>
                  <img
                    src={externalUrl}
                    alt="External preview"
                    className="max-h-48 rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              (activeTab === "library" && !selectedItem) ||
              (activeTab === "url" && !externalUrl)
            }
          >
            <Check className="mr-2 h-4 w-4" />
            Select Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
