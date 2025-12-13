import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Mic, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Documents Created", value: "0", icon: FileText, change: "+0%" },
  { label: "Words Generated", value: "0", icon: Zap, change: "+0%" },
  { label: "Brand Voices", value: "0", icon: Mic, change: "+0%" },
  { label: "Credits Used", value: "0%", icon: TrendingUp, change: "5,000 left" },
];

export default function Dashboard() {
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
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
