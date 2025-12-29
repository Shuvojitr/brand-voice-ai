import { useState } from "react";
import { useTicketReplies } from "@/hooks/useTicketReplies";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, User, Shield } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TicketConversationProps {
  ticketId: string;
  initialMessage: string;
  initialMessageDate: string;
  isAdmin?: boolean;
  ticketStatus?: string;
}

export function TicketConversation({ 
  ticketId, 
  initialMessage, 
  initialMessageDate,
  isAdmin = false,
  ticketStatus = "open"
}: TicketConversationProps) {
  const [newMessage, setNewMessage] = useState("");
  const { replies, isLoading, createReply } = useTicketReplies(ticketId);
  
  const isClosed = ticketStatus === "closed";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await createReply.mutateAsync({ 
      message: newMessage.trim(), 
      isAdminReply: isAdmin 
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 pb-4">
          {/* Initial message */}
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-muted">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Customer</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(initialMessageDate), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {initialMessage}
              </p>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Replies */}
          {replies?.map((reply) => (
            <div 
              key={reply.id} 
              className={cn(
                "flex gap-3",
                reply.is_admin_reply && "flex-row-reverse"
              )}
            >
              <Avatar className={cn(
                "h-8 w-8 flex-shrink-0",
                reply.is_admin_reply && "bg-primary"
              )}>
                <AvatarFallback className={cn(
                  reply.is_admin_reply ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {reply.is_admin_reply ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "flex-1 space-y-1",
                reply.is_admin_reply && "text-right"
              )}>
                <div className={cn(
                  "flex items-center gap-2",
                  reply.is_admin_reply && "justify-end"
                )}>
                  <span className="text-sm font-medium">
                    {reply.is_admin_reply ? "Support Team" : "Customer"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(reply.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <div className={cn(
                  "inline-block rounded-lg px-3 py-2 text-sm",
                  reply.is_admin_reply 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <p className="whitespace-pre-wrap">{reply.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Reply form */}
      {isClosed && !isAdmin ? (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center py-4">
            This ticket is closed. You cannot send new messages.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-4 border-t space-y-3">
          <Textarea
            placeholder="Type your reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || createReply.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {createReply.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
