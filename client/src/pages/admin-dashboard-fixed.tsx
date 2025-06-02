import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, TrendingUp, DollarSign, Activity, Target } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHousesManagement from "@/components/admin/houses-management";
import AffiliatesManagementFixed from "@/components/admin/affiliates-management-fixed";
import LinksManagement from "@/components/admin/links-management";
import PostbackLogs from "@/components/admin/postback-logs";
import SimplePostbackForm from "@/components/admin/simple-postback-form";
import PostbackGenerator from "@/components/admin/postback-generator";
import ReportsManagementReal from "@/components/admin/reports-management-real";
import CommissionsManagement from "@/components/admin/commissions-management";
import ErrorBoundary from "@/components/error-boundary";
import LoadingScreen from "@/components/loading-screen";

interface AdminDashboardProps {
  onPageChange?: (page: string) => void;
}

export default function AdminDashboardFixed({ onPageChange }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState("overview");

  // Queries com tratamento seguro de dados
  const { data: overviewData = {}, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/admin/overview"],
    retry: false,
  });

  const { data: affiliatesData = [], isLoading: affiliatesLoading } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    retry: false,
  });

  const { data: housesData = [], isLoading: housesLoading } = useQuery({
    queryKey: ["/api/admin/houses"],
    retry: false,
  });

  // Dados seguros com fallbacks
  const safeOverviewData = overviewData || {};
  const safeAffiliatesData = Array.isArray(affiliatesData) ? affiliatesData : [];
  const safeHousesData = Array.isArray(housesData) ? housesData : [];

  // Estados de carregamento
  const isLoading = overviewLoading || affiliatesLoading || housesLoading;

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue || 0);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "houses":
        return (
          <ErrorBoundary>
            <AdminHousesManagement onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      case "affiliates":
        return (
          <ErrorBoundary>
            <AffiliatesManagementFixed onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      case "links":
        return (
          <ErrorBoundary>
            <LinksManagement onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      case "postback-generator":
        return (
          <ErrorBoundary>
            <PostbackGenerator onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      case "reports":
        return (
          <ErrorBoundary>
            <ReportsManagementReal onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      case "commissions":
        return (
          <ErrorBoundary>
            <CommissionsManagement onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      case "postback-logs":
        return (
          <ErrorBoundary>
            <PostbackLogs onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      case "postback-form":
        return (
          <ErrorBoundary>
            <SimplePostbackForm onPageChange={setCurrentPage} />
          </ErrorBoundary>
        );
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    if (isLoading) {
      return <LoadingScreen message="Carregando painel administrativo..." />;
    }

    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Painel Administrativo
            </h1>
            <p className="text-slate-400">
              Visão geral do sistema de afiliados
            </p>
          </div>

          {/* Cards de Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-blue-400">Casas Ativas</h3>
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {safeHousesData.filter((house: any) => house?.isActive !== false).length || 0}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  {safeHousesData.length || 0} total
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-green-400">Afiliados</h3>
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {safeAffiliatesData.length || 0}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  {safeAffiliatesData.filter((affiliate: any) => affiliate?.isActive !== false).length || 0} ativos
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-purple-400">Volume Total</h3>
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(safeOverviewData.totalVolume || 0)}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  Este mês
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-emerald-400">Comissões Pagas</h3>
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(safeOverviewData.paidCommissions || 0)}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  Pagos
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards de Métricas Secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-300">Comissões Pendentes</h3>
                  <Activity className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(safeOverviewData.pendingCommissions || 0)}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  Aguardando pagamento
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-300">Taxa de Conversão</h3>
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {safeOverviewData.conversionRate || '0'}%
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  Média geral
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Afiliados */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Afiliados</CardTitle>
              <CardDescription className="text-slate-400">
                Afiliados com melhor performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeAffiliatesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nenhum afiliado encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeAffiliatesData.slice(0, 5).map((affiliate: any, index: number) => (
                    <div key={affiliate?.id || index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(affiliate?.username || affiliate?.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{affiliate?.fullName || affiliate?.username || 'Sem nome'}</p>
                          <p className="text-slate-400 text-sm">{affiliate?.email || 'Sem email'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">{formatCurrency(affiliate?.totalCommissions || 0)}</p>
                        <Badge variant={affiliate?.isActive ? 'default' : 'secondary'}>
                          {affiliate?.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Casas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Casas de Apostas</CardTitle>
              <CardDescription className="text-slate-400">
                Casas com maior volume de conversões
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeHousesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nenhuma casa encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeHousesData.slice(0, 5).map((house: any, index: number) => (
                    <div key={house?.id || index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(house?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{house?.name || 'Casa sem nome'}</p>
                          <p className="text-slate-400 text-sm">{house?.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold">{house?.totalConversions || 0} conversões</p>
                        <Badge variant={house?.isActive ? 'default' : 'secondary'}>
                          {house?.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
              <CardDescription className="text-slate-400">
                Acesso rápido às funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setCurrentPage("affiliates")}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Gerenciar Afiliados
                </Button>
                <Button 
                  onClick={() => setCurrentPage("houses")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Gerenciar Casas
                </Button>
                <Button 
                  onClick={() => setCurrentPage("reports")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Relatórios
                </Button>
                <Button 
                  onClick={() => setCurrentPage("commissions")}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Comissões
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    );
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando painel administrativo..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 flex">
        <AdminSidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
        
        <div className="flex-1 ml-64">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}