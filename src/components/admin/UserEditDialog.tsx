import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UserData {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_banned: boolean;
  organization_id?: string;
  credits_remaining?: number;
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
}

export function UserEditDialog({ open, onOpenChange, user }: UserEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "user",
    creditsToAdd: "",
    isBanned: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        role: user.role || "user",
        creditsToAdd: "",
        isBanned: user.is_banned || false,
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("admin-stats", {
        body: {
          action: "update-user",
          userId: user.id,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          creditsToAdd: formData.creditsToAdd ? parseInt(formData.creditsToAdd) : 0,
          isBanned: formData.isBanned,
          organizationId: user.organization_id,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "User Updated",
        description: `Successfully updated ${formData.email}`,
      });

      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details, role, credits, or ban status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">Add Credits</Label>
            <Input
              id="credits"
              type="number"
              value={formData.creditsToAdd}
              onChange={(e) => setFormData({ ...formData, creditsToAdd: e.target.value })}
              placeholder="e.g., 1000 (leave empty to skip)"
              disabled={!user?.organization_id}
            />
            {!user?.organization_id && (
              <p className="text-xs text-muted-foreground">
                User has no organization. Cannot add credits.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="banned">Ban User</Label>
              <p className="text-sm text-muted-foreground">
                Banned users cannot access the platform.
              </p>
            </div>
            <Switch
              id="banned"
              checked={formData.isBanned}
              onCheckedChange={(checked) => setFormData({ ...formData, isBanned: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
