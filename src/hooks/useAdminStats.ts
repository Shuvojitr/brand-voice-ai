import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_STATS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`;

async function fetchWithAuth(action: string, params: Record<string, string> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const url = new URL(ADMIN_STATS_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch admin data');
  }

  return response.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchWithAuth('stats'),
  });
}

export function useRecentSignups(limit: number = 10) {
  return useQuery({
    queryKey: ["admin-recent-signups", limit],
    queryFn: () => fetchWithAuth('recent-signups', { limit: limit.toString() }),
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => fetchWithAuth('all-users'),
  });
}
