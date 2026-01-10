import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Mic, TrendingUp, Zap, Calendar, Edit, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { useDashboardStats, useRecentDocuments } from "@/hooks/useDashboardStats";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const { data: stats, isLoading: statsLoading } = useDashboardStats(organization?.id);
  const { data: recentDocs, isLoading: docsLoading } = useRecentDocuments(organization?.id);

  const isLoading = orgLoading || statsLoading;
  
  // New user who hasn't claimed any plan yet
  const hasNoPlan = organization?.subscription_tier === null || organization?.subscription_status === 'none';
  const canClaimFreePlan = hasNoPlan && !organization?.has_used_free_plan;
  
  // User with inactive subscription (expired, cancelled, etc.) - different from new users
  const hasInactiveSubscription = organization?.subscription_status && 
    ['expired', 'cancelled', 'past_due', 'inactive'].includes(organization.subscription_status);
  
  const creditsTotal = stats?.creditsTotal ?? 0;
  const creditsUsed = stats?.creditsUsed ?? 0;
  const creditsRemaining = creditsTotal - creditsUsed;
  const creditsPercent = creditsTotal > 0 ? Math.round((creditsUsed / creditsTotal) * 100) : 0;

  const statsData = [
    { 
      label: "Documents Created", 
      value: stats?.documentsCount?.toLocaleString() || "0", 
      icon: FileText, 
      subtext: "Total documents" 
    },
    { 
      label: "Words Generated", 
      value: stats?.wordsGenerated?.toLocaleString() || "0", 
      icon: Zap, 
      subtext: "All time" 
    },
    { 
      label: "Brand Voices", 
      value: stats?.brandVoicesCount?.toString() || "0", 
      icon: Mic, 
      subtext: "Active voices" 
    },
    { 
      label: "Credits Used", 
      value: `${creditsPercent}%`, 
      icon: TrendingUp, 
      subtext: `${creditsRemaining.toLocaleString()} remaining` 
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* New User Banner - No plan claimed yet */}
        {hasNoPlan && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      {canClaimFreePlan ? "You don't have an active plan yet" : "Your plan has expired"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {canClaimFreePlan 
                        ? "Claim your free plan to get 1,000 words/month, or upgrade for more features."
                        : "Subscribe to a plan to continue generating content."}
                    </p>
                  </div>
                </div>
                <Button asChild className="shrink-0">
                  <Link to="/dashboard/billing">
                    {canClaimFreePlan ? "Get Started" : "View Plans"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inactive Subscription Banner - Expired/Cancelled users */}
        {!hasNoPlan && hasInactiveSubscription && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">
                      Your subscription is no longer active
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Upgrade now to continue generating AI-powered content and unlock all features.
                    </p>
                  </div>
                </div>
                <Button asChild variant="destructive" className="shrink-0">
                  <Link to="/dashboard/billing">
                    Upgrade Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your content today.
            </p>
          </div>
          <Button className="gradient-primary text-white" asChild>
            <Link to="/dashboard/templates">
              <Plus className="h-4 w-4 mr-2" />
              Create New Content
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link to="/dashboard/templates">
              <Card className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg h-full">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Plus className="h-6 w-6" />
                  </div>
                  <CardTitle>Create Content</CardTitle>
                  <CardDescription>
                    Generate new content using AI-powered templates
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/dashboard/documents">
              <Card className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg h-full">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle>My Documents</CardTitle>
                  <CardDescription>
                    View and edit your saved documents
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/dashboard/brand-voices">
              <Card className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg h-full">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Mic className="h-6 w-6" />
                  </div>
                  <CardTitle>Brand Voices</CardTitle>
                  <CardDescription>
                    Manage your custom brand voice profiles
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          {docsLoading ? (
            <Card>
              <CardContent className="py-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-9 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : recentDocs && recentDocs.length > 0 ? (
            <Card>
              <CardContent className="py-4">
                <div className="divide-y divide-border">
                  {recentDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {doc.template_type && (
                            <span className="capitalize">{doc.template_type.replace(/-/g, ' ')}</span>
                          )}
                          {doc.word_count !== null && (
                            <span>{doc.word_count.toLocaleString()} words</span>
                          )}
                          {doc.created_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dashboard/document/${doc.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  No documents yet. Start creating to see them here!
                </p>
                <Button className="gradient-primary text-white" asChild>
                  <Link to="/dashboard/templates">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Content
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
