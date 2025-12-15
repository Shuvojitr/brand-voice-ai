import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Get total words generated (all time)
      const { data: wordsData, error: wordsError } = await supabase
        .from("documents")
        .select("initial_word_count");

      if (wordsError) throw wordsError;

      const totalWords = wordsData?.reduce((sum, doc) => sum + (doc.initial_word_count || 0), 0) || 0;

      // Get total documents count
      const { count: docsCount, error: docsError } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      if (docsError) throw docsError;

      // Get total organizations
      const { count: orgsCount, error: orgsError } = await supabase
        .from("organizations")
        .select("*", { count: "exact", head: true });

      if (orgsError) throw orgsError;

      return {
        totalUsers: usersCount || 0,
        totalWords: totalWords,
        totalDocuments: docsCount || 0,
        totalOrganizations: orgsCount || 0,
        // Mock revenue for now - would come from Stripe integration
        totalRevenue: 0,
      };
    },
  });
}

export function useRecentSignups(limit: number = 10) {
  return useQuery({
    queryKey: ["admin-recent-signups", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at, is_banned")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Get organization memberships with credits
      const { data: memberships, error: membershipsError } = await supabase
        .from("organization_members")
        .select(`
          user_id,
          organizations (
            id,
            monthly_credits,
            credits_used
          )
        `);

      if (membershipsError) throw membershipsError;

      // Combine data
      return profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const membership = memberships?.find(m => m.user_id === profile.id);
        const org = membership?.organizations as any;
        
        return {
          ...profile,
          role: userRole?.role || "user",
          credits_remaining: org ? (org.monthly_credits - org.credits_used) : 0,
          organization_id: org?.id,
        };
      }) || [];
    },
  });
}
