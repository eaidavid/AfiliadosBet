import { ReactNode } from "react";
import AdminPanelToggle from "@/components/admin-panel-toggle";
import { SmartBottomNav } from "@/components/navigation/smart-bottom-nav";

interface BaseLayoutProps {
  children: ReactNode;
  showAdminToggle?: boolean;
  showBottomNav?: boolean;
}

export function BaseLayout({ 
  children, 
  showAdminToggle = true, 
  showBottomNav = true
}: BaseLayoutProps) {
  return (
    <div className="mobile-safe no-bounce min-h-screen bg-slate-950">
      {children}
      {showAdminToggle && <AdminPanelToggle />}
      {showBottomNav && <SmartBottomNav />}
    </div>
  );
}