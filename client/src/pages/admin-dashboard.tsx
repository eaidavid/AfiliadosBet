import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
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
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
  activeAffiliates: number;
  activeHouses: number;
  postbacksToday: number;
  totalPaidThisMonth: number;
}

interface ConversionByType {
  type: string;
  count: number;
  totalAmount: number;
  totalCommission: number;
}

interface ConversionEvolution {
  date: string;
  count: number;
  totalCommission: number;
}

interface TopAffiliate {
  id: number;
  username: string;
  fullName: string;
  email: string;
  totalConversions: number;
  totalCommission: number;
}

interface RecentPostback {
  id: number;
  casa: string;
  evento: string;
  subid: string;
  valor: number;
  status: string;
  criadoEm: string;
  ip: string;
}

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="text-2xl sm:text-3xl font-bold text-white">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

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
      case 'processando':
      case 'processing':
      case 'pending':
        return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle };
      default:
        return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

export default function AdminDashboard() {
  const [dateFilter, setDateFilter] = useState("30d");

  // Queries para buscar dados da API
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const { data: conversionsByType, isLoading: conversionsByTypeLoading } = useQuery<ConversionByType[]>({
    queryKey: ['/api/admin/dashboard/conversions-by-type'],
    refetchInterval: 60000,
  });

  const { data: conversionsEvolution, isLoading: evolutionLoading } = useQuery<ConversionEvolution[]>({
    queryKey: ['/api/admin/dashboard/conversions-evolution'],
    refetchInterval: 60000,
  });

  const { data: topAffiliates, isLoading: affiliatesLoading } = useQuery<TopAffiliate[]>({
    queryKey: ['/api/admin/dashboard/top-affiliates'],
    refetchInterval: 60000,
  });

  const { data: recentPostbacks, isLoading: postbacksLoading, refetch: refetchPostbacks } = useQuery<RecentPostback[]>({
    queryKey: ['/api/admin/dashboard/recent-postbacks'],
    refetchInterval: 15000, // Atualizar a cada 15 segundos
  });

  // Cores para os gráficos
  const chartColors = ['#00C39A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="bg-[#1C1F26] border-b border-[#1E293B] p-4 sm:p-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Administrativo</h1>
            <p className="text-[#94A3B8] mt-1">AfiliadosBet - Painel de Controle</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#94A3B8]" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px] bg-[#1E293B] border-[#334155] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="1y">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                refetchStats();
                refetchPostbacks();
              }}
              className="bg-gradient-to-r from-[#00C39A] to-[#3B82F6] border-0 hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Afiliados Ativos</p>
                    {statsLoading ? (
                      <div className="h-8 bg-[#334155] rounded animate-pulse mt-2"></div>
                    ) : (
                      <AnimatedNumber value={stats?.activeAffiliates || 0} />
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#00C39A]/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#00C39A]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Casas Ativas</p>
                    {statsLoading ? (
                      <div className="h-8 bg-[#334155] rounded animate-pulse mt-2"></div>
                    ) : (
                      <AnimatedNumber value={stats?.activeHouses || 0} />
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Postbacks Hoje</p>
                    {statsLoading ? (
                      <div className="h-8 bg-[#334155] rounded animate-pulse mt-2"></div>
                    ) : (
                      <AnimatedNumber value={stats?.postbacksToday || 0} />
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Total Pago (Mês)</p>
                    {statsLoading ? (
                      <div className="h-8 bg-[#334155] rounded animate-pulse mt-2"></div>
                    ) : (
                      <AnimatedNumber 
                        value={stats?.totalPaidThisMonth || 0} 
                        prefix="R$ " 
                      />
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-[#10B981]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Conversões por Tipo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#00C39A]" />
                  Conversões por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversionsByTypeLoading ? (
                  <div className="h-64 bg-[#334155] rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={conversionsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="type" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Bar dataKey="count" fill="#00C39A" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de Linha - Evolução de Conversões */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#3B82F6]" />
                  Evolução de Conversões (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evolutionLoading ? (
                  <div className="h-64 bg-[#334155] rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={conversionsEvolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Seções Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Afiliados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#F59E0B]" />
                  Top 5 Afiliados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {affiliatesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-[#334155] rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topAffiliates?.map((affiliate, index) => (
                      <div key={affiliate.id} className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-lg border border-[#334155]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#00C39A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{affiliate.fullName}</p>
                            <p className="text-[#94A3B8] text-sm">@{affiliate.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#00C39A] font-bold">R$ {affiliate.totalCommission.toLocaleString()}</p>
                          <p className="text-[#94A3B8] text-sm">{affiliate.totalConversions} conversões</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Postbacks Recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#8B5CF6]" />
                  Postbacks Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postbacksLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-[#334155] rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {recentPostbacks?.map((postback) => (
                      <div key={postback.id} className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-lg border border-[#334155]">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{postback.casa}</span>
                            <span className="text-[#94A3B8]">•</span>
                            <span className="text-[#94A3B8] text-sm">{postback.evento}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-[#94A3B8]">@{postback.subid}</span>
                            {postback.valor > 0 && (
                              <>
                                <span className="text-[#94A3B8]">•</span>
                                <span className="text-[#00C39A]">R$ {postback.valor.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={postback.status} />
                          <span className="text-[#94A3B8] text-xs">
                            {new Date(postback.criadoEm).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}