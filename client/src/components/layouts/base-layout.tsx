import AdminPanelToggle from "@/components/admin-panel-toggle";
import { PremiumBottomNav2026 } from "@/components/premium-bottom-nav-2026";
import { MenuToggleButton } from "@/components/menu-toggle-button";

interface BaseLayoutProps {
  children: React.ReactNode;
  showAdminToggle?: boolean;
  showBottomNav?: boolean;
  showMenuToggle?: boolean;
}

export function BaseLayout({ 
  children, 
  showAdminToggle = true, 
  showBottomNav = true, 
  showMenuToggle = true 
}: BaseLayoutProps) {
  return (
    <div className="mobile-safe no-bounce min-h-screen bg-slate-950">
      {children}
      {showAdminToggle && <AdminPanelToggle />}
      {showBottomNav && <PremiumBottomNav2026 />}
      {showMenuToggle && <MenuToggleButton />}
    </div>
  );
}