import { RouteGuard } from "./route-guard";
import { BaseLayout } from "../layouts/base-layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  showAdminToggle?: boolean;
  showBottomNav?: boolean;
  showMenuToggle?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  showAdminToggle = true,
  showBottomNav = true,
  showMenuToggle = true
}: ProtectedRouteProps) {
  return (
    <RouteGuard requireAuth={true} requireAdmin={requireAdmin}>
      <BaseLayout 
        showAdminToggle={showAdminToggle} 
        showBottomNav={showBottomNav} 
        showMenuToggle={showMenuToggle}
      >
        {children}
      </BaseLayout>
    </RouteGuard>
  );
}