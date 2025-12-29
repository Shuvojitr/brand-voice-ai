import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupportTickets, SupportTicket } from "@/hooks/useSupportTickets";
import { TicketConversation } from "@/components/tickets/TicketConversation";
import { Ticket, Search, Filter, Eye, Trash2, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "in-progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

const categoryLabels: Record<string, string> = {
  general: "General Inquiry",
  technical: "Technical Issue",
  billing: "Billing & Subscription",
  feature: "Feature Request",
  bug: "Bug Report",
};

export default function AdminSupportTickets() {
  const { tickets, isLoading, updateTicket, deleteTicket } = useSupportTickets();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets?.length || 0,
    open: tickets?.filter((t) => t.status === "open").length || 0,
    inProgress: tickets?.filter((t) => t.status === "in-progress").length || 0,
    resolved: tickets?.filter((t) => t.status === "resolved").length || 0,
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setAdminNotes(ticket.admin_notes || "");
  };

  const handleUpdateTicket = (updates: Partial<SupportTicket>) => {
    if (selectedTicket) {
      updateTicket.mutate({
        id: selectedTicket.id,
        updates: {
          ...updates,
          ...(updates.status === "resolved" && !selectedTicket.resolved_at
            ? { resolved_at: new Date().toISOString() }
            : {}),
        },
      });
      setSelectedTicket({ ...selectedTicket, ...updates });
    }
  };

  const handleSaveNotes = () => {
    if (selectedTicket) {
      updateTicket.mutate({
        id: selectedTicket.id,
        updates: { admin_notes: adminNotes },
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and respond to user support requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>View and manage support tickets from users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by subject, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tickets Table */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredTickets && filteredTickets.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {ticket.subject}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ticket.name}</div>
                            <div className="text-sm text-muted-foreground">{ticket.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {categoryLabels[ticket.category] || ticket.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(ticket.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewTicket(ticket)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Ticket?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this support ticket. This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTicket.mutate(ticket.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No tickets found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Support tickets will appear here when users submit them"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTicket.subject}</DialogTitle>
                  <DialogDescription>
                    Submitted on {format(new Date(selectedTicket.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="conversation" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="conversation">Conversation</TabsTrigger>
                    <TabsTrigger value="details">Details & Notes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="conversation" className="flex-1 overflow-hidden mt-4">
                    <div className="h-[50vh]">
                      <TicketConversation
                        ticketId={selectedTicket.id}
                        initialMessage={selectedTicket.message}
                        initialMessageDate={selectedTicket.created_at}
                        isAdmin={true}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-6 mt-4 overflow-y-auto max-h-[50vh]">
                    {/* Contact Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="mt-1">{selectedTicket.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="mt-1">
                          <a href={`mailto:${selectedTicket.email}`} className="text-primary hover:underline">
                            {selectedTicket.email}
                          </a>
                        </p>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(value) => handleUpdateTicket({ status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Priority</label>
                        <Select
                          value={selectedTicket.priority}
                          onValueChange={(value) => handleUpdateTicket({ priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="mt-1">
                        <Badge variant="outline">
                          {categoryLabels[selectedTicket.category] || selectedTicket.category}
                        </Badge>
                      </p>
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Admin Notes (Internal)</label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add internal notes about this ticket..."
                        rows={4}
                      />
                      <Button 
                        onClick={handleSaveNotes} 
                        disabled={updateTicket.isPending}
                        className="mt-2"
                        size="sm"
                      >
                        Save Notes
                      </Button>
                    </div>

                    {/* Resolved At */}
                    {selectedTicket.resolved_at && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Resolved on {format(new Date(selectedTicket.resolved_at), "MMMM d, yyyy 'at' h:mm a")}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
