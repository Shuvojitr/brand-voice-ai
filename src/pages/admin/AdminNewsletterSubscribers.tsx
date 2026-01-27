import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Search, Download, Trash2, Mail, CheckCircle, XCircle, Users } from "lucide-react";
import { format } from "date-fns";

interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string | null;
  is_active: boolean;
  is_confirmed: boolean;
  subscribed_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
}

export default function AdminNewsletterSubscribers() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return data as NewsletterSubscriber[];
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been removed from the list.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete subscriber. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ 
          is_active,
          unsubscribed_at: is_active ? null : new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast({
        title: "Status updated",
        description: "Subscriber status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const filteredSubscribers = subscribers?.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subscriber.source?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportToCSV = () => {
    if (!filteredSubscribers || filteredSubscribers.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no subscribers to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Email", "Source", "Status", "Confirmed", "Subscribed At", "Confirmed At", "Unsubscribed At"];
    const csvContent = [
      headers.join(","),
      ...filteredSubscribers.map((sub) =>
        [
          sub.email,
          sub.source || "",
          sub.is_active ? "Active" : "Inactive",
          sub.is_confirmed ? "Yes" : "No",
          format(new Date(sub.subscribed_at), "yyyy-MM-dd HH:mm:ss"),
          sub.confirmed_at ? format(new Date(sub.confirmed_at), "yyyy-MM-dd HH:mm:ss") : "",
          sub.unsubscribed_at ? format(new Date(sub.unsubscribed_at), "yyyy-MM-dd HH:mm:ss") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${filteredSubscribers.length} subscribers to CSV.`,
    });
  };

  const stats = {
    total: subscribers?.length || 0,
    active: subscribers?.filter((s) => s.is_active).length || 0,
    confirmed: subscribers?.filter((s) => s.is_confirmed).length || 0,
    unconfirmed: subscribers?.filter((s) => !s.is_confirmed && s.is_active).length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
            <p className="text-muted-foreground">
              Manage your newsletter subscribers and export data.
            </p>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Active</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.active}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Confirmed</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.confirmed}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.unconfirmed}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading subscribers...
                  </TableCell>
                </TableRow>
              ) : filteredSubscribers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No subscribers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers?.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscriber.source || "direct"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={subscriber.is_active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: subscriber.id,
                            is_active: !subscriber.is_active,
                          })
                        }
                      >
                        {subscriber.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscriber.is_confirmed ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete subscriber?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove {subscriber.email} from your newsletter list.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSubscriberMutation.mutate(subscriber.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
