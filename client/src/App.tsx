import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AppSettingsProvider } from "@/contexts/app-settings-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageLayout } from "@/components/layouts/page-layout";
import { ROUTES_CONFIG } from "@/config/routes.config";

// Page Imports
import SimpleLanding from "@/pages/simple-landing";
import Register from "@/pages/register";
import Auth from "@/pages/auth";
import UserDashboardComplete from "@/pages/user-dashboard-complete";
import AffiliateHome from "@/pages/affiliate-home";
import BettingHouses from "@/pages/betting-houses";
import MyLinks from "@/pages/my-links";
import AffiliateReports from "@/pages/affiliate-reports";
import UserProfile from "@/pages/user-profile";
import AffiliatePayments from "@/pages/affiliate-payments";
import ClickAnalytics from "@/pages/click-analytics";
import Statistics from "@/pages/statistics";
import AppSettings from "@/pages/app-settings";
import NotFound from "@/pages/not-found";

// Admin Pages
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCasas from "@/pages/admin-casas";
import AdminHouses from "@/pages/admin-houses";
import AdminManage from "@/pages/admin-manage";
import AdminEditAffiliate from "@/pages/admin-edit-affiliate";
import PostbackGeneratorProfessional from "@/pages/postback-generator-professional";
import PostbackLogs from "@/pages/postback-logs";
import AdminApiManagement from "@/pages/admin-api-management";
import AdminPayments from "@/pages/admin-payments";
import AdminSettingsEnhanced from "@/pages/admin-settings-enhanced";

function AuthPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <PageLayout showBreadcrumbs={false} showBottomNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-emerald-500 text-xl font-medium">Carregando...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isAuthenticated) {
    return (
      <PageLayout showBreadcrumbs={false} showBottomNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-emerald-500 text-xl mb-4">Você já está logado!</div>
            <div className="text-slate-400 text-sm">
              <a 
                href={isAdmin ? "/admin" : "/home"} 
                className="text-emerald-400 hover:underline"
              >
                Ir para {isAdmin ? "Admin" : "Dashboard"}
              </a>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBreadcrumbs={false} showBottomNav={false}>
      <Auth />
    </PageLayout>
  );
}

function LoginRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/auth");
  }, [setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path={ROUTES_CONFIG.home.path}>
        <PageLayout showBreadcrumbs={false} showBottomNav={false}>
          <SimpleLanding />
        </PageLayout>
      </Route>
      
      <Route path={ROUTES_CONFIG.register.path}>
        <PageLayout showBreadcrumbs={false} showBottomNav={false}>
          <Register />
        </PageLayout>
      </Route>
      
      <Route path={ROUTES_CONFIG.auth.path} component={AuthPage} />
      <Route path="/login" component={LoginRedirect} />

      {/* Protected User Routes */}
      <Route path={ROUTES_CONFIG.userHome.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.userHome.title}
            description={ROUTES_CONFIG.userHome.description}
          >
            <AffiliateHome />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.dashboard.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.dashboard.title}
            description={ROUTES_CONFIG.dashboard.description}
          >
            <UserDashboardComplete />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.bettingHouses.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.bettingHouses.title}
            description={ROUTES_CONFIG.bettingHouses.description}
          >
            <BettingHouses />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/houses">
        <ProtectedRoute>
          <PageLayout title="Casas de Apostas" description="Explore casas disponíveis">
            <BettingHouses />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.myLinks.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.myLinks.title}
            description={ROUTES_CONFIG.myLinks.description}
          >
            <MyLinks />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.analytics.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.analytics.title}
            description="Análise detalhada de cliques e conversões"
          >
            <ClickAnalytics />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.statistics.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.statistics.title}
            description="Estatísticas de performance"
          >
            <Statistics />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.reports.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.reports.title}
            description="Relatórios detalhados de comissões"
          >
            <AffiliateReports />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.profile.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.profile.title}
            description="Gerencie seu perfil e configurações"
          >
            <UserProfile />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.payments.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.payments.title}
            description={ROUTES_CONFIG.payments.description}
          >
            <AffiliatePayments />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.settings.path}>
        <ProtectedRoute>
          <PageLayout 
            title={ROUTES_CONFIG.settings.title}
            description="Configurações da aplicação"
          >
            <AppSettings />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      {/* Protected Admin Routes */}
      <Route path={ROUTES_CONFIG.admin.path}>
        <ProtectedRoute requireAdmin={true}>
          <PageLayout 
            title={ROUTES_CONFIG.admin.title}
            description={ROUTES_CONFIG.admin.description}
          >
            <AdminDashboard />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/casas">
        <ProtectedRoute requireAdmin={true}>
          <PageLayout title="Admin - Casas" description="Gerenciar casas de apostas">
            <AdminCasas />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminHouses.path}>
        <ProtectedRoute requireAdmin={true}>
          <PageLayout 
            title={ROUTES_CONFIG.adminHouses.title}
            description={ROUTES_CONFIG.adminHouses.description}
          >
            <AdminHouses />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminManage.path}>
        <ProtectedRoute requireAdmin={true}>
          <PageLayout 
            title={ROUTES_CONFIG.adminManage.title}
            description={ROUTES_CONFIG.adminManage.description}
          >
            <AdminManage />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/manage/:id/edit">
        <ProtectedRoute requireAdmin={true}>
          <PageLayout title="Editar Afiliado" description="Gerenciar dados do afiliado">
            <AdminEditAffiliate />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/postback-generator">
        <ProtectedRoute requireAdmin={true}>
          <PageLayout title="Gerador de Postbacks" description="Configurar postbacks das casas">
            <PostbackGeneratorProfessional />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/postback-logs">
        <ProtectedRoute requireAdmin={true}>
          <PageLayout title="Logs de Postbacks" description="Histórico de postbacks recebidos">
            <PostbackLogs />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/api-management">
        <ProtectedRoute requireAdmin={true}>
          <PageLayout title="Gerenciamento de API" description="Configurações de API">
            <AdminApiManagement />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminPayments.path}>
        <ProtectedRoute requireAdmin={true}>
          <PageLayout 
            title={ROUTES_CONFIG.adminPayments.title}
            description={ROUTES_CONFIG.adminPayments.description}
          >
            <AdminPayments />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminSettings.path}>
        <ProtectedRoute requireAdmin={true}>
          <PageLayout 
            title={ROUTES_CONFIG.adminSettings.title}
            description={ROUTES_CONFIG.adminSettings.description}
          >
            <AdminSettingsEnhanced />
          </PageLayout>
        </ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route>
        <PageLayout title="Página não encontrada" showBreadcrumbs={false}>
          <NotFound />
        </PageLayout>
      </Route>
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      event.preventDefault();
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