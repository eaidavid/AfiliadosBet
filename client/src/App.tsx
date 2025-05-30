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
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import AdminPanelToggle from "@/components/admin-panel-toggle";

function HomePage() {
  useEffect(() => {
    window.location.replace("/lp");
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecionando...</div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/lp" component={SimpleLanding} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={AuthenticatedUserDashboard} />
      <Route path="/admin" component={AuthenticatedAdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLogin() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = isAdmin ? "/admin" : "/dashboard";
    return null;
  }

  return <Login />;
}

function AuthenticatedUserDashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return (
    <>
      <UserDashboard />
      <AdminPanelToggle />
    </>
  );
}

function AuthenticatedAdminDashboard() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    window.location.href = "/login";
    return null;
  }

  return (
    <>
      <AdminDashboard />
      <AdminPanelToggle />
    </>
  );
}

function App() {
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
