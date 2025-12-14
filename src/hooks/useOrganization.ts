import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOrganization() {
  const queryClient = useQueryClient();

  const { data: organization, isLoading, error } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: membership, error: memberError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (memberError) throw memberError;

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", membership.organization_id)
        .single();

      if (orgError) throw orgError;
      return org;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["organization"] });
  };

  return { organization, isLoading, error, invalidate };
}
