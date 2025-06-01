import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Calendar, Download, Calculator } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CommissionsManagementProps {
  onPageChange?: (page: string) => void;
}

export default function CommissionsManagement({ onPageChange }: CommissionsManagementProps) {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    period: "month",
    affiliate: "all",
    house: "all",
    status: "all",
  });

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["/api/admin/commissions", filters],
    retry: false,
  });

  // Ensure commissions is always an array
  const safeCommissions = Array.isArray(commissions) ? commissions : [];

  const { data: statsData = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: affiliates = [] } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    retry: false,
  });

  const { data: houses = [] } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
    retry: false,
  });

  // Query for commission summary by affiliate
  const { data: affiliateCommissions = [], isLoading: commissionsLoading } = useQuery({
    queryKey: ["/api/admin/affiliate-commissions"],
    retry: false,
  });

  // Calculate commission statistics
  const commissionStats = {
    totalCommissions: affiliateCommissions.reduce((sum: number, affiliate: any) => 
      sum + parseFloat(affiliate.totalCommissions || 0), 0),
    pendingCommissions: affiliateCommissions.reduce((sum: number, affiliate: any) => 
      sum + parseFloat(affiliate.pendingAmount || 0), 0),
    paidCommissions: affiliateCommissions.reduce((sum: number, affiliate: any) => 
      sum + parseFloat(affiliate.paidAmount || 0), 0),
    totalAffiliates: affiliates.length,
  };

  const processPayment = useMutation({
    mutationFn: async (affiliateId: number) => {
      const response = await apiRequest("POST", `/api/commissions/process-payment/${affiliateId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Pagamento processado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-commissions"] });
    },
  });

  const queryClient = useQueryClient();

  const exportReport = () => {
    toast({
      title: "Relatório sendo gerado",
      description: "O relatório de comissões será baixado em breve.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", label: "Pendente" },
      paid: { color: "bg-green-500", label: "Paga" },
      cancelled: { color: "bg-red-500", label: "Cancelada" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Comissões e Estatísticas</h1>
          <p className="text-slate-400 mt-2">
            Gerencie comissões e acompanhe o desempenho financeiro do sistema
          </p>
        </div>
        <Button onClick={exportReport} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-emerald-600">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="commissions" className="text-white data-[state=active]:bg-emerald-600">
            Comissões
          </TabsTrigger>
          <TabsTrigger value="statistics" className="text-white data-[state=active]:bg-emerald-600">
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                title: "Comissões Pendentes",
                value: `R$ ${commissionStats.pendingCommissions.toFixed(2)}`,
                icon: Calculator,
                color: "text-yellow-400",
                bgColor: "bg-yellow-500/10",
              },
              {
                title: "Comissões Pagas",
                value: `R$ ${commissionStats.paidCommissions.toFixed(2)}`,
                icon: DollarSign,
                color: "text-green-400",
                bgColor: "bg-green-500/10",
              },
              {
                title: "Total de Afiliados",
                value: commissionStats.totalAffiliates,
                icon: Users,
                color: "text-blue-400",
                bgColor: "bg-blue-500/10",
              },
              {
                title: "Comissões Totais",
                value: `R$ ${commissionStats.totalCommissions.toFixed(2)}`,
                icon: TrendingUp,
                color: "text-purple-400",
                bgColor: "bg-purple-500/10",
              },
            ].map((stat, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filtros */}
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Período</label>
                  <Select value={filters.period} onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="week">Esta Semana</SelectItem>
                      <SelectItem value="month">Este Mês</SelectItem>
                      <SelectItem value="quarter">Trimestre</SelectItem>
                      <SelectItem value="year">Este Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Afiliado</label>
                  <Select value={filters.affiliate} onValueChange={(value) => setFilters(prev => ({ ...prev, affiliate: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Todos os afiliados" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">Todos os afiliados</SelectItem>
                      {affiliates.map((affiliate: any) => (
                        <SelectItem key={affiliate.id} value={affiliate.id.toString()}>
                          {affiliate.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Casa</label>
                  <Select value={filters.house} onValueChange={(value) => setFilters(prev => ({ ...prev, house: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Todas as casas" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">Todas as casas</SelectItem>
                      {houses.map((house: any) => (
                        <SelectItem key={house.id} value={house.id.toString()}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="paid">Pagas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Comissões por Afiliado</CardTitle>
              <CardDescription className="text-slate-400">
                Gerencie comissões totais, pendentes e pagas por afiliado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Afiliado</TableHead>
                      <TableHead className="text-slate-300">Total de Comissões</TableHead>
                      <TableHead className="text-slate-300">Pendentes</TableHead>
                      <TableHead className="text-slate-300">Pagas</TableHead>
                      <TableHead className="text-slate-300">Conversões</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400">
                          Carregando comissões...
                        </TableCell>
                      </TableRow>
                    ) : affiliateCommissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400">
                          Nenhum afiliado com comissões encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      affiliateCommissions.map((affiliate: any) => {
                        const totalAmount = parseFloat(affiliate.totalCommissions || 0);
                        const pendingAmount = parseFloat(affiliate.pendingAmount || 0);
                        const paidAmount = parseFloat(affiliate.paidAmount || 0);

                        return (
                          <TableRow key={affiliate.affiliateId} className="border-slate-700">
                            <TableCell>
                              <div>
                                <p className="font-medium text-white">{affiliate.username}</p>
                                <p className="text-sm text-slate-400">{affiliate.email}</p>
                                <p className="text-xs text-emerald-400">PIX: {affiliate.pix}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-emerald-400 font-medium">
                              R$ {totalAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-yellow-400">
                              R$ {pendingAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-green-400">
                              R$ {paidAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {affiliate.totalConversions || 0}
                            </TableCell>
                            <TableCell>
                              {pendingAmount > 0 ? (
                                <Button
                                  size="sm"
                                  onClick={() => processPayment.mutate(affiliate.affiliateId)}
                                  disabled={processPayment.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {processPayment.isPending ? 'Processando...' : `Pagar R$ ${pendingAmount.toFixed(2)}`}
                                </Button>
                              ) : (
                                <span className="text-slate-500 text-sm">Nenhuma comissão pendente</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estatísticas Tab */}
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Comissões Geradas</span>
                    <span className="text-white">R$ {commissionStats.totalCommissions.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pendentes</span>
                    <span className="text-yellow-400">R$ {commissionStats.pendingCommissions.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pagas</span>
                    <span className="text-green-400">R$ {commissionStats.paidCommissions.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Afiliados Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total</span>
                    <span className="text-white">{commissionStats.totalAffiliates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Com Comissões</span>
                    <span className="text-blue-400">{affiliateCommissions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Média Geral</span>
                    <span className="text-purple-400">
                      {affiliateCommissions.length > 0 
                        ? (affiliateCommissions.reduce((acc: number, aff: any) => 
                            acc + parseFloat(aff.conversionRate || 0), 0) / affiliateCommissions.length).toFixed(2)
                        : '0.00'}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}