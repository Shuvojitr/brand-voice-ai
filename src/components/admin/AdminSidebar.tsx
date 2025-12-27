import { LayoutDashboard, Users, FileText, Settings, ArrowLeft, DollarSign, Palette, MessageSquareQuote, HelpCircle, Key, FileStack } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const adminNavItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Templates", url: "/admin/templates", icon: FileText },
  { title: "Pages", url: "/admin/pages", icon: FileStack },
  { title: "API Keys", url: "/admin/api-keys", icon: Key },
  { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquareQuote },
  { title: "FAQs", url: "/admin/faqs", icon: HelpCircle },
  { title: "Plans", url: "/admin/plans", icon: DollarSign },
  { title: "Appearance", url: "/admin/appearance", icon: Palette },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground font-bold text-sm">
            SA
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg">Super Admin</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center gap-2"
                      activeClassName="bg-accent text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            {!collapsed && <span>Back to App</span>}
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
