import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  credits?: number;
  onLogout?: () => void;
  showFooter?: boolean;
  className?: string;
}

export function Layout({
  children,
  isAuthenticated = false,
  user,
  credits = 0,
  onLogout,
  showFooter = true,
  className,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        credits={credits}
        onLogout={onLogout}
      />
      <main className={cn("flex-1", className)}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
