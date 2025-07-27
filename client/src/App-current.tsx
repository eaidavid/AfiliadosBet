import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AppSettingsProvider } from "@/contexts/app-settings-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RouteGuard } from "@/components/auth/route-guard";

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
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-emerald-500 text-xl font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="mobile-safe bg-slate-950 flex items-center justify-center no-bounce min-h-screen">
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
    );
  }

  return <Auth />;
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
      <Route path="/" component={SimpleLanding} />
      <Route path="/register" component={Register} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginRedirect} />

      {/* Protected User Routes */}
      <Route path="/home">
        <ProtectedRoute>
          <AffiliateHome />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <UserDashboardComplete />
        </ProtectedRoute>
      </Route>

      <Route path="/affiliate-home">
        <ProtectedRoute>
          <AffiliateHome />
        </ProtectedRoute>
      </Route>

      <Route path="/betting-houses">
        <ProtectedRoute>
          <BettingHouses />
        </ProtectedRoute>
      </Route>

      <Route path="/houses">
        <ProtectedRoute>
          <BettingHouses />
        </ProtectedRoute>
      </Route>

      <Route path="/my-links">
        <ProtectedRoute>
          <MyLinks />
        </ProtectedRoute>
      </Route>

      <Route path="/analytics">
        <ProtectedRoute>
          <ClickAnalytics />
        </ProtectedRoute>
      </Route>

      <Route path="/stats">
        <ProtectedRoute>
          <Statistics />
        </ProtectedRoute>
      </Route>

      <Route path="/reports">
        <ProtectedRoute>
          <AffiliateReports />
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      </Route>

      <Route path="/payments">
        <ProtectedRoute>
          <AffiliatePayments />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <AppSettings />
        </ProtectedRoute>
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/casas">
        <ProtectedRoute requireAdmin={true}>
          <AdminCasas />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/houses">
        <ProtectedRoute requireAdmin={true}>
          <AdminHouses />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/manage">
        <ProtectedRoute requireAdmin={true}>
          <AdminManage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/manage/:id/edit">
        <ProtectedRoute requireAdmin={true}>
          <AdminEditAffiliate />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/postback-generator">
        <ProtectedRoute requireAdmin={true}>
          <PostbackGeneratorProfessional />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/postback-logs">
        <ProtectedRoute requireAdmin={true}>
          <PostbackLogs />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/api-management">
        <ProtectedRoute requireAdmin={true}>
          <AdminApiManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/payments">
        <ProtectedRoute requireAdmin={true}>
          <AdminPayments />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings">
        <ProtectedRoute requireAdmin={true}>
          <AdminSettingsEnhanced />
        </ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
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