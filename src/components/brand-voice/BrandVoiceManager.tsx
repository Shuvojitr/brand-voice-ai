import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BrandVoiceList } from "@/components/brand-voice/BrandVoiceList";
import { BrandVoiceForm } from "@/components/brand-voice/BrandVoiceForm";
import { Plus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type BrandVoice = Tables<"brand_voices">;

interface BrandVoiceManagerProps {
  organizationId: string;
}

export function BrandVoiceManager({ organizationId }: BrandVoiceManagerProps) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingVoice, setEditingVoice] = useState<BrandVoice | null>(null);

  const handleSuccess = () => {
    setIsCreating(false);
    setEditingVoice(null);
    queryClient.invalidateQueries({ queryKey: ["brand-voices", organizationId] });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingVoice(null);
  };

  const handleEdit = (voice: BrandVoice) => {
    setEditingVoice(voice);
    setIsCreating(false);
  };

  if (isCreating || editingVoice) {
    return (
      <BrandVoiceForm
        organizationId={organizationId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        initialData={editingVoice ? {
          id: editingVoice.id,
          name: editingVoice.name,
          description: editingVoice.description || "",
          language: editingVoice.language as "en" | "bn" || "en",
          styleInstructions: editingVoice.style_instructions || "",
          sampleText: editingVoice.sample_text || "",
          toneKeywords: editingVoice.tone_keywords || [],
          isDefault: editingVoice.is_default || false,
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Brand Voices</h3>
          <p className="text-sm text-muted-foreground">
            Define your unique writing styles for AI-generated content
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Voice
        </Button>
      </div>

      <BrandVoiceList
        organizationId={organizationId}
        onEdit={handleEdit}
      />
    </div>
  );
}
