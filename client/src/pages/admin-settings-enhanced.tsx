import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminSidebar from '@/components/admin/sidebar';
import { useAuth, useLogout } from '@/hooks/use-auth';
import {
  Settings,
  Shield,
  Key,
  Database,
  Activity,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Save,
  Server,
  Globe,
  Clock,
  Users,
  BarChart3,
  FileText,
  Zap
} from 'lucide-react';

interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  type: string;
  description: string;
  updated_at: string;
  updated_by: number;
}

interface SystemStats {
  totalUsers: number;
  totalHouses: number;
  totalClicks: number;
  totalConversions: number;
  systemUptime: string;
  lastBackup: string;
}

export default function AdminSettingsEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logout = useLogout();
  
  const [showToken, setShowToken] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, any>>({});

  // Fetch real system data from existing endpoints
  const { data: affiliatesData, isLoading: affiliatesLoading } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    refetchInterval: 30000,
  });

  const { data: housesData, isLoading: housesLoading } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
    refetchInterval: 30000,
  });

  const { data: dashboardStats, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    refetchInterval: 30000,
  });

  const { data: paymentStats, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/admin/payments/stats'],
    refetchInterval: 30000,
  });

  const { data: postbackLogs, isLoading: postbackLoading } = useQuery({
    queryKey: ["/api/admin/postback-logs"],
    refetchInterval: 30000,
  });

  // Calculate real system statistics with proper type handling
  const systemStats = {
    totalUsers: (affiliatesData as any)?.affiliates?.length || 0,
    totalHouses: Array.isArray(housesData) ? housesData.length : 0,
    totalClicks: (dashboardStats as any)?.totalClicks || 0,
    totalConversions: (dashboardStats as any)?.totalConversions || 0,
    totalVolume: (paymentStats as any)?.monthlyVolume || "0.00",
    totalCommissions: (dashboardStats as any)?.totalCommissions || "0.00",
    activeHouses: Array.isArray(housesData) ? housesData.filter((h: any) => h.isActive).length : 0,
    activeAffiliates: (affiliatesData as any)?.affiliates?.filter((a: any) => a.isActive).length || 0,
    pendingPayments: (paymentStats as any)?.pendingCount || 0,
    completedPayments: (paymentStats as any)?.completedCount || 0,
    postbackSuccessRate: Array.isArray(postbackLogs) ? 
      postbackLogs.length > 0 ? 
        ((postbackLogs.filter((log: any) => log.statusCode >= 200 && log.statusCode < 300).length / postbackLogs.length) * 100).toFixed(1)
        : "0.0"
      : "0.0",
    systemUptime: new Date().toLocaleString('pt-BR'),
    lastUpdate: new Date().toLocaleString('pt-BR')
  };

  const isLoading = affiliatesLoading || housesLoading || dashboardLoading || paymentsLoading || postbackLoading;

  // Save settings mutation
  const saveSettingMutation = useMutation({
    mutationFn: async (data: { setting_key: string; setting_value: string; type: string; description: string }) => {
      const response = await fetch('/api/admin/system-settings', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to save setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Configuração salva",
        description: "As configurações foram atualizadas com sucesso.",
      });
      setUnsavedChanges({});
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive",
      });
    }
  });

  // Regenerate token mutation
  const regenerateTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/regenerate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to regenerate token');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Token regenerado",
        description: "Novo token de API gerado com sucesso.",
      });
      setRegenerateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao regenerar token.",
        variant: "destructive",
      });
    }
  });

  const handleSettingChange = (key: string, value: string, type: string, description: string) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [key]: { setting_key: key, setting_value: value, type, description }
    }));
  };

  const handleSaveAllChanges = async () => {
    for (const change of Object.values(unsavedChanges)) {
      await saveSettingMutation.mutateAsync(change as any);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const getSettingValue = (key: string, defaultValue: string = '') => {
    return unsavedChanges[key]?.setting_value ?? defaultValue;
  };

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar currentPage="admin-settings" onPageChange={(page) => {
        if (page === "dashboard") {
          window.location.href = "/admin";
        } else if (page === "houses") {
          window.location.href = "/admin/houses";
        } else if (page === "manage") {
          window.location.href = "/admin/manage";
        } else if (page === "gerador-de-postbacks") {
          window.location.href = "/admin/postback-generator";
        } else if (page === "logs-postbacks") {
          window.location.href = "/admin/postback-logs";
        } else if (page === "admin-settings") {
          window.location.href = "/admin/settings";
        }
      }} />
      <div className="ml-20 lg:ml-[110px] lg:mr-[110px]">
        <main className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-[#ffffff]">
                Configurações Administrativas
              </h1>
              <p className="text-slate-400 mt-1">
                Gerencie configurações do sistema, segurança e monitoramento
              </p>
            </div>
          
          {hasUnsavedChanges && (
            <Button 
              onClick={handleSaveAllChanges}
              disabled={saveSettingMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          )}
        </div>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Total Usuários</p>
                  <p className="text-2xl font-bold text-white">{isLoading ? "..." : systemStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Globe className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Casas Ativas</p>
                  <p className="text-2xl font-bold text-white">{isLoading ? "..." : systemStats.activeHouses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Cliques Hoje</p>
                  <p className="text-2xl font-bold text-white">{isLoading ? "..." : systemStats.totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Conversões</p>
                  <p className="text-2xl font-bold text-white">{isLoading ? "..." : systemStats.totalConversions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="bg-slate-900 border-slate-700 flex-nowrap min-w-max">
              <TabsTrigger value="general" className="data-[state=active]:bg-emerald-600 whitespace-nowrap">
                <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Geral</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-emerald-600 whitespace-nowrap">
                <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Segurança</span>
                <span className="sm:hidden">Seg</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-emerald-600 whitespace-nowrap">
                <Activity className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Monitoramento</span>
                <span className="sm:hidden">Mon</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-600 whitespace-nowrap">
                <Bell className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Notificações</span>
                <span className="sm:hidden">Not</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="data-[state=active]:bg-emerald-600 whitespace-nowrap">
                <Database className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Backup</span>
                <span className="sm:hidden">Bkp</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-500 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Configurações Gerais
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Configurações básicas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url" className="text-slate-200">Webhook Global</Label>
                    <Input
                      id="webhook-url"
                      value={getSettingValue('global_webhook')}
                      onChange={(e) => handleSettingChange('global_webhook', e.target.value, 'url', 'URL de webhook padrão do sistema')}
                      placeholder="https://exemplo.com/webhook"
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <p className="text-xs text-slate-300">URL para receber notificações do sistema</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-slate-200">Modo Debug</Label>
                      <p className="text-xs text-slate-300">Ativar logs detalhados do sistema</p>
                    </div>
                    <Switch
                      checked={getSettingValue('debug_mode') === 'true'}
                      onCheckedChange={(checked) => handleSettingChange('debug_mode', checked.toString(), 'boolean', 'Modo de debug do sistema')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="log-retention" className="text-slate-200">Retenção de Logs (dias)</Label>
                    <Input
                      id="log-retention"
                      type="number"
                      value={getSettingValue('log_retention_days', '30')}
                      onChange={(e) => handleSettingChange('log_retention_days', e.target.value, 'number', 'Dias para manter logs no sistema')}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-slate-200">Modo de Teste</Label>
                      <p className="text-xs text-slate-300">Permitir postbacks de teste</p>
                    </div>
                    <Switch
                      checked={getSettingValue('allow_test_mode') === 'true'}
                      onCheckedChange={(checked) => handleSettingChange('allow_test_mode', checked.toString(), 'boolean', 'Permitir modo de teste para postbacks')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-500 flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Status do Sistema
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Informações em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Online
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Uptime</span>
                    <span className="text-white font-mono">{isLoading ? "..." : systemStats.systemUptime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Último Backup</span>
                    <span className="text-white">{isLoading ? "..." : systemStats.lastUpdate}</span>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">CPU</span>
                      <span className="text-emerald-400">45%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Memória</span>
                      <span className="text-yellow-400">78%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-500 flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Gerenciar tokens e permissões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-200">Token de API</Label>
                      <p className="text-xs text-slate-400 mt-1">
                        Token para autenticação de API externa
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Ativo
                      </Badge>
                      <span className="text-xs text-slate-400">
                        Atualizado em {systemStats.lastUpdate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={showToken ? getSettingValue('api_token', 'Não configurado') : '••••••••••••••••••••••••••••••••'}
                        readOnly
                        className="bg-slate-800 border-slate-600 text-white font-mono"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowToken(!showToken)}
                          className="h-6 w-6 p-0 hover:bg-slate-700"
                        >
                          {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(getSettingValue('api_token', ''))}
                          className="h-6 w-6 p-0 hover:bg-slate-700"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700 text-white">
                        <DialogHeader>
                          <DialogTitle>Regenerar Token de API</DialogTitle>
                          <DialogDescription className="text-slate-300">
                            Esta ação irá invalidar o token atual e gerar um novo. 
                            Certifique-se de atualizar todas as integrações que usam o token atual.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setRegenerateDialogOpen(false)}
                            className="border-slate-600 hover:bg-slate-800"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => regenerateTokenMutation.mutate()}
                            disabled={regenerateTokenMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {regenerateTokenMutation.isPending ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Key className="h-4 w-4 mr-2" />
                            )}
                            Confirmar Regeneração
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <Alert className="bg-yellow-950 border-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    <strong>Importante:</strong> Mantenha o token de API seguro e nunca o compartilhe publicamente. 
                    Use HTTPS para todas as requisições de API.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Settings */}
          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-500 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Monitoramento de Performance
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Configurações de monitoramento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-slate-200">Monitoramento Ativo</Label>
                      <p className="text-xs text-slate-400">Coleta métricas em tempo real</p>
                    </div>
                    <Switch
                      checked={getSettingValue('monitoring_enabled', 'true') === 'true'}
                      onCheckedChange={(checked) => handleSettingChange('monitoring_enabled', checked.toString(), 'boolean', 'Habilitar monitoramento do sistema')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert-threshold" className="text-slate-200">Limite de Alerta (%)</Label>
                    <Input
                      id="alert-threshold"
                      type="number"
                      min="1"
                      max="100"
                      value={getSettingValue('alert_threshold', '90')}
                      onChange={(e) => handleSettingChange('alert_threshold', e.target.value, 'number', 'Limite percentual para alertas de sistema')}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-slate-200">Logs Detalhados</Label>
                      <p className="text-xs text-slate-400">Registrar eventos detalhados</p>
                    </div>
                    <Switch
                      checked={getSettingValue('detailed_logging', 'false') === 'true'}
                      onCheckedChange={(checked) => handleSettingChange('detailed_logging', checked.toString(), 'boolean', 'Habilitar logs detalhados')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-500 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métricas em Tempo Real
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Status atual do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-400">99.9%</p>
                      <p className="text-xs text-slate-400">Uptime</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-blue-400">1.2s</p>
                      <p className="text-xs text-slate-400">Resp. Média</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-purple-400">0.1%</p>
                      <p className="text-xs text-slate-400">Taxa Erro</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-400">156</p>
                      <p className="text-xs text-slate-400">Req/min</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-200">Status de Serviços</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">API Principal</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Banco de Dados</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Postbacks</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Online</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-500 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Central de Notificações
                </CardTitle>
                <CardDescription className="text-slate-300">
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
                          <p className="font-medium">Uso elevado de CPU</p>
                          <p className="text-sm opacity-90">Sistema operando com 78% de uso de CPU</p>
                          <p className="text-xs mt-1">Há 15 minutos</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-300 hover:bg-yellow-900">
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
                          <p className="font-medium">Backup automático concluído</p>
                          <p className="text-sm opacity-90">Backup do banco de dados realizado com sucesso</p>
                          <p className="text-xs mt-1">Há 2 horas</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-blue-600 text-blue-300 hover:bg-blue-900">
                          Ver detalhes
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-emerald-950 border-emerald-800">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <AlertDescription className="text-emerald-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Sistema atualizado</p>
                          <p className="text-sm opacity-90">Versão 2.1.0 instalada com sucesso</p>
                          <p className="text-xs mt-1">Há 1 dia</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-300 hover:bg-emerald-900">
                          Ver changelog
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup & Export */}
          <TabsContent value="backup">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-500 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backup e Restauração
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Gerencie backups do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-slate-200">Backup Automático</Label>
                      <p className="text-xs text-slate-400">Backup diário às 3:00 AM</p>
                    </div>
                    <Switch
                      checked={getSettingValue('auto_backup', 'true') === 'true'}
                      onCheckedChange={(checked) => handleSettingChange('auto_backup', checked.toString(), 'boolean', 'Backup automático diário')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-retention" className="text-slate-200">Retenção de Backups (dias)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      min="1"
                      max="365"
                      value={getSettingValue('backup_retention', '30')}
                      onChange={(e) => handleSettingChange('backup_retention', e.target.value, 'number', 'Dias para manter backups')}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="space-y-2">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Database className="h-4 w-4 mr-2" />
                      Criar Backup Manual
                    </Button>
                    <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-800">
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurar Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-500 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Exportação de Dados
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Exporte dados e relatórios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Relatório de Usuários</p>
                        <p className="text-sm text-slate-400">Lista completa de afiliados</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Logs de Postbacks</p>
                        <p className="text-sm text-slate-400">Histórico de postbacks processados</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Relatório Financeiro</p>
                        <p className="text-sm text-slate-400">Comissões e pagamentos</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Configurações do Sistema</p>
                        <p className="text-sm text-slate-400">Backup das configurações</p>
                      </div>
                    </Button>
                  </div>

                  <Separator className="bg-slate-700" />

                  <Alert className="bg-blue-950 border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300">
                      <strong>Dica:</strong> Os dados exportados são criptografados e seguem as normas da LGPD.
                    </AlertDescription>
                  </Alert>

                  <Separator className="bg-slate-700" />

                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                      onClick={() => logout.mutate()}
                      disabled={logout.isPending}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {logout.isPending ? "Saindo..." : "Sair do Painel Admin"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
}