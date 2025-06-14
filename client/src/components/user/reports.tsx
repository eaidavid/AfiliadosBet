import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Filter, Download, Eye } from 'lucide-react';

interface ConversionData {
  id: number;
  casa: string;
  evento: string;
  valor: string;
  comissao: string;
  criadoEm: string;
  status: string;
}

interface ReportStats {
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalRevenue: number;
  totalCommission: string;
  conversionRate: number;
}

export default function UserReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportData, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['/api/user-reports', dateFrom, dateTo, selectedHouse, selectedEvent],
    enabled: true
  });

  const { data: housesData } = useQuery({
    queryKey: ['/api/my-houses']
  });

  const handleFilter = () => {
    refetchReport();
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Data,Casa,Evento,Valor,Comissão,Status\n" +
      (reportData?.conversions || []).map((row: ConversionData) => 
        `${row.criadoEm},${row.casa},${row.evento},${row.valor},${row.comissao},${row.status}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio-conversoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eventTypes = [
    { value: 'all', label: 'Todos os Eventos' },
    { value: 'click', label: 'Cliques' },
    { value: 'registration', label: 'Cadastros' },
    { value: 'deposit', label: 'Depósitos' },
    { value: 'revenue', label: 'Receita' },
    { value: 'withdrawal', label: 'Saques' },
    { value: 'recurring-deposit', label: 'Depósitos Recorrentes' },
    { value: 'payout', label: 'Pagamentos' },
    { value: 'profit', label: 'Lucros' }
  ];

  const getEventBadge = (evento: string) => {
    const colors = {
      click: 'bg-blue-500',
      registration: 'bg-green-500',
      deposit: 'bg-emerald-500',
      revenue: 'bg-purple-500',
      withdrawal: 'bg-orange-500',
      'recurring-deposit': 'bg-cyan-500',
      payout: 'bg-yellow-500',
      profit: 'bg-pink-500'
    };
    
    return (
      <Badge className={`${colors[evento as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {evento}
      </Badge>
    );
  };

  const filteredData = (reportData?.conversions || []).filter((item: ConversionData) => {
    const matchesSearch = item.casa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.evento.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (reportLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats: ReportStats = reportData?.stats || {
    totalClicks: 0,
    totalRegistrations: 0,
    totalDeposits: 0,
    totalRevenue: 0,
    totalCommission: '0.00',
    conversionRate: 0
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Relatórios Detalhados</h1>
        <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Total de Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalClicks}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Cadastros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalRegistrations}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Depósitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalDeposits}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Comissão Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">R$ {stats.totalCommission}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Data Final</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Casa de Apostas</label>
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Selecionar casa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Casas</SelectItem>
                  {Array.isArray(housesData) && housesData.map((house: any) => (
                    <SelectItem key={house.id} value={house.name}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Tipo de Evento</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Selecionar evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((event) => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Buscar</label>
              <Input
                placeholder="Buscar por casa ou evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
          </div>

          <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Tabela de Conversões */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CalendarDays className="w-5 h-5 mr-2" />
            Histórico de Conversões ({filteredData.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-600">
                  <TableHead className="text-slate-300">Data</TableHead>
                  <TableHead className="text-slate-300">Casa</TableHead>
                  <TableHead className="text-slate-300">Evento</TableHead>
                  <TableHead className="text-slate-300">Valor</TableHead>
                  <TableHead className="text-slate-300">Comissão</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      Nenhuma conversão encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((conversion: ConversionData) => (
                    <TableRow key={conversion.id} className="border-slate-700">
                      <TableCell className="text-slate-300">
                        {new Date(conversion.criadoEm).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-slate-300">{conversion.casa}</TableCell>
                      <TableCell>{getEventBadge(conversion.evento)}</TableCell>
                      <TableCell className="text-slate-300">
                        {conversion.valor ? `R$ ${conversion.valor}` : '-'}
                      </TableCell>
                      <TableCell className="text-emerald-400">
                        R$ {conversion.comissao}
                      </TableCell>
                      <TableCell>
                        <Badge className={conversion.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                          {conversion.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}