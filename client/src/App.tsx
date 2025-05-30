import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "@/pages/landing-page";
import Register from "@/pages/register";
import Login from "@/pages/login";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import AdminPanelToggle from "@/components/admin-panel-toggle";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={AuthenticatedLogin} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={AuthenticatedUserDashboard} />
        <Route path="/admin" component={AuthenticatedAdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </>
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
