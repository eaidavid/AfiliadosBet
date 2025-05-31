import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MousePointer, UserPlus, CreditCard, DollarSign } from "lucide-react";

export default function UserDashboardSimple() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalRegistrations: 0,
    totalDeposits: 0,
    totalCommission: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/user", {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.log("Stats error:", error);
        // Continua com valores padrão
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Bem-vindo, {user.fullName?.split(" ")[0] || user.username}! 👋
        </h1>
        <p className="text-slate-400">
          Acompanhe seu progresso e maximize seus ganhos como afiliado.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total de Cliques</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.totalClicks?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Registros</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.totalRegistrations || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Depósitos</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.totalDeposits || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Comissão Total</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  R$ {typeof stats.totalCommission === 'string' 
                    ? parseFloat(stats.totalCommission.replace(/[^\d.,]/g, '')).toFixed(2) || "0.00"
                    : (stats.totalCommission || 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = "/dashboard"}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500"
            >
              Acessar Dashboard Completo
            </Button>
            <Button
              onClick={() => window.location.href = "/admin"}
              className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-500"
            >
              Painel Administrativo
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              Página Inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}