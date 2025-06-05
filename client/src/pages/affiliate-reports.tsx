import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  TrendingUp, 
  MousePointer, 
  DollarSign, 
  Building2, 
  Calendar,
  Filter,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie } from 'recharts';

interface AnalyticsData {
  totalClicks: number;
  totalConversions: number;
  totalCommission: string;
  activeHouses: number;
  conversionsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  performanceByHouse: Array<{
    houseName: string;
    conversions: number;
    commission: string;
    clicks: number;
  }>;
  recentConversions: Array<{
    id: number;
    houseName: string;
    type: string;
    amount: string;
    commission: string;
    customerId: string | null;
    convertedAt: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const CONVERSION_ICONS = {
  click: '💥',
  registration: '✍️',
  deposit: '💰',
  profit: '📊'
};

const CONVERSION_LABELS = {
  click: 'Cliques',
  registration: 'Registros',
  deposit: 'Depósitos',
  profit: 'Lucros'
};

export default function AffiliateReports() {
  const [period, setPeriod] = useState('7');
  const [conversionFilter, setConversionFilter] = useState('all');
  const [houseFilter, setHouseFilter] = useState('all');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/affiliate/analytics', period, conversionFilter, houseFilter],
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-slate-800 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-slate-800 rounded-lg"></div>
                <div className="h-80 bg-slate-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const isEmpty = !analyticsData || (
    analyticsData.totalClicks === 0 && 
    analyticsData.totalConversions === 0 && 
    parseFloat(analyticsData.totalCommission || '0') === 0
  );

  return (
    <SidebarLayout>
      <div className="p-6 pt-[62px] pb-[62px] pl-[30px] pr-[30px]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-blue-400 flex items-center gap-3">
                  <BarChart3 className="h-10 w-10" />
                  Meu Relatório de Desempenho
                </h1>
                <p className="text-slate-400 mt-2">
                  Veja como seus links estão performando nos últimos dias
                </p>
                <p className="text-slate-500 text-sm mt-1 italic">
                  "Seus números contam sua história. Continue crescendo."
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoje</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Select value={conversionFilter} onValueChange={setConversionFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo de conversão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="click">Cliques</SelectItem>
                  <SelectItem value="registration">Registros</SelectItem>
                  <SelectItem value="deposit">Depósitos</SelectItem>
                  <SelectItem value="profit">Lucros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEmpty ? (
            <Card className="bg-slate-900/50 border-slate-800 text-center py-16">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-slate-800 rounded-full">
                    <Activity className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-300">
                      Nenhum dado disponível ainda para gerar o relatório
                    </h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Comece criando seus links de afiliado para ver as estatísticas aparecerem aqui.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <a href="/betting-houses">
                        <Building2 className="h-4 w-4 mr-2" />
                        Comece criando seus links
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="border-slate-600 hover:bg-slate-800">
                      <a href="/my-links">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver links gerados
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-800/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-200">Total de Cliques</CardTitle>
                    <MousePointer className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analyticsData?.totalClicks || 0}</div>
                    <p className="text-xs text-blue-300">
                      Todos os cliques registrados
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-800/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-200">Conversões</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analyticsData?.totalConversions || 0}</div>
                    <p className="text-xs text-emerald-300">
                      Total de conversões realizadas
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-800/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-200">Comissão Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(analyticsData?.totalCommission || '0')}
                    </div>
                    <p className="text-xs text-yellow-300">
                      Valor total em comissões
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-800/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-200">Casas Ativas</CardTitle>
                    <Building2 className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analyticsData?.activeHouses || 0}</div>
                    <p className="text-xs text-purple-300">
                      Casas com links gerados
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversions by Type Chart */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <PieChart className="h-5 w-5" />
                      Conversões por Tipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.conversionsByType && analyticsData.conversionsByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={analyticsData.conversionsByType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, percentage }) => `${CONVERSION_ICONS[type as keyof typeof CONVERSION_ICONS] || ''} ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analyticsData.conversionsByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [value, CONVERSION_LABELS[name as keyof typeof CONVERSION_LABELS] || name]}
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-400">
                        Nenhuma conversão registrada
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance by House Chart */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <BarChart3 className="h-5 w-5" />
                      Desempenho por Casa de Aposta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.performanceByHouse && analyticsData.performanceByHouse.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.performanceByHouse.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="houseName" 
                            stroke="#9ca3af"
                            fontSize={12}
                          />
                          <YAxis stroke="#9ca3af" fontSize={12} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="conversions" fill="#3B82F6" name="Conversões" />
                          <Bar dataKey="clicks" fill="#10B981" name="Cliques" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-400">
                        Nenhum dado de performance disponível
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Conversions Table */}
              {analyticsData?.recentConversions && analyticsData.recentConversions.length > 0 && (
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-100">
                        <Activity className="h-5 w-5" />
                        Últimas Conversões
                      </span>
                      <Button asChild variant="outline" size="sm" className="border-slate-600 hover:bg-slate-800">
                        <a href="/my-links">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver links gerados
                        </a>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Casa</TableHead>
                          <TableHead className="text-slate-300">Tipo</TableHead>
                          <TableHead className="text-slate-300">Valor</TableHead>
                          <TableHead className="text-slate-300">Comissão</TableHead>
                          <TableHead className="text-slate-300">Cliente</TableHead>
                          <TableHead className="text-slate-300">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.recentConversions.map((conversion) => (
                          <TableRow key={conversion.id} className="border-slate-700">
                            <TableCell className="text-slate-200">{conversion.houseName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-slate-600">
                                {CONVERSION_ICONS[conversion.type as keyof typeof CONVERSION_ICONS] || ''}
                                {CONVERSION_LABELS[conversion.type as keyof typeof CONVERSION_LABELS] || conversion.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {conversion.amount ? formatCurrency(conversion.amount) : '-'}
                            </TableCell>
                            <TableCell className="text-emerald-400 font-medium">
                              {formatCurrency(conversion.commission)}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {conversion.customerId || '-'}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {formatDate(conversion.convertedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Footer Links */}
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center gap-4">
                  <Button asChild variant="outline" className="border-slate-600 hover:bg-slate-800">
                    <a href="/my-links">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver links gerados
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-slate-600 hover:bg-slate-800">
                    <a href="/betting-houses">
                      <Building2 className="h-4 w-4 mr-2" />
                      Ver casas de apostas
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}