import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Save,
  Eye,
  Check,
  Cloud,
  CloudOff,
} from "lucide-react";
import {
  BlogPostInput,
} from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export default function AdminBlogPostEditor() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!postId;

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [currentPostId, setCurrentPostId] = useState<string | null>(postId || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [category, setCategory] = useState("General");
  const [authorName, setAuthorName] = useState("Admin");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Create a hash of current form data to detect changes
  const getFormDataHash = useCallback(() => {
    return JSON.stringify({
      title, slug, excerpt, content, featuredImage,
      category, authorName, readTimeMinutes, tags,
      isPublished, isFeatured
    });
  }, [title, slug, excerpt, content, featuredImage, category, authorName, readTimeMinutes, tags, isPublished, isFeatured]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    const currentHash = getFormDataHash();
    
    // Don't save if nothing changed or no title
    if (currentHash === lastSavedDataRef.current || !title.trim()) {
      return;
    }

    setSaveStatus("saving");

    const input: BlogPostInput = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      excerpt,
      content,
      featured_image: featuredImage || undefined,
      category,
      author_name: authorName,
      read_time_minutes: readTimeMinutes,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      is_published: isPublished,
      is_featured: isFeatured,
      published_at: isPublished ? new Date().toISOString() : undefined,
    };

    try {
      if (currentPostId) {
        // Update existing post
        const { error } = await supabase
          .from("blog_posts")
          .update(input)
          .eq("id", currentPostId);

        if (error) throw error;
      } else {
        // Create new post (first auto-save)
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(input)
          .select()
          .single();

        if (error) throw error;
        
        // Update URL to include the new post ID without navigation
        setCurrentPostId(data.id);
        window.history.replaceState(null, "", `/admin/blog/edit/${data.id}`);
      }

      lastSavedDataRef.current = currentHash;
      setSaveStatus("saved");
    } catch (error: any) {
      console.error("Auto-save error:", error);
      setSaveStatus("error");
    }
  }, [title, slug, excerpt, content, featuredImage, category, authorName, readTimeMinutes, tags, isPublished, isFeatured, currentPostId, getFormDataHash]);

  // Schedule auto-save with debounce
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    setSaveStatus("unsaved");
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // 2 second debounce
  }, [autoSave]);

  // Watch for changes and trigger auto-save
  useEffect(() => {
    if (!isLoading && title.trim()) {
      scheduleAutoSave();
    }
  }, [title, slug, excerpt, content, featuredImage, category, authorName, readTimeMinutes, tags, isPublished, isFeatured, isLoading, scheduleAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved" || saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Load existing post data if editing
  useEffect(() => {
    if (isEditing && postId) {
      loadPost();
    }
  }, [postId, isEditing]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt || "");
        setContent(data.content || "");
        setFeaturedImage(data.featured_image || "");
        setCategory(data.category || "General");
        setAuthorName(data.author_name || "Admin");
        setReadTimeMinutes(data.read_time_minutes || 5);
        setTags(data.tags?.join(", ") || "");
        setIsPublished(data.is_published || false);
        setIsFeatured(data.is_featured || false);
        
        // Set initial hash to prevent immediate auto-save
        lastSavedDataRef.current = JSON.stringify({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content: data.content || "",
          featuredImage: data.featured_image || "",
          category: data.category || "General",
          authorName: data.author_name || "Admin",
          readTimeMinutes: data.read_time_minutes || 5,
          tags: data.tags?.join(", ") || "",
          isPublished: data.is_published || false,
          isFeatured: data.is_featured || false
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading post",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin/blog");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `featured/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      setFeaturedImage(publicUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
    setFeaturedImage("");
  };

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleManualSave = async () => {
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog post",
        variant: "destructive",
      });
      return;
    }

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    await autoSave();
    toast({ title: "Post saved successfully" });
  };

  const handlePublish = async () => {
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog post",
        variant: "destructive",
      });
      return;
    }

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    await autoSave();
    navigate("/admin/blog");
  };

  const handlePreview = () => {
    const previewSlug = slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (previewSlug) {
      window.open(`/blog/${previewSlug}`, "_blank");
    }
  };

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
          <Badge variant="secondary" className="gap-1 bg-success/10 text-success border-success/20">
            <Check className="h-3 w-3" />
            Saved
          </Badge>
        );
      case "unsaved":
        return (
          <Badge variant="secondary" className="gap-1">
            <Cloud className="h-3 w-3" />
            Unsaved changes
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <CloudOff className="h-3 w-3" />
            Save failed
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[500px]" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[300px]" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/blog")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {currentPostId ? "Edit Blog Post" : "Create Blog Post"}
                </h1>
                {renderSaveStatus()}
              </div>
              <p className="text-muted-foreground mt-1">
                {currentPostId
                  ? "Changes are saved automatically"
                  : "Start typing to auto-save your draft"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentPostId && (slug || title) && (
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleManualSave}
              disabled={!title || saveStatus === "saving" || isUploading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!title || saveStatus === "saving" || isUploading}
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Done
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title"
                    className="text-lg"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateSlug}
                    >
                      Generate from title
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">/blog/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="post-url-slug"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary of the post (displayed in blog listings)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your blog post content..."
                  className="min-h-[400px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Published</Label>
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured</Label>
                  <Switch
                    id="featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredImage ? (
                  <div className="relative">
                    <img
                      src={featuredImage}
                      alt="Featured preview"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP (max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">or URL:</span>
                  <Input
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs h-8"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Meta Info */}
            <Card>
              <CardHeader>
                <CardTitle>Meta Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Tutorial, News"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="authorName">Author</Label>
                  <Input
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="readTime">Read Time (min)</Label>
                  <Input
                    id="readTime"
                    type="number"
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                    min={1}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="AI, Content, Marketing"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
