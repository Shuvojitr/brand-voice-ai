import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mic } from "lucide-react";

export default function BrandVoices() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Brand Voices</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your brand voice profiles
            </p>
          </div>
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Brand Voice
          </Button>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mic className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No brand voices yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Create a brand voice to ensure your content matches your unique style and tone.
            </p>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Brand Voice
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
