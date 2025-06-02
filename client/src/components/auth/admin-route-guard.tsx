import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [, setLocation] = useLocation();

  const { data: authStatus, isLoading, error } = useQuery({
    queryKey: ["/api/auth/status"],
    retry: false,
    staleTime: 30000, // 30 segundos
  });

  useEffect(() => {
    if (!isLoading && (!authStatus?.authenticated || authStatus?.user?.role !== 'admin')) {
      console.log("Redirecionando para login - não autenticado ou não é admin");
      setLocation("/login");
    }
  }, [authStatus, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Verificando autenticação...</div>
      </div>
    );
  }

  if (error || !authStatus?.authenticated || authStatus?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Redirecionando...</div>
      </div>
    );
  }

  return <>{children}</>;
}