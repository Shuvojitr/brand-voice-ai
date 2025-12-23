import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ApiKey {
  id: string;
  user_id: string;
  organization_id: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
  is_active: boolean;
}

// Generate a secure random API key
const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk-mygenai-';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

// Simple hash function for storing keys
const hashKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useApiKeys = (organizationId?: string) => {
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('organization_id', organizationId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApiKey[];
    },
    enabled: !!organizationId,
  });

  const createKeyMutation = useMutation({
    mutationFn: async ({ name, userId }: { name: string; userId: string }) => {
      const plainKey = generateApiKey();
      const keyHash = await hashKey(plainKey);
      const keyPrefix = plainKey.substring(0, 12) + '...' + plainKey.slice(-4);
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: userId,
          organization_id: organizationId!,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          name: name,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Return both the created record and the plain key (for one-time display)
      return { ...data, plainKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', organizationId] });
      toast.success("API key created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create API key: " + error.message);
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', organizationId] });
      toast.success("API key revoked successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to revoke API key: " + error.message);
    },
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ keyId, name }: { keyId: string; name: string }) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ name })
        .eq('id', keyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', organizationId] });
      toast.success("API key updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update API key: " + error.message);
    },
  });

  return {
    apiKeys: apiKeys || [],
    isLoading,
    createKey: createKeyMutation.mutateAsync,
    revokeKey: revokeKeyMutation.mutateAsync,
    updateKey: updateKeyMutation.mutateAsync,
    isCreating: createKeyMutation.isPending,
    isRevoking: revokeKeyMutation.isPending,
  };
};
