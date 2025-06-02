import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  MousePointer,
  UserPlus,
  CreditCard,
  Activity,
} from "lucide-react";

interface UserStats {
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommission: string;
  conversionRate: number;
}

interface Conversion {
  id: number;
  type: string;
  amount: string;
  commission: string;
  convertedAt: string;
  house?: string;
  status?: string;
}

interface Link {
  id: number;
  houseId: number;
  houseName?: string;
  generatedUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserReportsStable() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user stats with error handling
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/affiliate/stats"],
    retry: 1,
  });

  // Fetch conversions with error handling
  const { data: conversions = [], isLoading: conversionsLoading } = useQuery<Conversion[]>({
    queryKey: ["/api/affiliate/conversions"],
    retry: 1,
  });

  // Fetch links with error handling
  const { data: links = [], isLoading: linksLoading } = useQuery<Link[]>({
    queryKey: ["/api/affiliate/links"],
    retry: 1,
  });

  // Safe stats with defaults
  const safeStats = {
    totalClicks: stats?.totalClicks ?? 0,
    totalRegistrations: stats?.totalRegistrations ?? 0,
    totalDeposits: stats?.totalDeposits ?? 0,
    totalCommission: stats?.totalCommission ?? "0.00",
    conversionRate: stats?.conversionRate ?? 0,
  };

  // Safe arrays
  const safeConversions = Array.isArray(conversions) ? conversions : [];
  const safeLinks = Array.isArray(links) ? links : [];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      registration: 'bg-green-500',
      deposit: 'bg-blue-500',
      profit: 'bg-purple-500',
    };
    const labels = {
      registration: 'Cadastro',
      deposit: 'Depósito',
      profit: 'Lucro',
    };
    
    const color = colors[type as keyof typeof colors] || 'bg-gray-500';
    const label = labels[type as keyof typeof labels] || type;
    
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  if (statsLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Relatórios Detalhados
        </h1>
        <p className="text-slate-400">
          Performance completa e histórico de conversões do afiliado
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger 
            value="overview" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="conversions" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            Conversões
          </TabsTrigger>
          <TabsTrigger 
            value="links" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <MousePointer className="w-4 h-4 mr-2" />
                  Cliques Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {safeStats.totalClicks}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {safeStats.totalRegistrations}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Depósitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {safeStats.totalDeposits}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Comissão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">
                  R$ {safeStats.totalCommission}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Avançadas */}
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Métricas Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Taxa de Conversão</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {safeStats.conversionRate.toFixed(2)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Valor Médio por Depósito</div>
                  <div className="text-2xl font-bold text-blue-400">R$ 0,00</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Eficiência</div>
                  <div className="text-2xl font-bold text-green-400">0.0%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Performance Mensal</CardTitle>
              <CardDescription className="text-slate-400">
                Acompanhe seu desempenho ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-slate-400">Gráfico de performance em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Histórico de Conversões
              </CardTitle>
              <CardDescription className="text-slate-400">
                Todas as suas conversões registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionsLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Carregando conversões...</p>
                </div>
              ) : safeConversions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nenhuma conversão encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-slate-300">Data</TableHead>
                        <TableHead className="text-slate-300">Tipo</TableHead>
                        <TableHead className="text-slate-300">Casa</TableHead>
                        <TableHead className="text-slate-300">Valor</TableHead>
                        <TableHead className="text-slate-300">Comissão</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeConversions.map((conversion) => (
                        <TableRow key={conversion.id} className="border-slate-700">
                          <TableCell className="text-slate-300">
                            {formatDate(conversion.convertedAt)}
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(conversion.type)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {conversion.house || 'N/A'}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            R$ {parseFloat(conversion.amount || '0').toFixed(2)}
                          </TableCell>
                          <TableCell className="text-emerald-400">
                            R$ {parseFloat(conversion.commission || '0').toFixed(2)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Links de Afiliado Ativos
              </CardTitle>
              <CardDescription className="text-slate-400">
                Seus links de afiliação por casa de apostas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linksLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Carregando links...</p>
                </div>
              ) : safeLinks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nenhum link encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-slate-300">Casa de Apostas</TableHead>
                        <TableHead className="text-slate-300">Link</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeLinks.map((link) => (
                        <TableRow key={link.id} className="border-slate-700">
                          <TableCell className="text-slate-300 font-medium">
                            {link.houseName || `Casa ${link.houseId}`}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="max-w-xs truncate">
                              {link.generatedUrl}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={link.isActive ? 'default' : 'secondary'}>
                              {link.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {formatDate(link.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}