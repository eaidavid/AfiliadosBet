import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, DollarSign, Users, Building2, MousePointer, UserPlus, Wallet, Link as LinkIcon, BarChart3 } from "lucide-react";
import UserSidebar from "@/components/user/sidebar";

// Função helper para formatação de moeda
const formatCurrency = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue || 0);
};

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

export default function UserReports() {
  const { user } = useAuth();

  const { data: conversions = [], isLoading: conversionsLoading, error: conversionsError } = useQuery<ConversionData[]>({
    queryKey: ['/api/user/conversions'],
    enabled: !!user,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: stats = {}, isLoading: statsLoading, error: statsError } = useQuery<ConversionStats>({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: houses = [], isLoading: housesLoading, error: housesError } = useQuery<HouseData[]>({
    queryKey: ['/api/houses'],
    enabled: !!user,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: links = [], isLoading: linksLoading, error: linksError } = useQuery<LinkData[]>({
    queryKey: ['/api/user/links'],
    enabled: !!user,
    retry: 3,
    retryDelay: 1000,
  });

  const isLoading = conversionsLoading || statsLoading || housesLoading || linksLoading;
  const hasError = conversionsError || statsError || housesError || linksError;

  // Calcular estatísticas dos últimos 30 dias
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentConversions = conversions?.filter(conv => 
    new Date(conv.convertedAt) >= last30Days
  ) || [];

  const conversionsByType = recentConversions.reduce((acc: Record<string, number>, conv) => {
    acc[conv.type] = (acc[conv.type] || 0) + 1;
    return acc;
  }, {});

  const conversionsByHouse = recentConversions.reduce((acc: Record<string, number>, conv) => {
    acc[conv.houseName] = (acc[conv.houseName] || 0) + 1;
    return acc;
  }, {});

  const totalCommissionLast30Days = recentConversions.reduce((total, conv) => {
    return total + parseFloat(conv.commission || '0');
  }, 0);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <UserSidebar currentPage="reports" onPageChange={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-emerald-500 text-xl">Carregando relatórios...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <UserSidebar currentPage="reports" onPageChange={() => {}} />
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">Erro ao carregar relatórios</div>
            <div className="text-slate-400">Verifique sua conexão e tente novamente</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <UserSidebar currentPage="reports" onPageChange={() => {}} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
            <p className="text-slate-400">Análise detalhada do seu desempenho como afiliado</p>
          </div>

          {/* Cards de estatísticas gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Total de Cliques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalClicks || 0}
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
                  {stats.totalRegistrations || 0}
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
                  {stats.totalDeposits || 0}
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
                  {formatCurrency(stats.totalCommission || '0')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo dos últimos 30 dias */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Desempenho dos Últimos 30 Dias
              </CardTitle>
              <CardDescription className="text-slate-400">
                Análise do período mais recente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Conversões</div>
                  <div className="text-xl font-bold text-white">{recentConversions.length}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Comissões</div>
                  <div className="text-xl font-bold text-emerald-500">
                    {formatCurrency(totalCommissionLast30Days)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Taxa de Conversão</div>
                  <div className="text-xl font-bold text-white">
                    {stats.conversionRate ? `${stats.conversionRate.toFixed(2)}%` : '0%'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-600">
                Análise
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversions">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Histórico de Conversões</CardTitle>
                  <CardDescription className="text-slate-400">
                    Todas as suas conversões registradas ({conversions.length} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {conversions && conversions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-800">
                            <TableHead className="text-slate-300">Data</TableHead>
                            <TableHead className="text-slate-300">Casa</TableHead>
                            <TableHead className="text-slate-300">Tipo</TableHead>
                            <TableHead className="text-slate-300">Valor</TableHead>
                            <TableHead className="text-slate-300">Comissão</TableHead>
                            <TableHead className="text-slate-300">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {conversions.map((conversion) => (
                            <TableRow key={conversion.id} className="border-slate-800">
                              <TableCell className="text-slate-300">
                                {new Date(conversion.convertedAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="text-white">{conversion.houseName}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  conversion.type === 'registration' ? 'secondary' :
                                  conversion.type === 'deposit' ? 'default' : 'destructive'
                                }>
                                  {conversion.type === 'registration' ? 'Registro' :
                                   conversion.type === 'deposit' ? 'Depósito' : 
                                   conversion.type === 'profit' ? 'Lucro' : conversion.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {formatCurrency(conversion.amount || '0')}
                              </TableCell>
                              <TableCell className="text-emerald-500 font-semibold">
                                {formatCurrency(conversion.commission || '0')}
                              </TableCell>
                              <TableCell>
                                <Badge variant={conversion.status === 'paid' ? 'default' : 'secondary'}>
                                  {conversion.status === 'paid' ? 'Pago' : 'Pendente'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Nenhuma conversão registrada ainda
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="houses">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Casas de Apostas Disponíveis</CardTitle>
                  <CardDescription className="text-slate-400">
                    Plataformas disponíveis para afiliação ({houses.length} casas)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {houses.map((house) => (
                      <Card key={house.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-white">{house.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={house.isActive ? 'default' : 'secondary'}>
                                  {house.isActive ? 'Ativa' : 'Inativa'}
                                </Badge>
                                {conversionsByHouse[house.name] && (
                                  <span className="text-xs text-slate-400">
                                    {conversionsByHouse[house.name]} conversões
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Meus Links de Afiliado</CardTitle>
                  <CardDescription className="text-slate-400">
                    Links gerados para suas campanhas ({links.length} links)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {links.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-800">
                            <TableHead className="text-slate-300">Casa</TableHead>
                            <TableHead className="text-slate-300">Link</TableHead>
                            <TableHead className="text-slate-300">Status</TableHead>
                            <TableHead className="text-slate-300">Criado em</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {links.map((link) => (
                            <TableRow key={link.id} className="border-slate-800">
                              <TableCell className="text-white">{link.houseName}</TableCell>
                              <TableCell className="text-slate-300 max-w-xs">
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4" />
                                  <span className="truncate">{link.generatedUrl}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={link.isActive ? 'default' : 'secondary'}>
                                  {link.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(link.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Nenhum link gerado ainda
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Conversões por Tipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(conversionsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-slate-300 capitalize">
                            {type === 'registration' ? 'Registros' :
                             type === 'deposit' ? 'Depósitos' :
                             type === 'profit' ? 'Lucros' : type}
                          </span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                      ))}
                      {Object.keys(conversionsByType).length === 0 && (
                        <div className="text-slate-400 text-center py-4">
                          Nenhuma conversão nos últimos 30 dias
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Conversões por Casa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(conversionsByHouse).map(([house, count]) => (
                        <div key={house} className="flex items-center justify-between">
                          <span className="text-slate-300">{house}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                      ))}
                      {Object.keys(conversionsByHouse).length === 0 && (
                        <div className="text-slate-400 text-center py-4">
                          Nenhuma conversão nos últimos 30 dias
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}