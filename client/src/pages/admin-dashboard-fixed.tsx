import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSidebar } from "@/components/admin/sidebar";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  MousePointer,
  Award,
  RefreshCw
} from "lucide-react";

interface Affiliate {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommissions: string;
  houses: string[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
      case 'active':
        return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Ativo' };
      case 'inativo':
      case 'inactive':
        return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Inativo' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Indefinido' };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Badge variant="outline" className={`${config.color} text-xs font-medium border`}>
      {config.label}
    </Badge>
  );
};

export default function AdminDashboardFixed() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [timeRange, setTimeRange] = useState("7d");

  // Buscar dados reais do banco
  const { data: systemStats, isLoading: isLoadingStats } = useQuery<any>({
    queryKey: ['/api/stats/admin'],
    refetchInterval: 30000,
  });

  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useQuery<Affiliate[]>({
    queryKey: ['/api/admin/affiliates'],
    refetchInterval: 30000,
  });

  const { data: bettingHouses = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/betting-houses'],
    refetchInterval: 30000,
  });

  // Cálculos baseados em dados reais
  const activeAffiliates = Array.isArray(affiliates) ? affiliates.filter(a => a.isActive).length : 0;
  const totalCommissions = Array.isArray(affiliates) ? affiliates.reduce((sum, a) => sum + parseFloat(a.totalCommissions || '0'), 0) : 0;
  const recentAffiliates = Array.isArray(affiliates) ? affiliates.slice(0, 8) : [];

  // Debug para verificar dados
  console.log('🔍 Debug Dashboard - Affiliates:', affiliates);
  console.log('🔍 Debug Dashboard - Betting Houses:', bettingHouses);
  console.log('🔍 Debug Dashboard - System Stats:', systemStats);

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="ml-64 p-4 lg:p-6">
        
        <main className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Administrativo</h1>
              <p className="text-slate-400 mt-1">Visão geral do sistema em tempo real</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Métricas Principais - Dados Reais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Afiliados</p>
                      <p className="text-2xl font-bold text-white">{affiliates.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Afiliados Ativos</p>
                      <p className="text-2xl font-bold text-white">{activeAffiliates}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Casas Cadastradas</p>
                      <p className="text-2xl font-bold text-white">{bettingHouses.length}</p>
                    </div>
                    <MousePointer className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Conversões</p>
                      <p className="text-2xl font-bold text-white">{systemStats?.totalConversions || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Métricas Financeiras - Dados Reais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Volume</p>
                    <p className="text-2xl font-bold text-green-400">
                      R$ {systemStats?.totalVolume || '0,00'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Comissões</p>
                    <p className="text-2xl font-bold text-orange-400">
                      R$ {totalCommissions.toFixed(2)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Links</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {systemStats?.totalLinks || 0}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Afiliados - Dados Reais */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Afiliados do Sistema ({affiliates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAffiliates ? (
                <div className="text-center text-slate-400 py-8">
                  Carregando afiliados...
                </div>
              ) : recentAffiliates.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum afiliado encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Nome</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Cliques</TableHead>
                        <TableHead className="text-slate-300">Registros</TableHead>
                        <TableHead className="text-slate-300">Depósitos</TableHead>
                        <TableHead className="text-slate-300">Comissão</TableHead>
                        <TableHead className="text-slate-300">Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAffiliates.map((affiliate) => (
                        <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="text-slate-200 font-medium">
                            {affiliate.fullName}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.email}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={affiliate.isActive ? 'ativo' : 'inativo'} />
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.totalClicks}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.totalRegistrations}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.totalDeposits}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            R$ {affiliate.totalCommissions}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(affiliate.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas do Sistema */}
          {systemStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    Resumo Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total de Afiliados:</span>
                    <span className="text-white font-bold">{systemStats.totalAffiliates || affiliates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Casas Ativas:</span>
                    <span className="text-white font-bold">{systemStats.totalHouses || bettingHouses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Links Gerados:</span>
                    <span className="text-white font-bold">{systemStats.totalLinks || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Conversões:</span>
                    <span className="text-white font-bold">{systemStats.totalConversions || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Dados Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Volume Total:</span>
                    <span className="text-green-400 font-bold">R$ {systemStats.totalVolume || '0,00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Comissões Pagas:</span>
                    <span className="text-green-400 font-bold">R$ {systemStats.totalCommissions || '0,00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Afiliados Ativos:</span>
                    <span className="text-blue-400 font-bold">{activeAffiliates} de {affiliates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Taxa de Atividade:</span>
                    <span className="text-purple-400 font-bold">
                      {affiliates.length > 0 ? ((activeAffiliates / affiliates.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}