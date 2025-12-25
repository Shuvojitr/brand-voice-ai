import { DashboardLayout } from "@/components/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab, TeamTab, ApiTab, BrandVoiceManager } from "@/components/settings";
import { useOrganization } from "@/hooks/useOrganization";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users, Sparkles, Key } from "lucide-react";

export default function Settings() {
  const { organization, isLoading } = useOrganization();
  const { settings: siteSettings, isLoading: isSettingsLoading } = useSiteSettings();

  const isApiEnabled = siteSettings?.is_api_feature_enabled ?? true;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, team, and brand voice settings
          </p>
        </div>

        {isLoading || isSettingsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="brand-voice" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Brand Voice
              </TabsTrigger>
              {isApiEnabled && (
                <TabsTrigger value="api" className="gap-2">
                  <Key className="h-4 w-4" />
                  API
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="team">
              {organization ? (
                <TeamTab organizationId={organization.id} />
              ) : (
                <p className="text-muted-foreground">No organization found.</p>
              )}
            </TabsContent>

            <TabsContent value="brand-voice">
              {organization ? (
                <BrandVoiceManager organizationId={organization.id} />
              ) : (
                <p className="text-muted-foreground">No organization found.</p>
              )}
            </TabsContent>

            {isApiEnabled && (
              <TabsContent value="api">
                {organization ? (
                  <ApiTab organizationId={organization.id} />
                ) : (
                  <p className="text-muted-foreground">No organization found.</p>
                )}
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
