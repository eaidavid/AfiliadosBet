import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Filter, BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";

interface UserReportsProps {
  onPageChange?: (page: string) => void;
}

export default function UserReports({ onPageChange }: UserReportsProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  // Fetch user conversions with detailed data
  const { data: conversions = [] } = useQuery({
    queryKey: ["/api/user/conversions"],
    retry: false,
  });

  // Fetch betting houses for filter
  const { data: houses = [] } = useQuery({
    queryKey: ["/api/betting-houses"],
    retry: false,
  });

  // Calculate commission stats
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

  // Filter conversions based on selected filters
  const filteredConversions = conversions.filter((conversion: any) => {
    const matchesHouse = selectedHouse === "all" || conversion.houseId?.toString() === selectedHouse;
    const matchesEvent = selectedEvent === "all" || conversion.type === selectedEvent;
    const matchesSearch = !searchTerm || 
      conversion.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversion.houseName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesHouse && matchesEvent && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Pago</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Processando</Badge>;
    }
  };

  const getEventName = (type: string) => {
    const eventNames: { [key: string]: string } = {
      'registration': 'Cadastro',
      'deposit': 'Depósito',
      'first_deposit': 'Primeiro Depósito',
      'recurring_deposit': 'Depósito Recorrente',
      'profit': 'Lucro',
      'click': 'Clique'
    };
    return eventNames[type] || type;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Data', 'Casa', 'Evento', 'Valor', 'Comissão', 'Status'],
      ...filteredConversions.map((conv: any) => [
        format(new Date(conv.convertedAt), 'dd/MM/yyyy HH:mm'),
        conv.houseName || 'N/A',
        getEventName(conv.type),
        `R$ ${parseFloat(conv.amount || '0').toFixed(2)}`,
        `R$ ${parseFloat(conv.commission || '0').toFixed(2)}`,
        conv.status === 'paid' ? 'Pago' : 'Pendente'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_comissoes_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Relatórios Detalhados</h1>
            <p className="text-slate-400">Acompanhe suas conversões e comissões em tempo real</p>
          </div>
          <Button 
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total de Cliques</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.totalClicks?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Cadastros</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.totalRegistrations || "0"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Depósitos</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.totalDeposits || "0"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Comissão Total</p>
                  <p className="text-2xl font-bold text-emerald-500 mt-1">
                    R$ {(typeof stats?.totalCommission === 'string' 
                      ? parseFloat(stats.totalCommission) 
                      : stats?.totalCommission || 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Comissões Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-500 mt-1">
                    R$ {commissionStats.pendingCommissions.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Comissões Pagas</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">
                    R$ {commissionStats.paidCommissions.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Geral</p>
                  <p className="text-2xl font-bold text-blue-500 mt-1">
                    R$ {commissionStats.totalCommissions.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Data Inicial</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Data Final</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Casa de Apostas</label>
                <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Casas</SelectItem>
                    {houses.map((house: any) => (
                      <SelectItem key={house.id} value={house.id.toString()}>
                        {house.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Tipo de Evento</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Eventos</SelectItem>
                    <SelectItem value="registration">Cadastros</SelectItem>
                    <SelectItem value="deposit">Depósitos</SelectItem>
                    <SelectItem value="profit">Lucros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Buscar</label>
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </CardContent>
        </Card>

        {/* Conversions Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Conversões ({filteredConversions.length} registros)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredConversions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Nenhuma conversão encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Casa</TableHead>
                      <TableHead className="text-slate-300">Evento</TableHead>
                      <TableHead className="text-slate-300">Valor</TableHead>
                      <TableHead className="text-slate-300">Comissão</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversions.map((conversion: any) => (
                      <TableRow key={conversion.id} className="border-slate-700">
                        <TableCell className="text-white">
                          {format(new Date(conversion.convertedAt), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-white">
                          {conversion.houseName || 'N/A'}
                        </TableCell>
                        <TableCell className="text-white">
                          {getEventName(conversion.type)}
                        </TableCell>
                        <TableCell className="text-white">
                          R$ {parseFloat(conversion.amount || '0').toFixed(2)}
                        </TableCell>
                        <TableCell className="text-emerald-400 font-medium">
                          R$ {parseFloat(conversion.commission || '0').toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(conversion.status || 'pending')}
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