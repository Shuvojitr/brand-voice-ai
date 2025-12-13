import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Sparkles, MoreVertical, Edit, Trash2, Star, Globe } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type BrandVoice = Tables<"brand_voices">;

interface BrandVoiceListProps {
  organizationId: string;
  onEdit?: (voice: BrandVoice) => void;
  onSelect?: (voice: BrandVoice) => void;
  selectedId?: string;
  selectable?: boolean;
}

export function BrandVoiceList({
  organizationId,
  onEdit,
  onSelect,
  selectedId,
  selectable = false,
}: BrandVoiceListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: voices, isLoading } = useQuery({
    queryKey: ["brand-voices", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_voices")
        .select("*")
        .eq("organization_id", organizationId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BrandVoice[];
    },
    enabled: !!organizationId,
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("brand_voices")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("Brand voice deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["brand-voices", organizationId] });
    } catch (error) {
      console.error("Failed to delete brand voice:", error);
      toast.error("Failed to delete brand voice");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (voiceId: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from("brand_voices")
        .update({ is_default: false })
        .eq("organization_id", organizationId);

      // Then set the new default
      const { error } = await supabase
        .from("brand_voices")
        .update({ is_default: true })
        .eq("id", voiceId);

      if (error) throw error;

      toast.success("Default voice updated");
      queryClient.invalidateQueries({ queryKey: ["brand-voices", organizationId] });
    } catch (error) {
      console.error("Failed to set default voice:", error);
      toast.error("Failed to update default voice");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!voices?.length) {
    return (
      <Card className="border-dashed border-border/50 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No brand voices yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create your first brand voice to ensure consistent tone across all generated content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {voices.map((voice) => (
          <Card
            key={voice.id}
            className={`border-border/50 transition-all hover:border-primary/30 ${
              selectable ? "cursor-pointer" : ""
            } ${selectedId === voice.id ? "border-primary ring-2 ring-primary/20" : ""}`}
            onClick={() => selectable && onSelect?.(voice)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {voice.name}
                    {voice.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Globe className="h-3 w-3" />
                    {voice.language === "bn" ? "বাংলা" : "English"}
                  </CardDescription>
                </div>
                {!selectable && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(voice)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!voice.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefault(voice.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(voice.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {voice.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {voice.description}
                </p>
              )}
              {voice.tone_keywords && voice.tone_keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {voice.tone_keywords.slice(0, 4).map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {voice.tone_keywords.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{voice.tone_keywords.length - 4}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand Voice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brand voice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
