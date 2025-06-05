import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Play,
  Settings,
  BarChart3,
  Users,
  Building,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  Shield,
  History,
  Bell,
  FileText,
  Database,
  Zap,
  Target,
  Eye,
  Wrench
} from "lucide-react";

interface SystemStats {
  totalUsers: number;
  totalHouses: number;
  totalPostbacks: number;
  successRate: number;
  lastUpdate: string;
}

interface DiagnosticIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  count?: number;
  action?: string;
}

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
  identifier: string;
  base_url: string;
  is_active: boolean;
  commission_type: string;
  commission_value: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface SystemConfig {
  maintenance_mode: boolean;
  auto_refresh: boolean;
  refresh_interval: number;
  max_retry_attempts: number;
  notification_enabled: boolean;
}

interface SearchResult {
  type: 'user' | 'house' | 'postback' | 'link';
  id: number;
  title: string;
  subtitle: string;
  status: 'active' | 'inactive' | 'success' | 'failed';
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedPostback, setSelectedPostback] = useState<PostbackLog | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Queries for data fetching
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/system-stats"],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  const { data: diagnostics, isLoading: diagnosticsLoading } = useQuery({
    queryKey: ["/api/admin/diagnostics"],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  const { data: postbackLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/postback-logs"],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  const { data: bettingHouses, isLoading: housesLoading } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    // Search users
    if (users && Array.isArray(users)) {
      users.forEach((user: User) => {
        if (user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)) {
          results.push({
            type: 'user',
            id: user.id,
            title: user.name,
            subtitle: user.email,
            status: user.is_active ? 'active' : 'inactive'
          });
        }
      });
    }

    // Search betting houses
    if (bettingHouses && Array.isArray(bettingHouses)) {
      bettingHouses.forEach((house: BettingHouse) => {
        if (house.name?.toLowerCase().includes(query) || house.identifier?.toLowerCase().includes(query)) {
          results.push({
            type: 'house',
            id: house.id,
            title: house.name,
            subtitle: house.identifier,
            status: house.is_active ? 'active' : 'inactive'
          });
        }
      });
    }

    // Search postback logs
    if (postbackLogs && Array.isArray(postbackLogs)) {
      postbackLogs.forEach((log: PostbackLog) => {
        if (log.subid?.toLowerCase().includes(query) || log.event_type?.toLowerCase().includes(query)) {
          results.push({
            type: 'postback',
            id: log.id,
            title: `${log.event_type} - ${log.subid}`,
            subtitle: log.house_name || `House ID: ${log.betting_house_id}`,
            status: log.status_code >= 200 && log.status_code < 300 ? 'success' : 'failed'
          });
        }
      });
    }

    return results.slice(0, 10);
  }, [searchQuery, users, bettingHouses, postbackLogs]);

  // Mutations
  const retryPostbackMutation = useMutation({
    mutationFn: (logId: number) => apiRequest(`/api/admin/retry-postback/${logId}`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Postback reenviado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/postback-logs"] });
    },
    onError: () => {
      toast({ title: "Erro ao reenviar postback", variant: "destructive" });
    }
  });

  const toggleMaintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) => apiRequest("/api/admin/maintenance-mode", {
      method: 'POST',
      body: { enabled }
    }),
    onSuccess: () => {
      toast({ title: `Modo de manutenção ${maintenanceMode ? 'ativado' : 'desativado'}` });
    },
    onError: () => {
      toast({ title: "Erro ao alterar modo de manutenção", variant: "destructive" });
    }
  });

  const exportDataMutation = useMutation({
    mutationFn: (params: { type: string; filters?: any }) => 
      apiRequest("/api/admin/export-data", { method: 'POST', body: params }),
    onSuccess: (data) => {
      // Handle download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Relatório exportado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao exportar relatório", variant: "destructive" });
    }
  });

  // System statistics calculations
  const stats = useMemo(() => {
    if (!systemStats) return null;
    
    return {
      totalUsers: systemStats.totalUsers || 0,
      totalHouses: systemStats.totalHouses || 0,
      totalPostbacks: systemStats.totalPostbacks || 0,
      successRate: systemStats.successRate || 0,
      lastUpdate: systemStats.lastUpdate || new Date().toISOString()
    };
  }, [systemStats]);

  // Diagnostic issues
  const diagnosticIssues = useMemo(() => {
    if (!diagnostics) return [];
    
    return diagnostics.map((issue: any) => ({
      id: issue.id || Math.random().toString(),
      type: issue.type || 'info',
      title: issue.title || 'Problema detectado',
      description: issue.description || 'Descrição não disponível',
      count: issue.count || 0,
      action: issue.action || null
    }));
  }, [diagnostics]);

  const handleRetryPostback = (log: PostbackLog) => {
    retryPostbackMutation.mutate(log.id);
  };

  const handleToggleMaintenance = () => {
    const newMode = !maintenanceMode;
    setMaintenanceMode(newMode);
    toggleMaintenanceMutation.mutate(newMode);
  };

  const handleExportData = (type: string) => {
    exportDataMutation.mutate({ type });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-500 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Administração e Configurações
            </h1>
            <p className="text-slate-400 mt-1">
              Painel avançado de monitoramento, diagnóstico e otimização do sistema
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Auto-refresh</span>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
            
            <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(Number(v))}>
              <SelectTrigger className="w-24 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={maintenanceMode ? "destructive" : "outline"}
              onClick={handleToggleMaintenance}
              className="gap-2"
            >
              <Wrench className="h-4 w-4" />
              {maintenanceMode ? 'Sair da Manutenção' : 'Modo Manutenção'}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, email, subID, casa ou URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result) => (
                  <div key={`${result.type}-${result.id}`} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.type === 'user' && <Users className="h-4 w-4 text-blue-400" />}
                      {result.type === 'house' && <Building className="h-4 w-4 text-green-400" />}
                      {result.type === 'postback' && <Activity className="h-4 w-4 text-purple-400" />}
                      <div>
                        <p className="font-medium">{result.title}</p>
                        <p className="text-sm text-slate-400">{result.subtitle}</p>
                      </div>
                    </div>
                    <Badge variant={result.status === 'active' || result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold text-blue-400">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Casas de Apostas</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.totalHouses || 0}</p>
                </div>
                <Building className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Postbacks</p>
                  <p className="text-2xl font-bold text-purple-400">{stats?.totalPostbacks || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats?.successRate?.toFixed(1) || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="diagnostics" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="diagnostics" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Diagnósticos
            </TabsTrigger>
            <TabsTrigger value="postbacks" className="gap-2">
              <Activity className="h-4 w-4" />
              Postbacks
            </TabsTrigger>
            <TabsTrigger value="simulator" className="gap-2">
              <Play className="h-4 w-4" />
              Simulador
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Diagnóstico do Sistema
                </CardTitle>
                <CardDescription>
                  Problemas identificados e sugestões de otimização
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diagnosticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {diagnosticIssues.length === 0 ? (
                      <Alert className="bg-green-950 border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-300">
                          Nenhum problema detectado no sistema.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      diagnosticIssues.map((issue) => (
                        <Alert 
                          key={issue.id}
                          className={`${
                            issue.type === 'error' ? 'bg-red-950 border-red-800' :
                            issue.type === 'warning' ? 'bg-yellow-950 border-yellow-800' :
                            'bg-blue-950 border-blue-800'
                          }`}
                        >
                          {issue.type === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                          {issue.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                          {issue.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-400" />}
                          <AlertDescription className={`${
                            issue.type === 'error' ? 'text-red-300' :
                            issue.type === 'warning' ? 'text-yellow-300' :
                            'text-blue-300'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{issue.title}</p>
                                <p className="text-sm opacity-90">{issue.description}</p>
                                {issue.count && (
                                  <p className="text-xs mt-1">Afetados: {issue.count}</p>
                                )}
                              </div>
                              {issue.action && (
                                <Button size="sm" variant="outline">
                                  {issue.action}
                                </Button>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Postbacks Tab */}
          <TabsContent value="postbacks">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-500 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Gerenciamento de Postbacks
                </CardTitle>
                <CardDescription>
                  Monitorar e reexecutar postbacks do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {postbackLogs && Array.isArray(postbackLogs) && postbackLogs.length > 0 ? (
                      postbackLogs.slice(0, 10).map((log: PostbackLog) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge variant={log.status_code >= 200 && log.status_code < 300 ? 'default' : 'destructive'}>
                              {log.status_code}
                            </Badge>
                            <div>
                              <p className="font-medium">{log.event_type} - {log.subid}</p>
                              <p className="text-sm text-slate-400">
                                {log.house_name || `House ID: ${log.betting_house_id}`} • 
                                {new Date(log.executado_em).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Postback</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">URL</label>
                                    <p className="text-sm bg-slate-800 p-2 rounded">{log.url_disparada}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Parâmetros</label>
                                    <pre className="text-sm bg-slate-800 p-2 rounded overflow-auto">
                                      {JSON.stringify(JSON.parse(log.parametros_utilizados || '{}'), null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Resposta</label>
                                    <p className="text-sm bg-slate-800 p-2 rounded">{log.resposta}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRetryPostback(log)}
                              disabled={retryPostbackMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        Nenhum postback encontrado
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-500 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exportação de Relatórios
                </CardTitle>
                <CardDescription>
                  Gerar e baixar relatórios do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('postbacks')}
                    disabled={exportDataMutation.isPending}
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Logs de Postbacks</p>
                      <p className="text-sm text-slate-400">Exportar todos os logs</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('users')}
                    disabled={exportDataMutation.isPending}
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Usuários</p>
                      <p className="text-sm text-slate-400">Lista de todos os usuários</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('houses')}
                    disabled={exportDataMutation.isPending}
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Casas de Apostas</p>
                      <p className="text-sm text-slate-400">Dados das casas cadastradas</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('conversions')}
                    disabled={exportDataMutation.isPending}
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Conversões</p>
                      <p className="text-sm text-slate-400">Relatório de conversões</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('payments')}
                    disabled={exportDataMutation.isPending}
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Pagamentos</p>
                      <p className="text-sm text-slate-400">Histórico de pagamentos</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('analytics')}
                    disabled={exportDataMutation.isPending}
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Relatório Analítico</p>
                      <p className="text-sm text-slate-400">Dados analíticos completos</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulator Tab */}
          <TabsContent value="simulator">
            <PostbackSimulator />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-500 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Central de Notificações
                </CardTitle>
                <CardDescription>
                  Alertas e notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-yellow-950 border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Taxa de falhas elevada</p>
                          <p className="text-sm opacity-90">Casa Betano com 15% de falhas nas últimas 24h</p>
                          <p className="text-xs mt-1">Há 2 horas</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Investigar
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-blue-950 border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Novo afiliado cadastrado</p>
                          <p className="text-sm opacity-90">João Silva se registrou na plataforma</p>
                          <p className="text-xs mt-1">Há 1 hora</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver perfil
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-green-950 border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Sistema atualizado</p>
                          <p className="text-sm opacity-90">Versão 2.1.0 instalada com sucesso</p>
                          <p className="text-xs mt-1">Há 4 horas</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Postback Simulator Component
function PostbackSimulator() {
  const { toast } = useToast();
  const [selectedHouse, setSelectedHouse] = useState("");
  const [eventType, setEventType] = useState("");
  const [parameters, setParameters] = useState("{}");
  const [response, setResponse] = useState("");

  const { data: bettingHouses } = useQuery({
    queryKey: ["/api/admin/betting-houses"]
  });

  const simulateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/simulate-postback", {
      method: 'POST',
      body: data
    }),
    onSuccess: (data) => {
      setResponse(JSON.stringify(data, null, 2));
      toast({ title: "Postback simulado com sucesso" });
    },
    onError: (error) => {
      setResponse(`Erro: ${error.message}`);
      toast({ title: "Erro na simulação", variant: "destructive" });
    }
  });

  const handleSimulate = () => {
    try {
      const parsedParams = JSON.parse(parameters);
      simulateMutation.mutate({
        houseId: selectedHouse,
        eventType,
        parameters: parsedParams
      });
    } catch (error) {
      toast({ title: "Parâmetros JSON inválidos", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-emerald-500 flex items-center gap-2">
          <Play className="h-5 w-5" />
          Simulador de Postbacks
        </CardTitle>
        <CardDescription>
          Teste postbacks em tempo real com parâmetros personalizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Casa de Apostas</label>
            <Select value={selectedHouse} onValueChange={setSelectedHouse}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue placeholder="Selecionar casa" />
              </SelectTrigger>
              <SelectContent>
                {bettingHouses && Array.isArray(bettingHouses) && bettingHouses.map((house: BettingHouse) => (
                  <SelectItem key={house.id} value={house.id.toString()}>
                    {house.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Evento</label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue placeholder="Selecionar evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="register">Register</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="test">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Parâmetros (JSON)</label>
          <Textarea
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
            placeholder='{"subid": "12345", "customer_id": "67890", "amount": "100"}'
            className="bg-slate-800 border-slate-600 font-mono text-sm"
            rows={4}
          />
        </div>

        <Button 
          onClick={handleSimulate}
          disabled={!selectedHouse || !eventType || simulateMutation.isPending}
          className="w-full"
        >
          {simulateMutation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Simular Postback
        </Button>

        {response && (
          <div>
            <label className="text-sm font-medium mb-2 block">Resposta</label>
            <pre className="bg-slate-800 p-4 rounded-lg text-sm overflow-auto max-h-60">
              {response}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}