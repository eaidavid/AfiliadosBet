import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SidebarLayout from '@/components/sidebar-layout';

import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { apiRequest } from '@/lib/queryClient';
import { PremiumBottomNav2026 } from '@/components/premium-bottom-nav-2026';
import { PremiumHouseCard } from '@/components/premium/premium-house-card';
import {
  Search,
  Filter,
  Building2,
  CheckCircle,
  TrendingUp,
  Crown
} from 'lucide-react';

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

export default function BettingHousesPremium() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('all');
  const [affiliationFilter, setAffiliationFilter] = useState('all');
  const [selectedHouse, setSelectedHouse] = useState<BettingHouse | null>(null);
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false);

  // Fetch betting houses
  const { data: bettingHouses, isLoading: housesLoading, error: housesError } = useQuery({
    queryKey: ['/api/betting-houses'],
  });

  // Fetch affiliate stats with error handling
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/affiliate/stats'],
    initialData: {
      totalClicks: 0,
      totalCommission: '0',
      totalRegistrations: 0
    }
  });

  // Affiliate mutation
  const affiliateMutation = useMutation({
    mutationFn: async (houseId: number) => {
      const response = await apiRequest('/api/affiliate/join', {
        method: 'POST',
        body: JSON.stringify({ houseId }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao se afiliar');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Afiliação realizada!",
        description: "Você agora está afiliado a esta casa de apostas.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/betting-houses'] });
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
        icon: '💰',
        color: 'bg-emerald-500'
      });
    }
    
    if (house.revshareValue) {
      commissions.push({
        type: 'RevShare',
        value: `${house.revshareValue}%`,
        icon: '📈',
        color: 'bg-blue-500'
      });
    }
    
    if (commissions.length === 0 && house.commissionValue) {
      commissions.push({
        type: house.commissionType === 'percentage' ? 'RevShare' : 'CPA',
        value: house.commissionType === 'percentage' ? `${house.commissionValue}%` : `R$ ${house.commissionValue}`,
        icon: house.commissionType === 'percentage' ? '📈' : '💰',
        color: house.commissionType === 'percentage' ? 'bg-blue-500' : 'bg-emerald-500'
      });
    }
    
    return commissions;
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

  return (
    <SidebarLayout>
      <div className="space-y-8">


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
        </div>

        {/* Premium Filters */}
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700/50 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar casa premium..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              
              <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
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
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as casas</SelectItem>
                  <SelectItem value="affiliated">Já afiliado</SelectItem>
                  <SelectItem value="not-affiliated">Não afiliado</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 text-slate-300">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">
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

        {/* Affiliate Confirmation Dialog */}
        <Dialog open={showAffiliateDialog} onOpenChange={setShowAffiliateDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Confirmar Afiliação Premium</DialogTitle>
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
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
              >
                {affiliateMutation.isPending ? 'Afiliando...' : 'Confirmar Afiliação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <PremiumBottomNav2026 />
    </SidebarLayout>
  );
}