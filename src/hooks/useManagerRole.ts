import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useManagerRole() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["manager-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isManager: false, isAdmin: false, userId: null };

      // Check for manager role
      const { data: managerRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "manager")
        .maybeSingle();

      // Check for admin role (admins also have manager access)
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      return { 
        isManager: !!managerRole || !!adminRole, // Admins also have manager access
        isAdmin: !!adminRole,
        userId: user.id 
      };
    },
  });

  return {
    isManager: data?.isManager ?? false,
    isAdmin: data?.isAdmin ?? false,
    userId: data?.userId ?? null,
    isLoading,
    error,
  };
}
