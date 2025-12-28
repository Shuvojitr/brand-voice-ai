import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ManagerSidebar } from "./ManagerSidebar";
import { ManagerProtectedRoute } from "./ManagerProtectedRoute";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

interface ManagerLayoutProps {
  children: ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/manager") return "Overview";
    if (path.includes("/homepage")) return "Homepage";
    if (path.includes("/templates")) return "Templates";
    if (path.includes("/pages")) return "Pages";
    if (path.includes("/testimonials")) return "Testimonials";
    if (path.includes("/faqs")) return "FAQs";
    if (path.includes("/reports")) return "Reports";
    return "Manager";
  };

  return (
    <ManagerProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ManagerSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex-1 p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ManagerProtectedRoute>
  );
}
