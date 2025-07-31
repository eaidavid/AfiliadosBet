import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import CenteredLayout from '@/components/centered-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumHousesSection } from '@/components/premium-houses-section';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HeroSection } from '@/components/premium/hero-section';
import { OpportunityCard } from '@/components/premium/opportunity-card';
import { RevenueSimulator } from '@/components/premium/revenue-simulator';
import { ActivityFeed } from '@/components/premium/activity-feed';
import { GamificationPanel } from '@/components/premium/gamification-panel';
import { QuickActionsFab } from '@/components/premium/quick-actions-fab';
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

export default function AffiliateHome() {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

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

  // Join affiliate mutation with proper credentials
  const joinAffiliateMutation = useMutation({
    mutationFn: async (houseId: number) => {
      const response = await fetch('/api/affiliate/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ houseId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join affiliate program');
      }
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
    const isHybrid = house.commissionType === 'hybrid';
    
    if (isHybrid) {
      return { 
        text: '💎 DUPLA COMISSÃO', 
        color: 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse shadow-lg',
        textColor: 'text-white font-black'
      };
    }
    
    switch (house.commissionType) {
      case 'RevShare':
        return { text: '📊 RevShare', color: 'bg-blue-500', textColor: 'text-white' };
      case 'CPA':
        return { text: '💰 CPA', color: 'bg-emerald-500', textColor: 'text-white' };
      default:
        return { text: '📈 Popular', color: 'bg-gray-500', textColor: 'text-white' };
    }
  };

  // Helper to get commission display for homepage cards
  const getHomeCommissionDisplay = (house: BettingHouse) => {
    const isHybrid = house.commissionType === 'hybrid';
    
    if (isHybrid) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded border border-emerald-400/50">
            <span className="text-xs font-bold text-green-400">CPA</span>
            <span className="text-lg font-black text-green-400">R$ {parseFloat(house.cpaValue || '0').toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded border border-blue-400/50">
            <span className="text-xs font-bold text-blue-400">RevShare</span>
            <span className="text-lg font-black text-blue-400">{parseFloat(house.revshareValue || '0').toFixed(1)}%</span>
          </div>
        </div>
      );
    }
    
    const value = house.commissionType === 'CPA' 
      ? `R$ ${parseFloat(house.cpaValue || house.commissionValue || '0').toFixed(0)}`
      : `${parseFloat(house.revshareValue || house.commissionValue || '0').toFixed(1)}%`;
    
    return (
      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
        <div className="text-center">
          <div className="text-2xl font-black text-emerald-400">{value}</div>
          <div className="text-xs text-slate-400">{house.commissionType}</div>
        </div>
      </div>
    );
  };

  // Categorize houses for strategic display
  const categorizeHouses = (houses: BettingHouse[]) => {
    if (!houses || houses.length === 0) return { premium: [], popular: [], recent: [] };
    
    const premium = houses.filter(h => h.commissionType === 'hybrid').slice(0, 3);
    const popular = houses.filter(h => h.commissionType !== 'hybrid' && h.isActive).slice(0, 4);
    const recent = houses.slice(-3);
    
    return { premium, popular, recent };
  };

  const getPaymentMethods = (paymentMethods: any) => {
    if (!paymentMethods) return [];
    
    const methods = Array.isArray(paymentMethods) ? paymentMethods : 
                   typeof paymentMethods === 'string' ? paymentMethods.split(',') :
                   Object.keys(paymentMethods);
    
    return methods.map((method: string) => {
      const lowercaseMethod = method.toLowerCase().trim();
      if (lowercaseMethod.includes('pix')) return { 
        name: 'PIX', 
        icon: '◉', 
        className: 'text-emerald-400 font-bold bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-500/30' 
      };
      if (lowercaseMethod.includes('cartão') || lowercaseMethod.includes('card')) return { name: 'Cartão', icon: '💳' };
      if (lowercaseMethod.includes('boleto')) return { name: 'Boleto', icon: '📄' };
      if (lowercaseMethod.includes('cripto') || lowercaseMethod.includes('crypto')) return { name: 'Cripto', icon: '🪙' };
      return { name: method, icon: '💰' };
    });
  };

  const getCommissionDisplay = (house: BettingHouse) => {
    const commissionType = house.commissionType?.toLowerCase();
    
    if (commissionType === 'cpa') {
      const affiliatePercent = Number(house.cpaAffiliatePercent) || 0;
      
      if (affiliatePercent > 0) {
        return (
          <div className="text-sm">
            <span className="font-medium text-emerald-400">CPA:</span>
            <span className="text-slate-300 ml-1">{affiliatePercent.toFixed(1)}%</span>
          </div>
        );
      }
      
      const grossCPA = parseFloat(house.cpaValue || house.commissionValue || '0');
      return (
        <div className="text-sm">
          <span className="font-medium text-emerald-400">CPA:</span>
          <span className="text-slate-300 ml-1">R$ {grossCPA.toFixed(0)}</span>
        </div>
      );
    }
    
    if (commissionType === 'revshare') {
      const affiliatePercent = Number(house.revshareAffiliatePercent) || 0;
      
      if (affiliatePercent > 0) {
        return (
          <div className="text-sm">
            <span className="font-medium text-blue-400">Rev:</span>
            <span className="text-slate-300 ml-1">{affiliatePercent.toFixed(1)}%</span>
          </div>
        );
      }
      
      const grossRevShare = parseFloat(house.revshareValue || house.commissionValue || '0');
      return (
        <div className="text-sm">
          <span className="font-medium text-blue-400">Rev:</span>
          <span className="text-slate-300 ml-1">{grossRevShare}%</span>
        </div>
      );
    }
    
    if (commissionType === 'hybrid') {
      const cpaAffiliatePercent = Number(house.cpaAffiliatePercent) || 0;
      const revshareAffiliatePercent = Number(house.revshareAffiliatePercent) || 0;
      
      return (
        <div className="text-xs space-y-1">
          {cpaAffiliatePercent > 0 && (
            <div>
              <span className="font-medium text-emerald-400">CPA:</span>
              <span className="text-slate-300 ml-1">{cpaAffiliatePercent.toFixed(1)}%</span>
            </div>
          )}
          {revshareAffiliatePercent > 0 && (
            <div>
              <span className="font-medium text-blue-400">Rev:</span>
              <span className="text-slate-300 ml-1">{revshareAffiliatePercent.toFixed(1)}%</span>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="text-sm text-slate-400">
        {house.commissionValue || 'Não especificado'}
      </div>
    );
  };

  const filteredHouses = bettingHouses?.filter(house =>
    house.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const { premium, popular, recent } = categorizeHouses(bettingHouses || []);

  return (
    <CenteredLayout>
      <div className="space-y-8">
        {/* Premium Hero Section */}
        <HeroSection 
          userStats={userStats}
          onNavigate={(path) => navigate(path)}
        />

        {/* Premium Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {premium.slice(0, 6).map((house) => (
            <OpportunityCard
              key={house.id}
              house={house}
              onJoinAffiliate={() => handleJoinAffiliate(house.id)}
              onCopyLink={(link) => copyToClipboard(link)}
              onOpenLink={(link) => window.open(link, '_blank')}
              isPending={joinAffiliateMutation.isPending}
            />
          ))}
          
          {popular.slice(0, 3).map((house) => (
            <OpportunityCard
              key={house.id}
              house={house}
              onJoinAffiliate={() => handleJoinAffiliate(house.id)}
              onCopyLink={(link) => copyToClipboard(link)}
              onOpenLink={(link) => window.open(link, '_blank')}
              isPending={joinAffiliateMutation.isPending}
            />
          ))}
        </div>

        {/* Premium Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="xl:col-span-2 space-y-8">
            {/* Revenue Simulator */}
            <RevenueSimulator 
              selectedHouse={premium[0]}
              onSelectHouse={() => navigate('/betting-houses')}
            />
            
            {/* Activity Feed */}
            <ActivityFeed 
              recentConversions={recentConversions}
              recentPostbacks={recentPostbacks}
              affiliateLinks={affiliateLinks}
            />
          </div>
          
          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Gamification Panel */}
            <GamificationPanel userStats={userStats} />
          </div>
        </div>

        {/* Legacy Tabs - Hidden by default, can be toggled */}
        <div className="mt-12">
          <Button 
            variant="outline" 
            onClick={() => {
              const legacySection = document.getElementById('legacy-tabs');
              if (legacySection) {
                legacySection.style.display = legacySection.style.display === 'none' ? 'block' : 'none';
              }
            }}
            className="mb-6 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Mostrar Dados Detalhados
          </Button>
          
          <div id="legacy-tabs" style={{ display: 'none' }}>
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
            {/* Premium Houses Section - Strategic Focus */}
            <PremiumHousesSection 
              premium={premium}
              affiliateLinks={affiliateLinks}
              onJoinAffiliate={handleJoinAffiliate}
              onCopyLink={copyToClipboard}
              isJoining={joinAffiliateMutation.isPending}
            />
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-center gap-2">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                  Todas as Casas Disponíveis
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
                    const paymentMethods = getPaymentMethods(house.paymentMethods);
                    
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
                        
                        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                          {/* Commission Info */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">Comissão:</span>
                              {getCommissionDisplay(house)}
                            </div>
                            
                            {house.minDeposit && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Depósito Mín:</span>
                                <span className="text-slate-300 text-sm">R$ {house.minDeposit}</span>
                              </div>
                            )}
                          </div>

                          {/* Payment Methods */}
                          {paymentMethods.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-slate-400 text-sm">Métodos de Pagamento:</span>
                              <div className="flex flex-wrap gap-2">
                                {paymentMethods.map((method, index) => (
                                  <span 
                                    key={index} 
                                    className={method.className || "text-slate-300 text-xs bg-slate-800 px-2 py-1 rounded"}
                                  >
                                    {method.icon} {method.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-2">
                            {house.isAffiliated ? (
                              <Button 
                                variant="outline" 
                                className="w-full bg-emerald-600/20 border-emerald-600 text-emerald-400 hover:bg-emerald-600/30"
                                disabled
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Já Afiliado
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleJoinAffiliate(house.id)}
                                disabled={joinAffiliateMutation.isPending}
                                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                {joinAffiliateMutation.isPending ? 'Processando...' : 'Afiliar-se'}
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

          {/* My Links */}
          <TabsContent value="links" className="space-y-4 sm:space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Meus Links de Afiliado
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Links gerados automaticamente ao se afiliar às casas de apostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {linksLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-800 rounded mb-2"></div>
                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : affiliateLinks && affiliateLinks.length > 0 ? (
                  <div className="space-y-4">
                    {affiliateLinks.map((link) => (
                      <div key={link.id} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-slate-200">{link.houseName}</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              Criado em {format(new Date(link.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-emerald-400 border-emerald-500">
                            Ativo
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input 
                            value={link.generatedUrl} 
                            readOnly 
                            className="bg-slate-900 border-slate-600 text-slate-300 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(link.generatedUrl)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum link encontrado.</p>
                    <p className="text-sm">Afilie-se a uma casa de apostas para gerar seus links.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Conversions */}
          <TabsContent value="conversions" className="space-y-4 sm:space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Conversões Recentes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Últimas conversões registradas em suas afiliações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-800 rounded mb-2"></div>
                        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : recentConversions && recentConversions.length > 0 ? (
                  <div className="space-y-4">
                    {recentConversions.map((conversion) => (
                      <div key={conversion.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(conversion.type)}
                          <div>
                            <p className="font-medium text-slate-200">{conversion.houseName}</p>
                            <p className="text-xs text-slate-400">
                              {format(new Date(conversion.convertedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-emerald-400 border-emerald-500 mb-1">
                            {conversion.type}
                          </Badge>
                          {conversion.commission && (
                            <p className="text-sm text-emerald-400 font-medium">
                              R$ {conversion.commission}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversão encontrada.</p>
                    <p className="text-sm">Conversões aparecerão aqui quando ocorrerem.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Postbacks */}
          <TabsContent value="postbacks" className="space-y-4 sm:space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Postbacks Recentes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Últimos postbacks recebidos das casas de apostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postbacksLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-800 rounded mb-2"></div>
                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : recentPostbacks && recentPostbacks.length > 0 ? (
                  <div className="space-y-4">
                    {recentPostbacks.map((postback) => (
                      <div key={postback.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="font-medium text-slate-200">{postback.houseName}</p>
                            <p className="text-xs text-slate-400">
                              {format(new Date(postback.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-blue-400 border-blue-500 mb-1">
                            {postback.eventType}
                          </Badge>
                          <p className={`text-sm font-medium ${getStatusColor(postback.status)}`}>
                            {postback.status === 'success' ? 'Sucesso' : 'Erro'}
                          </p>
                        </div>
                      </div>
                    ))}
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

        {/* Quick Actions FAB */}
        <QuickActionsFab 
          onCopyBestLink={() => {
            const bestLink = affiliateLinks?.find(link => link.houseName)?.generatedUrl;
            if (bestLink) copyToClipboard(bestLink);
          }}
          onNewAffiliate={() => navigate('/betting-houses')}
          onSupport={() => {}} 
          onAnalytics={() => navigate('/analytics')}
        />
      </div>
    </CenteredLayout>
  );
}