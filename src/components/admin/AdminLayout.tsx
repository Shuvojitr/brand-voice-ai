import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminProtectedRoute } from "./AdminProtectedRoute";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-6">
              <SidebarTrigger />
              <div className="flex-1" />
              <span className="text-sm text-destructive font-medium">Admin Mode</span>
            </div>
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AdminProtectedRoute>
  );
}
