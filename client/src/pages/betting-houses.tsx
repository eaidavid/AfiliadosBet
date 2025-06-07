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
import { useToast } from '@/hooks/use-toast';
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

interface BettingHouse {
  id: number;
  name: string;
  description: string | null;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [affiliationFilter, setAffiliationFilter] = useState('all');
  const [selectedHouse, setSelectedHouse] = useState<BettingHouse | null>(null);
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedStatsHouse, setSelectedStatsHouse] = useState<BettingHouse | null>(null);

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
            <span className="font-medium text-blue-400">RevShare:</span>
            <span className="text-slate-300 ml-1">{house.revshareValue || house.commissionValue}</span>
          </div>
        );
      case 'Hybrid':
        return (
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium text-emerald-400">CPA:</span>
              <span className="text-slate-300 ml-1">R$ {house.cpaValue}</span>
            </div>
            <div>
              <span className="font-medium text-blue-400">RevShare:</span>
              <span className="text-slate-300 ml-1">{house.revshareValue}</span>
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
      if (lowercaseMethod.includes('pix')) return { name: 'Pix', icon: '🟢' };
      if (lowercaseMethod.includes('cartão') || lowercaseMethod.includes('card')) return { name: 'Cartão', icon: '💳' };
      if (lowercaseMethod.includes('boleto')) return { name: 'Boleto', icon: '📄' };
      if (lowercaseMethod.includes('cripto') || lowercaseMethod.includes('crypto')) return { name: 'Cripto', icon: '🪙' };
      return { name: method, icon: '💰' };
    });
  };

  const getHouseHighlights = (house: BettingHouse) => {
    const highlights = [];
    const commissions = getCommissionDisplayArray(house);
    
    if (commissions.length === 2) {
      highlights.push({ text: 'Comissão Híbrida', icon: '🔥', color: 'bg-orange-500' });
    }
    
    if (commissions.some(c => c.type === 'CPA' && parseFloat(c.value.replace(/[^\d]/g, '')) >= 50)) {
      highlights.push({ text: 'Alta Comissão', icon: '💎', color: 'bg-purple-500' });
    }
    
    if (house.isActive) {
      highlights.push({ text: 'Casa Ativa', icon: '✅', color: 'bg-emerald-500' });
    }
    
    const daysActive = Math.floor((Date.now() - new Date(house.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysActive <= 30) {
      highlights.push({ text: 'Novidade', icon: '🆕', color: 'bg-blue-500' });
    }
    
    return highlights.slice(0, 3);
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
      <div className="p-6 pt-[69px] pb-[69px]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-emerald-400 flex items-center gap-3">
                  <Building2 className="h-10 w-10" />
                  Casas de Apostas
                </h1>
                <p className="text-slate-300 text-lg mt-2">
                  Descubra as melhores oportunidades de afiliação e maximize seus ganhos.
                </p>
              </div>
              
              {/* Stats */}
              {!statsLoading && stats && (
                <div className="flex gap-4 text-center">
                  <div className="bg-slate-900/50 px-4 py-2 rounded-lg">
                    <div className="text-xl font-bold text-emerald-400">{stats.totalHouses}</div>
                    <div className="text-xs text-slate-400">Casas Disponíveis</div>
                  </div>
                  <div className="bg-slate-900/50 px-4 py-2 rounded-lg">
                    <div className="text-xl font-bold text-blue-400">{stats.affiliatedHouses}</div>
                    <div className="text-xs text-slate-400">Afiliações Ativas</div>
                  </div>
                </div>
              )}
            </div>
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

          {/* Houses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {housesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-slate-800 rounded mb-4"></div>
                    <div className="h-4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-4 bg-slate-800 rounded w-2/3"></div>
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
              filteredHouses.map((house: any) => {
                const commissions = getCommissionDisplay(house);
                const paymentMethods = getPaymentMethods(house.paymentMethods);
                const highlights = getHouseHighlights(house);
                
                return (
                  <Card key={house.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all duration-300 hover:scale-105">
                    <CardHeader className="pb-3">
                      {/* Header with Logo and Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {house.logoUrl ? (
                            <img 
                              src={house.logoUrl} 
                              alt={house.name}
                              className="h-16 w-16 rounded-lg object-cover bg-slate-800"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Crown className="h-8 w-8 text-emerald-400" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg text-slate-100">{house.name}</CardTitle>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                              <Calendar className="h-3 w-3" />
                              Ativa desde {format(new Date(house.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                        
                        <Badge 
                          variant={house.isAffiliated ? "default" : "secondary"}
                          className={house.isAffiliated ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"}
                        >
                          {house.isAffiliated ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Afiliado
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Não afiliado
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {highlights.map((highlight, idx) => (
                            <Badge key={idx} className={`${highlight.color} text-white text-xs`}>
                              <span className="mr-1">{highlight.icon}</span>
                              {highlight.text}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Commission Panel */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Comissões
                        </h4>
                        <div className="bg-slate-800 rounded-lg p-3">
                          {getCommissionDisplay(house)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {(() => {
                            const badge = getCommissionBadge(house);
                            return (
                              <Badge className={`${badge.color} text-white text-xs`}>
                                {badge.text}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Financial Data */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Informações Financeiras
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Depósito mínimo:</span>
                            <span className="text-slate-300">
                              {house.minDeposit ? `R$ ${house.minDeposit}` : 'R$ 0'}
                            </span>
                          </div>
                          
                          {paymentMethods.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {paymentMethods.map((method, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  <span className="mr-1">{method.icon}</span>
                                  {method.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {house.description && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-slate-300">Sobre a Casa</h4>
                          <p className="text-sm text-slate-400 line-clamp-2">
                            {house.description}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-4 border-t border-slate-700">
                        {house.isAffiliated ? (
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              onClick={() => {
                                // Find the user's affiliate link for this house
                                const userLink = Array.isArray(affiliateLinks) ? affiliateLinks.find((link: any) => link.houseId === house.id) : null;
                                if (userLink) {
                                  copyAffiliateLink(userLink.generatedUrl);
                                } else {
                                  toast({
                                    title: "Link não encontrado",
                                    description: "Não foi possível encontrar seu link de afiliado para esta casa.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar Meu Link
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full text-slate-400" 
                              size="sm"
                              onClick={() => showHouseStatistics(house)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver Estatísticas
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            onClick={() => handleAffiliate(house)}
                            disabled={affiliateMutation.isPending}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            {affiliateMutation.isPending ? 'Afiliando...' : 'Se Afiliar Agora'}
                            <ChevronRight className="h-4 w-4 ml-2" />
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
                {affiliateMutation.isPending ? 'Processando...' : 'Confirmar Afiliação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Statistics Dialog */}
        <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-emerald-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise Completa - {selectedStatsHouse?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Estatísticas detalhadas de performance e conversão para esta casa de apostas
              </DialogDescription>
            </DialogHeader>

            {selectedStatsHouse && (
              <div className="space-y-6">
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs">Total de Cliques</p>
                          <p className="text-2xl font-bold text-emerald-400">
                            {houseStats ? (houseStats as any).totalClicks || 0 : 0}
                          </p>
                        </div>
                        <MousePointer className="h-8 w-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs">Registros</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {houseStats ? (houseStats as any).totalRegistrations || 0 : 0}
                          </p>
                        </div>
                        <UserPlus className="h-8 w-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs">Depósitos</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {houseStats ? (houseStats as any).totalDeposits || 0 : 0}
                          </p>
                        </div>
                        <Banknote className="h-8 w-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs">Comissão Total</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            R$ {houseStats ? (houseStats as any).totalCommission?.toFixed(2) || '0.00' : '0.00'}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-800">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">
                      Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-emerald-600">
                      Performance
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="data-[state=active]:bg-emerald-600">
                      Tendências
                    </TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-emerald-600">
                      Detalhes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Conversion Rate */}
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Taxa de Conversão
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-emerald-400">
                                {houseStats ? ((houseStats as any).conversionRate || 0).toFixed(2) : '0.00'}%
                              </span>
                              {(() => {
                                const metrics = getPerformanceMetrics();
                                return metrics?.trend === 'up' ? (
                                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="h-5 w-5 text-red-400" />
                                );
                              })()}
                            </div>
                            <Progress 
                              value={houseStats ? (houseStats as any).conversionRate || 0 : 0} 
                              className="h-2" 
                            />
                            <p className="text-xs text-slate-400">
                              {(() => {
                                const metrics = getPerformanceMetrics();
                                return metrics?.performance || 'Sem dados';
                              })()} performance
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Average Commission */}
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Comissão Média
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <span className="text-2xl font-bold text-yellow-400">
                              R$ {houseStats ? ((houseStats as any).avgCommission || 0).toFixed(2) : '0.00'}
                            </span>
                            <p className="text-xs text-slate-400">
                              Por conversão realizada
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Atividade Recente (30 dias)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">
                              {houseStats ? (houseStats as any).recentClicks || 0 : 0}
                            </p>
                            <p className="text-xs text-slate-400">Cliques Recentes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-400">
                              {houseStats ? (houseStats as any).recentConversions || 0 : 0}
                            </p>
                            <p className="text-xs text-slate-400">Conversões Recentes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                          <LineChart className="h-4 w-4" />
                          Performance nos Últimos 7 Dias
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {houseStats && (houseStats as any).dailyStats?.map((day: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                              <span className="text-sm text-slate-300">
                                {format(new Date(day.date), 'dd/MM', { locale: ptBR })}
                              </span>
                              <div className="flex items-center gap-4">
                                <div className="text-xs text-blue-400">
                                  {day.clicks} cliques
                                </div>
                                <div className="text-xs text-purple-400">
                                  {day.conversions} conversões
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="trends" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Análise de Crescimento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Crescimento Mensal</span>
                            <span className={`font-bold ${(houseStats as any)?.monthlyGrowth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {houseStats ? ((houseStats as any).monthlyGrowth || 0).toFixed(1) : '0.0'}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.abs((houseStats as any)?.monthlyGrowth || 0)} 
                            className="h-2" 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          Informações do Link
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Criado em:</span>
                            <span className="text-slate-300">
                              {houseStats ? format(new Date((houseStats as any).linkCreatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tipo de Comissão:</span>
                            <span className="text-slate-300">{selectedStatsHouse.commissionType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <Badge className="bg-emerald-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  const userLink = Array.isArray(affiliateLinks) ? affiliateLinks.find((link: any) => link.houseId === selectedStatsHouse?.id) : null;
                  if (userLink) {
                    copyAffiliateLink(userLink.generatedUrl);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}