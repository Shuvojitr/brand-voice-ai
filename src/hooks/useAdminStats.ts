import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  totalWords: number;
  totalDocuments: number;
  totalOrganizations: number;
  totalMRR: number;
  userGrowth: number;
  activeSubscriptions: number;
  proSubscriptions: number;
  starterSubscriptions: number;
  freeSubscriptions: number;
}

interface RevenueChartData {
  month: string;
  revenue: number;
}

interface UsageChartData {
  day: string;
  date: string;
  words: number;
}

interface LiveActivity {
  id: string;
  type: "content_generated" | "new_signup";
  description: string;
  email: string;
  templateType?: string;
  wordCount?: number;
  name?: string;
  timestamp: string;
  isNew?: boolean;
}

async function fetchAdminData<T>(action: string, params?: Record<string, string>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`);
  url.searchParams.set("action", action);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch admin data");
  }

  return response.json();
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminData<AdminStats>("stats"),
  });
}

export function useRecentSignups(limit: number = 10) {
  return useQuery({
    queryKey: ["admin-recent-signups", limit],
    queryFn: () => fetchAdminData<any[]>("recent-signups", { limit: limit.toString() }),
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => fetchAdminData<any[]>("all-users"),
  });
}

export function useRevenueChart() {
  return useQuery<RevenueChartData[]>({
    queryKey: ["admin-revenue-chart"],
    queryFn: () => fetchAdminData<RevenueChartData[]>("revenue-chart"),
  });
}

export function useUsageChart() {
  return useQuery<UsageChartData[]>({
    queryKey: ["admin-usage-chart"],
    queryFn: () => fetchAdminData<UsageChartData[]>("usage-chart"),
  });
}

export function useLiveActivity(limit: number = 15) {
  return useQuery<LiveActivity[]>({
    queryKey: ["admin-live-activity", limit],
    queryFn: () => fetchAdminData<LiveActivity[]>("live-activity", { limit: limit.toString() }),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
