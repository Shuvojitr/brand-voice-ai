import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Globe, 
  Target, 
  DollarSign, 
  Radio,
  Layers,
  TrendingUp
} from "lucide-react";
import { useAdminStats, useRevenueChart, useUsageChart } from "@/hooks/useAdminStats";
import {
  useVisitorStats,
  useEngagementStats,
  useTrafficSources,
  useTopPages,
  useDeviceStats,
  useBrowserStats,
  useDailyVisitorTrend,
  useTemplateUsage,
  useUserCostAnalysis,
  useConversions,
  useRealtimeVisitors,
} from "@/hooks/useAdvancedAnalytics";
import {
  AnalyticsDateFilter,
  VisitorStatsCards,
  TrafficSourcesChart,
  VisitorTrendChart,
  DeviceBreakdownChart,
  TopPagesTable,
  TemplateUsageChart,
  RealtimeVisitorsCard,
  ConversionsCard,
  UserCostAnalysisTable,
  BrowserStatsChart,
} from "@/components/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState(7);
  
  // Existing stats hooks
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart();
  const { data: usageData, isLoading: usageLoading } = useUsageChart();
  
  // New advanced analytics hooks
  const { data: visitorStats, isLoading: visitorLoading } = useVisitorStats(dateRange);
  const { data: engagementStats, isLoading: engagementLoading } = useEngagementStats(dateRange);
  const { data: trafficSources, isLoading: trafficLoading } = useTrafficSources(dateRange);
  const { data: topPages, isLoading: pagesLoading } = useTopPages(dateRange, 10);
  const { data: deviceStats, isLoading: devicesLoading } = useDeviceStats(dateRange);
  const { data: browserStats, isLoading: browserLoading } = useBrowserStats(dateRange);
  const { data: dailyTrend, isLoading: trendLoading } = useDailyVisitorTrend(dateRange);
  const { data: templateUsage, isLoading: templateLoading } = useTemplateUsage(30);
  const { data: userCostAnalysis, isLoading: costLoading } = useUserCostAnalysis(20);
  const { data: conversions, isLoading: conversionsLoading } = useConversions(dateRange);
  const { data: realtimeVisitors, isLoading: realtimeLoading } = useRealtimeVisitors();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const revenueChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  };

  // Subscription distribution data for pie chart
  const subscriptionData = [
    { name: "Pro", value: stats?.proSubscriptions || 0 },
    { name: "Starter", value: stats?.starterSubscriptions || 0 },
    { name: "Free", value: stats?.freeSubscriptions || 0 },
  ].filter(item => item.value > 0);

  const COLORS = ["hsl(var(--primary))", "hsl(142, 76%, 36%)", "hsl(var(--muted-foreground))"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into traffic, engagement, and revenue
            </p>
          </div>
          <AnalyticsDateFilter value={dateRange} onChange={setDateRange} />
        </div>

        {/* Tabs for different analytics sections */}
        <Tabs defaultValue="traffic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1">
            <TabsTrigger value="traffic" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Traffic</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Engagement</span>
            </TabsTrigger>
            <TabsTrigger value="acquisition" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Acquisition</span>
            </TabsTrigger>
            <TabsTrigger value="monetization" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Monetization</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="gap-2">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Realtime</span>
            </TabsTrigger>
          </TabsList>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            {/* Visitor Stats Cards */}
            <VisitorStatsCards
              visitorStats={visitorStats}
              engagementStats={engagementStats}
              isLoading={visitorLoading || engagementLoading}
            />

            {/* Visitor Trend Chart */}
            <div className="grid gap-6 lg:grid-cols-3">
              <VisitorTrendChart data={dailyTrend} isLoading={trendLoading} />
              <DeviceBreakdownChart data={deviceStats} isLoading={devicesLoading} />
            </div>

            {/* Segmentation - Browser & Top Pages */}
            <div className="grid gap-6 lg:grid-cols-2">
              <BrowserStatsChart data={browserStats} isLoading={browserLoading} />
              <TopPagesTable data={topPages} isLoading={pagesLoading} />
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <VisitorStatsCards
              visitorStats={visitorStats}
              engagementStats={engagementStats}
              isLoading={visitorLoading || engagementLoading}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <TopPagesTable data={topPages} isLoading={pagesLoading} />
              <ConversionsCard data={conversions} isLoading={conversionsLoading} />
            </div>

            {/* Most Popular Templates */}
            <TemplateUsageChart data={templateUsage} isLoading={templateLoading} />
          </TabsContent>

          {/* Acquisition Tab */}
          <TabsContent value="acquisition" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <TrafficSourcesChart data={trafficSources} isLoading={trafficLoading} />
              <VisitorTrendChart data={dailyTrend} isLoading={trendLoading} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DeviceBreakdownChart data={deviceStats} isLoading={devicesLoading} />
              <BrowserStatsChart data={browserStats} isLoading={browserLoading} />
            </div>
          </TabsContent>

          {/* Monetization Tab */}
          <TabsContent value="monetization" className="space-y-6">
            {/* Revenue Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {revenueLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      ${revenueData?.reduce((acc, item) => acc + item.revenue, 0).toLocaleString() || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {stats?.activeSubscriptions || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly MRR
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      ${stats?.totalMRR?.toLocaleString() || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Conversion Rate
                  </CardTitle>
                  <Target className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {stats?.totalUsers 
                        ? (((stats.proSubscriptions + stats.starterSubscriptions) / stats.totalUsers) * 100).toFixed(1)
                        : 0}%
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
                  <Skeleton className="h-[300px] w-full" />
                ) : revenueData && revenueData.length > 0 ? (
                  <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
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
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Distribution & Cost Analysis */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-amber-500" />
                    Subscription Distribution
                  </CardTitle>
                  <CardDescription>Breakdown by subscription tier</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-[280px] w-full" />
                  ) : subscriptionData.length > 0 ? (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subscriptionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {subscriptionData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <ChartTooltip formatter={(value, name) => [`${value} users`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                      No subscription data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <UserCostAnalysisTable data={userCostAnalysis} isLoading={costLoading} />
            </div>
          </TabsContent>

          {/* Realtime Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <RealtimeVisitorsCard data={realtimeVisitors} isLoading={realtimeLoading} />
              <div className="lg:col-span-2">
                <VisitorTrendChart data={dailyTrend} isLoading={trendLoading} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <TopPagesTable data={topPages} isLoading={pagesLoading} />
              <ConversionsCard data={conversions} isLoading={conversionsLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
