import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SidebarLayout from '@/components/sidebar-layout';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  MousePointer,
  UserPlus,
  Banknote,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Award,
  Zap,
  Eye,
  RefreshCw,
  Filter,
  Download,
  Upload,
  Clock,
  Building2,
  Users,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatsSummary {
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommission: number;
  conversionRate: number;
  avgCommission: number;
  monthlyGrowth: number;
}

interface DailyStat {
  date: string;
  clicks: number;
  conversions: number;
  commission: number;
}

interface Conversion {
  id: number;
  type: 'click' | 'registration' | 'deposit' | 'first_deposit';
  amount: string;
  commission: string;
  convertedAt: string;
  houseName: string;
  customerId: string;
}

interface ManualConversionForm {
  type: 'registration' | 'deposit' | 'first_deposit';
  amount: string;
  commission: string;
  customerId: string;
  houseId: number;
  notes?: string;
}

export default function Statistics() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualConversionForm>({
    type: 'registration',
    amount: '',
    commission: '',
    customerId: '',
    houseId: 0,
    notes: ''
  });

  // Fetch statistics data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/affiliate/analytics', selectedPeriod, selectedHouse],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedHouse !== 'all' && { houseId: selectedHouse })
      });
      const response = await fetch(`/api/affiliate/analytics?${params}`);
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');
      return response.json();
    }
  });

  // Fetch betting houses for filter
  const { data: houses } = useQuery({
    queryKey: ['/api/affiliate/houses'],
    queryFn: async () => {
      const response = await fetch('/api/affiliate/houses');
      if (!response.ok) throw new Error('Erro ao carregar casas');
      return response.json();
    }
  });

  // Manual conversion mutation
  const manualConversionMutation = useMutation({
    mutationFn: async (data: ManualConversionForm) => {
      const response = await apiRequest('/api/affiliate/conversions/manual', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conversão adicionada",
        description: "A conversão manual foi registrada com sucesso.",
      });
      setIsManualDialogOpen(false);
      setManualForm({
        type: 'registration',
        amount: '',
        commission: '',
        customerId: '',
        houseId: 0,
        notes: ''
      });
      refetchStats();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar conversão manual.",
        variant: "destructive"
      });
    }
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    manualConversionMutation.mutate(manualForm);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (statsLoading) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-800 rounded"></div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Estatísticas Detalhadas</h1>
            <p className="text-slate-400 mt-2">
              Acompanhe seu desempenho e otimize seus resultados
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Period Filter */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>

            {/* House Filter */}
            <Select value={selectedHouse} onValueChange={setSelectedHouse}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as casas</SelectItem>
                {houses?.map((house: any) => (
                  <SelectItem key={house.id} value={house.id.toString()}>
                    {house.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Manual Conversion Button */}
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Adicionar Conversão Manual</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Registre conversões que não foram capturadas automaticamente
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Tipo</Label>
                      <Select
                        value={manualForm.type}
                        onValueChange={(value: any) => setManualForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registration">Registro</SelectItem>
                          <SelectItem value="deposit">Depósito</SelectItem>
                          <SelectItem value="first_deposit">Primeiro Depósito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">Casa</Label>
                      <Select
                        value={manualForm.houseId.toString()}
                        onValueChange={(value) => setManualForm(prev => ({ ...prev, houseId: parseInt(value) }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {houses?.map((house: any) => (
                            <SelectItem key={house.id} value={house.id.toString()}>
                              {house.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-slate-800 border-slate-600 text-white"
                        value={manualForm.amount}
                        onChange={(e) => setManualForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">Comissão (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-slate-800 border-slate-600 text-white"
                        value={manualForm.commission}
                        onChange={(e) => setManualForm(prev => ({ ...prev, commission: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">ID do Cliente</Label>
                    <Input
                      placeholder="ID ou identificador do cliente"
                      className="bg-slate-800 border-slate-600 text-white"
                      value={manualForm.customerId}
                      onChange={(e) => setManualForm(prev => ({ ...prev, customerId: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Observações (opcional)</Label>
                    <Input
                      placeholder="Notas adicionais sobre a conversão"
                      className="bg-slate-800 border-slate-600 text-white"
                      value={manualForm.notes}
                      onChange={(e) => setManualForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsManualDialogOpen(false)}
                      className="border-slate-600"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={manualConversionMutation.isPending}
                    >
                      {manualConversionMutation.isPending ? 'Adicionando...' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => refetchStats()} className="border-slate-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">Total de Cliques</CardTitle>
                <MousePointer className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.totalClicks?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {stats?.recentClicks || 0} nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">Conversões</CardTitle>
                <UserPlus className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.totalConversions || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Taxa: {formatPercentage(stats?.conversionRate || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">Comissão Total</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats?.totalCommission || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Média: {formatCurrency(stats?.avgCommission || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">Crescimento</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.monthlyGrowth > 0 ? '+' : ''}{formatPercentage(stats?.monthlyGrowth || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Statistics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-600">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="conversions" className="data-[state=active]:bg-slate-700">
              Conversões
            </TabsTrigger>
            <TabsTrigger value="houses" className="data-[state=active]:bg-slate-700">
              Por Casa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Daily Performance Chart */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Performance Diária
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Cliques e conversões por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Gráfico será exibido aqui</p>
                    <p className="text-sm mt-2">
                      Dados dos últimos {selectedPeriod} dias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversions" className="space-y-6">
            {/* Recent Conversions */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Conversões Recentes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Últimas conversões registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentConversions?.length > 0 ? (
                    stats.recentConversions.map((conversion: Conversion, index: number) => (
                      <div
                        key={conversion.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {conversion.type === 'registration' && (
                              <UserPlus className="h-5 w-5 text-blue-500" />
                            )}
                            {(conversion.type === 'deposit' || conversion.type === 'first_deposit') && (
                              <Banknote className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {conversion.type === 'registration' && 'Novo Registro'}
                              {conversion.type === 'deposit' && 'Depósito'}
                              {conversion.type === 'first_deposit' && 'Primeiro Depósito'}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {conversion.houseName} • {conversion.customerId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {formatCurrency(parseFloat(conversion.commission))}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {format(new Date(conversion.convertedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                      <p className="text-slate-400">Nenhuma conversão encontrada</p>
                      <p className="text-slate-500 text-sm mt-2">
                        As conversões aparecerão aqui quando ocorrerem
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="houses" className="space-y-6">
            {/* Performance by House */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Performance por Casa
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Desempenho detalhado de cada casa de apostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.clicksByHouse && Object.keys(stats.clicksByHouse).length > 0 ? (
                    Object.entries(stats.clicksByHouse).map(([houseName, clicks]) => (
                      <div
                        key={houseName}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-center space-x-4">
                          <Building2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <p className="text-white font-medium">{houseName}</p>
                            <p className="text-slate-400 text-sm">
                              {clicks} cliques
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Progress
                            value={(clicks as number / stats.totalClicks) * 100}
                            className="w-24 h-2"
                          />
                          <p className="text-slate-400 text-xs mt-1">
                            {formatPercentage((clicks as number / stats.totalClicks) * 100)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                      <p className="text-slate-400">Nenhum dado por casa encontrado</p>
                      <p className="text-slate-500 text-sm mt-2">
                        Dados aparecerão aqui após cliques nos links
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}