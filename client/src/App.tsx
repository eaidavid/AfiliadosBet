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
import { AppLayout } from "@/components/layouts/app-layout";
import { ROUTES_CONFIG } from "@/config/routes.config";
import AdminPanelToggle from "@/components/admin-panel-toggle";

// Page Imports
import SimpleLanding from "@/pages/simple-landing";
import Register from "@/pages/register";
import Auth from "@/pages/auth";
import UserDashboardComplete from "@/pages/user-dashboard-complete";
import AffiliateHome from "@/pages/affiliate-home";
import UserHomeFixed from "@/pages/user-home-fixed";
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
import AdminPostbackFixed from "@/pages/admin-postback-fixed";
import AdminLogsFixed from "@/pages/admin-logs-fixed";
import AdminApiManagement from "@/pages/admin-api-management";
import AdminPayments from "@/pages/admin-payments";
import AdminSettingsEnhanced from "@/pages/admin-settings-enhanced";
import ManualEntryPage from "@/pages/admin/manual-entry";
import AuditLogPage from "@/pages/admin/audit-log";

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
          <AppLayout>
            <UserHomeFixed />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.dashboard.path}>
        <ProtectedRoute>
          <AppLayout>
            <UserDashboardComplete />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.bettingHouses.path}>
        <ProtectedRoute>
          <AppLayout>
            <BettingHouses />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/houses">
        <ProtectedRoute>
          <AppLayout>
            <BettingHouses />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.myLinks.path}>
        <ProtectedRoute>
          <AppLayout>
            <MyLinks />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.analytics.path}>
        <ProtectedRoute>
          <AppLayout>
            <ClickAnalytics />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.statistics.path}>
        <ProtectedRoute>
          <AppLayout>
            <Statistics />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.reports.path}>
        <ProtectedRoute>
          <AppLayout>
            <AffiliateReports />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.profile.path}>
        <ProtectedRoute>
          <AppLayout>
            <UserProfile />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.payments.path}>
        <ProtectedRoute>
          <AppLayout>
            <AffiliatePayments />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.settings.path}>
        <ProtectedRoute>
          <AppLayout>
            <AppSettings />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Protected Admin Routes */}
      <Route path={ROUTES_CONFIG.admin.path}>
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/casas">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminCasas />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminHouses.path}>
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminHouses />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminManage.path}>
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminManage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/manage/:id/edit">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminEditAffiliate />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/postback">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminPostbackFixed />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/postback-generator">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <PostbackGeneratorProfessional />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/logs">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminLogsFixed />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/postback-logs">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <PostbackLogs />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/api-management">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminApiManagement />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminPayments.path}>
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminPayments />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={ROUTES_CONFIG.adminSettings.path}>
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AdminSettingsEnhanced />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Manual Entry System */}
      <Route path="/admin/manual-entry">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <ManualEntryPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/audit-log">
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AuditLogPage />
          </AppLayout>
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
          <Router />
          <AdminPanelToggle />
          <Toaster />
        </TooltipProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;