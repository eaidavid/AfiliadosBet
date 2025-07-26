import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import SidebarLayout from '@/components/sidebar-layout';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { PremiumMenuBar } from '@/components/premium/premium-menu-bar';
import { PremiumHouseCard } from '@/components/premium/premium-house-card';
import { apiRequest } from '@/lib/queryClient';
import {
  Search,
  Filter,
  Link,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Calendar,
  Users,
  Target,
  Award,
  Zap,
  Crown,
  Star,
  ChevronRight,
  Shield,
  Globe,
  Smartphone,
  BarChart3,
  TrendingDown,
  Eye,
  MousePointer,
  UserPlus,
  Banknote,
  Timer,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateHighlights, getVisualElements, shouldHighlight } from '@/utils/houseHighlights';

interface BettingHouse {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  commissionType: string;
  commissionValue: string | null;
  cpaValue: string | null;
  revshareValue: string | null;
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

interface AffiliateStats {
  totalHouses: number;
  affiliatedHouses: number;
  averageCommission: string;
}

interface AffiliateLink {
  id: number;
  houseName: string;
  generatedUrl: string;
  createdAt: string;
  houseId: number;
}

export default function BettingHouses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [affiliationFilter, setAffiliationFilter] = useState('all');
  const [selectedHouse, setSelectedHouse] = useState<BettingHouse | null>(null);
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedStatsHouse, setSelectedStatsHouse] = useState<BettingHouse | null>(null);

  // Enhanced commission display with strategic visual impact for hybrid houses
  const getCommissionDisplay = (house: BettingHouse) => {
    const commissionType = house.commissionType?.toLowerCase();
    
    if (commissionType === 'hybrid') {
      return (
        <div className="space-y-3">
          {/* CPA Section with enhanced visual impact */}
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-emerald-400/50 shadow-lg">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-400/10 rounded-full -mr-8 -mt-8"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <div>
                  <span className="text-sm font-bold text-green-400">CPA</span>
                  <p className="text-xs text-green-300/80">Por cada cadastro</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-green-400 drop-shadow-lg">
                  R$ {parseFloat(house.cpaValue || '0').toFixed(0)}
                </span>
                <p className="text-xs text-green-300/70">imediato</p>
              </div>
            </div>
          </div>
          
          {/* RevShare Section with enhanced visual impact */}
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/50 shadow-lg">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-full -mr-8 -mt-8"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                <div>
                  <span className="text-sm font-bold text-blue-400">RevShare</span>
                  <p className="text-xs text-blue-300/80">Mensal recorrente</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-400 drop-shadow-lg">
                  {parseFloat(house.revshareValue || '0').toFixed(1)}%
                </span>
                <p className="text-xs text-blue-300/70">para sempre</p>
              </div>
            </div>
          </div>
          
          {/* Combined earning potential with glow effect */}
          <div className="relative text-center p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-400/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 rounded-lg animate-pulse"></div>
            <div className="relative">
              <p className="text-sm font-bold text-yellow-400 mb-1">💎 DUPLA COMISSÃO</p>
              <p className="text-xs text-yellow-300/90">
                Ganhe <span className="font-bold">R$ {parseFloat(house.cpaValue || '0').toFixed(0)}</span> + 
                <span className="font-bold"> {parseFloat(house.revshareValue || '0').toFixed(1)}%</span> mensalmente
              </p>
            </div>
          </div>
        </div>
      );
    }
    
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
        <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-emerald-400/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-400">CPA</span>
            <span className="text-2xl font-black text-emerald-400 drop-shadow-lg">R$ {grossCPA.toFixed(0)}</span>
          </div>
        </div>
      );
    }
    
    if (commissionType === 'revshare') {
      const affiliatePercent = Number(house.revshareAffiliatePercent) || 0;
      
      if (affiliatePercent > 0) {
        return (
          <div className="text-sm">
            <span className="font-medium text-blue-400">RevShare:</span>
            <span className="text-slate-300 ml-1">{affiliatePercent.toFixed(1)}%</span>
          </div>
        );
      }
      
      const grossRevShare = parseFloat(house.revshareValue || house.commissionValue || '0');
      return (
        <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-blue-400">RevShare</span>
            <span className="text-2xl font-black text-blue-400 drop-shadow-lg">{grossRevShare}%</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-sm text-slate-400">
        {house.commissionValue || 'Não especificado'}
      </div>
    );
  };

  // Categorize houses for strategic display
  const categorizeHouses = (houses: BettingHouse[]) => {
    if (!houses || houses.length === 0) return { premium: [], highPaying: [], popular: [], recent: [] };
    
    const premium = houses.filter(h => h.commissionType === 'hybrid').slice(0, 3);
    const highPaying = houses.filter(h => h.commissionType !== 'hybrid' && 
      (parseFloat(h.cpaValue || '0') > 100 || parseFloat(h.revshareValue || '0') > 25)).slice(0, 4);
    const popular = houses.filter(h => h.isActive && h.commissionType !== 'hybrid').slice(0, 6);
    const recent = houses.slice(-4);
    
    return { premium, highPaying, popular, recent };
  };

  const getCommissionBadge = (house: BettingHouse) => {
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

  // Fetch betting houses
  const { data: bettingHouses, isLoading: housesLoading, error: housesError } = useQuery<BettingHouse[]>({
    queryKey: ['/api/betting-houses'],
    retry: 3,
  });

  // Fetch affiliate stats
  const { data: stats, isLoading: statsLoading } = useQuery<AffiliateStats>({
    queryKey: ['/api/stats/user'],
  });

  // Fetch affiliate links
  const { data: affiliateLinks = [] } = useQuery({
    queryKey: ['/api/affiliate/links'],
  });

  // Categorize houses for strategic display
  const { premium, highPaying, popular, recent } = categorizeHouses(bettingHouses || []);

  // Affiliate mutation
  const affiliateMutation = useMutation({
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
      toast({
        title: "Afiliação realizada!",
        description: "Você agora está afiliado a esta casa de apostas.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/betting-houses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/links'] });
      setShowAffiliateDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na afiliação",
        description: error.message || "Não foi possível realizar a afiliação. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const getCommissionDisplayArray = (house: BettingHouse) => {
    const commissions = [];
    
    if (house.cpaValue) {
      commissions.push({
        type: 'CPA',
        value: `R$ ${house.cpaValue}`,
        icon: <DollarSign className="h-4 w-4" />,
        color: 'bg-emerald-500'
      });
    }
    
    if (house.revshareValue) {
      commissions.push({
        type: 'RevShare',
        value: `${house.revshareValue}%`,
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'bg-blue-500'
      });
    }
    
    if (commissions.length === 0 && house.commissionValue) {
      commissions.push({
        type: house.commissionType === 'percentage' ? 'RevShare' : 'CPA',
        value: house.commissionType === 'percentage' ? `${house.commissionValue}%` : `R$ ${house.commissionValue}`,
        icon: house.commissionType === 'percentage' ? <TrendingUp className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />,
        color: house.commissionType === 'percentage' ? 'bg-blue-500' : 'bg-emerald-500'
      });
    }
    
    return commissions;
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

  const getHouseHighlights = (house: BettingHouse) => {
    if (!shouldHighlight(house)) {
      return [];
    }

    const highlight = generateHighlights(house);
    const visual = getVisualElements(highlight);
    
    const highlights = [];
    
    // Main promotional highlight
    if (highlight.badge) {
      highlights.push({
        text: highlight.badge,
        icon: highlight.icon,
        color: visual.badgeColor,
        title: highlight.title,
        subtitle: highlight.subtitle
      });
    }
    
    // Commission-specific highlights
    const commissions = getCommissionDisplayArray(house);
    if (commissions.length === 2) {
      highlights.push({ 
        text: 'DUPLA RECEITA', 
        icon: '💰', 
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        pulse: true
      });
    }
    
    // High commission highlights
    const hasHighRevShare = house.revshareAffiliatePercent && house.revshareAffiliatePercent >= 20;
    const hasHighCPA = house.cpaAffiliatePercent && house.cpaAffiliatePercent >= 30;
    
    if (hasHighRevShare || hasHighCPA) {
      highlights.push({ 
        text: 'COMISSÃO PREMIUM', 
        icon: '⚡', 
        color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        glow: true
      });
    }
    
    return highlights.slice(0, 2);
  };

  const filteredHouses = Array.isArray(bettingHouses) ? bettingHouses.filter((house: any) => {
    const matchesSearch = house.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCommission = commissionFilter === 'all' ||
      (commissionFilter === 'cpa' && (house.cpaValue || house.commissionType === 'fixed')) ||
      (commissionFilter === 'revshare' && (house.revshareValue || house.commissionType === 'percentage')) ||
      (commissionFilter === 'hybrid' && house.cpaValue && house.revshareValue);
    
    const matchesAffiliation = affiliationFilter === 'all' ||
      (affiliationFilter === 'affiliated' && house.isAffiliated) ||
      (affiliationFilter === 'not-affiliated' && !house.isAffiliated);
    
    return matchesSearch && matchesCommission && matchesAffiliation;
  }) : [];

  const handleAffiliate = async (house: BettingHouse) => {
    setSelectedHouse(house);
    setShowAffiliateDialog(true);
  };

  const confirmAffiliate = () => {
    if (selectedHouse) {
      affiliateMutation.mutate(selectedHouse.id);
    }
  };

  const copyAffiliateLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copiado!",
        description: "O link de afiliado foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const showHouseStatistics = (house: BettingHouse) => {
    setSelectedStatsHouse(house);
    setShowStatsDialog(true);
  };

  // Fetch house-specific statistics
  const { data: houseStats } = useQuery({
    queryKey: ['/api/stats/house', selectedStatsHouse?.id],
    enabled: !!selectedStatsHouse,
  });

  const getPerformanceMetrics = () => {
    if (!houseStats) return null;
    
    const stats = houseStats as any;
    const conversionRate = stats.totalClicks > 0 ? (stats.totalRegistrations / stats.totalClicks * 100) : 0;
    const avgCommission = stats.totalCommission > 0 ? (stats.totalCommission / stats.totalRegistrations) : 0;
    
    return {
      conversionRate,
      avgCommission,
      performance: conversionRate > 5 ? 'Excelente' : conversionRate > 2 ? 'Bom' : 'Regular',
      trend: stats.monthlyGrowth > 0 ? 'up' : 'down'
    };
  };

  return (
    <SidebarLayout>
      <div className="p-6 pt-[32px] pb-[32px] pl-[20px] pr-[20px]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Premium Menu Bar */}
          <PremiumMenuBar 
            userStats={{
              totalClicks: stats?.totalClicks,
              totalCommission: stats?.totalCommission?.toString(),
              totalRegistrations: stats?.totalRegistrations
            }}
            activeRoute="/betting-houses"
          />

          {/* Premium Hero Section */}
          <div className="relative overflow-hidden">
            <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-sm border-slate-700/50 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-4xl font-black text-white mb-2">
                          Casas Premium
                        </h1>
                        <p className="text-xl text-emerald-400 font-bold">
                          As Melhores Oportunidades de Afiliação
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-lg max-w-2xl">
                      Descubra casas de apostas com <span className="text-emerald-400 font-bold">comissões exclusivas</span>, 
                      <span className="text-blue-400 font-bold"> dados reais editáveis</span> e 
                      <span className="text-yellow-400 font-bold"> simuladores dinâmicos</span>.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-lg font-bold">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {filteredHouses.length} Casas Ativas
                    </Badge>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 text-lg font-bold">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      {filteredHouses.filter(h => h.commissionType === 'hybrid').length} Premium
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
          </div>

          {/* Banner Promocional */}
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">💥 Oportunidades Especiais</h3>
                  <p className="text-white/90">
                    Casas com comissões premium e pagamentos garantidos esperando por você!
                  </p>
                </div>
                <Zap className="h-12 w-12 text-yellow-300" />
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar casa de apostas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600"
                  />
                </div>
                
                <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Tipo de Comissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="cpa">CPA</SelectItem>
                    <SelectItem value="revshare">RevShare</SelectItem>
                    <SelectItem value="hybrid">Híbrido (CPA + RevShare)</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={affiliationFilter} onValueChange={setAffiliationFilter}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Status de Afiliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as casas</SelectItem>
                    <SelectItem value="affiliated">Já afiliado</SelectItem>
                    <SelectItem value="not-affiliated">Não afiliado</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2 text-slate-300">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">
                    {filteredHouses.length} casa{filteredHouses.length !== 1 ? 's' : ''} encontrada{filteredHouses.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Houses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {housesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
                  <CardContent className="p-8">
                    <div className="h-40 bg-slate-800 rounded-xl mb-6"></div>
                    <div className="h-6 bg-slate-800 rounded mb-4"></div>
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredHouses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  {housesError ? 'Erro ao carregar casas' : 'Nenhuma casa encontrada'}
                </h3>
                <p className="text-slate-400">
                  {housesError 
                    ? 'Verifique sua conexão e tente novamente.' 
                    : 'Tente ajustar os filtros para encontrar mais opções.'
                  }
                </p>
                {housesError && (
                  <Button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/betting-houses'] })}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Tentar Novamente
                  </Button>
                )}
              </div>
            ) : (
              filteredHouses.map((house: any) => (
                <PremiumHouseCard
                  key={house.id}
                  house={house}
                  onJoinAffiliate={(houseId) => affiliateMutation.mutate(houseId)}
                  onCopyLink={copyAffiliateLink}
                  onOpenLink={(link) => window.open(link, '_blank')}
                  isPending={affiliateMutation.isPending}
                />
              ))
            )}
          </div>
        </div>

        {/* Affiliate Confirmation Dialog */}
        <Dialog open={showAffiliateDialog} onOpenChange={setShowAffiliateDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Confirmar Afiliação</DialogTitle>
              <DialogDescription className="text-slate-300">
                Deseja se afiliar à casa de apostas <strong>{selectedHouse?.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            
            {selectedHouse && (
              <div className="space-y-4 py-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-200 mb-2">Detalhes da Afiliação:</h4>
                  <div className="space-y-2 text-sm">
                    {getCommissionDisplayArray(selectedHouse).map((commission, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-slate-400">{commission.type}:</span>
                        <span className="text-slate-200">{commission.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Depósito mínimo:</span>
                      <span className="text-slate-200">
                        {selectedHouse.minDeposit ? `R$ ${selectedHouse.minDeposit}` : 'R$ 0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAffiliateDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmAffiliate}
                disabled={affiliateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {affiliateMutation.isPending ? 'Afiliando...' : 'Confirmar Afiliação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* House Statistics Dialog */}
        <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">
                Estatísticas - {selectedStatsHouse?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedStatsHouse && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">
                      {houseStats?.totalClicks || 0}
                    </div>
                    <div className="text-sm text-slate-400">Total de Cliques</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {houseStats?.totalRegistrations || 0}
                    </div>
                    <div className="text-sm text-slate-400">Registros</div>
                  </div>
                </div>
                
                {getPerformanceMetrics() && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-200">Performance</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Taxa de Conversão:</span>
                        <span className="text-emerald-400 font-bold">
                          {getPerformanceMetrics()?.conversionRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Comissão Média:</span>
                        <span className="text-blue-400 font-bold">
                          R$ {getPerformanceMetrics()?.avgCommission.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Desempenho:</span>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                          {getPerformanceMetrics()?.performance}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <BottomNavigation />
    </SidebarLayout>
  );
}
