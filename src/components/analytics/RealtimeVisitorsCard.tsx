import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Radio, Monitor, Smartphone, Tablet, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RealtimeVisitor } from "@/hooks/useAdvancedAnalytics";

interface RealtimeVisitorsCardProps {
  data?: RealtimeVisitor[];
  isLoading: boolean;
}

const DeviceIcon = ({ device }: { device: string }) => {
  switch (device.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-3 w-3" />;
    case "tablet":
      return <Tablet className="h-3 w-3" />;
    default:
      return <Monitor className="h-3 w-3" />;
  }
};

export function RealtimeVisitorsCard({ data, isLoading }: RealtimeVisitorsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-green-500 animate-pulse" />
          Active Visitors
          {data && data.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600">
              {data.length} online
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Visitors active in the last 5 minutes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {data.slice(0, 10).map((visitor, index) => (
              <div
                key={visitor.sessionId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <DeviceIcon device={visitor.device} />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {visitor.pagePath}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>{visitor.country}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(visitor.startTime), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Radio className="h-8 w-8 mb-2 opacity-50" />
            <p>No active visitors right now</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
