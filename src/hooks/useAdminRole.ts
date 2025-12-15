import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminRole() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, userId: null };

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) {
        console.error("Error checking admin role:", roleError);
        return { isAdmin: false, userId: user.id };
      }

      return { 
        isAdmin: !!roleData, 
        userId: user.id 
      };
    },
  });

  return {
    isAdmin: data?.isAdmin ?? false,
    userId: data?.userId ?? null,
    isLoading,
    error,
  };
}
