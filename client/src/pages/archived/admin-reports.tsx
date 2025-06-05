import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Users, Building2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminReports() {
  const [selectedAffiliate, setSelectedAffiliate] = useState("all");
  const [selectedHouse, setSelectedHouse] = useState("all");

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  // Fetch all conversions for admin view
  const { data: allConversions = [], isLoading: conversionsLoading } = useQuery({
    queryKey: ["/api/admin/conversions"],
    retry: false,
  });

  // Fetch all affiliates
  const { data: affiliates = [] } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    retry: false,
  });

  // Fetch betting houses
  const { data: houses = [] } = useQuery({
    queryKey: ["/api/betting-houses"],
    retry: false,
  });

  // Calculate commission stats from all conversions with null safety
  const safeConversions = Array.isArray(allConversions) ? allConversions : [];
  const commissionStats = {
    totalCommissions: safeConversions
      .reduce((sum: number, c: any) => sum + parseFloat(c?.commission || '0'), 0),
    pendingCommissions: safeConversions
      .filter((c: any) => c?.status === 'pending')
      .reduce((sum: number, c: any) => sum + parseFloat(c?.commission || '0'), 0),
    paidCommissions: safeConversions
      .filter((c: any) => c?.status === 'paid')
      .reduce((sum: number, c: any) => sum + parseFloat(c?.commission || '0'), 0),
    totalConversions: safeConversions.length,
  };

  // Filter conversions based on selected criteria with null safety
  const filteredConversions = safeConversions.filter((conversion: any) => {
    if (selectedAffiliate !== "all" && conversion?.affiliate !== selectedAffiliate) return false;
    if (selectedHouse !== "all" && conversion?.casa !== selectedHouse) return false;
    return true;
  });

  if (statsLoading || conversionsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Relatórios Administrativos
          </h1>
          <p className="text-muted-foreground">
            Visão geral completa de todos os afiliados e conversões
          </p>
        </div>

        {/* Admin Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {commissionStats.totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Todas as comissões do sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {commissionStats.pendingCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {commissionStats.paidCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Já processadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliates.length}</div>
              <p className="text-xs text-muted-foreground">
                Afiliados ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre os dados por afiliado e casa de apostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Afiliado</label>
                <Select value={selectedAffiliate} onValueChange={setSelectedAffiliate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar afiliado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Afiliados</SelectItem>
                    {affiliates.map((affiliate: any) => (
                      <SelectItem key={affiliate.id} value={affiliate.email}>
                        {affiliate.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Casa de Apostas</label>
                <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar casa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Casas</SelectItem>
                    {houses.map((house: any) => (
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
        <Card>
          <CardHeader>
            <CardTitle>Todas as Conversões</CardTitle>
            <CardDescription>
              Lista completa de conversões de todos os afiliados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredConversions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma conversão encontrada com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Afiliado</TableHead>
                      <TableHead>Casa de Apostas</TableHead>
                      <TableHead>Tipo de Evento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversions.map((conversion: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {conversion.convertedAt ? 
                            format(new Date(conversion.convertedAt), "dd/MM/yyyy HH:mm") :
                            format(new Date(), "dd/MM/yyyy HH:mm")
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {conversion.affiliate || 'N/A'}
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
                          R$ {parseFloat(conversion.value || '0').toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold">
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