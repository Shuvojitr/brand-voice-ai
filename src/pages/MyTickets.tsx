import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  open: { label: "Open", variant: "destructive", icon: AlertCircle },
  in_progress: { label: "In Progress", variant: "default", icon: Clock },
  resolved: { label: "Resolved", variant: "secondary", icon: CheckCircle },
  closed: { label: "Closed", variant: "outline", icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Low", variant: "outline" },
  normal: { label: "Normal", variant: "secondary" },
  high: { label: "High", variant: "default" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export default function MyTickets() {
  const { tickets, isLoading } = useSupportTickets();

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Support Tickets</h1>
            <p className="text-muted-foreground">
              Track the status of your support requests
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/support/email">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any support tickets yet.
              </p>
              <Button asChild>
                <Link to="/dashboard/support/email">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.open;
              const priority = priorityConfig[ticket.priority] || priorityConfig.normal;
              const StatusIcon = status.icon;

              return (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {ticket.subject}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <span className="capitalize">{ticket.category}</span>
                          <span>•</span>
                          <span>{format(new Date(ticket.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={priority.variant}>{priority.label}</Badge>
                        <Badge variant={status.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.message}
                    </p>
                    {ticket.resolved_at && (
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                        Resolved on {format(new Date(ticket.resolved_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
