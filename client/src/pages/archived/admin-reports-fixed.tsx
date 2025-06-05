import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Users, Building2 } from "lucide-react";
import { format } from "date-fns";

interface AdminStats {
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalVolume: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalAffiliates: number;
}

interface Conversion {
  id: number;
  type: string;
  amount: string;
  commission: string;
  convertedAt: string;
  status: string;
  affiliate: string;
  house: string;
  value: string;
  customerId: string;
}

interface Affiliate {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface House {
  id: number;
  name: string;
  identifier: string;
  isActive: boolean;
}

export default function AdminReports() {
  const [selectedAffiliate, setSelectedAffiliate] = useState("all");
  const [selectedHouse, setSelectedHouse] = useState("all");

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  // Fetch all conversions for admin view
  const { data: allConversions = [], isLoading: conversionsLoading } = useQuery<Conversion[]>({
    queryKey: ["/api/admin/conversions"],
    retry: false,
  });

  // Fetch all affiliates
  const { data: affiliates = [] } = useQuery<Affiliate[]>({
    queryKey: ["/api/admin/affiliates"],
    retry: false,
  });

  // Fetch betting houses
  const { data: houses = [] } = useQuery<House[]>({
    queryKey: ["/api/betting-houses"],
    retry: false,
  });

  // Calculate commission stats from all conversions with null safety
  const safeConversions = Array.isArray(allConversions) ? allConversions : [];
  const commissionStats = {
    totalCommissions: safeConversions
      .reduce((sum: number, c) => sum + parseFloat(c?.commission || '0'), 0),
    pendingCommissions: safeConversions
      .filter((c) => c?.status === 'pending')
      .reduce((sum: number, c) => sum + parseFloat(c?.commission || '0'), 0),
    paidCommissions: safeConversions
      .filter((c) => c?.status === 'paid')
      .reduce((sum: number, c) => sum + parseFloat(c?.commission || '0'), 0),
    totalConversions: safeConversions.length,
  };

  // Filter conversions based on selected criteria
  const filteredConversions = safeConversions.filter((conversion) => {
    if (selectedAffiliate !== "all" && conversion?.affiliate !== selectedAffiliate) return false;
    if (selectedHouse !== "all" && conversion?.house !== selectedHouse) return false;
    return true;
  });

  if (statsLoading || conversionsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Relatórios Administrativos
          </h1>
          <p className="text-slate-400">
            Visão geral completa de todos os afiliados e conversões
          </p>
        </div>

        {/* Admin Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total de Comissões</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {commissionStats.totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-slate-400">
                Todas as comissões do sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Comissões Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                R$ {commissionStats.pendingCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">
                Aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Comissões Pagas</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                R$ {commissionStats.paidCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">
                Já processadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total de Afiliados</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{affiliates.length}</div>
              <p className="text-xs text-slate-400">
                Afiliados ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
            <CardDescription className="text-slate-400">
              Filtre os dados por afiliado e casa de apostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-slate-300">Afiliado</label>
                <Select value={selectedAffiliate} onValueChange={setSelectedAffiliate}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecionar afiliado" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todos os Afiliados</SelectItem>
                    {affiliates.map((affiliate) => (
                      <SelectItem key={affiliate.id} value={affiliate.username}>
                        {affiliate.username} - {affiliate.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-slate-300">Casa de Apostas</label>
                <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecionar casa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todas as Casas</SelectItem>
                    {houses.map((house) => (
                      <SelectItem key={house.id} value={house.name}>
                        {house.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversions Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Todas as Conversões</CardTitle>
            <CardDescription className="text-slate-400">
              Lista completa de conversões de todos os afiliados ({filteredConversions.length} conversões)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredConversions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">
                  Nenhuma conversão encontrada com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Afiliado</TableHead>
                      <TableHead className="text-slate-300">Casa de Apostas</TableHead>
                      <TableHead className="text-slate-300">Tipo de Evento</TableHead>
                      <TableHead className="text-slate-300">Valor</TableHead>
                      <TableHead className="text-slate-300">Comissão</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversions.map((conversion, index) => (
                      <TableRow key={conversion.id || index} className="border-slate-800">
                        <TableCell className="text-slate-300">
                          {conversion.convertedAt ? 
                            format(new Date(conversion.convertedAt), "dd/MM/yyyy HH:mm") :
                            format(new Date(), "dd/MM/yyyy HH:mm")
                          }
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {conversion.affiliate || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {conversion.house || 'Casa não informada'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            conversion.type === 'registration' ? 'secondary' :
                            conversion.type === 'deposit' ? 'default' :
                            conversion.type === 'profit' ? 'destructive' : 'outline'
                          }>
                            {conversion.type === 'registration' ? 'Cadastro' :
                             conversion.type === 'deposit' ? 'Depósito' :
                             conversion.type === 'profit' ? 'Lucro' : conversion.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          R$ {parseFloat(conversion.value || conversion.amount || '0').toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-500">
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
      </div>
    </div>
  );
}