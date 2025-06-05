import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { 
  Activity, 
  Filter, 
  Download, 
  RefreshCw, 
  Search, 
  Copy, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Clock,
  Database,
  ExternalLink,
  Play,
  TestTube
} from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import { motion } from "framer-motion";

interface PostbackLog {
  id: number;
  betting_house_id: number;
  event_type: string;
  url_disparada: string;
  resposta: string;
  status_code: number;
  executado_em: string;
  parametros_utilizados: string;
  subid: string;
  valor: number;
  tipo_comissao: string;
  is_test: boolean;
  house_name?: string;
}

interface BettingHouse {
  id: number;
  name: string;
}

interface LogMetrics {
  total: number;
  success: number;
  failure: number;
  tests: number;
  lastExecution: string;
}

export default function PostbackLogs() {
  // State management
  const [currentPage, setCurrentPage] = useState("logs-postbacks");
  const [selectedLog, setSelectedLog] = useState<PostbackLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [filterHouse, setFilterHouse] = useState<string>("all");
  const [filterEventType, setFilterEventType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCommissionType, setFilterCommissionType] = useState<string>("all");
  const [filterSubid, setFilterSubid] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  // Fetch postback logs
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['/api/admin/postback-logs'],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Fetch betting houses
  const { data: bettingHouses = [] } = useQuery({
    queryKey: ['/api/betting-houses'],
  });

  // Computed metrics
  const metrics = useMemo((): LogMetrics => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return {
        total: 0,
        success: 0,
        failure: 0,
        tests: 0,
        lastExecution: "Nenhum log encontrado"
      };
    }

    const validLogs = logs.filter((log: PostbackLog) => log && typeof log === 'object');
    const successLogs = validLogs.filter((log: PostbackLog) => log.status_code >= 200 && log.status_code < 300);
    const failureLogs = validLogs.filter((log: PostbackLog) => log.status_code < 200 || log.status_code >= 300);
    const testLogs = validLogs.filter((log: PostbackLog) => log.is_test);
    
    const sortedLogs = validLogs.sort((a: PostbackLog, b: PostbackLog) => 
      new Date(b.executado_em).getTime() - new Date(a.executado_em).getTime()
    );
    
    return {
      total: validLogs.length,
      success: successLogs.length,
      failure: failureLogs.length,
      tests: testLogs.length,
      lastExecution: sortedLogs.length > 0 
        ? new Date(sortedLogs[0].executado_em).toLocaleString('pt-BR')
        : "Nenhuma execução"
    };
  }, [logs]);

  // Get unique values for filters
  const uniqueEventTypes = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];
    return [...new Set(logs
      .filter((log: PostbackLog) => log && log.event_type)
      .map((log: PostbackLog) => log.event_type)
    )];
  }, [logs]);

  const uniqueCommissionTypes = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];
    return [...new Set(logs
      .filter((log: PostbackLog) => log && log.tipo_comissao)
      .map((log: PostbackLog) => log.tipo_comissao)
    )];
  }, [logs]);

  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];
    
    return logs.filter((log: PostbackLog) => {
      if (!log) return false;

      // House filter
      if (filterHouse !== "all" && log.betting_house_id?.toString() !== filterHouse) {
        return false;
      }

      // Event type filter
      if (filterEventType !== "all" && log.event_type !== filterEventType) {
        return false;
      }

      // Status filter
      if (filterStatus !== "all") {
        if (filterStatus === "success" && (log.status_code < 200 || log.status_code >= 300)) {
          return false;
        }
        if (filterStatus === "failure" && (log.status_code >= 200 && log.status_code < 300)) {
          return false;
        }
        if (filterStatus === "test" && !log.is_test) {
          return false;
        }
      }

      // Commission type filter
      if (filterCommissionType !== "all" && log.tipo_comissao !== filterCommissionType) {
        return false;
      }

      // SubID filter
      if (filterSubid && !log.subid?.toLowerCase().includes(filterSubid.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filterDateFrom) {
        const logDate = new Date(log.executado_em);
        const fromDate = new Date(filterDateFrom);
        if (logDate < fromDate) return false;
      }

      if (filterDateTo) {
        const logDate = new Date(log.executado_em);
        const toDate = new Date(filterDateTo + "T23:59:59");
        if (logDate > toDate) return false;
      }

      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableFields = [
          log.subid,
          log.event_type,
          log.house_name,
          log.url_disparada,
          log.tipo_comissao
        ].filter(Boolean);
        
        if (!searchableFields.some(field => 
          field?.toString().toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }

      return true;
    });
  }, [logs, filterHouse, filterEventType, filterStatus, filterCommissionType, filterSubid, filterDateFrom, filterDateTo, searchTerm]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: "URL copiada para a área de transferência",
      });
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterHouse("all");
    setFilterEventType("all");
    setFilterStatus("all");
    setFilterCommissionType("all");
    setFilterSubid("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSearchTerm("");
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Aplique filtros para exportar dados específicos",
        variant: "destructive",
      });
      return;
    }

    const csvData = filteredLogs.map((log: PostbackLog) => ({
      'Data/Hora': new Date(log.executado_em).toLocaleString('pt-BR'),
      'Casa': log.house_name || '',
      'Tipo de Evento': log.event_type || '',
      'SubID': log.subid || '',
      'Tipo de Comissão': log.tipo_comissao || '',
      'Valor': log.valor || '',
      'Status': log.status_code || '',
      'URL': log.url_disparada || '',
      'É Teste': log.is_test ? 'Sim' : 'Não'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => 
        Object.values(row).map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `postback_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: `${filteredLogs.length} logs exportados com sucesso`,
    });
  };

  // Get status badge variant
  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return { variant: "default" as const, color: "text-green-400", icon: CheckCircle };
    } else {
      return { variant: "destructive" as const, color: "text-red-400", icon: XCircle };
    }
  };

  // Format response for display
  const formatResponse = (response: string) => {
    if (!response) return "Sem resposta";
    if (response.length > 100) {
      return response.substring(0, 100) + "...";
    }
    return response;
  };

  // Open log details modal
  const openLogDetails = (log: PostbackLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        refetchLogs();
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, refetchLogs]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-400" />
                Logs de Postbacks
              </h1>
              <p className="text-slate-400 mt-2">
                Monitore e analise todos os disparos de postbacks em tempo real
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  className="data-[state=checked]:bg-green-600"
                />
                <Label className="text-slate-300">Auto-refresh</Label>
              </div>
              {autoRefresh && (
                <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                  <SelectTrigger className="w-24 bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="15">15s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                    <SelectItem value="60">60s</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button
                onClick={() => refetchLogs()}
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total de Logs</p>
                    <p className="text-2xl font-bold text-white">{metrics.total}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Sucessos</p>
                    <p className="text-2xl font-bold text-green-400">{metrics.success}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Falhas</p>
                    <p className="text-2xl font-bold text-red-400">{metrics.failure}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Testes</p>
                    <p className="text-2xl font-bold text-purple-400">{metrics.tests}</p>
                  </div>
                  <TestTube className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Última Execução</p>
                    <p className="text-sm font-medium text-white">{metrics.lastExecution}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por SubID, evento, casa, URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Filter Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Casa de Apostas</Label>
                  <Select value={filterHouse} onValueChange={setFilterHouse}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">Todas as casas</SelectItem>
                      {bettingHouses && Array.isArray(bettingHouses) && bettingHouses.map((house: BettingHouse) => (
                        <SelectItem key={house.id} value={house.id.toString()}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo de Evento</Label>
                  <Select value={filterEventType} onValueChange={setFilterEventType}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">Todos os eventos</SelectItem>
                      {uniqueEventTypes.map((eventType: string) => (
                        <SelectItem key={eventType} value={eventType}>
                          {eventType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="success">Sucesso (2xx)</SelectItem>
                      <SelectItem value="failure">Falha (!2xx)</SelectItem>
                      <SelectItem value="test">Testes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo de Comissão</Label>
                  <Select value={filterCommissionType} onValueChange={setFilterCommissionType}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {uniqueCommissionTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">SubID</Label>
                  <Input
                    placeholder="Filtrar por SubID"
                    value={filterSubid}
                    onChange={(e) => setFilterSubid(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Data Inicial</Label>
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Data Final</Label>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  Logs de Postbacks ({filteredLogs.length})
                </CardTitle>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {filteredLogs.length} de {metrics.total} logs
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-2 text-slate-400">Carregando logs...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum log encontrado</h3>
                  <p className="text-slate-400">
                    Ajuste os filtros ou verifique se há logs registrados no sistema
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Data/Hora</TableHead>
                        <TableHead className="text-slate-300">Casa</TableHead>
                        <TableHead className="text-slate-300">Evento</TableHead>
                        <TableHead className="text-slate-300">SubID</TableHead>
                        <TableHead className="text-slate-300">Comissão</TableHead>
                        <TableHead className="text-slate-300">Valor</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">URL</TableHead>
                        <TableHead className="text-slate-300">Resposta</TableHead>
                        <TableHead className="text-slate-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log: PostbackLog) => {
                        const statusBadge = getStatusBadge(log.status_code);
                        const StatusIcon = statusBadge.icon;
                        
                        return (
                          <TableRow key={log.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="text-slate-300 font-mono text-sm">
                              {new Date(log.executado_em).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-white">
                              {log.house_name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                {log.is_test && (
                                  <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                                    <TestTube className="w-3 h-3 mr-1" />
                                    Teste
                                  </Badge>
                                )}
                                {log.event_type}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono">
                              {log.subid || 'N/A'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {log.tipo_comissao || 'N/A'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {log.valor ? `R$ ${log.valor}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {log.status_code}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-slate-400 font-mono text-sm">
                                  {log.url_disparada}
                                </span>
                                <Button
                                  onClick={() => copyToClipboard(log.url_disparada)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-slate-700"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-400 max-w-xs">
                              <span className="truncate">
                                {formatResponse(log.resposta)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => openLogDetails(log)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-slate-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Log Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Detalhes do Log #{selectedLog?.id}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Informações completas do disparo de postback
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Data/Hora de Execução</Label>
                  <p className="text-white font-mono">
                    {new Date(selectedLog.executado_em).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-300">Casa de Apostas</Label>
                  <p className="text-white">{selectedLog.house_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Tipo de Evento</Label>
                  <div className="flex items-center gap-2">
                    {selectedLog.is_test && (
                      <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                        <TestTube className="w-3 h-3 mr-1" />
                        Teste
                      </Badge>
                    )}
                    <span className="text-white">{selectedLog.event_type}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">SubID</Label>
                  <p className="text-white font-mono">{selectedLog.subid || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Tipo de Comissão</Label>
                  <p className="text-white">{selectedLog.tipo_comissao || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Valor</Label>
                  <p className="text-white">{selectedLog.valor ? `R$ ${selectedLog.valor}` : 'N/A'}</p>
                </div>
              </div>

              {/* URL */}
              <div>
                <Label className="text-slate-300">URL Disparada</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-800/50 p-3 rounded border border-slate-600">
                    <p className="text-green-400 font-mono text-sm break-all">
                      {selectedLog.url_disparada}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(selectedLog.url_disparada)}
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status and Response */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Código de Status</Label>
                  <div className="mt-1">
                    {(() => {
                      const statusBadge = getStatusBadge(selectedLog.status_code);
                      const StatusIcon = statusBadge.icon;
                      return (
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="w-3 h-3" />
                          {selectedLog.status_code}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Parameters */}
              {selectedLog.parametros_utilizados && (
                <div>
                  <Label className="text-slate-300">Parâmetros Utilizados</Label>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-600 mt-1">
                    <pre className="text-slate-400 font-mono text-sm overflow-x-auto">
                      {selectedLog.parametros_utilizados}
                    </pre>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <Label className="text-slate-300">Resposta Completa</Label>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-600 mt-1 max-h-60 overflow-y-auto">
                  <pre className="text-slate-400 font-mono text-sm whitespace-pre-wrap">
                    {selectedLog.resposta || 'Sem resposta'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}