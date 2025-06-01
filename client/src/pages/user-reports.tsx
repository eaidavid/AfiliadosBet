import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

interface UserReportsProps {
  onPageChange?: (page: string) => void;
}

export default function UserReports({ onPageChange }: UserReportsProps) {
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  // Fetch user conversions with detailed data
  const { data: conversions = [], isLoading: conversionsLoading } = useQuery({
    queryKey: ["/api/user/conversions"],
    retry: false,
  });

  // Fetch betting houses for filter
  const { data: houses = [] } = useQuery({
    queryKey: ["/api/betting-houses"],
    retry: false,
  });

  // Calculate commission stats from real conversions
  const commissionStats = {
    pendingCommissions: conversions
      .filter((c: any) => c.status === 'pending')
      .reduce((sum: number, c: any) => sum + parseFloat(c.commission || '0'), 0),
    paidCommissions: conversions
      .filter((c: any) => c.status === 'paid')
      .reduce((sum: number, c: any) => sum + parseFloat(c.commission || '0'), 0),
    totalCommissions: conversions
      .reduce((sum: number, c: any) => sum + parseFloat(c.commission || '0'), 0),
  };

  // Filter conversions based on selected criteria
  const filteredConversions = conversions.filter((conversion: any) => {
    if (selectedHouse !== "all" && conversion.house !== selectedHouse) return false;
    if (selectedEvent !== "all" && conversion.type !== selectedEvent) return false;
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
            Relatórios Detalhados
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas conversões e comissões em tempo real
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {commissionStats.totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Todas as comissões acumuladas
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
                Já recebidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Conversões</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversions.length}</div>
              <p className="text-xs text-muted-foreground">
                Conversões registradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre os dados por casa de apostas e tipo de evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
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

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Tipo de Evento</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Eventos</SelectItem>
                    <SelectItem value="registration">Cadastro</SelectItem>
                    <SelectItem value="deposit">Depósito</SelectItem>
                    <SelectItem value="profit">Lucro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Conversões Detalhadas</CardTitle>
            <CardDescription>
              Lista completa de todas as suas conversões e comissões
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