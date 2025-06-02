import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MousePointer, 
  UserPlus, 
  Wallet, 
  DollarSign, 
  TrendingUp,
  Building,
  Link as LinkIcon,
  CalendarDays,
  Copy,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ConversionData {
  id: number;
  type: string;
  amount: string;
  commission: string;
  convertedAt: string;
  houseId: number;
  houseName: string;
  status: string;
}

interface ConversionStats {
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommission: string;
  conversionRate: number;
}

interface HouseData {
  id: number;
  name: string;
  identifier: string;
  isActive: boolean;
}

interface LinkData {
  id: number;
  generatedUrl: string;
  houseId: number;
  houseName: string;
  isActive: boolean;
  createdAt: string;
}

const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue || 0);
};

export default function UserReportsPanel() {
  const { toast } = useToast();

  // Fetch user statistics
  const { data: stats = {}, isLoading: statsLoading } = useQuery<ConversionStats>({
    queryKey: ['/api/user/stats'],
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch conversions
  const { data: conversions = [], isLoading: conversionsLoading } = useQuery<ConversionData[]>({
    queryKey: ['/api/user/conversions'],
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch betting houses
  const { data: houses = [], isLoading: housesLoading } = useQuery<HouseData[]>({
    queryKey: ['/api/houses'],
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch user links
  const { data: links = [], isLoading: linksLoading } = useQuery<LinkData[]>({
    queryKey: ['/api/user/links'],
    retry: 3,
    retryDelay: 1000,
  });

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const isLoading = statsLoading || conversionsLoading || housesLoading || linksLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-emerald-500 text-xl">Carregando relatórios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Relatórios</h2>
        <p className="text-slate-400 mt-1">Acompanhe seu desempenho e ganhos</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Total de Cliques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.totalClicks || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.totalRegistrations || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Depósitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.totalDeposits || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Comissões Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(stats?.totalCommission || '0')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Taxa de Conversão</div>
              <div className="text-xl font-bold text-white">
                {stats?.conversionRate ? `${stats.conversionRate.toFixed(2)}%` : '0%'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Conversões Totais</div>
              <div className="text-xl font-bold text-white">
                {conversions?.length || 0}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Links Ativos</div>
              <div className="text-xl font-bold text-white">
                {links?.filter(link => link?.isActive)?.length || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="conversions" className="space-y-6">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="conversions" className="data-[state=active]:bg-emerald-600">
            Conversões
          </TabsTrigger>
          <TabsTrigger value="houses" className="data-[state=active]:bg-emerald-600">
            Casas de Apostas
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-emerald-600">
            Meus Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversions">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Histórico de Conversões</CardTitle>
            </CardHeader>
            <CardContent>
              {conversions?.length > 0 ? (
                <div className="space-y-4">
                  {conversions.map((conversion) => (
                    <div key={conversion.id} className="p-4 bg-slate-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={conversion.type === 'deposit' ? 'default' : 'secondary'}>
                              {conversion.type === 'deposit' ? 'Depósito' : 
                               conversion.type === 'registration' ? 'Registro' : 'Lucro'}
                            </Badge>
                            <span className="text-white font-medium">{conversion.houseName}</span>
                          </div>
                          <div className="text-sm text-slate-400">
                            {formatDate(conversion.convertedAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold">
                            {formatCurrency(conversion.commission)}
                          </div>
                          <div className="text-sm text-slate-400">
                            Valor: {formatCurrency(conversion.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhuma conversão encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="houses">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Casas de Apostas Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              {houses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {houses.map((house) => (
                    <div key={house.id} className="p-4 bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building className="h-8 w-8 text-emerald-500" />
                          <div>
                            <h3 className="text-white font-medium">{house.name}</h3>
                            <p className="text-sm text-slate-400">{house.identifier}</p>
                          </div>
                        </div>
                        <Badge variant={house.isActive ? 'default' : 'secondary'}>
                          {house.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhuma casa de apostas disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Meus Links de Afiliado</CardTitle>
            </CardHeader>
            <CardContent>
              {links?.length > 0 ? (
                <div className="space-y-4">
                  {links.map((link) => (
                    <div key={link.id} className="p-4 bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="h-5 w-5 text-emerald-500" />
                          <div className="space-y-1">
                            <p className="text-white font-medium">{link.houseName}</p>
                            <p className="text-sm text-slate-400">
                              Criado em {formatDate(link.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={link.isActive ? 'default' : 'secondary'}>
                            {link.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.generatedUrl)}
                            className="border-slate-700"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(link.generatedUrl, '_blank')}
                            className="border-slate-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-slate-700 rounded text-sm text-slate-300 break-all">
                        {link.generatedUrl}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum link de afiliado encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}