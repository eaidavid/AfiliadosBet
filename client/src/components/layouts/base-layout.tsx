import { ReactNode } from "react";
import { SmartBottomNav } from "@/components/navigation/smart-bottom-nav";

interface BaseLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function BaseLayout({ 
  children,
  showBottomNav = true
}: BaseLayoutProps) {
  return (
    <div className="mobile-safe no-bounce min-h-screen bg-slate-950">
      {children}
      {showBottomNav && <SmartBottomNav />}
    </div>
  );
}