import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MediaItem {
  id: string;
  name: string;
  file_path: string;
  url: string;
  bucket: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

export function useMedia(bucket?: string) {
  const queryClient = useQueryClient();

  const { data: mediaItems = [], isLoading, error } = useQuery({
    queryKey: ["media", bucket],
    queryFn: async () => {
      let query = supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (bucket) {
        query = query.eq("bucket", bucket);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MediaItem[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      altText,
      targetBucket = "blog-images",
    }: {
      file: File;
      altText?: string;
      targetBucket?: string;
    }) => {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `media/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(filePath);

      // Get image dimensions if it's an image
      let width: number | null = null;
      let height: number | null = null;

      if (file.type.startsWith("image/")) {
        const dimensions = await getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert record into media table
      const { data, error } = await supabase
        .from("media")
        .insert({
          name: file.name,
          file_path: filePath,
          url: urlData.publicUrl,
          bucket: targetBucket,
          mime_type: file.type,
          size_bytes: file.size,
          width,
          height,
          alt_text: altText || null,
          uploaded_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MediaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("File uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      altText,
      name,
    }: {
      id: string;
      altText?: string;
      name?: string;
    }) => {
      const updates: Partial<MediaItem> = {};
      if (altText !== undefined) updates.alt_text = altText;
      if (name !== undefined) updates.name = name;

      const { data, error } = await supabase
        .from("media")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MediaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaItem: MediaItem) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(mediaItem.bucket)
        .remove([mediaItem.file_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error } = await supabase
        .from("media")
        .delete()
        .eq("id", mediaItem.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  return {
    mediaItems,
    isLoading,
    error,
    uploadFile: uploadMutation.mutateAsync,
    updateMedia: updateMutation.mutateAsync,
    deleteMedia: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
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
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
