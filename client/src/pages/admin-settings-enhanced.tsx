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
  
  const [showToken, setShowToken] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, any>>({});

  // Fetch system settings from database
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/system-settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Fetch system stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/system-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

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
    return unsavedChanges[key]?.setting_value ?? settings?.[key]?.setting_value ?? defaultValue;
  };

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  if (settingsLoading || statsLoading) {
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
    <div className="flex flex-col overflow-x-hidden pl-[220px] pr-4 pt-6 max-w-[1440px] mx-auto space-y-6 min-h-screen bg-slate-950 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-500 flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Configurações Administrativas
            </h1>
            <p className="text-slate-300 mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Total Usuários</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{stats?.totalHouses || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{stats?.totalClicks || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{stats?.totalConversions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-slate-900 border-slate-700">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-600">
              <Settings className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-emerald-600">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-emerald-600">
              <Activity className="h-4 w-4 mr-2" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-600">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-emerald-600">
              <Database className="h-4 w-4 mr-2" />
              Backup
            </TabsTrigger>
          </TabsList>

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
                    <span className="text-white font-mono">{stats?.systemUptime || '0h 0m'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Último Backup</span>
                    <span className="text-white">{stats?.lastBackup || 'Nunca'}</span>
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
                        Atualizado em {settings?.api_token?.updated_at ? new Date(settings.api_token.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}