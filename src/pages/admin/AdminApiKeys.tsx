import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { useAdminApiKeys } from "@/hooks/useAdminApiKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Activity, User, Ban, CheckCircle, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AdminApiKeysContent() {
  const { apiKeys, stats, isLoading, revokeKey, activateKey, isRevoking, isActivating } = useAdminApiKeys();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Manager</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage all API keys across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalActiveKeys || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalApiRequests || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top API User</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : stats?.topApiUser ? (
              <div>
                <div className="text-sm font-medium truncate">{stats.topApiUser.email}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.topApiUser.requests} requests
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>All API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Key Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {key.profiles?.full_name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {key.profiles?.email || "No email"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {key.key_prefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      {key.created_at ? (
                        <div>
                          <div className="text-sm">
                            {format(new Date(key.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {key.last_used_at ? (
                        <div>
                          <div className="text-sm">
                            {format(new Date(key.last_used_at), "MMM d, yyyy HH:mm")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {key.is_active ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Revoked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {key.is_active ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              disabled={isRevoking}
                            >
                              {isRevoking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-1" />
                                  Revoke
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke this API key? The user will no longer
                                be able to use this key to access the API. This action can be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => revokeKey(key.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateKey(key.id)}
                          disabled={isActivating}
                        >
                          {isActivating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys found</p>
              <p className="text-sm">Users haven't created any API keys yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminApiKeys() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminApiKeysContent />
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
