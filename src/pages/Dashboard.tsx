import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Mic, TrendingUp, Zap, Calendar, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { useDashboardStats, useRecentDocuments } from "@/hooks/useDashboardStats";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const { data: stats, isLoading: statsLoading } = useDashboardStats(organization?.id);
  const { data: recentDocs, isLoading: docsLoading } = useRecentDocuments(organization?.id);

  const isLoading = orgLoading || statsLoading;
  
  const creditsRemaining = (stats?.creditsTotal || 1000) - (stats?.creditsUsed || 0);
  const creditsPercent = Math.round(((stats?.creditsUsed || 0) / (stats?.creditsTotal || 1000)) * 100);

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
