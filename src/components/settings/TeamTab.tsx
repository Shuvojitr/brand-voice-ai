import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Trash2, Crown, Shield, User } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type OrgRole = Tables<"organization_members">["role"];

interface TeamTabProps {
  organizationId: string;
}

interface MemberWithProfile {
  id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  profile: {
    email: string | null;
    full_name: string | null;
  } | null;
}

export function TeamTab({ organizationId }: TeamTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user and their role
  const { data: currentUserRole } = useQuery({
    queryKey: ["current-user-role", organizationId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      setCurrentUserId(user.id);

      const { data } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .single();

      return data?.role || null;
    },
    enabled: !!organizationId,
  });

  const isAdminOrOwner = currentUserRole === "owner" || currentUserRole === "admin";

  // Fetch team members
  const { data: members, isLoading } = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq("organization_id", organizationId)
        .order("role", { ascending: true });

      if (error) throw error;
      
      // Fetch profiles for each member
      const memberIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", memberIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      // Transform the data to match our interface
      return (data as any[]).map((member): MemberWithProfile => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        profile: profileMap.get(member.user_id) || null,
      }));
    },
    enabled: !!organizationId,
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Check if user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteEmail.toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast({
          title: "User not found",
          description: "No user with this email exists. They need to sign up first.",
          variant: "destructive",
        });
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "This user is already a member of your organization.",
          variant: "destructive",
        });
        return;
      }

      // Add member
      const { error } = await supabase
        .from("organization_members")
        .insert({
          organization_id: organizationId,
          user_id: profile.id,
          role: "member",
        });

      if (error) throw error;

      toast({
        title: "Member added",
        description: `${inviteEmail} has been added to your organization.`,
      });

      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["organization-members", organizationId] });
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!removeId) return;

    try {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", removeId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The member has been removed from your organization.",
      });

      queryClient.invalidateQueries({ queryKey: ["organization-members", organizationId] });
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemoveId(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    try {
      const { error } = await supabase
        .from("organization_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["organization-members", organizationId] });
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: OrgRole) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: OrgRole): "default" | "secondary" | "outline" => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Member */}
      {isAdminOrOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
            <CardDescription>
              Add new members to your organization by their email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="invite-email" className="sr-only">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
              <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Invite
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              The user must already have an account to be added.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your organization's team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {isAdminOrOwner && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member) => {
                  const isCurrentUser = member.user_id === currentUserId;
                  const isOwner = member.role === "owner";
                  const canModify = isAdminOrOwner && !isOwner && !isCurrentUser;

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.profile?.full_name || "Unknown"}
                            {isCurrentUser && (
                              <span className="text-muted-foreground ml-2">(you)</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.profile?.email || "No email"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canModify ? (
                          <Select
                            value={member.role || "member"}
                            onValueChange={(value) => handleRoleChange(member.id, value as OrgRole)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      {isAdminOrOwner && (
                        <TableCell>
                          {canModify && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setRemoveId(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from your organization? 
              They will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
