import { DashboardLayout } from "@/components/dashboard";
import { BrandVoiceManager } from "@/components/brand-voice/BrandVoiceManager";
import { useOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandVoices() {
  const { organization, isLoading } = useOrganization();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Brand Voices</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your brand voice profiles
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : organization ? (
          <BrandVoiceManager organizationId={organization.id} />
        ) : (
          <p className="text-muted-foreground">No organization found.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
