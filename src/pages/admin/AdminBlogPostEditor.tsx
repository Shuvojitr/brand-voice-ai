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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  AlertTriangle,
  RotateCcw,
  Send,
  CalendarClock,
  Clock,
  ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BlogPostInput,
} from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MediaPickerDialog } from "@/components/media/MediaPickerDialog";
import { CategoryMultiSelect } from "@/components/blog-editor/CategoryMultiSelect";
import { AuthorSelect } from "@/components/blog-editor/AuthorSelect";
import { TagInput } from "@/components/blog-editor/TagInput";

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
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>("");

  // Track if this is a published post being edited
  const [isPublishedPost, setIsPublishedPost] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isPublishingChanges, setIsPublishingChanges] = useState(false);
  const [isDiscardingChanges, setIsDiscardingChanges] = useState(false);

  // Store original published content for comparison/revert
  const originalPublishedDataRef = useRef<{
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
  } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [category, setCategory] = useState("General");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [authorUserId, setAuthorUserId] = useState<string | null>(null);
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Calculate reading time based on content (average 200 words per minute)
  const calculateReadingTime = useCallback((text: string): number => {
    const plainText = text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[#*`_~\[\]]/g, "") // Remove markdown syntax
      .trim();
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return minutes;
  }, []);

  // Auto-update reading time when content changes
  useEffect(() => {
    if (content) {
      const calculatedTime = calculateReadingTime(content);
      setReadTimeMinutes(calculatedTime);
    }
  }, [content, calculateReadingTime]);

  // Check if current content differs from published content
  const checkForPendingChanges = useCallback(() => {
    if (!isPublishedPost || !originalPublishedDataRef.current) return false;
    
    const original = originalPublishedDataRef.current;
    return (
      title !== original.title ||
      excerpt !== original.excerpt ||
      content !== original.content ||
      featuredImage !== original.featuredImage
    );
  }, [isPublishedPost, title, excerpt, content, featuredImage]);

  // Update pending changes status when content changes
  useEffect(() => {
    if (isPublishedPost && originalPublishedDataRef.current) {
      setHasPendingChanges(checkForPendingChanges());
    }
  }, [isPublishedPost, title, excerpt, content, featuredImage, checkForPendingChanges]);

  // Create a hash of current form data to detect changes
  const getFormDataHash = useCallback(() => {
    return JSON.stringify({
      title, slug, excerpt, content, featuredImage,
      category, authorName, authorAvatar, selectedCategoryIds, readTimeMinutes, tags: tagsArray,
      isPublished, isFeatured, scheduledPublishAt: scheduledPublishAt?.toISOString(),
      scheduledTime
    });
  }, [title, slug, excerpt, content, featuredImage, category, authorName, authorAvatar, selectedCategoryIds, readTimeMinutes, tagsArray, isPublished, isFeatured, scheduledPublishAt, scheduledTime]);

  // Auto-save function - saves to draft fields for published posts
  const autoSave = useCallback(async () => {
    const currentHash = getFormDataHash();
    
    // Don't save if nothing changed or no title
    if (currentHash === lastSavedDataRef.current || !title.trim()) {
      return;
    }

    setSaveStatus("saving");
    let savedPostId = currentPostId;

    try {
      if (currentPostId) {
        if (isPublishedPost && isPublished) {
          // For published posts: save changes to draft fields only
          const hasDraftChanges = checkForPendingChanges();
          
          const updateData: Record<string, unknown> = {
            // Always update these non-content fields directly
            slug: slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            category,
            author_name: authorName,
            author_avatar: authorAvatar || null,
            author_user_id: authorUserId,
            read_time_minutes: readTimeMinutes,
            tags: tagsArray,
            is_featured: isFeatured,
          };

          if (hasDraftChanges) {
            // Store content changes in draft fields
            updateData.draft_title = title;
            updateData.draft_excerpt = excerpt;
            updateData.draft_content = content;
            updateData.draft_featured_image = featuredImage || null;
            updateData.has_pending_changes = true;
          }

          const { error } = await supabase
            .from("blog_posts")
            .update(updateData)
            .eq("id", currentPostId);

          if (error) throw error;
        } else {
          // For unpublished posts: update directly as before
          // Compute full scheduled datetime if date is set
          let scheduledDateTime: string | null = null;
          if (scheduledPublishAt && !isPublished) {
            const [hours, minutes] = scheduledTime.split(":").map(Number);
            const scheduledDate = new Date(scheduledPublishAt);
            scheduledDate.setHours(hours, minutes, 0, 0);
            scheduledDateTime = scheduledDate.toISOString();
          }

          const input: BlogPostInput = {
            title,
            slug: slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            excerpt,
            content,
            featured_image: featuredImage || undefined,
            category,
            author_name: authorName,
            author_avatar: authorAvatar || undefined,
            author_user_id: authorUserId,
            read_time_minutes: readTimeMinutes,
            tags: tagsArray,
            is_published: isPublished,
            is_featured: isFeatured,
            published_at: isPublished ? new Date().toISOString() : undefined,
            scheduled_publish_at: scheduledDateTime,
            // Clear draft fields when saving directly
            draft_title: null,
            draft_excerpt: null,
            draft_content: null,
            draft_featured_image: null,
            has_pending_changes: false,
          };

          const { error } = await supabase
            .from("blog_posts")
            .update(input)
            .eq("id", currentPostId);

          if (error) throw error;
        }
      } else {
        // Create new post (first auto-save) - always save directly
        // Compute full scheduled datetime if date is set
        let scheduledDateTime: string | null = null;
        if (scheduledPublishAt && !isPublished) {
          const [hours, minutes] = scheduledTime.split(":").map(Number);
          const scheduledDate = new Date(scheduledPublishAt);
          scheduledDate.setHours(hours, minutes, 0, 0);
          scheduledDateTime = scheduledDate.toISOString();
        }

        const input: BlogPostInput = {
          title,
          slug: slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          excerpt,
          content,
          featured_image: featuredImage || undefined,
          category,
          author_name: authorName,
          author_avatar: authorAvatar || undefined,
          author_user_id: authorUserId,
          read_time_minutes: readTimeMinutes,
          tags: tagsArray,
          is_published: isPublished,
          is_featured: isFeatured,
          published_at: isPublished ? new Date().toISOString() : undefined,
          scheduled_publish_at: scheduledDateTime,
        };

        const { data, error } = await supabase
          .from("blog_posts")
          .insert(input)
          .select()
          .single();

        if (error) throw error;
        
        // Update URL to include the new post ID without navigation
        savedPostId = data.id;
        setCurrentPostId(data.id);
        window.history.replaceState(null, "", `/admin/blog/edit/${data.id}`);
      }

      // Sync categories to pivot table
      if (savedPostId) {
        await supabase.from("post_categories").delete().eq("post_id", savedPostId);
        if (selectedCategoryIds.length > 0) {
          await supabase.from("post_categories").insert(
            selectedCategoryIds.map((catId) => ({ post_id: savedPostId!, category_id: catId }))
          );
        }
      }

      lastSavedDataRef.current = currentHash;
      setSaveStatus("saved");
    } catch (error: unknown) {
      console.error("Auto-save error:", error);
      setSaveStatus("error");
    }
  }, [title, slug, excerpt, content, featuredImage, category, authorName, readTimeMinutes, tagsArray, selectedCategoryIds, isPublished, isFeatured, currentPostId, getFormDataHash, isPublishedPost, checkForPendingChanges, scheduledPublishAt, scheduledTime]);

  // Publish draft changes to live
  const publishChanges = async () => {
    if (!currentPostId || !hasPendingChanges) return;

    setIsPublishingChanges(true);

    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title,
          excerpt,
          content,
          featured_image: featuredImage || null,
          // Clear draft fields
          draft_title: null,
          draft_excerpt: null,
          draft_content: null,
          draft_featured_image: null,
          has_pending_changes: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentPostId);

      if (error) throw error;

      // Update original reference
      originalPublishedDataRef.current = {
        title,
        excerpt,
        content,
        featuredImage,
      };
      
      setHasPendingChanges(false);
      toast({ title: "Changes published successfully", description: "Your updates are now live." });
    } catch (error: unknown) {
      console.error("Publish error:", error);
      toast({
        title: "Failed to publish changes",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsPublishingChanges(false);
    }
  };

  // Discard draft changes and revert to published version
  const discardChanges = async () => {
    if (!currentPostId || !originalPublishedDataRef.current) return;

    setIsDiscardingChanges(true);

    try {
      const original = originalPublishedDataRef.current;

      // Revert form state
      setTitle(original.title);
      setExcerpt(original.excerpt);
      setContent(original.content);
      setFeaturedImage(original.featuredImage);

      // Clear draft fields in database
      const { error } = await supabase
        .from("blog_posts")
        .update({
          draft_title: null,
          draft_excerpt: null,
          draft_content: null,
          draft_featured_image: null,
          has_pending_changes: false,
        })
        .eq("id", currentPostId);

      if (error) throw error;

      setHasPendingChanges(false);
      lastSavedDataRef.current = JSON.stringify({
        title: original.title,
        slug,
        excerpt: original.excerpt,
        content: original.content,
        featuredImage: original.featuredImage,
        category,
        authorName,
        readTimeMinutes,
        tags: tagsArray,
        isPublished,
        isFeatured
      });
      setSaveStatus("saved");

      toast({ title: "Changes discarded", description: "Reverted to the published version." });
    } catch (error: unknown) {
      console.error("Discard error:", error);
      toast({
        title: "Failed to discard changes",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDiscardingChanges(false);
    }
  };

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
  }, [title, slug, excerpt, content, featuredImage, category, authorName, readTimeMinutes, tagsArray, selectedCategoryIds, isPublished, isFeatured, isLoading, scheduleAutoSave, scheduledPublishAt, scheduledTime]);

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

  // Load current user's profile for author defaults
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();
        if (profile && !isEditing) {
          setAuthorUserId(user.id);
          setAuthorName(profile.full_name || user.email || "Admin");
          setAuthorAvatar(profile.avatar_url || "");
        }
        if (!authorUserId) {
          setAuthorUserId(user.id);
        }
      }
    };
    loadUserProfile();
  }, [isEditing]);

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
        const wasPublished = data.is_published || false;
        setIsPublishedPost(wasPublished);
        
        // If post has pending draft changes, load the draft content
        // Otherwise load the published content
        const hasDraft = data.has_pending_changes && wasPublished;
        
        if (hasDraft && data.draft_title) {
          setTitle(data.draft_title);
        } else {
          setTitle(data.title);
        }
        
        setSlug(data.slug);
        
        if (hasDraft && data.draft_excerpt !== null) {
          setExcerpt(data.draft_excerpt);
        } else {
          setExcerpt(data.excerpt || "");
        }
        
        if (hasDraft && data.draft_content !== null) {
          setContent(data.draft_content);
        } else {
          setContent(data.content || "");
        }
        
        if (hasDraft && data.draft_featured_image !== null) {
          setFeaturedImage(data.draft_featured_image);
        } else {
          setFeaturedImage(data.featured_image || "");
        }
        
        setCategory(data.category || "General");
        setAuthorName(data.author_name || "");
        setAuthorAvatar(data.author_avatar || "");
        setReadTimeMinutes(data.read_time_minutes || 5);
        setTagsArray(data.tags || []);

        // Load categories from pivot table
        const { data: postCats } = await supabase
          .from("post_categories")
          .select("category_id")
          .eq("post_id", postId!);
        if (postCats && postCats.length > 0) {
          setSelectedCategoryIds(postCats.map((pc: any) => pc.category_id));
        }
        setIsPublished(wasPublished);
        setIsFeatured(data.is_featured || false);
        setHasPendingChanges(data.has_pending_changes || false);

        // Load scheduled publishing date/time
        if (data.scheduled_publish_at) {
          const scheduledDate = new Date(data.scheduled_publish_at);
          setScheduledPublishAt(scheduledDate);
          setScheduledTime(
            `${scheduledDate.getHours().toString().padStart(2, "0")}:${scheduledDate.getMinutes().toString().padStart(2, "0")}`
          );
        } else {
          setScheduledPublishAt(null);
          setScheduledTime("09:00");
        }

        // Store original published content for comparison
        if (wasPublished) {
          originalPublishedDataRef.current = {
            title: data.title,
            excerpt: data.excerpt || "",
            content: data.content || "",
            featuredImage: data.featured_image || "",
          };
        }
        
        // Set initial hash to prevent immediate auto-save
        const loadedTitle = hasDraft && data.draft_title ? data.draft_title : data.title;
        const loadedExcerpt = hasDraft && data.draft_excerpt !== null ? data.draft_excerpt : (data.excerpt || "");
        const loadedContent = hasDraft && data.draft_content !== null ? data.draft_content : (data.content || "");
        const loadedFeaturedImage = hasDraft && data.draft_featured_image !== null ? data.draft_featured_image : (data.featured_image || "");
        
        lastSavedDataRef.current = JSON.stringify({
          title: loadedTitle,
          slug: data.slug,
          excerpt: loadedExcerpt,
          content: loadedContent,
          featuredImage: loadedFeaturedImage,
          category: data.category || "General",
          authorName: data.author_name || "Admin",
          readTimeMinutes: data.read_time_minutes || 5,
          tags: data.tags || [],
          isPublished: wasPublished,
          isFeatured: data.is_featured || false,
          scheduledPublishAt: data.scheduled_publish_at || null,
          scheduledTime: data.scheduled_publish_at 
            ? `${new Date(data.scheduled_publish_at).getHours().toString().padStart(2, "0")}:${new Date(data.scheduled_publish_at).getMinutes().toString().padStart(2, "0")}`
            : "09:00"
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error loading post",
        description: error instanceof Error ? error.message : "Unknown error",
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
      const filePath = `media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save to media table
      await supabase.from("media").insert({
        name: file.name,
        file_path: filePath,
        url: publicUrl,
        bucket: "blog-images",
        mime_type: file.type,
        size_bytes: file.size,
        width: dimensions.width,
        height: dimensions.height,
        uploaded_by: user?.id || null,
      });

      setFeaturedImage(publicUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleMediaSelect = (url: string) => {
    setFeaturedImage(url);
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
    toast({ title: "Draft saved successfully" });
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
            {isPublishedPost && hasPendingChanges ? "Draft saved" : "Saved"}
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
        {/* Pending Changes Banner */}
        {isPublishedPost && hasPendingChanges && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning">You have unpublished changes</p>
                <p className="text-sm text-muted-foreground">
                  Your edits are saved as a draft. Publish to make them live or discard to revert.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDiscardingChanges}
                  >
                    {isDiscardingChanges ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Discard
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will revert all your unpublished changes and restore the currently live version. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={discardChanges}>
                      Discard Changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                size="sm"
                onClick={publishChanges}
                disabled={isPublishingChanges}
              >
                {isPublishingChanges ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish Changes
              </Button>
            </div>
          </div>
        )}

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
                {isPublishedPost && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Published
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {isPublishedPost
                  ? "Edits are saved as drafts. Publish to make changes live."
                  : currentPostId
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
              Save Draft
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
                    onCheckedChange={(checked) => {
                      setIsPublished(checked);
                      // Clear scheduled publishing if publishing now
                      if (checked) {
                        setScheduledPublishAt(null);
                      }
                    }}
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

                {/* Schedule Publishing (only show if not already published) */}
                {!isPublished && (
                  <div className="pt-3 border-t space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <Label>Schedule for later</Label>
                    </div>
                    
                    {scheduledPublishAt ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            Scheduled for {format(scheduledPublishAt, "MMM d, yyyy")} at {scheduledTime}
                          </span>
                        </div>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <CalendarClock className="h-4 w-4 mr-2" />
                              Change date
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={scheduledPublishAt}
                              onSelect={(date) => date && setScheduledPublishAt(date)}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <div className="grid gap-2">
                          <Label htmlFor="scheduledTime" className="text-xs text-muted-foreground">Time</Label>
                          <Input
                            id="scheduledTime"
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="h-9"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setScheduledPublishAt(null)}
                          className="w-full text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear schedule
                        </Button>
                      </div>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground">
                            <CalendarClock className="h-4 w-4 mr-2" />
                            Set publish date
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledPublishAt ?? undefined}
                            onSelect={(date) => date && setScheduledPublishAt(date)}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowMediaPicker(true)}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Media Library
                  </Button>
                </div>
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

            {/* Media Picker Dialog */}
            <MediaPickerDialog
              open={showMediaPicker}
              onOpenChange={setShowMediaPicker}
              onSelect={handleMediaSelect}
              title="Select Featured Image"
            />

            {/* Meta Info */}
            <Card>
              <CardHeader>
                <CardTitle>Meta Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategoryMultiSelect
                  selectedIds={selectedCategoryIds}
                  onChange={setSelectedCategoryIds}
                />

                <AuthorSelect
                  authorUserId={authorUserId}
                  onSelect={(userId, name, avatar) => {
                    setAuthorUserId(userId);
                    setAuthorName(name);
                    setAuthorAvatar(avatar);
                  }}
                />

                <TagInput
                  tags={tagsArray}
                  onChange={setTagsArray}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
