import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  MousePointer, 
  TrendingUp, 
  Calendar, 
  Globe, 
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  Target,
  Users,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download
} from 'lucide-react';
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ClickAnalytics {
  totalClicks: number;
  totalConversions: number;
  totalCommission: number;
  conversionRate: number;
  clicksByDay: Record<string, number>;
  clicksByHouse: Record<string, number>;
  recentClicks: Array<{
    id: number;
    linkId: number;
    ipAddress: string;
    userAgent: string;
    clickedAt: string;
    houseName: string;
    houseId: number;
  }>;
  recentConversions: Array<{
    id: number;
    type: string;
    amount: string;
    commission: string;
    convertedAt: string;
    houseName: string;
    customerId: string;
  }>;
}

export default function ClickAnalytics() {
  const [period, setPeriod] = useState('7d');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<ClickAnalytics>({
    queryKey: ['/api/affiliate/analytics', period],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getDeviceType = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile') || userAgent.toLowerCase().includes('android')) {
      return { icon: <Smartphone className="h-4 w-4" />, text: 'Mobile', color: 'text-blue-400' };
    } else if (userAgent.toLowerCase().includes('tablet') || userAgent.toLowerCase().includes('ipad')) {
      return { icon: <Monitor className="h-4 w-4" />, text: 'Tablet', color: 'text-purple-400' };
    } else {
      return { icon: <Monitor className="h-4 w-4" />, text: 'Desktop', color: 'text-emerald-400' };
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Outro';
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-6 pt-[69px] pb-[69px]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Carregando analytics...</h3>
              <p className="text-slate-400">Preparando dados de cliques e conversões</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 pt-[69px] pb-[69px]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-slate-900/40 to-emerald-900/20 rounded-2xl border border-blue-500/20 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
            <div className="relative">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-blue-400 flex items-center gap-3 mb-2">
                    <Activity className="h-10 w-10" />
                    Analytics de Cliques
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Monitore em tempo real como seus leads interagem com seus links de afiliado
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Últimas 24h</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total de Cliques</p>
                    <p className="text-3xl font-bold text-blue-400">{analytics?.totalClicks || 0}</p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <MousePointer className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Conversões</p>
                    <p className="text-3xl font-bold text-emerald-400">{analytics?.totalConversions || 0}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Taxa de Conversão</p>
                    <p className="text-3xl font-bold text-purple-400">{analytics?.conversionRate.toFixed(2) || 0}%</p>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Comissão Total</p>
                    <p className="text-3xl font-bold text-yellow-400">{formatCurrency(analytics?.totalCommission || 0)}</p>
                  </div>
                  <div className="bg-yellow-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="clicks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="clicks">Cliques Recentes</TabsTrigger>
              <TabsTrigger value="houses">Por Casa</TabsTrigger>
              <TabsTrigger value="conversions">Conversões</TabsTrigger>
            </TabsList>

            {/* Recent Clicks */}
            <TabsContent value="clicks" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Cliques Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.recentClicks.map((click) => {
                      const device = getDeviceType(click.userAgent);
                      const browser = getBrowserInfo(click.userAgent);
                      
                      return (
                        <div key={click.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-4">
                            <div className={`${device.color}`}>
                              {device.icon}
                            </div>
                            <div>
                              <p className="font-medium text-slate-200">{click.houseName}</p>
                              <p className="text-sm text-slate-400">
                                {formatDate(click.clickedAt)} • {device.text} • {browser}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              {click.ipAddress.split('.').slice(0, 2).join('.')}.xxx.xxx
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    
                    {(!analytics?.recentClicks || analytics.recentClicks.length === 0) && (
                      <div className="text-center py-8">
                        <MousePointer className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Nenhum clique registrado no período</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clicks by House */}
            <TabsContent value="houses" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-400 flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Performance por Casa de Apostas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics?.clicksByHouse || {}).map(([house, clicks]) => {
                      const percentage = analytics?.totalClicks ? (clicks / analytics.totalClicks * 100).toFixed(1) : 0;
                      
                      return (
                        <div key={house} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-slate-200">{house}</p>
                              <p className="text-sm text-slate-400">{percentage}% do total</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">{clicks}</p>
                            <p className="text-xs text-slate-400">cliques</p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {Object.keys(analytics?.clicksByHouse || {}).length === 0 && (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Nenhum dado de cliques por casa no período</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Conversions */}
            <TabsContent value="conversions" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Conversões Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.recentConversions.map((conversion) => (
                      <div key={conversion.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-slate-200">{conversion.houseName}</p>
                            <p className="text-sm text-slate-400">
                              {formatDate(conversion.convertedAt)} • {conversion.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-400">{formatCurrency(parseFloat(conversion.commission))}</p>
                          <p className="text-xs text-slate-400">ID: {conversion.customerId}</p>
                        </div>
                      </div>
                    ))}
                    
                    {(!analytics?.recentConversions || analytics.recentConversions.length === 0) && (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Nenhuma conversão registrada no período</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tracking Instructions */}
          <Card className="rounded-lg border text-card-foreground shadow-sm from-slate-900/50 to-blue-900/20 border-blue-500/20 bg-[#000000]">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Como Funciona o Rastreamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                  <div className="bg-blue-500/10 p-3 rounded-lg w-fit mx-auto mb-3">
                    <MousePointer className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="font-medium text-slate-200 mb-2">1. Clique Registrado</h4>
                  <p className="text-sm text-slate-400">Quando alguém clica no seu link do Instagram ou outra rede social</p>
                </div>
                
                <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                  <div className="bg-emerald-500/10 p-3 rounded-lg w-fit mx-auto mb-3">
                    <Activity className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="font-medium text-slate-200 mb-2">2. Dados Capturados</h4>
                  <p className="text-sm text-slate-400">IP, dispositivo, navegador e horário são registrados automaticamente</p>
                </div>
                
                <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                  <div className="bg-purple-500/10 p-3 rounded-lg w-fit mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <h4 className="font-medium text-slate-200 mb-2">3. Analytics em Tempo Real</h4>
                  <p className="text-sm text-slate-400">Veja imediatamente as estatísticas de performance dos seus links</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}