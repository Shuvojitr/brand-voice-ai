import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { 
  useUserActiveChat, 
  useLiveChatMessages, 
  useCreateLiveChat, 
  useSendLiveChatMessage,
  useUpdateLiveChatStatus 
} from "@/hooks/useLiveChat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { TypingIndicator } from "./TypingIndicator";

interface LiveChatWidgetProps {
  userName: string;
  userEmail: string;
  onClose?: () => void;
}

export function LiveChatWidget({ userName, userEmail, onClose }: LiveChatWidgetProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: activeChat, isLoading: chatLoading } = useUserActiveChat();
  const { data: messages = [], isLoading: messagesLoading } = useLiveChatMessages(activeChat?.id || null);
  const createChat = useCreateLiveChat();
  const sendMessage = useSendLiveChatMessage();
  const updateStatus = useUpdateLiveChatStatus();
  const { otherUserTyping, handleInputChange, stopTyping } = useTypingIndicator(
    activeChat?.status === "active" ? activeChat.id : null,
    false
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartChat = async () => {
    await createChat.mutateAsync({ userName, userEmail });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    stopTyping();
    await sendMessage.mutateAsync({
      chatId: activeChat.id,
      message: message.trim(),
      isAdminMessage: false,
    });
    setMessage("");
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    handleInputChange(value);
  };

  const handleEndChat = async () => {
    if (!activeChat) return;
    await updateStatus.mutateAsync({ chatId: activeChat.id, status: "ended" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary">Waiting for agent</Badge>;
      case "active":
        return <Badge className="bg-green-500">Connected</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
      default:
        return null;
    }
  };

  if (chatLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // No active chat - show start chat button
  if (!activeChat) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Live Chat
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start a live chat with our support team. We're here to help!
          </p>
          <Button 
            onClick={handleStartChat} 
            disabled={createChat.isPending}
            className="w-full"
          >
            {createChat.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              "Start Chat"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Active chat exists
  return (
    <Card className="w-full max-w-md flex flex-col h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Live Chat
          </CardTitle>
          {getStatusBadge(activeChat.status)}
        </div>
        <div className="flex items-center gap-1">
          {activeChat.status !== "ended" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEndChat}
              disabled={updateStatus.isPending}
            >
              End Chat
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {activeChat.status === "waiting" && messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Waiting for a support agent...</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.is_admin_message ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.is_admin_message
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.is_admin_message ? "text-muted-foreground/70" : "text-primary-foreground/70"
                }`}>
                  {format(new Date(msg.created_at), "HH:mm")}
                </p>
              </div>
            </div>
          ))}

          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <TypingIndicator label="Agent is typing" />
              </div>
            </div>
          )}

          {activeChat.status === "ended" && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              This chat has ended. Thank you for contacting us!
            </div>
          )}
        </div>
      </ScrollArea>

      {activeChat.status !== "ended" && (
        <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageChange}
            disabled={sendMessage.isPending}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim() || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </Card>
  );
}
