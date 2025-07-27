import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CenteredLayout from "@/components/centered-layout";
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
        return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Ativo' };
      case 'inativo':
      case 'inactive':
        return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Inativo' };
      default:
        return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Indefinido' };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Badge variant="outline" className={`${config.color} text-xs font-medium border`}>
      {config.label}
    </Badge>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, description }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-medium">{trend}</span>
              </div>
            )}
          </div>
          <div className="bg-emerald-600/20 p-3 rounded-full">
            <Icon className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        {description && (
          <p className="text-slate-500 text-xs mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

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

  const stats = systemStats || {
    totalAffiliates: 0,
    totalActiveAffiliates: 0,
    totalBettingHouses: 0,
    totalClicks: 0,
    totalRegistrations: 0,
    totalCommissions: '0.00',
    dailyStats: []
  };

  const recentAffiliates = affiliates.slice(0, 5);

  if (isLoadingStats) {
    return (
      <CenteredLayout>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-slate-300">Carregando dashboard...</p>
        </div>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
            <p className="text-slate-400">Visão geral da plataforma AfiliadosBet</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Afiliados"
            value={stats.totalAffiliates?.toLocaleString() || '0'}
            icon={Users}
            trend="+12%"
            description="Usuários registrados"
          />
          <StatCard
            title="Afiliados Ativos"
            value={stats.totalActiveAffiliates?.toLocaleString() || '0'}
            icon={Activity}
            trend="+8%"
            description="Ativos este mês"
          />
          <StatCard
            title="Casas de Apostas"
            value={bettingHouses.length?.toLocaleString() || '0'}
            icon={Building2}
            description="Parceiros ativos"
          />
          <StatCard
            title="Comissões Totais"
            value={`R$ ${stats.totalCommissions || '0,00'}`}
            icon={DollarSign}
            trend="+22%"
            description="Valor acumulado"
          />
        </div>

        {/* Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total de Cliques"
            value={stats.totalClicks?.toLocaleString() || '0'}
            icon={MousePointer}
            trend="+15%"
            description="Cliques em links"
          />
          <StatCard
            title="Registros"
            value={stats.totalRegistrations?.toLocaleString() || '0'}
            icon={Award}
            trend="+18%"
            description="Conversões realizadas"
          />
          <StatCard
            title="Taxa de Conversão"
            value={stats.totalClicks > 0 ? `${((stats.totalRegistrations / stats.totalClicks) * 100).toFixed(2)}%` : '0%'}
            icon={BarChart3}
            trend="+3%"
            description="Cliques para registros"
          />
        </div>

        {/* Recent Affiliates */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <span>Afiliados Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAffiliates ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
              </div>
            ) : recentAffiliates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Cliques</TableHead>
                    <TableHead className="text-slate-300">Comissões</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAffiliates.map((affiliate) => (
                    <TableRow key={affiliate.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {affiliate.fullName || affiliate.username}
                      </TableCell>
                      <TableCell className="text-slate-300">{affiliate.email}</TableCell>
                      <TableCell>
                        <StatusBadge status={affiliate.isActive ? 'ativo' : 'inativo'} />
                      </TableCell>
                      <TableCell className="text-slate-300">{affiliate.totalClicks}</TableCell>
                      <TableCell className="text-emerald-400 font-medium">
                        R$ {affiliate.totalCommissions || '0,00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum afiliado encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CenteredLayout>
  );
}