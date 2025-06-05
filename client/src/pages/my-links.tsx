import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link2, Search, Filter, Copy, ExternalLink, TrendingUp, MousePointer, DollarSign, Calendar, AlertCircle, Crown, CheckCircle2 } from 'lucide-react';
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AffiliateLink {
  id: number;
  userId: number;
  houseId: number;
  generatedUrl: string;
  isActive: boolean;
  createdAt: string;
  house: {
    id: number;
    name: string;
    logoUrl: string | null;
    commissionType: string;
    cpaValue: string | null;
    revshareValue: string | null;
  };
  clickCount: number;
  conversionCount: number;
  totalCommission: string;
}

export default function MyLinks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch affiliate links with performance data
  const { data: affiliateLinks, isLoading } = useQuery<AffiliateLink[]>({
    queryKey: ['/api/affiliate/my-links'],
  });

  const filteredLinks = affiliateLinks?.filter(link => {
    const matchesSearch = link.house.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerformance = performanceFilter === 'all' || 
      (performanceFilter === 'with-conversions' && link.conversionCount > 0) ||
      (performanceFilter === 'no-conversions' && link.conversionCount === 0);
    
    return matchesSearch && matchesPerformance;
  }) || [];

  const copyToClipboard = async (url: string, linkId: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(linkId);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getCommissionBadge = (house: any) => {
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

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-slate-800 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-slate-800 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 pt-[62px] pb-[62px]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-blue-400 flex items-center gap-3">
                  <Link2 className="h-10 w-10" />
                  Meus Links de Afiliação
                </h1>
                <p className="text-slate-400 mt-2">
                  Veja o desempenho dos seus links já gerados nas casas de apostas
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome da casa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por desempenho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os links</SelectItem>
                  <SelectItem value="with-conversions">Com conversões</SelectItem>
                  <SelectItem value="no-conversions">Sem conversões</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Links Grid */}
          {filteredLinks.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800 text-center py-16">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-slate-800 rounded-full">
                    <Link2 className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-300">
                      {searchTerm || performanceFilter !== 'all' 
                        ? 'Nenhum link encontrado' 
                        : 'Você ainda não gerou nenhum link de afiliação'
                      }
                    </h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      {searchTerm || performanceFilter !== 'all'
                        ? 'Tente ajustar os filtros ou criar novos links.'
                        : 'Novos links devem ser gerados na página Casas de Apostas.'
                      }
                    </p>
                  </div>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a href="/betting-houses">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Explorar Casas de Apostas
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((link) => {
                const badge = getCommissionBadge(link.house);
                
                return (
                  <Card key={link.id} className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader className="pb-4">
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
                              <Crown className="h-6 w-6 text-blue-400" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg text-slate-100">{link.house.name}</CardTitle>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(link.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        <Badge className={`${badge.color} text-white text-xs`}>
                          {badge.text}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <MousePointer className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="text-lg font-bold text-white">{link.clickCount}</div>
                          <div className="text-xs text-slate-400">Cliques</div>
                        </div>
                        
                        <div className="text-center p-3 bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="text-lg font-bold text-white">{link.conversionCount}</div>
                          <div className="text-xs text-slate-400">Conversões</div>
                        </div>
                        
                        <div className="text-center p-3 bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="h-4 w-4 text-yellow-400" />
                          </div>
                          <div className="text-lg font-bold text-white">
                            {link.totalCommission ? formatCurrency(link.totalCommission) : 'R$ 0,00'}
                          </div>
                          <div className="text-xs text-slate-400">Comissão</div>
                        </div>
                      </div>

                      {/* Performance Status */}
                      {link.clickCount === 0 && link.conversionCount === 0 ? (
                        <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400">Sem cliques ou conversões ainda</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-emerald-900/20 rounded-lg border border-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-emerald-300">Link ativo com performance</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(link.generatedUrl, link.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          {copiedLinkId === link.id ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar Link
                            </>
                          )}
                        </Button>
                        
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-slate-600 hover:bg-slate-800"
                        >
                          <a href={link.generatedUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Footer Notice */}
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              Novos links devem ser gerados na{' '}
              <a href="/betting-houses" className="text-blue-400 hover:text-blue-300 underline">
                página Casas de Apostas
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}