import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MousePointer, UserPlus, CreditCard, DollarSign, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import UserSidebar from "@/components/user/sidebar";
import UserTopBar from "@/components/user/topbar";
import BettingHouses from "@/components/user/betting-houses";
import MyLinks from "@/components/user/my-links";
import Payments from "@/components/user/payments";
import UserReports from "@/components/user/reports";
import Support from "@/components/user/support";
import Profile from "@/components/user/profile";

export default function UserDashboardComplete() {
  const [currentPage, setCurrentPage] = useState("home");
  const { user, isLoading: authLoading } = useAuth();

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/stats/user"],
    retry: 1,
    staleTime: 1000,
  });

  const { data: accountStatus = {} } = useQuery({
    queryKey: ["/api/user/account-status"],
    refetchInterval: 5000,
    retry: 1,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const safeStats = {
    totalClicks: (stats as any)?.totalClicks || 0,
    totalRegistrations: (stats as any)?.totalRegistrations || 0,
    totalDeposits: (stats as any)?.totalDeposits || 0,
    totalCommission: (stats as any)?.totalCommission || 0,
    conversionRate: (stats as any)?.conversionRate || 0,
  };

  const formatCommission = (commission: number) => {
    return (commission || 0).toFixed(2);
  };

  const renderStatsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total de Cliques</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {safeStats.totalClicks.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Registros</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {safeStats.totalRegistrations.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Depósitos</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {safeStats.totalDeposits.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Comissão Total</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  R$ {formatCommission(safeStats.totalCommission)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAccountStatus = () => {
    const isActive = (accountStatus as any)?.isActive !== false;
    
    return (
      <Alert className={`mb-6 ${isActive ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <AlertDescription className="ml-2 text-emerald-500">
            Conta ativa e funcionando normalmente
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const WelcomeSection = () => (
    <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-6 mb-8 border border-emerald-500/20">
      <h1 className="text-3xl font-bold text-white mb-2">
        Bem-vindo, {user?.fullName?.split(" ")[0] || user?.username}! 👋
      </h1>
      <p className="text-slate-400">
        Acompanhe seu progresso e maximize seus ganhos como afiliado.
      </p>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <div className="space-y-6">
            <WelcomeSection />
            {renderAccountStatus()}
            {renderStatsCards()}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Casas Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <BettingHouses />
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Meus Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <MyLinks />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "houses":
        return <BettingHouses />;
      case "links":
        return <MyLinks />;
      case "payments":
        return <Payments />;
      case "reports":
        return <UserReports />;
      case "support":
        return <Support />;
      case "profile":
        return <Profile />;
      default:
        return (
          <div className="space-y-6">
            <WelcomeSection />
            {renderAccountStatus()}
            {renderStatsCards()}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col lg:flex-row">
        <UserSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1 flex flex-col">
          <UserTopBar />
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  );
}