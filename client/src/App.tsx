import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AppSettingsProvider } from "@/contexts/app-settings-context";
// import LandingPage from "@/pages/landing-page";
import SimpleLanding from "@/pages/simple-landing";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Auth from "@/pages/auth";
import UserDashboardComplete from "@/pages/user-dashboard-complete";
import UserReports from "@/pages/archived/user-reports-clean";
import AffiliateHome from "@/pages/affiliate-home";
import BettingHouses from "@/pages/betting-houses";
import MyLinks from "@/pages/my-links";
import AffiliateReports from "@/pages/affiliate-reports";
import UserProfile from "@/pages/user-profile";
import AffiliatePayments from "@/pages/affiliate-payments";
import ClickAnalytics from "@/pages/click-analytics";
import AdminDashboardFixed from "@/pages/admin-dashboard-fixed";

import AdminCasas from "@/pages/admin-casas";

import AdminHouses from "@/pages/admin-houses";
import AdminManageFixed from "@/pages/admin-manage-fixed";
import AdminEditAffiliate from "@/pages/admin-edit-affiliate";
import PostbackGeneratorProfessional from "@/pages/postback-generator-professional";
import PostbackLogs from "@/pages/postback-logs";
import AdminApiManagement from "@/pages/admin-api-management";
import AdminPayments from "@/pages/admin-payments";

import AdminSettingsEnhanced from "@/pages/admin-settings-enhanced";
import AppSettings from "@/pages/app-settings";
import Statistics from "@/pages/statistics";
import NotFound from "@/pages/not-found";
import AdminPanelToggle from "@/components/admin-panel-toggle";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MenuToggleButton } from "@/components/menu-toggle-button";

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
      <BottomNavigation />
      <MenuToggleButton />
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
      <BottomNavigation />
      <MenuToggleButton />
    </div>
  );
}

function AuthenticatedAppSettings() {
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
      <AppSettings />
      <AdminPanelToggle />
      <BottomNavigation />
      <MenuToggleButton />
    </div>
  );
}

function AuthenticatedStatistics() {
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
      <Statistics />
      <AdminPanelToggle />
      <BottomNavigation />
      <MenuToggleButton />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleLanding} />
      <Route path="/home" component={AuthenticatedAffiliateHome} />
      <Route path="/auth" component={AuthenticatedAuth} />
      <Route path="/login" component={AuthenticatedLogin} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={AuthenticatedUserDashboard} />
      <Route path="/affiliate-home" component={AuthenticatedAffiliateHome} />
      <Route path="/betting-houses" component={AuthenticatedBettingHouses} />
      <Route path="/houses" component={AuthenticatedBettingHouses} />
      <Route path="/my-links" component={AuthenticatedMyLinks} />
      <Route path="/analytics" component={AuthenticatedClickAnalytics} />
      <Route path="/stats" component={AuthenticatedStatistics} />
      <Route path="/reports" component={AuthenticatedReports} />
      <Route path="/profile" component={AuthenticatedProfile} />
      <Route path="/payments" component={AuthenticatedPayments} />
      <Route path="/admin" component={AuthenticatedAdminDashboard} />
      <Route path="/admin/casas" component={AuthenticatedAdminCasas} />

      <Route path="/admin/houses" component={AuthenticatedAdminHouses} />
      <Route path="/admin/manage" component={AuthenticatedAdminManage} />
      <Route path="/admin/manage/:id/edit" component={AuthenticatedAdminEditAffiliate} />
      <Route path="/admin/postback-generator" component={AuthenticatedPostbackGenerator} />
      <Route path="/admin/postback-logs" component={AuthenticatedPostbackLogs} />
      <Route path="/admin/api-management" component={AuthenticatedAdminApiManagement} />
      <Route path="/admin/payments" component={AuthenticatedAdminPayments} />

      <Route path="/admin/settings" component={AuthenticatedAdminSettings} />
      <Route path="/settings" component={AuthenticatedAppSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedAuth() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  // COMPLETAMENTE REMOVIDO o redirecionamento automático
  // O redirecionamento agora é feito apenas no onSuccess do login

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  // Se já autenticado, mostrar mensagem mas NÃO redirecionar automaticamente
  if (isAuthenticated) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Você já está logado!</div>
        <div className="text-slate-400 text-sm mt-2">
          <a href={isAdmin ? "/admin" : "/home"} className="text-emerald-400 hover:underline">
            Ir para {isAdmin ? "Admin" : "Dashboard"}
          </a>
        </div>
      </div>
    );
  }

  return <Auth />;
}

function AuthenticatedLogin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Sempre redirecionar /login para /auth
    setLocation("/auth");
  }, [setLocation]);

  return null;
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
      <BottomNavigation />
    </div>
  );
}

function AuthenticatedAffiliateHome() {
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
      <AffiliateHome />
      <AdminPanelToggle />
      <BottomNavigation />
      <MenuToggleButton />
    </div>
  );
}

function AuthenticatedBettingHouses() {
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
      <BettingHouses />
      <AdminPanelToggle />
      <BottomNavigation />
      <MenuToggleButton />
    </div>
  );
}

function AuthenticatedMyLinks() {
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
      <MyLinks />
      <AdminPanelToggle />
      <BottomNavigation />
      <MenuToggleButton />
    </div>
  );
}

function AuthenticatedClickAnalytics() {
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
      <ClickAnalytics />
      <AdminPanelToggle />
      <BottomNavigation />
    </div>
  );
}

function AuthenticatedReports() {
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
      <AffiliateReports />
      <AdminPanelToggle />
      <BottomNavigation />
    </div>
  );
}

function AuthenticatedProfile() {
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
      <UserProfile />
      <AdminPanelToggle />
      <BottomNavigation />
      <MenuToggleButton />
    </div>
  );
}

function AuthenticatedPayments() {
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
      <AffiliatePayments />
      <AdminPanelToggle />
      <BottomNavigation />
    </div>
  );
}

function AuthenticatedAdminDashboard() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      console.log('🔄 Admin não autenticado, redirecionando para /auth');
      window.location.href = "/auth";
    }
  }, [isAuthenticated, isLoading, isAdmin]);

  if (isLoading) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce">
        <div className="text-emerald-500 text-xl">Redirecionando...</div>
      </div>
    );
  }

  return (
    <div className="mobile-safe no-bounce">
      <AdminDashboardFixed />
      <AdminPanelToggle />
      <BottomNavigation />
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
      <BottomNavigation />
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
      <BottomNavigation />
    </div>
  );
}



function AuthenticatedAdminPayments() {
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
      <AdminPayments />
      <AdminPanelToggle />
      <BottomNavigation />
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
      <AdminManageFixed />
      <AdminPanelToggle />
      <BottomNavigation />
    </div>
  );
}

function AuthenticatedAdminEditAffiliate() {
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
      <AdminEditAffiliate />
      <AdminPanelToggle />
      <BottomNavigation />
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
      <BottomNavigation />
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
      <BottomNavigation />
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
      <AdminSettingsEnhanced />
      <AdminPanelToggle />
      <BottomNavigation />
    </div>
  );
}

function AuthenticatedAdminApiManagement() {
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
      <AdminApiManagement />
      <AdminPanelToggle />
      <BottomNavigation />
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
      <AppSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
