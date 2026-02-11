import { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AuthorSelectProps {
  authorUserId: string | null;
  onSelect: (userId: string, name: string, avatar: string) => void;
}

export function AuthorSelect({ authorUserId, onSelect }: AuthorSelectProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    // Fetch all profiles - admins can see all via service role through edge fn
    // But since we're client-side, we fetch current user + use admin role to see others
    // The profiles table RLS only allows own profile, so we need a workaround
    // We'll fetch from admin-stats edge function or just load current user + stored author
    
    // For now, get current user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUsers([profile]);
    }
    setIsLoading(false);
  };

  const selectedUser = useMemo(
    () => users.find((u) => u.id === authorUserId),
    [users, authorUserId]
  );

  const getDisplayName = (user: UserProfile) =>
    user.full_name || user.email || "Unknown User";

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5" />
        Author
      </Label>

      {selectedUser && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
          <Avatar className="h-7 w-7">
            <AvatarImage src={selectedUser.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(getDisplayName(selectedUser))}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{getDisplayName(selectedUser)}</span>
        </div>
      )}

      <Select
        value={authorUserId || ""}
        onValueChange={(val) => {
          const user = users.find((u) => u.id === val);
          if (user) {
            onSelect(user.id, getDisplayName(user), user.avatar_url || "");
          }
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select author"} />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(getDisplayName(user))}
                  </AvatarFallback>
                </Avatar>
                <span>{getDisplayName(user)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
