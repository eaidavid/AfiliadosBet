import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Gift,
  CheckCircle,
  MousePointer,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Search,
  Crown,
  Eye,
  Zap,
  ExternalLink,
  Copy,
  BarChart3,
  Bell,
  Activity,
  XCircle,
  Coins,
  Building2,
  Link
} from 'lucide-react';

interface UserStats {
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommission: string;
  conversionRate: number;
}

interface BettingHouse {
  id: number;
  name: string;
  logoUrl: string | null;
  commissionType: string;
  commissionValue: string | null;
  cpaValue: string | null;
  revshareValue: string | null;
  minDeposit: string | null;
  paymentMethods: any;
  isActive: boolean;
  createdAt: string;
  isAffiliated: boolean;
}

interface AffiliateLink {
  id: number;
  houseName: string;
  generatedUrl: string;
  createdAt: string;
  houseId: number;
}

interface Conversion {
  id: number;
  type: string;
  houseName: string;
  commission: string | null;
  customerId: string | null;
  convertedAt: string;
}

interface PostbackLog {
  id: number;
  houseName: string;
  eventType: string;
  value: string;
  status: string;
  createdAt: string;
}

interface MonthlyStats {
  month: string;
  commission: number;
}

export default function AffiliateHome() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/affiliate/stats'],
  });

  // Fetch betting houses
  const { data: bettingHouses, isLoading: housesLoading } = useQuery<BettingHouse[]>({
    queryKey: ['/api/betting-houses'],
  });

  // Fetch affiliate links
  const { data: affiliateLinks, isLoading: linksLoading } = useQuery<AffiliateLink[]>({
    queryKey: ['/api/affiliate/links'],
  });

  // Fetch recent conversions
  const { data: recentConversions, isLoading: conversionsLoading } = useQuery<Conversion[]>({
    queryKey: ['/api/affiliate/conversions'],
  });

  // Fetch recent postbacks
  const { data: recentPostbacks, isLoading: postbacksLoading } = useQuery<PostbackLog[]>({
    queryKey: ['/api/affiliate/postbacks'],
  });

  // Join affiliate mutation
  const joinAffiliateMutation = useMutation({
    mutationFn: async (houseId: number) => {
      const response = await fetch('/api/affiliate/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseId }),
      });
      if (!response.ok) throw new Error('Failed to join affiliate program');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/betting-houses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/links'] });
      toast({
        title: "Sucesso!",
        description: "Você se afiliou com sucesso à casa de apostas.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível se afiliar à casa de apostas.",
        variant: "destructive",
      });
    },
  });

  const handleJoinAffiliate = (houseId: number) => {
    joinAffiliateMutation.mutate(houseId);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      case 'registration':
        return <Users className="h-4 w-4" />;
      case 'deposit':
        return <DollarSign className="h-4 w-4" />;
      case 'profit':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'text-emerald-400' : 'text-red-400';
  };

  const getHouseBadge = (house: BettingHouse) => {
    switch (house.commissionType) {
      case 'Hybrid':
        return { text: '💎 Híbrido', color: 'bg-purple-500' };
      case 'RevShare':
        return { text: '📊 RevShare', color: 'bg-blue-500' };
      case 'CPA':
        return { text: '💰 CPA', color: 'bg-emerald-500' };
      default:
        return { text: '📈 Popular', color: 'bg-gray-500' };
    }
  };

  const getCommissionDisplay = (house: BettingHouse) => {
    switch (house.commissionType) {
      case 'CPA':
        return (
          <div className="text-sm">
            <span className="font-medium text-emerald-400">CPA:</span>
            <span className="text-slate-300 ml-1">R$ {house.cpaValue || house.commissionValue}</span>
          </div>
        );
      case 'RevShare':
        return (
          <div className="text-sm">
            <span className="font-medium text-blue-400">Rev:</span>
            <span className="text-slate-300 ml-1">{house.revshareValue || house.commissionValue}%</span>
          </div>
        );
      case 'Hybrid':
        return (
          <div className="text-xs space-y-1">
            <div>
              <span className="font-medium text-emerald-400">CPA:</span>
              <span className="text-slate-300 ml-1">R$ {house.cpaValue}</span>
            </div>
            <div>
              <span className="font-medium text-blue-400">Rev:</span>
              <span className="text-slate-300 ml-1">{house.revshareValue}%</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-slate-400">
            {house.commissionValue || 'Não especificado'}
          </div>
        );
    }
  };

  const filteredHouses = bettingHouses?.filter(house =>
    house.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <SidebarLayout>
      <div className="p-3 sm:p-6 pt-[62px] pb-[62px]">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-emerald-400 flex items-center gap-2 sm:gap-3">
                  <Gift className="h-6 w-6 sm:h-10 sm:w-10" />
                  Bem-vindo ao AfiliadosBet
                </h1>
                <p className="text-slate-300 text-sm sm:text-lg mt-2">
                  Gerencie seus links de afiliado, acompanhe seus resultados e maximize seus ganhos.
                </p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500 text-xs sm:text-sm">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Conta Ativa
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Cliques</CardTitle>
                <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold text-blue-400">
                  {statsLoading ? '...' : userStats?.totalClicks || 0}
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Cliques únicos em seus links
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Registros</CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                  {statsLoading ? '...' : userStats?.totalRegistrations || 0}
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Usuários cadastrados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Comissão Total</CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                  R$ {statsLoading ? '...' : userStats?.totalCommission || '0,00'}
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Valor total em comissões
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="houses" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-slate-900 border-slate-700 grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="houses" className="data-[state=active]:bg-emerald-600 text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Casas Disponíveis</span>
                <span className="sm:hidden">Casas</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="data-[state=active]:bg-emerald-600 text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Meus Links</span>
                <span className="sm:hidden">Links</span>
              </TabsTrigger>
              <TabsTrigger value="conversions" className="data-[state=active]:bg-emerald-600 text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Conversões Recentes</span>
                <span className="sm:hidden">Conv.</span>
              </TabsTrigger>
              <TabsTrigger value="postbacks" className="data-[state=active]:bg-emerald-600 text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Postbacks Recentes</span>
                <span className="sm:hidden">Post.</span>
              </TabsTrigger>
            </TabsList>

            {/* Betting Houses */}
            <TabsContent value="houses" className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-center gap-2">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                    Casas de Apostas Disponíveis
                  </h2>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar casa de apostas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-700 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {housesLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-24 bg-slate-800 rounded mb-4"></div>
                          <div className="h-4 bg-slate-800 rounded mb-2"></div>
                          <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    filteredHouses.map((house) => {
                      const badge = getHouseBadge(house);
                      return (
                        <Card key={house.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all duration-200 touch-manipulation">
                          <CardHeader className="pb-3 p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {house.logoUrl ? (
                                  <img 
                                    src={house.logoUrl} 
                                    alt={house.name}
                                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-700 rounded-lg flex items-center justify-center">
                                    <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                                  </div>
                                )}
                                <div>
                                  <CardTitle className="text-base sm:text-lg text-slate-100">{house.name}</CardTitle>
                                  <Badge className={`${badge.color} text-white text-xs mt-1`}>
                                    {badge.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="text-xs sm:text-sm text-slate-400">Comissão:</span>
                                <div className="text-right">
                                  {getCommissionDisplay(house)}
                                </div>
                              </div>
                              {house.minDeposit && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs sm:text-sm text-slate-400">Depósito Min:</span>
                                  <span className="text-xs sm:text-sm text-slate-300">R$ {house.minDeposit}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-slate-400">Status:</span>
                                <Badge variant={house.isActive ? "default" : "secondary"} className="text-xs">
                                  {house.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-700">
                              {house.isAffiliated ? (
                                <Button 
                                  variant="outline" 
                                  className="w-full h-9 sm:h-10 text-sm touch-manipulation" 
                                  size="sm"
                                  onClick={() => {
                                    // Find the user's link for this house
                                    const userLink = affiliateLinks?.find(link => link.houseId === house.id);
                                    if (userLink) {
                                      copyToClipboard(userLink.generatedUrl);
                                    } else {
                                      toast({
                                        title: "Link não encontrado",
                                        description: "Não foi possível encontrar seu link de afiliado para esta casa.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                  Ver Link
                                </Button>
                              ) : (
                                <Button 
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-9 sm:h-10 text-sm touch-manipulation" 
                                  size="sm"
                                  onClick={() => handleJoinAffiliate(house.id)}
                                  disabled={joinAffiliateMutation.isPending}
                                >
                                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                  {joinAffiliateMutation.isPending ? 'Afiliando...' : 'Se Afiliar'}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Affiliate Links */}
            <TabsContent value="links" className="space-y-4 sm:space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl text-emerald-400 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                    Meus Links Ativos
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    Gerencie e acompanhe seus links de afiliado
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {linksLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-slate-800 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : affiliateLinks && affiliateLinks.length > 0 ? (
                    <div className="space-y-4">
                      {/* Mobile view - cards */}
                      <div className="block sm:hidden space-y-3">
                        {affiliateLinks.map((link) => (
                          <Card key={link.id} className="bg-slate-800/50 border-slate-600">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-slate-100">{link.houseName}</div>
                                    <div className="text-xs text-slate-400">
                                      {format(new Date(link.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="text-xs text-slate-400">Link:</div>
                                  <code className="text-xs bg-slate-700 px-2 py-1 rounded text-emerald-400 block break-all">
                                    {link.generatedUrl}
                                  </code>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs touch-manipulation"
                                    onClick={() => copyToClipboard(link.generatedUrl)}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copiar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs touch-manipulation"
                                    onClick={() => window.open(link.generatedUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Desktop view - table */}
                      <div className="hidden sm:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-700">
                              <TableHead className="text-slate-300">Casa</TableHead>
                              <TableHead className="text-slate-300">Link</TableHead>
                              <TableHead className="text-slate-300">Criado em</TableHead>
                              <TableHead className="text-slate-300">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {affiliateLinks.map((link) => (
                              <TableRow key={link.id} className="border-slate-700">
                                <TableCell className="text-slate-100 font-medium">
                                  {link.houseName}
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <code className="text-xs bg-slate-800 px-2 py-1 rounded text-emerald-400 truncate block">
                                    {link.generatedUrl}
                                  </code>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {format(new Date(link.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyToClipboard(link.generatedUrl)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <BarChart3 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum link de afiliado encontrado.</p>
                      <p className="text-sm">Afilie-se a uma casa de apostas para começar.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Conversions */}
            <TabsContent value="conversions" className="space-y-4 sm:space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl text-emerald-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    Conversões Recentes
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    Últimas 10 conversões registradas
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {conversionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-slate-800 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : recentConversions && recentConversions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Mobile view - cards */}
                      <div className="block sm:hidden space-y-3">
                        {recentConversions.map((conversion) => (
                          <Card key={conversion.id} className="bg-slate-800/50 border-slate-600">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(conversion.type)}
                                  <div>
                                    <div className="font-medium text-slate-100 capitalize">
                                      {conversion.type === 'click' ? 'Clique' : 
                                       conversion.type === 'registration' ? 'Registro' :
                                       conversion.type === 'deposit' ? 'Depósito' : conversion.type}
                                    </div>
                                    <div className="text-xs text-slate-400">{conversion.houseName}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-emerald-400">
                                    {conversion.commission ? `R$ ${conversion.commission}` : '-'}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {format(new Date(conversion.convertedAt), 'dd/MM/yyyy', { locale: ptBR })}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Desktop view - table */}
                      <div className="hidden sm:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-700">
                              <TableHead className="text-slate-300">Tipo</TableHead>
                              <TableHead className="text-slate-300">Casa</TableHead>
                              <TableHead className="text-slate-300">Comissão</TableHead>
                              <TableHead className="text-slate-300">Data</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentConversions.map((conversion) => (
                              <TableRow key={conversion.id} className="border-slate-700">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(conversion.type)}
                                    <span className="capitalize text-slate-300">
                                      {conversion.type === 'click' ? 'Clique' : 
                                       conversion.type === 'registration' ? 'Registro' :
                                       conversion.type === 'deposit' ? 'Depósito' : conversion.type}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {conversion.houseName}
                                </TableCell>
                                <TableCell className="text-emerald-400 font-medium">
                                  {conversion.commission ? `R$ ${conversion.commission}` : '-'}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {format(new Date(conversion.convertedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma conversão encontrada.</p>
                      <p className="text-sm">Suas conversões aparecerão aqui quando houver atividade.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Postbacks */}
            <TabsContent value="postbacks" className="space-y-4 sm:space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl text-emerald-400 flex items-center gap-2">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    Postbacks Recentes
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    Últimos 5 postbacks recebidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {postbacksLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-slate-800 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : recentPostbacks && recentPostbacks.length > 0 ? (
                    <div className="space-y-4">
                      {/* Mobile view - cards */}
                      <div className="block sm:hidden space-y-3">
                        {recentPostbacks.map((postback) => (
                          <Card key={postback.id} className="bg-slate-800/50 border-slate-600">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-slate-100">{postback.houseName}</div>
                                    <div className="text-xs text-slate-400 capitalize">{postback.eventType}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-xs font-medium ${getStatusColor(postback.status)}`}>
                                      {postback.status === 'success' ? 'Sucesso' : 'Erro'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-slate-300">R$ {postback.value}</div>
                                  <div className="text-xs text-slate-400">
                                    {format(new Date(postback.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Desktop view - table */}
                      <div className="hidden sm:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-700">
                              <TableHead className="text-slate-300">Casa</TableHead>
                              <TableHead className="text-slate-300">Evento</TableHead>
                              <TableHead className="text-slate-300">Valor</TableHead>
                              <TableHead className="text-slate-300">Status</TableHead>
                              <TableHead className="text-slate-300">Data</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentPostbacks.map((postback) => (
                              <TableRow key={postback.id} className="border-slate-700">
                                <TableCell className="text-slate-300 font-medium">
                                  {postback.houseName}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {postback.eventType}
                                </TableCell>
                                <TableCell className="text-emerald-400">
                                  {postback.value ? `R$ ${postback.value}` : '-'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {postback.status === 'success' ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-400" />
                                    )}
                                    <span className={getStatusColor(postback.status)}>
                                      {postback.status === 'success' ? 'Sucesso' : 'Falha'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {format(new Date(postback.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum postback encontrado.</p>
                      <p className="text-sm">Postbacks das casas de apostas aparecerão aqui.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarLayout>
  );
}