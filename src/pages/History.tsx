import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react";

export default function History() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-muted-foreground mt-1">
            View your content generation history
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <HistoryIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No history yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Your content generation history will appear here as you create content.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
