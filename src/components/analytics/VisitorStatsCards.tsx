import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Eye, UserPlus, RotateCcw, MousePointer2, Clock } from "lucide-react";
import type { VisitorStats, EngagementStats } from "@/hooks/useAdvancedAnalytics";

interface VisitorStatsCardsProps {
  visitorStats?: VisitorStats;
  engagementStats?: EngagementStats;
  isLoading: boolean;
}

export function VisitorStatsCards({ visitorStats, engagementStats, isLoading }: VisitorStatsCardsProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stats = [
    {
      title: "Total Sessions",
      value: visitorStats?.totalSessions || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Unique Visitors",
      value: visitorStats?.uniqueVisitors || 0,
      icon: Eye,
      color: "text-green-500",
    },
    {
      title: "New Visitors",
      value: visitorStats?.newVisitors || 0,
      icon: UserPlus,
      color: "text-purple-500",
    },
    {
      title: "Returning Visitors",
      value: visitorStats?.returningVisitors || 0,
      icon: RotateCcw,
      color: "text-orange-500",
    },
    {
      title: "Bounce Rate",
      value: `${engagementStats?.bounceRate || 0}%`,
      icon: MousePointer2,
      color: "text-red-500",
    },
    {
      title: "Avg. Session Duration",
      value: formatDuration(engagementStats?.avgSessionDuration || 0),
      icon: Clock,
      color: "text-cyan-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
