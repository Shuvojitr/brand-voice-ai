import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface LiveChat {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
}

export interface LiveChatMessage {
  id: string;
  chat_id: string;
  user_id: string | null;
  message: string;
  is_admin_message: boolean;
  created_at: string;
}

export function useLiveChats(status?: string) {
  return useQuery({
    queryKey: ["live-chats", status],
    queryFn: async () => {
      let query = supabase
        .from("live_chats")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LiveChat[];
    },
  });
}

export function useUserActiveChat() {
  return useQuery({
    queryKey: ["user-active-chat"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("live_chats")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["waiting", "active"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as LiveChat | null;
    },
  });
}

export function useLiveChatMessages(chatId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["live-chat-messages", chatId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  return useQuery({
    queryKey: ["live-chat-messages", chatId],
    queryFn: async () => {
      if (!chatId) return [];
      
      const { data, error } = await supabase
        .from("live_chat_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as LiveChatMessage[];
    },
    enabled: !!chatId,
  });
}

export function useCreateLiveChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userName, userEmail }: { userName: string; userEmail: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to start a chat");

      const { data, error } = await supabase
        .from("live_chats")
        .insert({
          user_id: user.id,
          user_name: userName,
          user_email: userEmail,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;
      return data as LiveChat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-active-chat"] });
      queryClient.invalidateQueries({ queryKey: ["live-chats"] });
      toast({
        title: "Chat started",
        description: "A support agent will be with you shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSendLiveChatMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      chatId, 
      message, 
      isAdminMessage 
    }: { 
      chatId: string; 
      message: string; 
      isAdminMessage: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      const { data, error } = await supabase
        .from("live_chat_messages")
        .insert({
          chat_id: chatId,
          user_id: user.id,
          message,
          is_admin_message: isAdminMessage,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LiveChatMessage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live-chat-messages", variables.chatId] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateLiveChatStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      chatId, 
      status,
      assignedTo,
    }: { 
      chatId: string; 
      status: string;
      assignedTo?: string;
    }) => {
      const updateData: Partial<LiveChat> = { status };
      
      if (status === "ended") {
        updateData.ended_at = new Date().toISOString();
      }
      
      if (assignedTo) {
        updateData.assigned_to = assignedTo;
      }

      const { data, error } = await supabase
        .from("live_chats")
        .update(updateData)
        .eq("id", chatId)
        .select()
        .single();

      if (error) throw error;
      return data as LiveChat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-chats"] });
      queryClient.invalidateQueries({ queryKey: ["user-active-chat"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
