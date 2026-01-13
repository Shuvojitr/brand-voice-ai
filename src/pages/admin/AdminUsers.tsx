import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAllUsers } from "@/hooks/useAdminStats";
import { usePlans } from "@/hooks/usePlans";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Search, CreditCard, Ban, UserX, Crown, CheckCircle, MailCheck, Shield, LogIn, Calendar, CalendarPlus, CalendarMinus, UserPlus, Mail, Key, Eye, EyeOff, RefreshCw } from "lucide-react";

type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

export default function AdminUsers() {
  const { data: users, isLoading } = useAllUsers();
  const { data: plans } = usePlans(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [banUserOpen, setBanUserOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditsAmount, setCreditsAmount] = useState("");
  const [creditsMode, setCreditsMode] = useState<"add" | "deduct">("add");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>("free");
  const [selectedRole, setSelectedRole] = useState<"user" | "manager" | "admin">("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [periodDays, setPeriodDays] = useState("");
  const [periodMode, setPeriodMode] = useState<"extend" | "reduce" | "set">("extend");
  
  // Add user dialogs
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Build plan details from database plans
  const planDetailsMap = useMemo(() => {
    const defaultDetails: Record<SubscriptionTier, { label: string; credits: number; color: string }> = {
      free: { label: "Free", credits: 1000, color: "" },
      starter: { label: "Starter", credits: 5000, color: "" },
      pro: { label: "Pro", credits: 20000, color: "bg-blue-500 hover:bg-blue-600" },
      enterprise: { label: "Enterprise", credits: 100000, color: "bg-purple-500 hover:bg-purple-600" },
    };

    if (!plans) return defaultDetails;

    plans.forEach(plan => {
      const tier = plan.slug as SubscriptionTier;
      if (tier in defaultDetails) {
        defaultDetails[tier] = {
          label: plan.name,
          credits: plan.credits,
          color: tier === "pro" ? "bg-blue-500 hover:bg-blue-600" : 
                 tier === "enterprise" ? "bg-purple-500 hover:bg-purple-600" : "",
        };
      }
    });

    return defaultDetails;
  }, [plans]);

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

  const handleUpdatePlan = async () => {
    if (!selectedUser?.organization_id || !selectedPlan) return;
    
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=update-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            organizationId: selectedUser.organization_id,
            plan: selectedPlan,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update plan");

      toast({
        title: "Plan Updated",
        description: `${selectedUser.email} upgraded to ${planDetailsMap[selectedPlan].label}. Added ${planDetailsMap[selectedPlan].credits.toLocaleString()} credits to existing balance.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setPlanDialogOpen(false);
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

  const handleVerifyUser = async (user: any) => {
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=verify-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to verify user");

      toast({
        title: "User Verified",
        description: `${user.email} has been verified successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
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

  const openPlanDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedPlan(user.subscription_tier || "free");
    setPlanDialogOpen(true);
  };

  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role || "user");
    setRoleDialogOpen(true);
  };

  const openPeriodDialog = (user: any) => {
    setSelectedUser(user);
    setPeriodDays("");
    setPeriodMode("extend");
    setPeriodDialogOpen(true);
  };

  const handleUpdateSubscriptionPeriod = async () => {
    if (!selectedUser?.organization_id || !periodDays) return;
    
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=update-subscription-period`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            organizationId: selectedUser.organization_id,
            days: parseInt(periodDays),
            mode: periodMode,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update subscription period");

      const actionText = periodMode === "extend" ? "Extended" : periodMode === "reduce" ? "Reduced" : "Set";
      toast({
        title: "Subscription Period Updated",
        description: `${actionText} subscription by ${periodDays} days for ${selectedUser.email}. New end date: ${new Date(data.subscription_ends_at).toLocaleDateString()}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setPeriodDialogOpen(false);
      setPeriodDays("");
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

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=update-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            role: selectedRole,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update role");

      toast({
        title: "Role Updated",
        description: `${selectedUser.email} is now a ${selectedRole}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setRoleDialogOpen(false);
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

  const handleInviteUser = async () => {
    if (!newUserEmail) return;
    
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=invite-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            email: newUserEmail.trim(),
            fullName: newUserName.trim() || undefined,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send invitation");

      toast({
        title: "Invitation Sent",
        description: `An invitation email has been sent to ${newUserEmail}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setInviteUserOpen(false);
      setNewUserEmail("");
      setNewUserName("");
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

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) return;
    
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            email: newUserEmail.trim(),
            password: newUserPassword,
            fullName: newUserName.trim() || undefined,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create user");

      toast({
        title: "User Created",
        description: `User ${newUserEmail} has been created successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setCreateUserOpen(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      setShowPassword(false);
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

  const handleResendInvite = async (user: any) => {
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=resend-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to resend invitation");

      toast({
        title: "Invitation Resent",
        description: `A new invitation email has been sent to ${user.email}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
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

  const handleImpersonateUser = async (user: any) => {
    if (user.is_banned) {
      toast({
        title: "Cannot Impersonate",
        description: "This user is banned and cannot be impersonated.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=impersonate-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to impersonate user");

      // Use the token hash to verify and sign in as the user
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: "magiclink",
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      // Redirect to dashboard after successful impersonation
      window.location.href = "/dashboard";
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
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setInviteUserOpen(true)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invite Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCreateUserOpen(true)}>
                      <Key className="h-4 w-4 mr-2" />
                      Create with Password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <TableHead>Plan</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Email Status</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.full_name || "—"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === "admin" ? "default" : user.role === "manager" ? "default" : "secondary"}
                            className={
                              user.role === "admin" ? "bg-amber-500 hover:bg-amber-600" : 
                              user.role === "manager" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                            }
                          >
                            {user.role === "admin" ? "Admin" : user.role === "manager" ? "Manager" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.subscription_tier === "enterprise" ? "default" :
                              user.subscription_tier === "pro" ? "default" :
                              user.subscription_tier === "starter" ? "secondary" :
                              "outline"
                            }
                            className={
                              user.subscription_tier === "enterprise" ? "bg-purple-500 hover:bg-purple-600" :
                              user.subscription_tier === "pro" ? "bg-blue-500 hover:bg-blue-600" :
                              ""
                            }
                          >
                            {user.subscription_tier?.charAt(0).toUpperCase() + user.subscription_tier?.slice(1) || "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.credits_remaining.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.created_at
                            ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {user.email_confirmed_at ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              Pending
                            </Badge>
                          )}
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
                              onClick={() => handleImpersonateUser(user)}
                              disabled={isSubmitting || user.is_banned}
                              title="Login as this user"
                            >
                              <LogIn className="h-4 w-4 mr-1" />
                              Login As
                            </Button>
                            {!user.email_confirmed_at && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResendInvite(user)}
                                  disabled={isSubmitting}
                                  title="Resend invitation email"
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Resend
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyUser(user)}
                                  disabled={isSubmitting}
                                  title="Manually verify email"
                                >
                                  <MailCheck className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRoleDialog(user)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Role
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPlanDialog(user)}
                              disabled={!user.organization_id}
                            >
                              <Crown className="h-4 w-4 mr-1" />
                              Plan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPeriodDialog(user)}
                              disabled={!user.organization_id}
                              title="Extend or reduce subscription period"
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Period
                            </Button>
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

      {/* Manage Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <Select value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as SubscriptionTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["free", "starter", "pro", "enterprise"] as SubscriptionTier[]).map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {planDetailsMap[tier].label} ({planDetailsMap[tier].credits.toLocaleString()} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium">Plan Details</p>
              <p className="text-sm text-muted-foreground mt-1">
                Credits to add: {planDetailsMap[selectedPlan].credits.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Note: The new plan's credits will be added to the user's existing balance.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Current plan: <span className="font-medium capitalize">{selectedUser?.subscription_tier || "Free"}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePlan} 
              disabled={isSubmitting || selectedPlan === selectedUser?.subscription_tier}
            >
              {isSubmitting ? "Updating..." : "Update Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as "user" | "manager" | "admin")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium">Role Permissions</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedRole === "admin" 
                  ? "Admins have full access to the admin dashboard and can manage all users, plans, and settings."
                  : selectedRole === "manager"
                  ? "Managers have elevated access to manage content, templates, and view reports, but cannot manage users or billing."
                  : "Users have standard access to the platform features based on their subscription plan."}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Current role: <span className="font-medium capitalize">{selectedUser?.role || "user"}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={isSubmitting || selectedRole === selectedUser?.role}
            >
              {isSubmitting ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Period Dialog */}
      <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription Period</DialogTitle>
            <DialogDescription>
              Extend, reduce, or set the subscription period for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select value={periodMode} onValueChange={(v) => setPeriodMode(v as "extend" | "reduce" | "set")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extend">
                    <div className="flex items-center gap-2">
                      <CalendarPlus className="h-4 w-4 text-green-500" />
                      Extend Period
                    </div>
                  </SelectItem>
                  <SelectItem value="reduce">
                    <div className="flex items-center gap-2">
                      <CalendarMinus className="h-4 w-4 text-red-500" />
                      Reduce Period
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Set Period (from today)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-days">Days</Label>
              <Input
                id="period-days"
                type="number"
                min="1"
                placeholder="e.g., 30"
                value={periodDays}
                onChange={(e) => setPeriodDays(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {periodMode === "extend" && "Days to add to the current end date"}
                {periodMode === "reduce" && "Days to subtract from the current end date"}
                {periodMode === "set" && "Days from today to set as the new end date"}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/50 space-y-1">
              <p className="text-sm font-medium">Current Status</p>
              <p className="text-sm text-muted-foreground">
                Plan: <span className="font-medium capitalize">{selectedUser?.subscription_tier || "Free"}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Current end date:{" "}
                <span className="font-medium">
                  {selectedUser?.subscription_ends_at 
                    ? new Date(selectedUser.subscription_ends_at).toLocaleDateString() 
                    : "No end date set"}
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubscriptionPeriod} 
              disabled={isSubmitting || !periodDays}
              variant={periodMode === "reduce" ? "destructive" : "default"}
            >
              {isSubmitting ? "Processing..." : 
                periodMode === "extend" ? "Extend Period" : 
                periodMode === "reduce" ? "Reduce Period" : "Set Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteUserOpen} onOpenChange={(open) => {
        setInviteUserOpen(open);
        if (!open) {
          setNewUserEmail("");
          setNewUserName("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite User
            </DialogTitle>
            <DialogDescription>
              Send an invitation email to a new user. They will set their own password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full Name (optional)</Label>
              <Input
                id="invite-name"
                type="text"
                placeholder="John Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                The user will receive an email with a link to set their password and complete registration.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteUserOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUser} 
              disabled={isSubmitting || !newUserEmail}
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserOpen} onOpenChange={(open) => {
        setCreateUserOpen(open);
        if (!open) {
          setNewUserEmail("");
          setNewUserName("");
          setNewUserPassword("");
          setShowPassword(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Create User
            </DialogTitle>
            <DialogDescription>
              Create a new user account with a password. The account will be immediately active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email Address *</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-name">Full Name (optional)</Label>
              <Input
                id="create-name"
                type="text"
                placeholder="John Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password *</Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters.
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-amber-500/10 border-amber-500/20">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                The user's email will be automatically verified and they can log in immediately with this password.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={isSubmitting || !newUserEmail || !newUserPassword || newUserPassword.length < 6}
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
