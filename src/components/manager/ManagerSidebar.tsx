import { LayoutDashboard, FileText, ArrowLeft, MessageSquareQuote, HelpCircle, FileStack, BarChart3, Ticket, MessageCircle } from "lucide-react";
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

const managerNavItems = [
  { title: "Overview", url: "/manager", icon: LayoutDashboard },
  { title: "Templates", url: "/manager/templates", icon: FileText },
  { title: "Pages", url: "/manager/pages", icon: FileStack },
  { title: "Testimonials", url: "/manager/testimonials", icon: MessageSquareQuote },
  { title: "FAQs", url: "/manager/faqs", icon: HelpCircle },
  { title: "Support Tickets", url: "/manager/tickets", icon: Ticket },
  { title: "Live Chats", url: "/manager/live-chats", icon: MessageCircle },
  { title: "Reports", url: "/manager/reports", icon: BarChart3 },
];

export function ManagerSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/manager") {
      return location.pathname === "/manager";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm">
            M
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg">Manager</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manager Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managerNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/manager"}
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
