import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface TypingState {
  isTyping: boolean;
  userId: string;
  isAdmin: boolean;
}

export function useTypingIndicator(chatId: string | null, isAdmin: boolean) {
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!chatId) {
      setOtherUserTyping(false);
      return;
    }

    const channelName = `typing:${chatId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typingUsers = Object.values(state).flat() as unknown as TypingState[];
        
        // Check if the other party (opposite of isAdmin) is typing
        const otherPartyTyping = typingUsers.some(
          (user) => user.isTyping && user.isAdmin !== isAdmin
        );
        setOtherUserTyping(otherPartyTyping);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track initial presence as not typing
          await channel.track({
            isTyping: false,
            userId: (await supabase.auth.getUser()).data.user?.id || "anonymous",
            isAdmin,
          });
        }
      });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [chatId, isAdmin]);

  const setTyping = useCallback(async (typing: boolean) => {
    if (!channelRef.current || isTypingRef.current === typing) return;
    
    isTypingRef.current = typing;

    const user = (await supabase.auth.getUser()).data.user;
    
    await channelRef.current.track({
      isTyping: typing,
      userId: user?.id || "anonymous",
      isAdmin,
    });

    // Auto-clear typing after 3 seconds of no input
    if (typing) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(async () => {
        isTypingRef.current = false;
        if (channelRef.current) {
          await channelRef.current.track({
            isTyping: false,
            userId: user?.id || "anonymous",
            isAdmin,
          });
        }
      }, 3000);
    }
  }, [isAdmin]);

  const handleInputChange = useCallback((value: string) => {
    if (value.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  }, [setTyping]);

  const stopTyping = useCallback(() => {
    setTyping(false);
  }, [setTyping]);

  return { otherUserTyping, handleInputChange, stopTyping };
}
