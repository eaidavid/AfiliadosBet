import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "@/components/admin/sidebar";
import { 
  Users, 
  Building2, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  MousePointer,
  Link as LinkIcon,
  Target,
  Wallet,
  Timer,
  Award,
  Download,
  Menu
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

// Interfaces para o novo dashboard
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
    switch (status.toLowerCase()) {
      case 'sucesso':
      case 'success':
      case 'paid':
        return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle };
      case 'erro':
      case 'error':
      case 'failed':
        return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle };
      case 'pending':
      case 'pendente':
        return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock };
      default:
        return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertCircle };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.color} border text-xs flex items-center gap-1`}>
      <IconComponent className="h-3 w-3" />
      {status}
    </Badge>
  );
};

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dados do sistema
  const { data: systemOverview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<SystemOverview>({
    queryKey: ['/api/admin/dashboard/overview'],
    refetchInterval: 30000,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<RecentActivity>({
    queryKey: ['/api/admin/dashboard/recent-activity'],
    refetchInterval: 10000,
  });

  const { data: topAffiliates, isLoading: affiliatesLoading } = useQuery<TopAffiliate[]>({
    queryKey: ['/api/admin/dashboard/top-affiliates'],
    refetchInterval: 30000,
  });

  const { data: housePerformance, isLoading: houseLoading } = useQuery<HousePerformance[]>({
    queryKey: ['/api/admin/dashboard/house-performance'],
    refetchInterval: 30000,
  });

  const { data: postbackSummary, isLoading: postbackSummaryLoading } = useQuery<PostbackSummary[]>({
    queryKey: ['/api/admin/dashboard/postback-summary'],
    refetchInterval: 30000,
  });

  const { data: recentPayments, isLoading: paymentsLoading } = useQuery<RecentPayment[]>({
    queryKey: ['/api/admin/dashboard/recent-payments'],
    refetchInterval: 30000,
  });

  const refreshData = () => {
    refetchOverview();
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === "leads") {
      window.location.href = "/admin/leads";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-72">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 p-4 pl-16">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-slate-900/30 backdrop-blur-sm border-b border-slate-700/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Dashboard Administrativo
              </h1>
              <p className="text-slate-400 mt-2">Visão geral completa do sistema de afiliados</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* 1. RESUMO GERAL DO SISTEMA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Resumo Geral do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {systemOverview?.activeAffiliates || 0}
                  </div>
                  <div className="text-sm text-slate-400">Afiliados Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {systemOverview?.activeHouses || 0}
                  </div>
                  <div className="text-sm text-slate-400">Casas de Apostas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {systemOverview?.totalAffiliateLinks || 0}
                  </div>
                  <div className="text-sm text-slate-400">Links de Afiliados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {systemOverview?.totalConversions || 0}
                  </div>
                  <div className="text-sm text-slate-400">Total de Conversões</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {systemOverview?.totalClicks || 0}
                  </div>
                  <div className="text-sm text-slate-400">Total de Cliques</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    R$ {(systemOverview?.totalPaidCommissions || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Total Pago</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    R$ {(systemOverview?.pendingCommissions || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Comissões Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    R$ {(systemOverview?.totalProfit || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Lucro Gerado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. ATIVIDADE RECENTE EM TEMPO REAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimos Postbacks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{postback.casa}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400 text-sm">{postback.evento}</span>
                        </div>
                        <div className="text-sm text-slate-400">@{postback.subid}</div>
                      </div>
                      <div className="text-right">
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
          </motion.div>

          {/* Últimos Cliques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-slate-700 ">
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
                      <div>
                        <div className="text-white font-medium">@{click.username}</div>
                        <div className="text-sm text-slate-400">{click.houseName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          {new Date(click.clickedAt).toLocaleTimeString()}
                        </div>
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
          </motion.div>

          {/* Últimas Conversões */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800 border-slate-700 ">
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
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">@{conversion.username}</span>
                          <Badge variant="outline" className="text-xs">{conversion.type}</Badge>
                        </div>
                        <div className="text-sm text-slate-400">{conversion.houseName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">R$ {conversion.commission.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(conversion.convertedAt).toLocaleTimeString()}
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
          </motion.div>
        </div>

        {/* 3. RANKING DOS MELHORES AFILIADOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800 border-slate-700 ">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-400" />
                Top 10 Afiliados por Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-slate-400">Posição</TableHead>
                    <TableHead className="text-slate-400">Afiliado</TableHead>
                    <TableHead className="text-slate-400">Total Comissão</TableHead>
                    <TableHead className="text-slate-400">Conversões</TableHead>
                    <TableHead className="text-slate-400">Leads</TableHead>
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
                        <div>
                          <div className="text-white font-medium">{affiliate.fullName}</div>
                          <div className="text-slate-400 text-sm">@{affiliate.username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-emerald-400 font-bold">
                        R$ {affiliate.totalCommission.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-white">{affiliate.totalConversions}</TableCell>
                      <TableCell className="text-white">{affiliate.totalLeads}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-4">
                        Nenhum afiliado encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. DESEMPENHO DAS CASAS DE APOSTAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800 border-slate-700 ">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Desempenho das Casas de Apostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-slate-400">Casa</TableHead>
                    <TableHead className="text-slate-400">Cliques</TableHead>
                    <TableHead className="text-slate-400">Registros</TableHead>
                    <TableHead className="text-slate-400">Depósitos</TableHead>
                    <TableHead className="text-slate-400">Lucro Gerado</TableHead>
                    <TableHead className="text-slate-400">Comissão Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {housePerformance?.map((house) => (
                    <TableRow key={house.houseName} className="border-slate-600">
                      <TableCell className="text-white font-medium">{house.houseName}</TableCell>
                      <TableCell className="text-white">{house.totalClicks}</TableCell>
                      <TableCell className="text-white">{house.totalRegistrations}</TableCell>
                      <TableCell className="text-white">{house.totalDeposits}</TableCell>
                      <TableCell className="text-blue-400 font-bold">
                        R$ {house.totalProfit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-emerald-400 font-bold">
                        R$ {house.totalCommission.toLocaleString()}
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
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. RESUMO DE EVENTOS POR CASA (POSTBACKS) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-800 border-slate-700 ">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-green-400" />
                Resumo de Eventos por Casa (Postbacks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-slate-400">Casa</TableHead>
                    <TableHead className="text-slate-400">Evento</TableHead>
                    <TableHead className="text-slate-400">Total Recebido</TableHead>
                    <TableHead className="text-slate-400">Último Recebido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postbackSummary?.map((summary, index) => (
                    <TableRow key={index} className="border-slate-600">
                      <TableCell className="text-white font-medium">{summary.casa}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{summary.evento}</Badge>
                      </TableCell>
                      <TableCell className="text-white">{summary.totalReceived}</TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(summary.lastReceived).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-4">
                        Nenhum postback encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* 6. PAGAMENTOS RECENTES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-slate-800 border-slate-700 ">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-orange-400" />
                Pagamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-slate-400">Afiliado</TableHead>
                    <TableHead className="text-slate-400">Valor</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Método</TableHead>
                    <TableHead className="text-slate-400">Chave Pix</TableHead>
                    <TableHead className="text-slate-400">Transação</TableHead>
                    <TableHead className="text-slate-400">Pago em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments?.map((payment) => (
                    <TableRow key={payment.id} className="border-slate-600">
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{payment.affiliateName}</div>
                          <div className="text-slate-400 text-sm">@{payment.username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-emerald-400 font-bold">
                        R$ {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="text-white">{payment.method}</TableCell>
                      <TableCell className="text-slate-400">{payment.pixKey || '-'}</TableCell>
                      <TableCell className="text-slate-400">{payment.transactionId || '-'}</TableCell>
                      <TableCell className="text-slate-400">
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-400 py-4">
                        Nenhum pagamento encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </div>
  );
}