import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Activity,
  UserPlus,
  Zap,
  Crown,
  RefreshCw,
  Radio
} from "lucide-react";
import { useAdminStats, useRevenueChart, useUsageChart, useLiveActivity } from "@/hooks/useAdminStats";
import { formatDistanceToNow } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealtimeActivity {
  id: string;
  type: "content_generated" | "new_signup";
  description: string;
  email: string;
  templateType?: string;
  wordCount?: number;
  name?: string;
  timestamp: string;
  isNew?: boolean;
}

export default function AdminOverview() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart();
  const { data: usageData, isLoading: usageLoading } = useUsageChart();
  const { data: initialActivities, isLoading: activitiesLoading } = useLiveActivity(15);
  const queryClient = useQueryClient();
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realtimeActivities, setRealtimeActivities] = useState<RealtimeActivity[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const initializedRef = useRef(false);

  // Initialize activities from initial data
  useEffect(() => {
    if (initialActivities && !initializedRef.current) {
      setRealtimeActivities(initialActivities);
      initializedRef.current = true;
    }
  }, [initialActivities]);

  // Subscribe to realtime changes
  useEffect(() => {
    // Subscribe to documents table for content generation
    const documentsChannel = supabase
      .channel('admin-documents-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
        },
        async (payload) => {
          console.log('New document created:', payload);
          const newDoc = payload.new as any;
          
          // Fetch user email for this document
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', newDoc.user_id)
            .single();

          const email = profile?.email || 'Unknown user';
          
          const newActivity: RealtimeActivity = {
            id: newDoc.id,
            type: 'content_generated',
            description: `${email} generated ${newDoc.template_type || 'content'} (${newDoc.initial_word_count || 0} words)`,
            email: email,
            templateType: newDoc.template_type,
            wordCount: newDoc.initial_word_count || 0,
            timestamp: newDoc.created_at,
            isNew: true,
          };

          setRealtimeActivities(prev => {
            // Remove the isNew flag from previous items
            const updated = prev.map(a => ({ ...a, isNew: false }));
            // Add new activity at the beginning, keep max 15
            return [newActivity, ...updated].slice(0, 15);
          });

          setLastRefresh(new Date());
          
          // Also refresh stats
          refetchStats();
          
          toast.info('New content generated', {
            description: `${email} generated ${newDoc.initial_word_count || 0} words`,
          });
        }
      )
      .subscribe((status) => {
        console.log('Documents channel status:', status);
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
        }
      });

    // Subscribe to profiles table for new signups
    const profilesChannel = supabase
      .channel('admin-profiles-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('New user signed up:', payload);
          const newProfile = payload.new as any;
          
          const newActivity: RealtimeActivity = {
            id: newProfile.id,
            type: 'new_signup',
            description: `${newProfile.email} signed up`,
            email: newProfile.email || 'Unknown',
            name: newProfile.full_name,
            timestamp: newProfile.created_at,
            isNew: true,
          };

          setRealtimeActivities(prev => {
            const updated = prev.map(a => ({ ...a, isNew: false }));
            return [newActivity, ...updated].slice(0, 15);
          });

          setLastRefresh(new Date());
          
          // Also refresh stats
          refetchStats();
          
          toast.success('New user signed up!', {
            description: newProfile.email,
          });
        }
      )
      .subscribe((status) => {
        console.log('Profiles channel status:', status);
      });

    return () => {
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(profilesChannel);
      setIsRealtimeConnected(false);
    };
  }, [refetchStats]);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["admin-live-activity"] });
    await refetchStats();
    // Reset to fetch fresh data
    initializedRef.current = false;
    setIsRefreshing(false);
    setLastRefresh(new Date());
  }, [queryClient, refetchStats]);

  // Use realtime activities if available, otherwise fall back to initial
  const activities = realtimeActivities.length > 0 ? realtimeActivities : initialActivities;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const statsCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ? formatNumber(stats.totalUsers) : "0",
      icon: Users,
      trend: stats?.userGrowth || 0,
      trendLabel: "vs last month",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Monthly Recurring Revenue",
      value: stats?.totalMRR ? formatCurrency(stats.totalMRR) : "$0",
      icon: DollarSign,
      description: `${stats?.activeSubscriptions || 0} active subscriptions`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Words Generated",
      value: stats?.totalWords ? formatNumber(stats.totalWords) : "0",
      icon: FileText,
      description: "All time",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Active Subscriptions",
      value: stats?.activeSubscriptions?.toString() || "0",
      icon: Crown,
      description: `${stats?.proSubscriptions || 0} Pro • ${stats?.starterSubscriptions || 0} Starter • ${stats?.freeSubscriptions || 0} Free`,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  const usageChartConfig = {
    words: {
      label: "Words",
      color: "hsl(var(--primary))",
    },
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_signup":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "content_generated":
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "new_signup":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">New User</Badge>;
      case "content_generated":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Content</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Command Center</h1>
            <p className="text-muted-foreground mt-1">
              Real-time overview of your platform's performance
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              {isRealtimeConnected ? (
                <>
                  <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-green-600 font-medium">Realtime Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">Connecting...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <>
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.trend !== undefined ? (
                      <div className="flex items-center gap-1 mt-1">
                        {stat.trend >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${stat.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                        </span>
                        <span className="text-xs text-muted-foreground">{stat.trendLabel}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Monthly recurring revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : revenueData && revenueData.length > 0 ? (
                <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        className="text-muted-foreground"
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Content Generation
              </CardTitle>
              <CardDescription>Words generated per day over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : usageData && usageData.length > 0 ? (
                <ChartContainer config={usageChartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatNumber(value)}
                        className="text-muted-foreground"
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatNumber(Number(value)), "Words"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="words" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorWords)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No usage data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Activity Feed
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </CardTitle>
                <CardDescription>
                  Real-time actions happening on your platform • Last updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-1">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id + "-" + index}
                    className={`flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all duration-500 ${
                      (activity as RealtimeActivity).isNew 
                        ? 'bg-primary/5 border border-primary/20 animate-pulse' 
                        : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      (activity as RealtimeActivity).isNew 
                        ? 'bg-primary/10 ring-2 ring-primary/30' 
                        : 'bg-muted'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{activity.email}</span>
                        {(activity as RealtimeActivity).isNew && (
                          <Badge className="bg-primary text-primary-foreground text-xs animate-pulse">
                            NEW
                          </Badge>
                        )}
                        {getActivityBadge(activity.type)}
                        {activity.type === "content_generated" && activity.templateType && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.templateType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.type === "content_generated" 
                          ? `Generated ${activity.wordCount?.toLocaleString() || 0} words`
                          : "Just signed up"
                        }
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet</p>
                <p className="text-sm">Activity will appear here as users interact with your platform</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}