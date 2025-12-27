import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/NotFound";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setAuthChecking(false);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_banned')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.is_banned) {
          setIsBanned(true);
          navigate("/banned", { replace: true });
        }
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_banned')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.is_banned) {
            setIsBanned(true);
            navigate("/banned", { replace: true });
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Only redirect to login if not authenticated (keep this behavior)
    if (!authChecking && !isAuthenticated) {
      navigate("/login");
    }
  }, [authChecking, isAuthenticated, navigate]);

  if (authChecking || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Stealth mode: Show 404 if authenticated but not admin (hide existence of admin pages)
  if (isAuthenticated && !isAdmin && !isBanned) {
    return <NotFound />;
  }

  if (!isAuthenticated || isBanned) {
    return null;
  }

  return <>{children}</>;
}
