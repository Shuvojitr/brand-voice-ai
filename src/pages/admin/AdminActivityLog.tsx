import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Shield, 
  Ban, 
  UserCheck, 
  CreditCard, 
  Crown, 
  ChevronLeft, 
  ChevronRight,
  Activity
} from "lucide-react";

interface ActivityLog {
  id: string;
  admin_user_id: string;
  admin_email?: string;
  admin_name?: string;
  action: string;
  target_user_id?: string;
  target_organization_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

const actionConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  user_banned: { 
    label: "User Banned", 
    icon: <Ban className="h-4 w-4" />, 
    color: "bg-red-500/10 text-red-600 border-red-500/20" 
  },
  user_unbanned: { 
    label: "User Unbanned", 
    icon: <UserCheck className="h-4 w-4" />, 
    color: "bg-green-500/10 text-green-600 border-green-500/20" 
  },
  user_verified: { 
    label: "Email Verified", 
    icon: <UserCheck className="h-4 w-4" />, 
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20" 
  },
  role_updated: { 
    label: "Role Changed", 
    icon: <Shield className="h-4 w-4" />, 
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20" 
  },
  plan_updated: { 
    label: "Plan Changed", 
    icon: <Crown className="h-4 w-4" />, 
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20" 
  },
  credits_updated: { 
    label: "Credits Modified", 
    icon: <CreditCard className="h-4 w-4" />, 
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" 
  },
};

function useActivityLogs(page: number, limit: number = 20) {
  return useQuery({
    queryKey: ["admin-activity-logs", page, limit],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const offset = (page - 1) * limit;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=activity-logs&limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${session.session?.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }
      
      return response.json() as Promise<{ logs: ActivityLog[]; total: number }>;
    },
  });
}

function getActionDetails(log: ActivityLog): string {
  const details = log.details || {};
  
  switch (log.action) {
    case "user_banned":
    case "user_unbanned":
    case "user_verified":
      return details.target_email || "Unknown user";
    case "role_updated":
      return `${details.target_email || "User"}: ${details.previous_role} → ${details.new_role}`;
    case "plan_updated":
      return `${details.organization_name || "Organization"}: ${details.previous_plan} → ${details.new_plan}`;
    case "credits_updated":
      const mode = details.mode === "add" ? "+" : details.mode === "deduct" ? "-" : "";
      return `${details.organization_name || "Organization"}: ${mode}${details.amount} credits`;
    default:
      return JSON.stringify(details);
  }
}

export default function AdminActivityLog() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useActivityLogs(page, limit);

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all admin actions and changes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              {data?.total || 0} total actions recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : data?.logs && data.logs.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.logs.map((log) => {
                        const config = actionConfig[log.action] || {
                          label: log.action,
                          icon: <Activity className="h-4 w-4" />,
                          color: "bg-muted text-muted-foreground",
                        };
                        
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant="outline" className={config.color}>
                                {config.icon}
                                <span className="ml-1">{config.label}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {log.admin_name || "Admin"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {log.admin_email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="text-sm truncate" title={getActionDetails(log)}>
                                {getActionDetails(log)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">
                                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-4">
                  No activity recorded yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Admin actions will appear here once they are performed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
