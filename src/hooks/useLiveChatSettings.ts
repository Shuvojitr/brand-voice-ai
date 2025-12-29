import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LiveChatSettings {
  id: string;
  is_enabled: boolean;
  business_hours_start: string;
  business_hours_end: string;
  business_days: number[];
  timezone: string;
  offline_message: string;
  auto_reply_enabled: boolean;
  auto_reply_delay_seconds: number;
  auto_reply_message: string;
  created_at: string;
  updated_at: string;
}

export function useLiveChatSettings() {
  return useQuery({
    queryKey: ["live-chat-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_chat_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as LiveChatSettings;
    },
  });
}

export function useUpdateLiveChatSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<LiveChatSettings>) => {
      const { data, error } = await supabase
        .from("live_chat_settings")
        .update(updates)
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-chat-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save settings: " + error.message);
    },
  });
}

export function isWithinBusinessHours(settings: LiveChatSettings): boolean {
  const now = new Date();
  
  // Get current day (1=Monday, 7=Sunday to match our format)
  const jsDay = now.getDay(); // 0=Sunday, 1=Monday, etc.
  const currentDay = jsDay === 0 ? 7 : jsDay; // Convert to 1-7 format
  
  // Check if today is a business day
  // If no days are selected, treat it as "all days" (no day restriction)
  const businessDays = settings.business_days ?? [];
  if (businessDays.length > 0 && !businessDays.includes(currentDay)) {
    return false;
  }

  // Parse business hours
  const [startHour, startMin] = settings.business_hours_start.split(":").map(Number);
  const [endHour, endMin] = settings.business_hours_end.split(":").map(Number);

  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  
  const currentMinutes = currentHour * 60 + currentMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
