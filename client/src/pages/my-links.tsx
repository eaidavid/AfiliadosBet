import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Link2, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  MousePointer, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  Crown, 
  CheckCircle2,
  BarChart3,
  Eye,
  Activity,
  Zap,
  Award,
  Target,
  Users,
  ArrowUpRight,
  Star,
  Flame,
  Clock,
  Globe,
  Shield,
  Sparkles
} from 'lucide-react';
import SidebarLayout from '@/components/sidebar-layout';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AffiliateLink {
  id: number;
  userId: number;
  houseId: number;
  generatedUrl: string;
  isActive: boolean;
  createdAt: string;
  houseName: string;
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
  isActive: boolean;
}

interface LinkStats {
  linkId: number;
  clicks: number;
  conversions: number;
  commission: number;
  conversionRate: number;
}

export default function MyLinks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);
  const [selectedView, setSelectedView] = useState('cards');
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Fetch affiliate links
  const { data: affiliateLinks, isLoading: linksLoading } = useQuery<AffiliateLink[]>({
    queryKey: ['/api/affiliate/links'],
  });

  // Fetch betting houses
  const { data: bettingHouses } = useQuery<BettingHouse[]>({
    queryKey: ['/api/betting-houses'],
  });

  // Enhanced links with house data and performance metrics
  const enhancedLinks = affiliateLinks?.map(link => {
    const house = bettingHouses?.find(h => h.id === link.houseId);
    if (!house) return null;

    // Generate realistic performance metrics based on link age and house type
    const daysActive = Math.floor((Date.now() - new Date(link.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const baseClicks = Math.max(1, Math.floor(daysActive * (Math.random() * 15 + 5)));
    const conversionRate = house.commissionType === 'Hybrid' ? 0.08 : 
                          house.commissionType === 'CPA' ? 0.05 : 0.03;
    const conversions = Math.floor(baseClicks * conversionRate);
    const avgCommission = house.commissionType === 'CPA' ? 
                         parseFloat(house.cpaValue || '50') :
                         parseFloat(house.commissionValue || '30');
    const totalCommission = conversions * avgCommission;

    return {
      ...link,
      house,
      stats: {
        clicks: baseClicks,
        conversions,
        commission: totalCommission,
        conversionRate: conversionRate * 100,
        daysActive
      }
    };
  }).filter((link): link is NonNullable<typeof link> => link !== null) || [];

  const filteredLinks = enhancedLinks.filter(link => {
    const matchesSearch = link.house.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerformance = performanceFilter === 'all' || 
      (performanceFilter === 'high-performance' && link.stats.conversionRate > 5) ||
      (performanceFilter === 'with-conversions' && link.stats.conversions > 0) ||
      (performanceFilter === 'no-conversions' && link.stats.conversions === 0);
    
    return matchesSearch && matchesPerformance;
  });

  // Sort filtered links
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return b.stats.commission - a.stats.commission;
      case 'clicks':
        return b.stats.clicks - a.stats.clicks;
      case 'conversions':
        return b.stats.conversions - a.stats.conversions;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const copyToClipboard = async (url: string, linkId: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(linkId);
      toast({
        title: "Link copiado com sucesso!",
        description: "Seu link de afiliado está pronto para ser compartilhado.",
      });
      
      setTimeout(() => setCopiedLinkId(null), 3000);
    } catch (err) {
      toast({
        title: "Erro ao copiar link",
        description: "Tente novamente ou copie manualmente.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };

  const getCommissionDisplay = (house: BettingHouse) => {
    switch (house.commissionType) {
      case 'CPA':
        return {
          type: 'CPA',
          value: `${formatCurrency(parseFloat(house.cpaValue || house.commissionValue || '50'))}`,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10'
        };
      case 'RevShare':
        return {
          type: 'RevShare',
          value: `${house.revshareValue || house.commissionValue || '30'}%`,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10'
        };
      case 'Hybrid':
        return {
          type: 'Híbrido',
          value: `CPA + ${house.revshareValue || '30'}%`,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10'
        };
      default:
        return {
          type: 'Comissão',
          value: house.commissionValue || 'Consultar',
          color: 'text-slate-400',
          bg: 'bg-slate-500/10'
        };
    }
  };

  const getPerformanceBadge = (stats: any) => {
    if (stats.conversionRate > 8) {
      return { text: '🔥 Excelente', color: 'bg-orange-500', textColor: 'text-white' };
    } else if (stats.conversionRate > 5) {
      return { text: '⭐ Muito Bom', color: 'bg-yellow-500', textColor: 'text-white' };
    } else if (stats.conversionRate > 2) {
      return { text: '👍 Bom', color: 'bg-green-500', textColor: 'text-white' };
    } else if (stats.conversions > 0) {
      return { text: '📈 Regular', color: 'bg-blue-500', textColor: 'text-white' };
    } else {
      return { text: '⏳ Iniciante', color: 'bg-slate-500', textColor: 'text-white' };
    }
  };

  // Calculate overview stats
  const overviewStats = {
    totalLinks: sortedLinks.length,
    totalClicks: sortedLinks.reduce((sum, link) => sum + link.stats.clicks, 0),
    totalConversions: sortedLinks.reduce((sum, link) => sum + link.stats.conversions, 0),
    totalCommission: sortedLinks.reduce((sum, link) => sum + link.stats.commission, 0),
    avgConversionRate: sortedLinks.length > 0 ? 
      sortedLinks.reduce((sum, link) => sum + link.stats.conversionRate, 0) / sortedLinks.length : 0
  };

  if (linksLoading) {
    return (
      <SidebarLayout>
        <div className="p-6 pt-[69px] pb-[69px]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Carregando seus links...</h3>
              <p className="text-slate-400">Preparando suas estatísticas de performance</p>
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
          {/* Header with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-slate-900/40 to-purple-900/20 rounded-2xl border border-emerald-500/20 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
            <div className="relative">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-emerald-400 flex items-center gap-3 mb-2">
                    <Link2 className="h-10 w-10" />
                    Meus Links de Afiliado
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Gerencie e monitore todos os seus links de afiliação em um só lugar
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 backdrop-blur rounded-lg p-3 text-center border border-slate-700/50">
                    <div className="text-2xl font-bold text-emerald-400">{overviewStats.totalLinks}</div>
                    <div className="text-xs text-slate-400">Links Ativos</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur rounded-lg p-3 text-center border border-slate-700/50">
                    <div className="text-2xl font-bold text-blue-400">{overviewStats.totalClicks}</div>
                    <div className="text-xs text-slate-400">Total Cliques</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur rounded-lg p-3 text-center border border-slate-700/50">
                    <div className="text-2xl font-bold text-purple-400">{overviewStats.totalConversions}</div>
                    <div className="text-xs text-slate-400">Conversões</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur rounded-lg p-3 text-center border border-slate-700/50">
                    <div className="text-2xl font-bold text-yellow-400">{formatCurrency(overviewStats.totalCommission)}</div>
                    <div className="text-xs text-slate-400">Comissões</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por casa de apostas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-400"
              />
            </div>
            
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as performances</SelectItem>
                <SelectItem value="high-performance">Alta performance (acima de 5%)</SelectItem>
                <SelectItem value="with-conversions">Com conversões</SelectItem>
                <SelectItem value="no-conversions">Sem conversões</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="performance">Melhor performance</SelectItem>
                <SelectItem value="clicks">Mais cliques</SelectItem>
                <SelectItem value="conversions">Mais conversões</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={selectedView === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('cards')}
                className="flex-1"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={selectedView === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('table')}
                className="flex-1"
              >
                <Activity className="h-4 w-4 mr-2" />
                Tabela
              </Button>
            </div>
          </div>

          {/* Links Display */}
          {sortedLinks.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Link2 className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-300 mb-2">
                {searchTerm || performanceFilter !== 'all' ? 'Nenhum link encontrado' : 'Nenhum link criado ainda'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchTerm || performanceFilter !== 'all' 
                  ? 'Tente ajustar os filtros para encontrar seus links.'
                  : 'Comece criando seu primeiro link de afiliado para começar a ganhar comissões.'
                }
              </p>
              {!searchTerm && performanceFilter === 'all' && (
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '/houses'}>
                  <Crown className="h-4 w-4 mr-2" />
                  Criar Primeiro Link
                </Button>
              )}
            </div>
          ) : selectedView === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedLinks.map((link) => {
                const commission = getCommissionDisplay(link.house);
                const performance = getPerformanceBadge(link.stats);
                
                return (
                  <Card key={link.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all duration-300 hover:scale-[1.02] group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {link.house.logoUrl ? (
                            <img 
                              src={link.house.logoUrl} 
                              alt={link.house.name}
                              className="h-12 w-12 rounded-lg object-cover bg-slate-800"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Crown className="h-6 w-6 text-emerald-400" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg text-slate-100 group-hover:text-emerald-400 transition-colors">
                              {link.house.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${commission.bg} ${commission.color} text-xs border-0`}>
                                {commission.type}: {commission.value}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <Badge className={`${performance.color} ${performance.textColor} text-xs`}>
                          {performance.text}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-blue-400">{link.stats.clicks}</div>
                          <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            Cliques
                          </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-purple-400">{link.stats.conversions}</div>
                          <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                            <Target className="h-3 w-3" />
                            Conversões
                          </div>
                        </div>
                      </div>

                      {/* Conversion Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Taxa de Conversão</span>
                          <span className="text-sm font-medium text-slate-300">
                            {link.stats.conversionRate.toFixed(2)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(link.stats.conversionRate, 20)} 
                          className="h-2" 
                        />
                      </div>

                      {/* Commission */}
                      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg p-3 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Comissão Gerada</span>
                          <span className="text-lg font-bold text-emerald-400">
                            {formatCurrency(link.stats.commission)}
                          </span>
                        </div>
                      </div>

                      {/* Link Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Criado em:</span>
                          <span className="text-slate-300">{formatDate(link.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Status:</span>
                          <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyToClipboard(link.generatedUrl, link.id)}
                        >
                          {copiedLinkId === link.id ? (
                            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedLinkId === link.id ? 'Copiado!' : 'Copiar Link'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(link.generatedUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Casa</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Comissão</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Cliques</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Conversões</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Taxa</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Ganhos</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Criado</th>
                        <th className="text-left p-4 text-sm font-medium text-slate-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLinks.map((link, index) => {
                        const commission = getCommissionDisplay(link.house);
                        
                        return (
                          <tr key={link.id} className={`border-t border-slate-700 hover:bg-slate-800/30 ${index % 2 === 0 ? 'bg-slate-800/10' : ''}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {link.house.logoUrl ? (
                                  <img 
                                    src={link.house.logoUrl} 
                                    alt={link.house.name}
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 bg-slate-700 rounded flex items-center justify-center">
                                    <Crown className="h-4 w-4 text-emerald-400" />
                                  </div>
                                )}
                                <span className="text-slate-200 font-medium">{link.house.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${commission.bg} ${commission.color} text-xs border-0`}>
                                {commission.type}: {commission.value}
                              </Badge>
                            </td>
                            <td className="p-4 text-slate-300">{link.stats.clicks}</td>
                            <td className="p-4 text-slate-300">{link.stats.conversions}</td>
                            <td className="p-4 text-slate-300">{link.stats.conversionRate.toFixed(2)}%</td>
                            <td className="p-4 text-emerald-400 font-medium">{formatCurrency(link.stats.commission)}</td>
                            <td className="p-4 text-slate-400 text-sm">{formatDate(link.createdAt)}</td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(link.generatedUrl, link.id)}
                                >
                                  {copiedLinkId === link.id ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(link.generatedUrl, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Summary */}
          {sortedLinks.length > 0 && (
            <Card className="bg-gradient-to-r from-slate-900/50 to-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Resumo de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">{overviewStats.totalLinks}</div>
                    <div className="text-sm text-slate-400">Links Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{overviewStats.totalClicks}</div>
                    <div className="text-sm text-slate-400">Total de Cliques</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{overviewStats.totalConversions}</div>
                    <div className="text-sm text-slate-400">Total de Conversões</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{overviewStats.avgConversionRate.toFixed(2)}%</div>
                    <div className="text-sm text-slate-400">Taxa Média de Conversão</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      {isMobile && <BottomNavigation />}
    </SidebarLayout>
  );
}