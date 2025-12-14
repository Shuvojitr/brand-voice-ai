import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  CreditCard, 
  Settings, 
  Sparkles,
  Mic,
  FolderOpen
} from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/dashboard/templates", icon: FileText },
  { title: "Documents", url: "/dashboard/documents", icon: FolderOpen },
  { title: "History", url: "/dashboard/history", icon: History },
];

const settingsNavItems = [
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const tierLabels: Record<string, string> = {
  free: "Free Plan",
  starter: "Starter Plan",
  pro: "Pro Plan",
  enterprise: "Enterprise",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { organization, invalidate } = useOrganization();

  const creditsUsed = organization?.credits_used || 0;
  const monthlyCredits = organization?.monthly_credits || 1000;
  const creditsRemaining = Math.max(0, monthlyCredits - creditsUsed);
  const usagePercent = Math.min((creditsUsed / monthlyCredits) * 100, 100);
  const tier = organization?.subscription_tier || "free";

  // Subscribe to real-time organization updates
  useEffect(() => {
    if (!organization?.id) return;

    const channel = supabase
      .channel('organization-credits')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organizations',
          filter: `id=eq.${organization.id}`
        },
        () => {
          invalidate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id, invalidate]);

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              MyGen<span className="gradient-text">AI</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && (
          <Link to="/dashboard/billing" className="block">
            <div className="rounded-lg bg-primary/5 p-3 hover:bg-primary/10 transition-colors">
              <p className="text-xs font-medium text-primary mb-1">
                {tierLabels[tier]}
              </p>
              <p className="text-xs text-muted-foreground">
                {creditsRemaining.toLocaleString()} words remaining
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary transition-all duration-500" 
                  style={{ width: `${100 - usagePercent}%` }}
                />
              </div>
            </div>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
