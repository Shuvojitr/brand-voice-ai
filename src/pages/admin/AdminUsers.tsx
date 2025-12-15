import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAllUsers } from "@/hooks/useAdminStats";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Search, CreditCard, Ban, UserX } from "lucide-react";

export default function AdminUsers() {
  const { data: users, isLoading } = useAllUsers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [banUserOpen, setBanUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditsAmount, setCreditsAmount] = useState("");
  const [creditsMode, setCreditsMode] = useState<"add" | "deduct">("add");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUpdateCredits = async () => {
    if (!selectedUser?.organization_id || !creditsAmount) return;
    
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=update-credits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            organizationId: selectedUser.organization_id,
            amount: parseInt(creditsAmount),
            mode: creditsMode,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update credits");

      toast({
        title: "Credits Updated",
        description: `${creditsMode === "add" ? "Added" : "Deducted"} ${creditsAmount} credits ${creditsMode === "add" ? "to" : "from"} ${selectedUser.email}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setCreditsDialogOpen(false);
      setCreditsAmount("");
      setCreditsMode("add");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const newBanStatus = !selectedUser.is_banned;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=toggle-ban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            isBanned: newBanStatus,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update ban status");

      toast({
        title: newBanStatus ? "User Banned" : "User Unbanned",
        description: `${selectedUser.email} has been ${newBanStatus ? "banned" : "unbanned"}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setBanUserOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all registered users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  {users?.length || 0} total users registered
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.full_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.credits_remaining.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.created_at
                            ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {user.is_banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setCreditsDialogOpen(true);
                              }}
                              disabled={!user.organization_id}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Credits
                            </Button>
                            <Button
                              variant={user.is_banned ? "outline" : "destructive"}
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setBanUserOpen(true);
                              }}
                            >
                              {user.is_banned ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Unban
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-1" />
                                  Ban
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {searchQuery ? "No users match your search." : "No users found."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manage Credits Dialog */}
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Credits</DialogTitle>
            <DialogDescription>
              Add or deduct credits for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select value={creditsMode} onValueChange={(v) => setCreditsMode(v as "add" | "deduct")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Credits</SelectItem>
                  <SelectItem value="deduct">Deduct Credits</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">Amount</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                placeholder="e.g., 1000"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current balance: {selectedUser?.credits_remaining?.toLocaleString() || 0} credits
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCredits} 
              disabled={isSubmitting || !creditsAmount}
              variant={creditsMode === "deduct" ? "destructive" : "default"}
            >
              {isSubmitting ? "Processing..." : creditsMode === "add" ? "Add Credits" : "Deduct Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banUserOpen} onOpenChange={setBanUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_banned ? "Unban User" : "Ban User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_banned
                ? `Are you sure you want to unban ${selectedUser?.email}? They will regain access to the platform.`
                : `Are you sure you want to ban ${selectedUser?.email}? They will lose access to the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanUserOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.is_banned ? "default" : "destructive"}
              onClick={handleBanUser}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : selectedUser?.is_banned
                ? "Unban User"
                : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
