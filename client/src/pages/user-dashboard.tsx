import { useState } from "react";
import UserSidebar from "@/components/user/sidebar";
import UserTopBar from "@/components/user/topbar";
import BettingHouses from "@/components/user/betting-houses";
import MyLinks from "@/components/user/my-links";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MousePointer, UserPlus, CreditCard, DollarSign } from "lucide-react";

export default function UserDashboard() {
  const [currentPage, setCurrentPage] = useState("home");
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/user"],
  });

  const renderContent = () => {
    switch (currentPage) {
      case "houses":
        return <BettingHouses />;
      case "links":
        return <MyLinks />;
      case "dashboard":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard Detalhado</h1>
            <p className="text-slate-400">Análise completa do seu desempenho como afiliado.</p>
            {/* Add detailed dashboard content here */}
          </div>
        );
      case "payments":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Pagamentos</h1>
            <p className="text-slate-400">Configure sua forma de recebimento e acompanhe o histórico.</p>
            {/* Add payments content here */}
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Relatórios</h1>
            <p className="text-slate-400">Relatórios detalhados por período e casa de apostas.</p>
            {/* Add reports content here */}
          </div>
        );
      case "support":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Suporte</h1>
            <p className="text-slate-400">Entre em contato conosco para tirar suas dúvidas.</p>
            {/* Add support content here */}
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
            <p className="text-slate-400">Gerencie suas informações pessoais e configurações.</p>
            {/* Add profile content here */}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Bem-vindo, {user?.fullName?.split(" ")[0]}! 👋
                </h1>
                <p className="text-slate-400">
                  Acompanhe seu progresso e maximize seus ganhos como afiliado.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total de Cliques</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {stats?.totalClicks?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <MousePointer className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <span className="text-emerald-500 text-sm font-medium">+12.5%</span>
                    <span className="text-slate-400 text-sm ml-2">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Registros</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {stats?.totalRegistrations || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <span className="text-emerald-500 text-sm font-medium">+8.2%</span>
                    <span className="text-slate-400 text-sm ml-2">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Depósitos</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {stats?.totalDeposits || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <span className="text-emerald-500 text-sm font-medium">+15.7%</span>
                    <span className="text-slate-400 text-sm ml-2">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Comissão Total</p>
                      <p className="text-2xl font-bold text-emerald-500 mt-1">
                        R$ {stats?.totalCommission?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <span className="text-emerald-500 text-sm font-medium">+22.3%</span>
                    <span className="text-slate-400 text-sm ml-2">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setCurrentPage("houses")}
                    className="flex items-center justify-center space-x-3 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors"
                  >
                    <span className="text-emerald-500 font-medium">Afiliar-se a Nova Casa</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage("links")}
                    className="flex items-center justify-center space-x-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors"
                  >
                    <span className="text-blue-500 font-medium">Ver Meus Links</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage("reports")}
                    className="flex items-center justify-center space-x-3 p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl transition-colors"
                  >
                    <span className="text-yellow-500 font-medium">Relatórios Detalhados</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <UserSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="ml-72">
        <UserTopBar />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
