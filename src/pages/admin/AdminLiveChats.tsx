import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  CheckCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { 
  useLiveChats, 
  useLiveChatMessages, 
  useSendLiveChatMessage,
  useUpdateLiveChatStatus,
  LiveChat
} from "@/hooks/useLiveChat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLiveChats() {
  const [selectedChat, setSelectedChat] = useState<LiveChat | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("waiting");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: waitingChats = [], isLoading: waitingLoading } = useLiveChats("waiting");
  const { data: activeChats = [], isLoading: activeLoading } = useLiveChats("active");
  const { data: endedChats = [], isLoading: endedLoading } = useLiveChats("ended");
  const { data: messages = [], isLoading: messagesLoading } = useLiveChatMessages(selectedChat?.id || null);
  const sendMessage = useSendLiveChatMessage();
  const updateStatus = useUpdateLiveChatStatus();

  // Subscribe to real-time updates for chat status
  useEffect(() => {
    const channel = supabase
      .channel("admin-live-chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_chats",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["live-chats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAcceptChat = async (chat: LiveChat) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await updateStatus.mutateAsync({
      chatId: chat.id,
      status: "active",
      assignedTo: user.id,
    });
    setSelectedChat({ ...chat, status: "active", assigned_to: user.id });
    setActiveTab("active");
  };

  const handleEndChat = async () => {
    if (!selectedChat) return;
    await updateStatus.mutateAsync({ chatId: selectedChat.id, status: "ended" });
    setSelectedChat(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    await sendMessage.mutateAsync({
      chatId: selectedChat.id,
      message: message.trim(),
      isAdminMessage: true,
    });
    setMessage("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary">Waiting</Badge>;
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
      default:
        return null;
    }
  };

  const ChatListItem = ({ chat, showAccept = false }: { chat: LiveChat; showAccept?: boolean }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedChat?.id === chat.id ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => setSelectedChat(chat)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{chat.user_name}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{chat.user_email}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(chat.created_at), "MMM d, HH:mm")}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(chat.status)}
            {showAccept && (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptChat(chat);
                }}
                disabled={updateStatus.isPending}
              >
                Accept
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const isLoading = waitingLoading || activeLoading || endedLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Chats</h1>
          <p className="text-muted-foreground">
            Manage and respond to live chat conversations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start rounded-none border-b px-3">
                    <TabsTrigger value="waiting" className="relative">
                      Waiting
                      {waitingChats.length > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                          {waitingChats.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="ended">Ended</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="h-[500px]">
                    <TabsContent value="waiting" className="m-0 p-3 space-y-3">
                      {waitingLoading ? (
                        [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
                      ) : waitingChats.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No waiting chats</p>
                      ) : (
                        waitingChats.map((chat) => (
                          <ChatListItem key={chat.id} chat={chat} showAccept />
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="active" className="m-0 p-3 space-y-3">
                      {activeLoading ? (
                        [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
                      ) : activeChats.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No active chats</p>
                      ) : (
                        activeChats.map((chat) => (
                          <ChatListItem key={chat.id} chat={chat} />
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="ended" className="m-0 p-3 space-y-3">
                      {endedLoading ? (
                        [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
                      ) : endedChats.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No ended chats</p>
                      ) : (
                        endedChats.map((chat) => (
                          <ChatListItem key={chat.id} chat={chat} />
                        ))
                      )}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card className="flex flex-col h-[600px]">
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSelectedChat(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle className="text-lg">{selectedChat.user_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedChat.user_email}</p>
                    </div>
                    {getStatusBadge(selectedChat.status)}
                  </div>
                  {selectedChat.status === "active" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEndChat}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      End Chat
                    </Button>
                  )}
                </CardHeader>

                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-3">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No messages yet
                      </p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_admin_message ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              msg.is_admin_message
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.is_admin_message ? "text-primary-foreground/70" : "text-muted-foreground/70"
                            }`}>
                              {format(new Date(msg.created_at), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {selectedChat.status === "active" && (
                  <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
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

                {selectedChat.status === "ended" && (
                  <div className="p-4 border-t text-center text-muted-foreground text-sm">
                    This chat has ended.
                  </div>
                )}

                {selectedChat.status === "waiting" && (
                  <div className="p-4 border-t">
                    <Button 
                      className="w-full"
                      onClick={() => handleAcceptChat(selectedChat)}
                      disabled={updateStatus.isPending}
                    >
                      Accept Chat
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a chat to view the conversation</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
