import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { PremiumBottomNav2026 } from "@/components/premium-bottom-nav-2026";
import AdminPanelToggle from "@/components/admin-panel-toggle";

interface UnifiedLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  topbar?: ReactNode;
  showBottomNav?: boolean;
  showAdminToggle?: boolean;
  className?: string;
}

export function UnifiedLayout({ 
  children, 
  sidebar, 
  topbar, 
  showBottomNav = true, 
  showAdminToggle = true,
  className = "" 
}: UnifiedLayoutProps) {
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className={`mobile-safe no-bounce min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        {sidebar && (
          <div className="hidden lg:block">
            {sidebar}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          {topbar && (
            <div className="lg:block">
              {topbar}
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Bottom Navigation - Only on mobile */}
      {showBottomNav && isMobile && (
        <PremiumBottomNav2026 />
      )}

      {/* Admin Panel Toggle - Only for admins */}
      {showAdminToggle && isAdmin && (
        <AdminPanelToggle />
      )}
    </div>
  );
}

// Layout específico para páginas administrativas
export function AdminLayout({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <UnifiedLayout
      showBottomNav={true}
      showAdminToggle={true}
      className={className}
    >
      {children}
    </UnifiedLayout>
  );
}

// Layout específico para páginas de usuário
export function UserLayout({ 
  children, 
  sidebar, 
  topbar, 
  className = "" 
}: { 
  children: ReactNode; 
  sidebar?: ReactNode; 
  topbar?: ReactNode; 
  className?: string;
}) {
  return (
    <UnifiedLayout
      sidebar={sidebar}
      topbar={topbar}
      showBottomNav={true}
      showAdminToggle={true}
      className={className}
    >
      {children}
    </UnifiedLayout>
  );
}

// Layout mínimo para páginas de autenticação
export function AuthLayout({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <UnifiedLayout
      showBottomNav={false}
      showAdminToggle={false}
      className={className}
    >
      {children}
    </UnifiedLayout>
  );
}