import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Key, Loader2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

export default function AdminSettings() {
  const { settings, isLoading, updateSettings } = useSiteSettings();

  const handleApiToggle = async (enabled: boolean) => {
    try {
      await updateSettings.mutateAsync({ is_api_feature_enabled: enabled });
      toast.success(enabled ? "Developer API enabled" : "Developer API disabled");
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure platform-wide settings.
          </p>
        </div>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Enable or disable platform features globally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-11" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="api-toggle" className="font-medium">
                    Enable Developer API
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    If disabled, users cannot generate keys or use the API.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {updateSettings.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    id="api-toggle"
                    checked={settings?.is_api_feature_enabled ?? true}
                    onCheckedChange={handleApiToggle}
                    disabled={updateSettings.isPending}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Status
            </CardTitle>
            <CardDescription>
              Current security configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Role-Based Access Control</span>
              <Badge>Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Row Level Security</span>
              <Badge>Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Role Check</span>
              <Badge>user_roles table</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Additional admin settings will be available here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Email notification settings</li>
              <li>Default credit allocations</li>
              <li>API rate limiting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
