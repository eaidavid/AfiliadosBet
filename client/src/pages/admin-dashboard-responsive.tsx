import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Eye,
  Calendar,
  Search,
  Filter,
  RefreshCw
} from "lucide-react";

// Interfaces
interface SystemOverview {
  activeAffiliates: number;
  activeHouses: number;
  totalAffiliateLinks: number;
  totalConversions: number;
  totalClicks: number;
  totalPaidCommissions: number;
  pendingCommissions: number;
  totalProfit: number;
}

interface RecentActivity {
  postbacks: RecentPostback[];
  clicks: RecentClick[];
  conversions: RecentConversion[];
}

interface RecentPostback {
  id: number;
  casa: string;
  evento: string;
  valor: number;
  status: string;
  subid: string;
  criadoEm: string;
  ip: string;
}

interface RecentClick {
  id: number;
  username: string;
  houseName: string;
  ipAddress: string;
  userAgent: string;
  clickedAt: string;
}

interface RecentConversion {
  id: number;
  username: string;
  houseName: string;
  type: string;
  amount: number;
  commission: number;
  customerId: string;
  convertedAt: string;
}

interface TopAffiliate {
  id: number;
  username: string;
  fullName: string;
  totalCommission: number;
  totalConversions: number;
  totalLeads: number;
}

interface HousePerformance {
  houseName: string;
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalProfit: number;
  totalCommission: number;
}

interface PostbackSummary {
  casa: string;
  evento: string;
  totalReceived: number;
  lastReceived: string;
}

interface RecentPayment {
  id: number;
  affiliateName: string;
  username: string;
  amount: number;
  status: string;
  method: string;
  pixKey: string;
  transactionId: string;
  paidAt: string;
  createdAt: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sucesso':
      case 'success':
      case 'pago':
        return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Sucesso' };
      case 'erro':
      case 'error':
      case 'falha':
        return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Erro' };
      case 'pendente':
      case 'pending':
        return { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Pendente' };
      default:
        return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: status || 'Desconhecido' };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Badge variant="outline" className={`${config.color} text-xs font-medium border`}>
      {config.label}
    </Badge>
  );
};

