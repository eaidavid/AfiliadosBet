import { useState, useEffect } from "react";
import UserSidebar from "@/components/user/sidebar";
import UserTopBar from "@/components/user/topbar";
import BettingHousesSecure from "@/components/user/betting-houses-secure";
import MyLinks from "@/components/user/my-links";
import Payments from "@/components/user/payments";
import UserReports from "@/pages/user-reports";
import Support from "@/components/user/support";
import Profile from "@/components/user/profile";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealtime } from "@/hooks/use-realtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MousePointer, UserPlus, CreditCard, DollarSign, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function UserDashboardComplete() {
  const [currentPage, setCurrentPage] = useState("home");
  const { user, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  // Ativar atualização em tempo real via WebSocket
  useRealtime();

  // Sistema de atualização em tempo real
  useRealtimeData({
    interval: 2000,
    queryKeys: [
      "/api/betting-houses",
      "/api/my-links", 
      "/api/stats/user",
      "/api/user/stats",
      "/api/user/conversions",
      "/api/user/payment-config",
      "/api/user/payments",
      "/api/user/account-status"
    ],
    enabled: true
  });

  const { data: stats = {}, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/stats/user"],
    retry: 1,
    staleTime: 1000,
  });

  const { data: accountStatus = {} } = useQuery({
    queryKey: ["/api/user/account-status"],
    refetchInterval: 5000,
    retry: 1,
  });

  // Estado de carregamento seguro
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

  // Função segura para renderizar stats
  const renderStatsCards = () => {
    const safeStats = {
      totalClicks: stats?.totalClicks || 0,
      totalRegistrations: stats?.totalRegistrations || 0,
      totalDeposits: stats?.totalDeposits || 0,
      totalCommission: stats?.totalCommission || 0,
      conversionRate: stats?.conversionRate || 0,
    };

    const formatCommission = (commission) => {
      if (typeof commission === 'string') {
        const cleanValue = commission.replace(/[^\d.,]/g, '');
        const numValue = parseFloat(cleanValue) || 0;
        return numValue.toFixed(2);
      }
      return (commission || 0).toFixed(2);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  {safeStats.totalRegistrations}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-emerald-500" />
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
                  {safeStats.totalDeposits}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-500" />
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

  // Função para renderizar o status da conta
  const renderAccountStatus = () => {
    const isActive = accountStatus?.isActive !== false;
    
    return (
      <Alert className={`mb-6 ${isActive ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
        <div className="flex items-center">
          {isActive ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={`ml-2 ${isActive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isActive ? 'Conta ativa e funcionando normalmente' : 'Conta inativa - Entre em contato com o suporte'}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  // Componente de boas-vindas
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

  // Renderização da página atual
  const renderCurrentPage = () => {
    try {
      switch (currentPage) {
        case "home":
          return (
            <div className="space-y-6">
              <WelcomeSection />
              {renderAccountStatus()}
              {renderStatsCards()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Casas Disponíveis</h3>
                    <BettingHousesSecure />
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Meus Links</h3>
                    <MyLinks />
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        case "houses":
          return <BettingHousesSecure />;
        case "links":
          return <MyLinks />;
        case "payments":
          return <Payments />;
        case "reports":
          return <Reports />;
        case "support":
          return <Support />;
        case "profile":
          return <Profile />;
        default:
          return (
            <div className="space-y-4 lg:space-y-6">
              <WelcomeSection />
              {renderAccountStatus()}
              <div className="space-y-4 lg:space-y-6">
                {renderStatsCards()}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white">Casas Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {houses.length > 0 ? (
                          houses.map((house) => (
                            <div key={house.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-emerald-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{house.name}</p>
                                <p className="text-slate-400 text-sm">Ativa desde {house.logoUrl ? new Date().toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                Não afiliado
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Building className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">Nenhuma casa disponível</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white">Meus Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {links.length > 0 ? (
                          links.slice(0, 3).map((link) => (
                            <div key={link.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Link className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{link.alias || `Link ${link.id}`}</p>
                                <p className="text-slate-400 text-xs truncate">{link.shortUrl}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Link className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">Nenhum link criado</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error("Page render error:", error);
      return (
        <div className="min-h-96 flex items-center justify-center">
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500 ml-2">
              Erro ao carregar a página. Recarregando...
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  };

  return (
    <div className="mobile-safe bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 no-bounce">
      {/* Sidebar para todas as telas */}
      <UserSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Área principal com responsividade melhorada */}
      <div className={`transition-all duration-300 ${!isMobile ? "ml-72" : ""}`}>
        <UserTopBar onPageChange={setCurrentPage} />
        
        <main className={`safe-area overflow-x-hidden ${isMobile ? "pt-16 px-4 pb-4" : "p-6"}`}>
          <div className="w-full max-w-none">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </div>
  );
}