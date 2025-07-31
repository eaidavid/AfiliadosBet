import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MousePointer,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Eye,
  ExternalLink,
  Copy,
  BarChart3,
  Bell,
  Activity,
  Coins,
  Building2,
  Link,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface UserStats {
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommission: string;
  conversionRate: number;
  recentClicks?: any[];
  recentConversions?: any[];
  clicksByDay?: Record<string, number>;
  clicksByHouse?: Record<string, number>;
}

interface BettingHouse {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  commissionType: string;
  commissionValue: string | null;
  revshareValue?: string | null | undefined;
  cpaValue?: string | null | undefined;
  revshareAffiliatePercent?: number;
  cpaAffiliatePercent?: number;
  minDeposit: string | null;
  paymentMethods: any;
  isActive: boolean;
  createdAt: string;
  isAffiliated: boolean;
  affiliateLink?: string;
  highlights?: string[];
}

interface AffiliateLink {
  id: number;
  houseName: string;
  generatedUrl: string;
  isActive: boolean;
  createdAt: string;
  clickCount: number;
  conversionCount: number;
}

export default function UserHomeFixed() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Fetch user stats with error handling
  const { data: stats = {}, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/stats/user"],
    retry: 1,
    staleTime: 30000,
  });

  // Fetch betting houses with error handling
  const { data: bettingHouses = [], isLoading: housesLoading } = useQuery({
    queryKey: ["/api/betting-houses"],
    retry: 1,
    staleTime: 60000,
  });

  // Fetch affiliate links with error handling
  const { data: affiliateLinks = [], isLoading: linksLoading } = useQuery({
    queryKey: ["/api/affiliate/links"],
    retry: 1,
    staleTime: 30000,
  });

  // Safe stats with defaults
  const safeStats: UserStats = {
    totalClicks: stats?.totalClicks || 0,
    totalRegistrations: stats?.totalRegistrations || 0,
    totalDeposits: stats?.totalDeposits || 0,
    totalCommission: stats?.totalCommission || '0.00',
    conversionRate: stats?.conversionRate || 0,
    recentClicks: stats?.recentClicks || [],
    recentConversions: stats?.recentConversions || [],
    clicksByDay: stats?.clicksByDay || {},
    clicksByHouse: stats?.clicksByHouse || {},
  };

  // Copy link function
  const copyToClipboard = async (text: string, linkId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(linkId);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue || 0);
  };

  // Error state
  if (statsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente recarregar a página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Dashboard do Afiliado</h1>
        <p className="text-slate-400">
          Acompanhe seu desempenho e gerencie suas afiliações
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20 bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-slate-700" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border-emerald-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-100">
                  Total de Cliques
                </CardTitle>
                <MousePointer className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {safeStats.totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-emerald-300 mt-1">
                  Links acessados pelos usuários
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">
                  Registros
                </CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {safeStats.totalRegistrations.toLocaleString()}
                </div>
                <p className="text-xs text-blue-300 mt-1">
                  Usuários convertidos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">
                  Depósitos
                </CardTitle>
                <Coins className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {safeStats.totalDeposits.toLocaleString()}
                </div>
                <p className="text-xs text-purple-300 mt-1">
                  Depósitos realizados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-100">
                  Comissões
                </CardTitle>
                <DollarSign className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(safeStats.totalCommission)}
                </div>
                <p className="text-xs text-amber-300 mt-1">
                  Total acumulado
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="houses" className="data-[state=active]:bg-emerald-600">
            <Building2 className="h-4 w-4 mr-2" />
            Casas
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-emerald-600">
            <Link className="h-4 w-4 mr-2" />
            Meus Links
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-emerald-600">
            <Activity className="h-4 w-4 mr-2" />
            Atividade
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Performance Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300">Taxa de Conversão</span>
                  <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400">
                    {safeStats.conversionRate.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300">Cliques Hoje</span>
                  <span className="text-white font-semibold">
                    {(safeStats.recentClicks || []).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300">Conversões Hoje</span>
                  <span className="text-white font-semibold">
                    {(safeStats.recentConversions || []).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Status do Afiliado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Conta Ativa</div>
                    <div className="text-slate-400 text-sm">Pronto para gerar links</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">
                      {bettingHouses.filter((h: BettingHouse) => h.isAffiliated).length} Casas Ativas
                    </div>
                    <div className="text-slate-400 text-sm">Casas de apostas afiliadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Houses Tab */}
        <TabsContent value="houses" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Casas de Apostas Disponíveis</CardTitle>
              <CardDescription className="text-slate-400">
                Explore as casas disponíveis e comece a gerar seus links de afiliado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {housesLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-slate-700 rounded-lg">
                      <Skeleton className="h-12 w-12 rounded bg-slate-700" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32 bg-slate-700" />
                        <Skeleton className="h-3 w-48 bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {bettingHouses.slice(0, 5).map((house: BettingHouse) => (
                    <div key={house.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{house.name}</h3>
                          <p className="text-slate-400 text-sm">
                            {house.commissionType === 'CPA' ? 'Comissão por registro' : 
                             house.commissionType === 'RevShare' ? 'Divisão de receita' : 
                             'Modelo híbrido'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {house.isAffiliated ? (
                          <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Afiliado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            Disponível
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Meus Links de Afiliado</CardTitle>
              <CardDescription className="text-slate-400">
                Gerencie e monitore o desempenho dos seus links
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linksLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                  ))}
                </div>
              ) : affiliateLinks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não possui links de afiliado</p>
                  <p className="text-sm">Vá para "Casas" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {affiliateLinks.map((link: AffiliateLink) => (
                    <div key={link.id} className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-white font-medium">{link.houseName}</h3>
                          <p className="text-slate-400 text-sm">
                            Criado em {format(new Date(link.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={link.isActive ? "secondary" : "outline"} 
                                 className={link.isActive ? "bg-green-600/20 text-green-400" : "border-slate-600 text-slate-400"}>
                            {link.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-slate-400">
                          <MousePointer className="h-4 w-4 mr-1" />
                          {link.clickCount || 0} cliques
                        </div>
                        <div className="flex items-center text-slate-400">
                          <Users className="h-4 w-4 mr-1" />
                          {link.conversionCount || 0} conversões
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-2">
                        <div className="flex-1 p-2 bg-slate-700/50 rounded text-slate-300 text-sm font-mono truncate">
                          {link.generatedUrl}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(link.generatedUrl, link.id)}
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          {copiedId === link.id ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          <a href={link.generatedUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-blue-400" />
                  Cliques Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(safeStats.recentClicks || []).length === 0 ? (
                  <div className="text-center py-4 text-slate-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum clique recente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(safeStats.recentClicks || []).slice(0, 5).map((click: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                        <span className="text-slate-300 text-sm">{click.houseName || 'Casa desconhecida'}</span>
                        <span className="text-slate-400 text-xs">
                          {click.clickedAt ? format(new Date(click.clickedAt), 'HH:mm', { locale: ptBR }) : '--:--'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Conversões Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(safeStats.recentConversions || []).length === 0 ? (
                  <div className="text-center py-4 text-slate-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversão recente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(safeStats.recentConversions || []).slice(0, 5).map((conversion: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                        <div className="flex flex-col">
                          <span className="text-slate-300 text-sm">{conversion.houseName || 'Casa desconhecida'}</span>
                          <span className="text-slate-400 text-xs">{conversion.type || 'Conversão'}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm font-medium">
                            {formatCurrency(conversion.commission || 0)}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {conversion.convertedAt ? format(new Date(conversion.convertedAt), 'HH:mm', { locale: ptBR }) : '--:--'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}