export default function AdminDashboardResponsive() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [timeRange, setTimeRange] = useState("7d");

  // Data fetching queries
  const { data: systemOverview, isLoading: isLoadingOverview } = useQuery<SystemOverview>({
    queryKey: ['/api/admin/system-overview'],
    refetchInterval: 30000,
  });

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery<RecentActivity>({
    queryKey: ['/api/admin/recent-activity'],
    refetchInterval: 15000,
  });

  const { data: topAffiliates, isLoading: isLoadingAffiliates } = useQuery<TopAffiliate[]>({
    queryKey: ['/api/admin/top-affiliates'],
    refetchInterval: 30000,
  });

  const { data: housePerformance, isLoading: isLoadingHouses } = useQuery<HousePerformance[]>({
    queryKey: ['/api/admin/house-performance'],
    refetchInterval: 30000,
  });

  const { data: postbackSummary, isLoading: isLoadingPostbacks } = useQuery<PostbackSummary[]>({
    queryKey: ['/api/admin/postback-summary'],
    refetchInterval: 30000,
  });

  const { data: recentPayments, isLoading: isLoadingPayments } = useQuery<RecentPayment[]>({
    queryKey: ['/api/admin/recent-payments'],
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <main className="flex-1 p-4 lg:p-6 lg:ml-64 space-y-6">
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

          {/* Métricas Principais */}
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
                      <p className="text-sm text-slate-400">Afiliados Ativos</p>
                      <p className="text-2xl font-bold text-white">{systemOverview?.activeAffiliates || 0}</p>
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
                      <p className="text-sm text-slate-400">Casas Ativas</p>
                      <p className="text-2xl font-bold text-white">{systemOverview?.activeHouses || 0}</p>
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
                      <p className="text-sm text-slate-400">Total Cliques</p>
                      <p className="text-2xl font-bold text-white">{systemOverview?.totalClicks || 0}</p>
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
                      <p className="text-sm text-slate-400">Conversões</p>
                      <p className="text-2xl font-bold text-white">{systemOverview?.totalConversions || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Métricas Financeiras */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Pago</p>
                    <p className="text-2xl font-bold text-green-400">
                      R$ {(systemOverview?.totalPaidCommissions || 0).toLocaleString()}
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
                    <p className="text-sm text-slate-400">Pendente</p>
                    <p className="text-2xl font-bold text-orange-400">
                      R$ {(systemOverview?.pendingCommissions || 0).toLocaleString()}
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
                    <p className="text-sm text-slate-400">Lucro Total</p>
                    <p className="text-2xl font-bold text-purple-400">
                      R$ {(systemOverview?.totalProfit || 0).toLocaleString()}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Atividade Recente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Últimos Postbacks */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Últimos Postbacks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity?.postbacks?.map((postback) => (
                    <div key={postback.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{postback.casa}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400 text-sm truncate">{postback.evento}</span>
                        </div>
                        <div className="text-sm text-slate-400 truncate">@{postback.subid}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <StatusBadge status={postback.status} />
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(postback.criadoEm).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-400 py-4">
                      Nenhum postback recente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Últimos Cliques */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-green-400" />
                  Últimos Cliques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity?.clicks?.map((click) => (
                    <div key={click.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{click.username}</span>
                        </div>
                        <div className="text-sm text-slate-400 truncate">{click.houseName}</div>
                      </div>
                      <div className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(click.clickedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-400 py-4">
                      Nenhum clique recente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Últimas Conversões */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Últimas Conversões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity?.conversions?.map((conversion) => (
                    <div key={conversion.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{conversion.username}</span>
                        </div>
                        <div className="text-sm text-slate-400 truncate">{conversion.houseName} • {conversion.type}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-emerald-400 font-bold">R$ {(conversion.commission || 0).toLocaleString()}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(conversion.convertedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-400 py-4">
                      Nenhuma conversão recente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Afiliados */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-400" />
                Top Afiliados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-400">#</TableHead>
                      <TableHead className="text-slate-400">Afiliado</TableHead>
                      <TableHead className="text-slate-400 hidden sm:table-cell">Nome Completo</TableHead>
                      <TableHead className="text-slate-400">Comissão Total</TableHead>
                      <TableHead className="text-slate-400 hidden md:table-cell">Conversões</TableHead>
                      <TableHead className="text-slate-400 hidden lg:table-cell">Leads</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topAffiliates?.map((affiliate, index) => (
                      <TableRow key={affiliate.id} className="border-slate-600">
                        <TableCell>
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white">{affiliate.username}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-slate-400">{affiliate.fullName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-400">R$ {affiliate.totalCommission.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-white">{affiliate.totalConversions}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-white">{affiliate.totalLeads}</div>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-4">
                          Nenhum afiliado encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Performance das Casas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Desempenho das Casas de Apostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-400">Casa</TableHead>
                      <TableHead className="text-slate-400 hidden sm:table-cell">Cliques</TableHead>
                      <TableHead className="text-slate-400 hidden md:table-cell">Registros</TableHead>
                      <TableHead className="text-slate-400 hidden lg:table-cell">Depósitos</TableHead>
                      <TableHead className="text-slate-400">Lucro</TableHead>
                      <TableHead className="text-slate-400">Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {housePerformance?.map((house) => (
                      <TableRow key={house.houseName} className="border-slate-600">
                        <TableCell>
                          <div className="font-medium text-white">{house.houseName}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-white">{house.totalClicks.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-white">{house.totalRegistrations.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-white">{house.totalDeposits.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-purple-400">R$ {house.totalProfit.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-400">R$ {house.totalCommission.toLocaleString()}</div>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-4">
                          Nenhuma casa encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}