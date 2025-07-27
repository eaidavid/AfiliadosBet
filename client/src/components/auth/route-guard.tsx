import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false, 
  redirectTo = "/auth" 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    if (requireAdmin && (!isAuthenticated || !isAdmin)) {
      setLocation(redirectTo);
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, requireAuth, requireAdmin, redirectTo, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-emerald-500 text-xl font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) return null;
  if (requireAdmin && (!isAuthenticated || !isAdmin)) return null;

  return <>{children}</>;
}