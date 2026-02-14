import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldX, Mail, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Banned = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_banned")
        .eq("id", session.user.id)
        .single();

      if (profile?.is_banned) {
        setIsBanned(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
      setLoading(false);
    };

    checkBanStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isBanned) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription className="text-base">
            Your account has been temporarily suspended due to a violation of our terms of service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              If you believe this is a mistake, or if you'd like to appeal this decision, 
              please contact our support team. We're here to help resolve any issues.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <a href="https://lovable.dev/support" target="_blank" rel="noopener noreferrer">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <a href="https://lovable.dev/terms" target="_blank" rel="noopener noreferrer">
                <HelpCircle className="w-4 h-4 mr-2" />
                View Terms of Service
              </a>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Reference your account email when contacting support to expedite the review process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Banned;
