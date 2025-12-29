import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

export function useTicketReplies(ticketId: string | null) {
  const queryClient = useQueryClient();

  const { data: replies, isLoading, error } = useQuery({
    queryKey: ["ticket-replies", ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as TicketReply[];
    },
    enabled: !!ticketId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`ticket-replies-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_replies',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ticket-replies", ticketId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, queryClient]);

  const createReply = useMutation({
    mutationFn: async ({ message, isAdminReply }: { message: string; isAdminReply: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ticket_replies")
        .insert([{
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_admin_reply: isAdminReply,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-replies", ticketId] });
      toast.success("Reply sent");
    },
    onError: (error) => {
      toast.error("Failed to send reply: " + error.message);
    },
  });

  return {
    replies,
    isLoading,
    error,
    createReply,
  };
}
