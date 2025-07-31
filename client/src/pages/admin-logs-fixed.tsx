import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  Eye,
  RefreshCw
} from 'lucide-react';

interface PostbackLog {
  id: number;
  house_name: string;
  event_type: string;
  subid: string;
  amount: string;
  customer_id: string | null;
  raw_data: string;
  ip_address: string;
  status: string;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

interface FilterState {
  house: string;
  status: string;
  eventType: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export default function AdminLogsFixed() {
  const [filters, setFilters] = useState<FilterState>({
    house: 'all',
    status: 'all',
    eventType: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.house !== 'all') queryParams.append('house', filters.house);
  if (filters.status !== 'all') queryParams.append('status', filters.status);
  if (filters.eventType !== 'all') queryParams.append('event_type', filters.eventType);
  if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
  if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
  if (filters.search) queryParams.append('search', filters.search);
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());

  // Fetch postback logs
  const { data: logsData, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/postback-logs", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/admin/postback-logs?${queryParams.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar logs');
      }
      
      return response.json();
    },
    retry: 1,
    staleTime: 30000,
  });

  // Fetch betting houses for filter
  const { data: bettingHouses = [] } = useQuery({
    queryKey: ["/api/admin/houses"],
    retry: 1,
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      house: 'all',
      status: 'all',
      eventType: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Badge variant="default" className="bg-green-600/20 text-green-400 border-green-600/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sucesso
          </Badge>
        );
      case 'ERROR_VALIDATION':
        return (
          <Badge variant="destructive" className="bg-red-600/20 text-red-400 border-red-600/30">
            <XCircle className="h-3 w-3 mr-1" />
            Erro Validação
          </Badge>
        );
      case 'ERROR_PROCESSING':
        return (
          <Badge variant="destructive" className="bg-red-600/20 text-red-400 border-red-600/30">
            <XCircle className="h-3 w-3 mr-1" />
            Erro Processamento
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-600 text-slate-400">
            {status}
          </Badge>
        );
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors = {
      register: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
      deposit: 'bg-green-600/20 text-green-400 border-green-600/30',
      profit: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
      chargeback: 'bg-red-600/20 text-red-400 border-red-600/30'
    };

    const labels = {
      register: 'Registro',
      deposit: 'Depósito',
      profit: 'Lucro',
      chargeback: 'Chargeback'
    };

    return (
      <Badge variant="outline" className={colors[eventType as keyof typeof colors] || 'border-slate-600 text-slate-400'}>
        {labels[eventType as keyof typeof labels] || eventType}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar logs de postback. Tente recarregar a página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            Logs de Postbacks
          </h1>
          <p className="text-slate-400 mt-2">
            Monitore e analise todos os postbacks recebidos pelas casas de apostas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-slate-600 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total de Logs</p>
                <p className="text-2xl font-bold text-white">{totalLogs.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Sucessos</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter((log: PostbackLog) => log.status === 'SUCCESS').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-medium">Erros</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter((log: PostbackLog) => log.status.startsWith('ERROR')).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter((log: PostbackLog) => log.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-emerald-400" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="SubID, IP, Customer ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9 bg-slate-700 border-slate-600"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="house">Casa</Label>
              <Select value={filters.house} onValueChange={(value) => handleFilterChange('house', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as casas</SelectItem>
                  {bettingHouses.map((house: any) => (
                    <SelectItem key={house.id} value={house.name}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="SUCCESS">Sucesso</SelectItem>
                  <SelectItem value="ERROR_VALIDATION">Erro Validação</SelectItem>
                  <SelectItem value="ERROR_PROCESSING">Erro Processamento</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eventType">Evento</Label>
              <Select value={filters.eventType} onValueChange={(value) => handleFilterChange('eventType', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os eventos</SelectItem>
                  <SelectItem value="register">Registro</SelectItem>
                  <SelectItem value="deposit">Depósito</SelectItem>
                  <SelectItem value="profit">Lucro</SelectItem>
                  <SelectItem value="chargeback">Chargeback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Data Inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <Button
            onClick={clearFilters}
            variant="outline"
            className="border-slate-600 hover:bg-slate-700"
          >
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-400" />
              Logs de Postbacks
            </span>
            <span className="text-sm text-slate-400">
              {totalLogs > 0 && `${((page - 1) * pageSize) + 1}-${Math.min(page * pageSize, totalLogs)} de ${totalLogs}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(10).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-slate-700" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhum log encontrado</p>
              <p className="text-sm">Nenhum postback foi recebido ainda ou os filtros não retornaram resultados</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Data/Hora</TableHead>
                      <TableHead className="text-slate-300">Casa</TableHead>
                      <TableHead className="text-slate-300">Evento</TableHead>
                      <TableHead className="text-slate-300">SubID</TableHead>
                      <TableHead className="text-slate-300">Valor</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">IP</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: PostbackLog) => (
                      <TableRow key={log.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-slate-300">
                          <div className="text-sm">
                            {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            <br />
                            <span className="text-xs text-slate-400">
                              {format(new Date(log.created_at), 'HH:mm:ss', { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {log.house_name}
                        </TableCell>
                        <TableCell>
                          {getEventTypeBadge(log.event_type)}
                        </TableCell>
                        <TableCell className="text-slate-300 font-mono text-sm">
                          {log.subid}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {log.amount ? `R$ ${parseFloat(log.amount).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.status)}
                        </TableCell>
                        <TableCell className="text-slate-400 font-mono text-sm">
                          {log.ip_address}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 hover:bg-slate-700"
                            onClick={() => {
                              // TODO: Implement log details modal
                              console.log('Show log details:', log);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-400">
                    Página {page} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}