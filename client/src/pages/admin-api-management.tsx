import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Settings, 
  Activity, 
  ExternalLink, 
  Code,
  Database,
  Webhook,
  BarChart3,
  Shield
} from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import { motion } from "framer-motion";

interface ApiKey {
  id: number;
  name: string;
  keyValue: string;
  houseId: number;
  houseName: string;
  isActive: boolean;
  lastUsed: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface ApiRequestLog {
  id: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  createdAt: string;
}

export default function AdminApiManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [key: number]: boolean }>({});
  
  // Fetch API keys
  const { data: apiKeys, isLoading: keysLoading, refetch: refetchKeys } = useQuery({
    queryKey: ['/api/admin/api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/admin/api-keys');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      return response.json();
    }
  });

  // Fetch betting houses for API key creation
  const { data: bettingHouses } = useQuery({
    queryKey: ['/api/admin/betting-houses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/betting-houses');
      if (!response.ok) throw new Error('Failed to fetch betting houses');
      return response.json();
    }
  });

  // Fetch API request logs
  const { data: requestLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/admin/api-logs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/api-logs');
      if (!response.ok) throw new Error('Failed to fetch API logs');
      return response.json();
    }
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: { name: string; houseId: number; expiresAt?: string }) => {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "API Key criada com sucesso!" });
      setShowCreateDialog(false);
      refetchKeys();
    },
    onError: () => {
      toast({ title: "Erro ao criar API Key", variant: "destructive" });
    }
  });

  // Deactivate API key mutation
  const deactivateApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/api-keys/${id}/deactivate`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to deactivate API key');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "API Key desativada com sucesso!" });
      refetchKeys();
    },
    onError: () => {
      toast({ title: "Erro ao desativar API Key", variant: "destructive" });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado para a área de transferência!" });
  };

  const toggleShowApiKey = (keyId: number) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-600 text-white">Sucesso</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-yellow-600 text-white">Cliente</Badge>;
    } else if (statusCode >= 500) {
      return <Badge className="bg-red-600 text-white">Servidor</Badge>;
    }
    return <Badge variant="outline">{statusCode}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      
      <div className="flex-1 ml-64 p-6 pb-48">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-400" />
                Gerenciamento de API
              </h1>
              <p className="text-slate-400 mt-2">
                Gerencie chaves de API e monitore integrações externas
              </p>
            </div>
          </div>

          <Tabs defaultValue="keys" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="keys" className="data-[state=active]:bg-slate-700">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-slate-700">
                <Activity className="w-4 h-4 mr-2" />
                Logs de Requisições
              </TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-slate-700">
                <Code className="w-4 h-4 mr-2" />
                Documentação
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-slate-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Chaves de API</h2>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Criar Nova API Key</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Crie uma nova chave de API para integração externa
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      createApiKeyMutation.mutate({
                        name: formData.get('name') as string,
                        houseId: parseInt(formData.get('houseId') as string),
                        expiresAt: formData.get('expiresAt') as string || undefined
                      });
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome da Chave</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="Ex: API Produção Casa X"
                          className="bg-slate-800 border-slate-600 text-white" 
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="houseId">Casa de Apostas</Label>
                        <Select name="houseId" required>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione uma casa" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {bettingHouses?.map((house: any) => (
                              <SelectItem key={house.id} value={house.id.toString()}>
                                {house.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expiresAt">Data de Expiração (Opcional)</Label>
                        <Input 
                          id="expiresAt" 
                          name="expiresAt" 
                          type="date"
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={createApiKeyMutation.isPending}
                      >
                        {createApiKeyMutation.isPending ? "Criando..." : "Criar API Key"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  {keysLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Nome</TableHead>
                          <TableHead className="text-slate-300">Casa</TableHead>
                          <TableHead className="text-slate-300">Chave</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Último Uso</TableHead>
                          <TableHead className="text-slate-300">Criada</TableHead>
                          <TableHead className="text-slate-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys?.map((key: ApiKey) => (
                          <TableRow key={key.id} className="border-slate-700">
                            <TableCell className="text-white font-medium">{key.name}</TableCell>
                            <TableCell className="text-slate-300">{key.houseName}</TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="font-mono">
                                  {showApiKey[key.id] 
                                    ? key.keyValue 
                                    : '••••••••••••••••••••••••••••••••'
                                  }
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleShowApiKey(key.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {showApiKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(key.keyValue)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {key.isActive ? (
                                <Badge className="bg-green-600 text-white">Ativa</Badge>
                              ) : (
                                <Badge className="bg-red-600 text-white">Inativa</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {key.lastUsed ? formatDate(key.lastUsed) : 'Nunca'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {formatDate(key.createdAt)}
                            </TableCell>
                            <TableCell>
                              {key.isActive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deactivateApiKeyMutation.mutate(key.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Desativar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Logs de Requisições da API</h2>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  {logsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Método</TableHead>
                          <TableHead className="text-slate-300">Endpoint</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Tempo (ms)</TableHead>
                          <TableHead className="text-slate-300">IP</TableHead>
                          <TableHead className="text-slate-300">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requestLogs?.map((log: ApiRequestLog) => (
                          <TableRow key={log.id} className="border-slate-700">
                            <TableCell>
                              <Badge variant="outline" className="text-blue-400 border-blue-400">
                                {log.method}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white font-mono">{log.endpoint}</TableCell>
                            <TableCell>{getStatusBadge(log.statusCode)}</TableCell>
                            <TableCell className="text-slate-300">{log.responseTime}ms</TableCell>
                            <TableCell className="text-slate-300 font-mono">{log.ipAddress}</TableCell>
                            <TableCell className="text-slate-300">{formatDate(log.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="docs" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Documentação da API</h2>
              
              <div className="grid gap-6">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Autenticação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300">
                      Para usar a API, inclua sua chave de API no header de cada requisição:
                    </p>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <code className="text-green-400">
                        X-API-Key: sua_chave_de_api_aqui
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Endpoints Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-2">POST /api/v1/conversions</h4>
                      <p className="text-slate-300 mb-2">Registrar uma conversão (click, registro, depósito, lucro)</p>
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <pre className="text-green-400 text-sm">
{`{
  "event_type": "deposit",
  "customer_id": "customer_123", 
  "subid": "affiliate_username",
  "amount": "100.00",
  "commission": "30.00",
  "metadata": {
    "currency": "BRL",
    "payment_method": "pix"
  }
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">GET /api/v1/affiliates</h4>
                      <p className="text-slate-300 mb-2">Listar afiliados ativos para sua casa de apostas</p>
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <code className="text-blue-400">
                          GET /api/v1/affiliates?page=1&limit=10&status=active
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">GET /api/v1/stats</h4>
                      <p className="text-slate-300 mb-2">Obter estatísticas da sua casa de apostas</p>
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <code className="text-blue-400">
                          GET /api/v1/stats?start_date=2024-01-01&end_date=2024-12-31
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">URL Base da API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <code className="text-blue-400">
                        {window.location.origin}/api/v1
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/api/v1`)}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Estatísticas da API</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Total de Chaves</p>
                        <p className="text-2xl font-bold text-white">{apiKeys?.length || 0}</p>
                      </div>
                      <Key className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Chaves Ativas</p>
                        <p className="text-2xl font-bold text-green-400">
                          {apiKeys?.filter((key: ApiKey) => key.isActive).length || 0}
                        </p>
                      </div>
                      <Shield className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Requisições Hoje</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {requestLogs?.filter((log: ApiRequestLog) => 
                            new Date(log.createdAt).toDateString() === new Date().toDateString()
                          ).length || 0}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Taxa de Sucesso</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {requestLogs?.length ? 
                            Math.round((requestLogs.filter((log: ApiRequestLog) => 
                              log.statusCode >= 200 && log.statusCode < 300
                            ).length / requestLogs.length) * 100) : 0
                          }%
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}