import { DashboardLayout } from "@/components/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab, TeamTab, BrandVoiceTab } from "@/components/settings";
import { useOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Settings() {
  const { organization, isLoading } = useOrganization();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, team, and brand voice settings
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
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
                <BrandVoiceTab organizationId={organization.id} />
              ) : (
                <p className="text-muted-foreground">No organization found.</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
