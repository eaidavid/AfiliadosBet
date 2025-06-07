import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Conversion {
  id: number;
  type: string;
  amount: string | null;
  commission: string | null;
  convertedAt: string;
  affiliateName: string;
  affiliateUsername: string;
  houseName: string;
  houseId: number;
  userId: number;
}

interface ConversionsResponse {
  success: boolean;
  data: Conversion[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  totals: {
    totalClick: number;
    totalRegistration: number;
    totalDeposit: number;
    totalProfit: number;
    totalCommissions: number;
    totalAmount: number;
  };
}

interface Affiliate {
  id: number;
  name: string;
  username: string;
}

interface House {
  id: number;
  name: string;
}

export default function SmarticoDashboard() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>('');
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [page] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set default dates (last 7 days)
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(weekAgo.toISOString().split('T')[0]);
  }, []);

  // Query para buscar conversões
  const { data: conversionsData, isLoading: loadingConversions, error: conversionsError } = useQuery<ConversionsResponse>({
    queryKey: ['conversions', dateFrom, dateTo, selectedAffiliate, selectedHouse, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (selectedAffiliate) params.append('user_id', selectedAffiliate);
      if (selectedHouse) params.append('house_id', selectedHouse);
      params.append('page', page.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/conversions?${params}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar conversões');
      }
      return response.json();
    },
    enabled: !!dateFrom && !!dateTo
  });

  // Query para buscar afiliados
  const { data: affiliatesData } = useQuery<{ success: boolean; data: Affiliate[] }>({
    queryKey: ['affiliates'],
    queryFn: async () => {
      const response = await fetch('/api/conversions/affiliates');
      if (!response.ok) {
        throw new Error('Erro ao buscar afiliados');
      }
      return response.json();
    }
  });

  // Query para buscar casas
  const { data: housesData } = useQuery<{ success: boolean; data: House[] }>({
    queryKey: ['houses'],
    queryFn: async () => {
      const response = await fetch('/api/conversions/houses');
      if (!response.ok) {
        throw new Error('Erro ao buscar casas');
      }
      return response.json();
    }
  });

  // Mutation para sincronização manual
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/conversions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Erro na sincronização');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sincronização concluída",
        description: "Dados atualizados com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['conversions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getEventTypeBadge = (type: string) => {
    const badges = {
      click: <Badge variant="secondary">Click</Badge>,
      registration: <Badge variant="default">Registro</Badge>,
      deposit: <Badge variant="outline" className="border-green-500 text-green-600">Depósito</Badge>,
      profit: <Badge variant="outline" className="border-blue-500 text-blue-600">Lucro</Badge>
    };
    return badges[type as keyof typeof badges] || <Badge variant="secondary">{type}</Badge>;
  };

  const formatCurrency = (value: string | null | number) => {
    if (!value) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (conversionsError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Erro ao carregar dados: {conversionsError.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Smartico</h1>
          <p className="text-gray-600">Relatório de conversões da API Smartico</p>
        </div>
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          variant="outline"
        >
          {syncMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sincronizar Agora
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Configure os filtros para visualizar os dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Afiliado</label>
              <Select value={selectedAffiliate} onValueChange={setSelectedAffiliate}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os afiliados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os afiliados</SelectItem>
                  {affiliatesData?.data?.map((affiliate) => (
                    <SelectItem key={affiliate.id} value={affiliate.id.toString()}>
                      {affiliate.name} (@{affiliate.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Casa de Apostas</label>
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as casas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as casas</SelectItem>
                  {housesData?.data?.map((house) => (
                    <SelectItem key={house.id} value={house.id.toString()}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      {conversionsData?.totals && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionsData.totals.totalClick}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionsData.totals.totalRegistration}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depósitos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionsData.totals.totalDeposit}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Volume: {formatCurrency(conversionsData.totals.totalAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(conversionsData.totals.totalCommissions)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Conversões */}
      <Card>
        <CardHeader>
          <CardTitle>Conversões Recentes</CardTitle>
          <CardDescription>
            Lista detalhada de todas as conversões processadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingConversions ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Casa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversionsData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhuma conversão encontrada para os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    conversionsData?.data?.map((conversion) => (
                      <TableRow key={conversion.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(conversion.convertedAt)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{conversion.affiliateName}</div>
                            <div className="text-sm text-gray-500">@{conversion.affiliateUsername}</div>
                          </div>
                        </TableCell>
                        <TableCell>{conversion.houseName}</TableCell>
                        <TableCell>{getEventTypeBadge(conversion.type)}</TableCell>
                        <TableCell>{formatCurrency(conversion.amount)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(conversion.commission)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}