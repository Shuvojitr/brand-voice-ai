import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Radio,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { useAdminStats, useLiveActivity } from "@/hooks/useAdminStats";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
            <h1 className="text-3xl font-bold">Overview</h1>
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

        {/* Quick Link to Analytics */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">View Detailed Analytics</h3>
                <p className="text-sm text-muted-foreground">Charts, trends, and subscription distribution</p>
              </div>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/analytics">
                View Analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

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
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading && !activities ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div 
                    key={`${activity.id}-${index}`} 
                    className={`flex items-start gap-4 p-3 rounded-lg transition-all ${
                      activity.isNew 
                        ? 'bg-primary/5 border border-primary/20 animate-pulse' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="p-2 rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{activity.description}</p>
                        {activity.isNew && (
                          <Badge variant="default" className="text-xs">NEW</Badge>
                        )}
                        {getActivityBadge(activity.type)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">New signups and content generations will appear here in real-time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
