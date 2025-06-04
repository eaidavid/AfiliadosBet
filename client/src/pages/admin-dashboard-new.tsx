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
      <div className="flex-1 lg:ml-72">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-slate-900/30 backdrop-blur-sm border-b border-slate-700/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Admin</h1>
              <p className="text-slate-400 mt-1">Visão geral completa do sistema de afiliados</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 border-0 hover:opacity-90 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
        {/* 1. RESUMO GERAL DO SISTEMA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-[#00C39A]" />
                Resumo Geral do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00C39A]">
                    {systemOverview?.activeAffiliates || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Afiliados Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#3B82F6]">
                    {systemOverview?.activeHouses || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Casas de Apostas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8B5CF6]">
                    {systemOverview?.totalAffiliateLinks || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Links de Afiliados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F59E0B]">
                    {systemOverview?.totalConversions || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Total de Conversões</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#334155]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10B981]">
                    {systemOverview?.totalClicks || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Total de Cliques</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00C39A]">
                    R$ {(systemOverview?.totalPaidCommissions || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Total Pago</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F59E0B]">
                    R$ {(systemOverview?.pendingCommissions || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Comissões Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8B5CF6]">
                    R$ {(systemOverview?.totalProfit || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Lucro Gerado</div>
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
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#3B82F6]" />
                  Últimos Postbacks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity?.postbacks?.map((postback) => (
                    <div key={postback.id} className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{postback.casa}</span>
                          <span className="text-[#94A3B8]">•</span>
                          <span className="text-[#94A3B8] text-sm">{postback.evento}</span>
                        </div>
                        <div className="text-sm text-[#94A3B8]">@{postback.subid}</div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={postback.status} />
                        <div className="text-xs text-[#94A3B8] mt-1">
                          {new Date(postback.criadoEm).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-[#94A3B8] py-4">
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
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-[#10B981]" />
                  Últimos Cliques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity?.clicks?.map((click) => (
                    <div key={click.id} className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">@{click.username}</div>
                        <div className="text-sm text-[#94A3B8]">{click.houseName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#94A3B8]">
                          {new Date(click.clickedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-[#94A3B8] py-4">
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
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#00C39A]" />
                  Últimas Conversões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity?.conversions?.map((conversion) => (
                    <div key={conversion.id} className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">@{conversion.username}</span>
                          <Badge variant="outline" className="text-xs">{conversion.type}</Badge>
                        </div>
                        <div className="text-sm text-[#94A3B8]">{conversion.houseName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#00C39A] font-bold">R$ {conversion.commission.toLocaleString()}</div>
                        <div className="text-xs text-[#94A3B8]">
                          {new Date(conversion.convertedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-[#94A3B8] py-4">
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
          <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#F59E0B]" />
                Top 10 Afiliados por Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#334155]">
                    <TableHead className="text-[#94A3B8]">Posição</TableHead>
                    <TableHead className="text-[#94A3B8]">Afiliado</TableHead>
                    <TableHead className="text-[#94A3B8]">Total Comissão</TableHead>
                    <TableHead className="text-[#94A3B8]">Conversões</TableHead>
                    <TableHead className="text-[#94A3B8]">Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAffiliates?.map((affiliate, index) => (
                    <TableRow key={affiliate.id} className="border-[#334155]">
                      <TableCell>
                        <div className="w-8 h-8 bg-gradient-to-br from-[#00C39A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{affiliate.fullName}</div>
                          <div className="text-[#94A3B8] text-sm">@{affiliate.username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#00C39A] font-bold">
                        R$ {affiliate.totalCommission.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-white">{affiliate.totalConversions}</TableCell>
                      <TableCell className="text-white">{affiliate.totalLeads}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[#94A3B8] py-4">
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
          <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#8B5CF6]" />
                Desempenho das Casas de Apostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#334155]">
                    <TableHead className="text-[#94A3B8]">Casa</TableHead>
                    <TableHead className="text-[#94A3B8]">Cliques</TableHead>
                    <TableHead className="text-[#94A3B8]">Registros</TableHead>
                    <TableHead className="text-[#94A3B8]">Depósitos</TableHead>
                    <TableHead className="text-[#94A3B8]">Lucro Gerado</TableHead>
                    <TableHead className="text-[#94A3B8]">Comissão Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {housePerformance?.map((house) => (
                    <TableRow key={house.houseName} className="border-[#334155]">
                      <TableCell className="text-white font-medium">{house.houseName}</TableCell>
                      <TableCell className="text-white">{house.totalClicks}</TableCell>
                      <TableCell className="text-white">{house.totalRegistrations}</TableCell>
                      <TableCell className="text-white">{house.totalDeposits}</TableCell>
                      <TableCell className="text-[#3B82F6] font-bold">
                        R$ {house.totalProfit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[#00C39A] font-bold">
                        R$ {house.totalCommission.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-[#94A3B8] py-4">
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
          <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-[#10B981]" />
                Resumo de Eventos por Casa (Postbacks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#334155]">
                    <TableHead className="text-[#94A3B8]">Casa</TableHead>
                    <TableHead className="text-[#94A3B8]">Evento</TableHead>
                    <TableHead className="text-[#94A3B8]">Total Recebido</TableHead>
                    <TableHead className="text-[#94A3B8]">Último Recebido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postbackSummary?.map((summary, index) => (
                    <TableRow key={index} className="border-[#334155]">
                      <TableCell className="text-white font-medium">{summary.casa}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{summary.evento}</Badge>
                      </TableCell>
                      <TableCell className="text-white">{summary.totalReceived}</TableCell>
                      <TableCell className="text-[#94A3B8]">
                        {new Date(summary.lastReceived).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-[#94A3B8] py-4">
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
          <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#F59E0B]" />
                Pagamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#334155]">
                    <TableHead className="text-[#94A3B8]">Afiliado</TableHead>
                    <TableHead className="text-[#94A3B8]">Valor</TableHead>
                    <TableHead className="text-[#94A3B8]">Status</TableHead>
                    <TableHead className="text-[#94A3B8]">Método</TableHead>
                    <TableHead className="text-[#94A3B8]">Chave Pix</TableHead>
                    <TableHead className="text-[#94A3B8]">Transação</TableHead>
                    <TableHead className="text-[#94A3B8]">Pago em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments?.map((payment) => (
                    <TableRow key={payment.id} className="border-[#334155]">
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{payment.affiliateName}</div>
                          <div className="text-[#94A3B8] text-sm">@{payment.username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#00C39A] font-bold">
                        R$ {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="text-white">{payment.method}</TableCell>
                      <TableCell className="text-[#94A3B8]">{payment.pixKey || '-'}</TableCell>
                      <TableCell className="text-[#94A3B8]">{payment.transactionId || '-'}</TableCell>
                      <TableCell className="text-[#94A3B8]">
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-[#94A3B8] py-4">
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