import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, DollarSign, Users, Building2, Eye, MousePointer, UserPlus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import UserSidebar from "@/components/user/sidebar";

// Função helper para formatação de moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface ConversionData {
  id: number;
  evento: string;
  casa: string;
  valor: string;
  status: string;
  criadoEm: string;
  subid: string;
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
  logo: string;
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

  const { data: conversions = [], isLoading: conversionsLoading } = useQuery({
    queryKey: ['/api/user/conversions'],
    enabled: !!user,
  });

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  const { data: houses = [], isLoading: housesLoading } = useQuery({
    queryKey: ['/api/houses'],
    enabled: !!user,
  });

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ['/api/user/links'],
    enabled: !!user,
  });

  const isLoading = conversionsLoading || statsLoading || housesLoading || linksLoading;

  // Calcular estatísticas dos últimos 30 dias
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentConversions = (conversions as ConversionData[])?.filter(conv => 
    new Date(conv.criadoEm) >= last30Days
  ) || [];

  const conversionsByType = recentConversions.reduce((acc: Record<string, number>, conv) => {
    acc[conv.evento] = (acc[conv.evento] || 0) + 1;
    return acc;
  }, {});

  const conversionsByHouse = recentConversions.reduce((acc: Record<string, number>, conv) => {
    acc[conv.casa] = (acc[conv.casa] || 0) + 1;
    return acc;
  }, {});

  const totalCommissionLast30Days = recentConversions.reduce((total, conv) => {
    return total + parseFloat(conv.valor || '0');
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

  const typedStats = stats as ConversionStats;
  const typedHouses = houses as HouseData[];
  const typedLinks = links as LinkData[];

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
                  {typedStats.totalClicks || 0}
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
                  {typedStats.totalRegistrations || 0}
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
                  {typedStats.totalDeposits || 0}
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
                  {formatCurrency(parseFloat(typedStats.totalCommission || '0'))}
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
                    {typedStats.conversionRate ? `${typedStats.conversionRate.toFixed(2)}%` : '0%'}
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
                    Todas as suas conversões registradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {conversions && (conversions as ConversionData[]).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800">
                          <TableHead className="text-slate-300">Data</TableHead>
                          <TableHead className="text-slate-300">Casa</TableHead>
                          <TableHead className="text-slate-300">Tipo</TableHead>
                          <TableHead className="text-slate-300">Valor</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Subid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(conversions as ConversionData[]).map((conversion) => (
                          <TableRow key={conversion.id} className="border-slate-800">
                            <TableCell className="text-slate-300">
                              {new Date(conversion.criadoEm).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-white">{conversion.casa}</TableCell>
                            <TableCell>
                              <Badge variant={
                                conversion.evento === 'registration' ? 'secondary' :
                                conversion.evento === 'deposit' ? 'default' : 'destructive'
                              }>
                                {conversion.evento === 'registration' ? 'Registro' :
                                 conversion.evento === 'deposit' ? 'Depósito' : 
                                 conversion.evento === 'profit' ? 'Lucro' : conversion.evento}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-emerald-500">
                              {formatCurrency(parseFloat(conversion.valor || '0'))}
                            </TableCell>
                            <TableCell>
                              <Badge variant={conversion.status === 'approved' ? 'default' : 'secondary'}>
                                {conversion.status === 'approved' ? 'Aprovado' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">{conversion.subid}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                    Plataformas disponíveis para afiliação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typedHouses.map((house) => (
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
                    Links gerados para suas campanhas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {typedLinks.length > 0 ? (
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
                        {typedLinks.map((link) => (
                          <TableRow key={link.id} className="border-slate-800">
                            <TableCell className="text-white">{link.houseName}</TableCell>
                            <TableCell className="text-slate-300 max-w-xs truncate">
                              {link.generatedUrl}
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
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Nenhum link gerado ainda. Visite a seção "Links" para criar seus primeiros links.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Conversões por Tipo</CardTitle>
                    <CardDescription className="text-slate-400">
                      Últimos 30 dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(conversionsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-slate-300 capitalize">
                            {type === 'registration' ? 'Registros' :
                             type === 'deposit' ? 'Depósitos' :
                             type === 'profit' ? 'Lucros' : type}
                          </span>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                      {Object.keys(conversionsByType).length === 0 && (
                        <div className="text-center py-4 text-slate-400">
                          Nenhuma conversão nos últimos 30 dias
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Conversões por Casa</CardTitle>
                    <CardDescription className="text-slate-400">
                      Últimos 30 dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(conversionsByHouse).map(([house, count]) => (
                        <div key={house} className="flex items-center justify-between">
                          <span className="text-slate-300">{house}</span>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                      {Object.keys(conversionsByHouse).length === 0 && (
                        <div className="text-center py-4 text-slate-400">
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