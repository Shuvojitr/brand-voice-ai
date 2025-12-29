import { DashboardLayout } from "@/components/dashboard";
import { LiveChatWidget } from "@/components/live-chat";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveChat() {
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();

        setUserInfo({
          name: profile?.full_name || user.email?.split("@")[0] || "User",
          email: profile?.email || user.email || "",
        });
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-[500px] w-full max-w-md" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Chat Support</h1>
          <p className="text-muted-foreground">
            Chat with our support team in real-time.
          </p>
        </div>

        {userInfo && (
          <LiveChatWidget 
            userName={userInfo.name} 
            userEmail={userInfo.email} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
