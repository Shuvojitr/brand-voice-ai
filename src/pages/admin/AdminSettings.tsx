import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure platform-wide settings.
          </p>
        </div>

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
              <li>Feature flags</li>
              <li>API rate limiting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
