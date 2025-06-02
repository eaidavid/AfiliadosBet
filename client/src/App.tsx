import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "@/pages/landing-page";
import SimpleLanding from "@/pages/simple-landing";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminDashboardSimple from "@/pages/admin-dashboard-simple";
import NotFound from "@/pages/not-found";
import AdminPanelToggle from "@/components/admin-panel-toggle";

function AuthenticatedHome() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <Dashboard />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleLanding} />
      <Route path="/home" component={AuthenticatedHome} />
      <Route path="/login" component={AuthenticatedLogin} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={AuthenticatedUserDashboard} />
      <Route path="/admin" component={AuthenticatedAdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLogin() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Use wouter navigation instead of window.location
    const targetPath = isAdmin ? "/admin" : "/dashboard";
    if (location !== targetPath) {
      setLocation(targetPath);
    }
    return null;
  }

  return <Login />;
}

function AuthenticatedUserDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <Dashboard />
    </div>
  );
}

function AuthenticatedAdminDashboard() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminDashboardSimple />
    </div>
  );
}

function App() {
  // Adicionar tratamento global de erros
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Previne que o erro cause tela branca
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      event.preventDefault(); // Previne que o erro cause tela branca
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
