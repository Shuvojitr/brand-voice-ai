import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, Mic, Plus, LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session?.user) {
        navigate("/login", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session?.user) {
        navigate("/login", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              MyGen<span className="gradient-text">AI</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{userName}</span>!
          </h1>
          <p className="text-muted-foreground">
            What would you like to create today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Plus className="h-6 w-6" />
              </div>
              <CardTitle>New Content</CardTitle>
              <CardDescription>
                Generate new content using AI-powered templates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
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

          <Card className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
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
        </div>

        {/* Recent Documents Placeholder */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                No documents yet. Start creating to see them here!
              </p>
              <Button className="mt-4 gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
