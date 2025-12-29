import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AiProviderSetting {
  id: string;
  provider_name: string;
  provider_slug: string;
  api_key_encrypted: string | null;
  api_endpoint: string | null;
  default_model: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export function useAiProviderSettings() {
  const queryClient = useQueryClient();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['ai-provider-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_provider_settings')
        .select('*')
        .order('provider_name');
      
      if (error) throw error;
      return data as AiProviderSetting[];
    },
  });

  const activeProvider = providers?.find(p => p.is_active);

  const updateProviderMutation = useMutation({
    mutationFn: async ({ 
      id, 
      api_key, 
      default_model, 
      api_endpoint 
    }: { 
      id: string; 
      api_key?: string; 
      default_model?: string;
      api_endpoint?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      
      if (api_key !== undefined) {
        // For now, we store the key directly. In production, you'd encrypt this.
        // The key is already protected by RLS (admin only)
        updates.api_key_encrypted = api_key;
      }
      if (default_model !== undefined) {
        updates.default_model = default_model;
      }
      if (api_endpoint !== undefined) {
        updates.api_endpoint = api_endpoint;
      }

      const { error } = await supabase
        .from('ai_provider_settings')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-provider-settings'] });
      toast.success('Provider settings updated');
    },
    onError: (error) => {
      console.error('Error updating provider:', error);
      toast.error('Failed to update provider settings');
    },
  });

  const activateProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      // First deactivate all providers
      const { error: deactivateError } = await supabase
        .from('ai_provider_settings')
        .update({ is_active: false })
        .neq('id', 'dummy'); // Update all

      if (deactivateError) throw deactivateError;

      // Then activate the selected one
      const { error: activateError } = await supabase
        .from('ai_provider_settings')
        .update({ is_active: true })
        .eq('id', providerId);

      if (activateError) throw activateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-provider-settings'] });
      toast.success('AI provider activated');
    },
    onError: (error) => {
      console.error('Error activating provider:', error);
      toast.error('Failed to activate provider');
    },
  });

  return {
    providers,
    activeProvider,
    isLoading,
    updateProvider: updateProviderMutation.mutate,
    activateProvider: activateProviderMutation.mutate,
    isUpdating: updateProviderMutation.isPending,
    isActivating: activateProviderMutation.isPending,
  };
}
