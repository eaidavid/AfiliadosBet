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
import UserDashboardComplete from "@/pages/user-dashboard-complete";
import UserReports from "@/pages/user-reports-clean";
import AdminDashboard from "@/pages/admin-dashboard-new";
import AdminLeadsManagement from "@/pages/admin-leads-management";
import AdminCasas from "@/pages/admin-casas";

import AdminHouses from "@/pages/admin-houses";
import AdminManage from "@/pages/admin-manage";
import PostbackGeneratorProfessional from "@/pages/postback-generator-professional";
import PostbackLogs from "@/pages/postback-logs";
import AdminSettings from "@/pages/admin-settings";
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
      <UserDashboardComplete />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedUserReports() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <UserReports />
      <AdminPanelToggle />
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
      <Route path="/reports" component={AuthenticatedUserReports} />
      <Route path="/admin" component={AuthenticatedAdminDashboard} />
      <Route path="/admin/leads" component={AuthenticatedAdminLeads} />
      <Route path="/admin/casas" component={AuthenticatedAdminCasas} />

      <Route path="/admin/houses" component={AuthenticatedAdminHouses} />
      <Route path="/admin/manage" component={AuthenticatedAdminManage} />
      <Route path="/admin/postback-generator" component={AuthenticatedPostbackGenerator} />
      <Route path="/admin/postback-logs" component={AuthenticatedPostbackLogs} />
      <Route path="/admin/settings" component={AuthenticatedAdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLogin() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const targetPath = isAdmin ? "/admin" : "/dashboard";
      if (location !== targetPath) {
        setLocation(targetPath);
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, location, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <Login />;
}

function AuthenticatedUserDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <UserDashboardComplete />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedAdminDashboard() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminDashboard />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedAdminLeads() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminLeadsManagement />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedAdminCasas() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminCasas />
      <AdminPanelToggle />
    </div>
  );
}



function AuthenticatedAdminHouses() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminHouses />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedAdminManage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminManage />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedPostbackGenerator() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <PostbackGeneratorProfessional />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedPostbackLogs() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <PostbackLogs />
      <AdminPanelToggle />
    </div>
  );
}

function AuthenticatedAdminSettings() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminSettings />
      <AdminPanelToggle />
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
