import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Globe, 
  Key, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  Activity
} from "lucide-react";

export default function AdminApiHouses() {
  const [selectedHouse, setSelectedHouse] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    baseUrl: "",
    primaryParam: "subid",
    commissionType: "CPA" as "CPA" | "RevShare" | "Hybrid",
    commissionValue: "",
    cpaValue: "",
    revshareValue: "",
    minDeposit: "",
    identifier: "",
    securityToken: "",
    integrationType: "api" as "postback" | "api",
    
    // API específico
    apiBaseUrl: "",
    authType: "bearer" as "bearer" | "apikey" | "basic" | "custom",
    authToken: "",
    authApiKey: "",
    authUsername: "",
    authPassword: "",
    customHeaders: "",
    
    affiliateStatsEndpoint: "/api/affiliate/stats",
    conversionsEndpoint: "/api/conversions",
    commissionsEndpoint: "/api/commissions",
    
    subidField: "subid",
    amountField: "amount",
    eventField: "event_type",
    
    syncSchedule: "hourly" as "realtime" | "hourly" | "daily",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: houses, isLoading } = useQuery({
    queryKey: ["/api/admin/houses"],
    queryFn: () => apiRequest("/api/admin/houses"),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const apiConfig = data.integrationType === 'api' ? {
        baseUrl: data.apiBaseUrl,
        authType: data.authType,
        authData: {
          token: data.authToken,
          apiKey: data.authApiKey,
          username: data.authUsername,
          password: data.authPassword,
          headers: data.customHeaders ? JSON.parse(data.customHeaders) : {},
        },
        endpoints: {
          affiliateStats: data.affiliateStatsEndpoint,
          conversions: data.conversionsEndpoint,
          commissions: data.commissionsEndpoint,
        },
        dataMapping: {
          subidField: data.subidField,
          amountField: data.amountField,
          eventField: data.eventField,
        },
        syncSchedule: data.syncSchedule,
      } : {};

      const payload = {
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl,
        baseUrl: data.baseUrl,
        primaryParam: data.primaryParam,
        commissionType: data.commissionType,
        commissionValue: data.commissionValue,
        cpaValue: data.cpaValue,
        revshareValue: data.revshareValue,
        minDeposit: data.minDeposit,
        identifier: data.identifier,
        securityToken: data.securityToken,
        integrationType: data.integrationType,
        apiConfig,
      };

      if (selectedHouse?.id) {
        return apiRequest(`/api/admin/houses/${selectedHouse.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        return apiRequest("/api/admin/houses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: selectedHouse ? "Casa atualizada com sucesso" : "Casa criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/houses"] });
      setShowForm(false);
      setSelectedHouse(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar casa",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (houseId: number) => {
      return apiRequest(`/api/admin/houses/${houseId}/test-api`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      setTestResult(data);
      toast({
        title: data.success ? "Conexão bem-sucedida" : "Falha na conexão",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setTestResult({
        success: false,
        message: error.message || "Erro ao testar conexão",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async ({ houseId, dateFrom, dateTo }: any) => {
      return apiRequest(`/api/admin/houses/${houseId}/sync`, {
        method: "POST",
        body: JSON.stringify({ dateFrom, dateTo }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronização concluída",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/houses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Erro ao sincronizar dados",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      logoUrl: "",
      baseUrl: "",
      primaryParam: "subid",
      commissionType: "CPA",
      commissionValue: "",
      cpaValue: "",
      revshareValue: "",
      minDeposit: "",
      identifier: "",
      securityToken: "",
      integrationType: "api",
      apiBaseUrl: "",
      authType: "bearer",
      authToken: "",
      authApiKey: "",
      authUsername: "",
      authPassword: "",
      customHeaders: "",
      affiliateStatsEndpoint: "/api/affiliate/stats",
      conversionsEndpoint: "/api/conversions",
      commissionsEndpoint: "/api/commissions",
      subidField: "subid",
      amountField: "amount",
      eventField: "event_type",
      syncSchedule: "hourly",
    });
  };

  const handleEdit = (house: any) => {
    setSelectedHouse(house);
    setFormData({
      name: house.name || "",
      description: house.description || "",
      logoUrl: house.logoUrl || "",
      baseUrl: house.baseUrl || "",
      primaryParam: house.primaryParam || "subid",
      commissionType: house.commissionType || "CPA",
      commissionValue: house.commissionValue || "",
      cpaValue: house.cpaValue || "",
      revshareValue: house.revshareValue || "",
      minDeposit: house.minDeposit || "",
      identifier: house.identifier || "",
      securityToken: house.securityToken || "",
      integrationType: house.integrationType || "api",
      apiBaseUrl: house.apiConfig?.baseUrl || "",
      authType: house.apiConfig?.authType || "bearer",
      authToken: house.apiConfig?.authData?.token || "",
      authApiKey: house.apiConfig?.authData?.apiKey || "",
      authUsername: house.apiConfig?.authData?.username || "",
      authPassword: house.apiConfig?.authData?.password || "",
      customHeaders: house.apiConfig?.authData?.headers ? JSON.stringify(house.apiConfig.authData.headers, null, 2) : "",
      affiliateStatsEndpoint: house.apiConfig?.endpoints?.affiliateStats || "/api/affiliate/stats",
      conversionsEndpoint: house.apiConfig?.endpoints?.conversions || "/api/conversions",
      commissionsEndpoint: house.apiConfig?.endpoints?.commissions || "/api/commissions",
      subidField: house.apiConfig?.dataMapping?.subidField || "subid",
      amountField: house.apiConfig?.dataMapping?.amountField || "amount",
      eventField: house.apiConfig?.dataMapping?.eventField || "event_type",
      syncSchedule: house.apiConfig?.syncSchedule || "hourly",
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleTestConnection = (houseId: number) => {
    testConnectionMutation.mutate(houseId);
  };

  const handleSync = (houseId: number) => {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7); // Últimos 7 dias
    
    syncMutation.mutate({
      houseId,
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0]
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Casas por API</h1>
            <p className="text-slate-400">
              Gerencie casas de apostas com integração por API
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setSelectedHouse(null);
              setShowForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Casa API
          </Button>
        </div>

        {!showForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses?.filter((house: any) => house.integrationType === 'api').map((house: any) => (
              <Card key={house.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      {house.logoUrl && (
                        <img src={house.logoUrl} alt={house.name} className="w-6 h-6 rounded" />
                      )}
                      {house.name}
                    </CardTitle>
                    <Badge variant={house.isActive ? "default" : "secondary"}>
                      {house.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <CardDescription>{house.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Tipo:</span>
                      <p className="text-white">{house.commissionType}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Valor:</span>
                      <p className="text-white">
                        {house.commissionType === 'RevShare' 
                          ? `${house.commissionValue}%`
                          : `R$ ${house.commissionValue}`
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Auth:</span>
                      <p className="text-white capitalize">{house.apiConfig?.authType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Sync:</span>
                      <p className="text-white capitalize">{house.apiConfig?.syncSchedule || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(house)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(house.id)}
                        disabled={testConnectionMutation.isPending}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <TestTube className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSync(house.id)}
                      disabled={syncMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedHouse ? "Editar Casa API" : "Nova Casa API"}
              </CardTitle>
              <CardDescription>
                Configure uma casa de apostas com integração por API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="commission">Comissões</TabsTrigger>
                    <TabsTrigger value="api">API Config</TabsTrigger>
                    <TabsTrigger value="mapping">Mapeamento</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Nome da Casa</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Ex: Betfair"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Identificador</Label>
                        <Input
                          value={formData.identifier}
                          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Ex: betfair"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300">Descrição</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Descrição da casa de apostas..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">URL do Logo</Label>
                        <Input
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">URL de Afiliação</Label>
                        <Input
                          value={formData.baseUrl}
                          onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://casa.com/register?ref=VALUE"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Parâmetro Principal</Label>
                        <Input
                          value={formData.primaryParam}
                          onChange={(e) => setFormData({ ...formData, primaryParam: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="subid"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Token de Segurança</Label>
                        <div className="relative">
                          <Input
                            value={formData.securityToken}
                            onChange={(e) => setFormData({ ...formData, securityToken: e.target.value })}
                            type={showPassword ? "text" : "password"}
                            className="bg-slate-700 border-slate-600 text-white pr-10"
                            placeholder="token123..."
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="commission" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Tipo de Comissão</Label>
                        <Select
                          value={formData.commissionType}
                          onValueChange={(value: any) => setFormData({ ...formData, commissionType: value })}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CPA">CPA (Custo Por Aquisição)</SelectItem>
                            <SelectItem value="RevShare">RevShare (Divisão de Receita)</SelectItem>
                            <SelectItem value="Hybrid">Híbrido (CPA + RevShare)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Depósito Mínimo (R$)</Label>
                        <Input
                          value={formData.minDeposit}
                          onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="10.00"
                        />
                      </div>
                    </div>

                    {formData.commissionType === "CPA" && (
                      <div>
                        <Label className="text-slate-300">Valor CPA (R$)</Label>
                        <Input
                          value={formData.commissionValue}
                          onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="150.00"
                          required
                        />
                      </div>
                    )}

                    {formData.commissionType === "RevShare" && (
                      <div>
                        <Label className="text-slate-300">Percentual RevShare (%)</Label>
                        <Input
                          value={formData.commissionValue}
                          onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="30"
                          required
                        />
                      </div>
                    )}

                    {formData.commissionType === "Hybrid" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300">Valor CPA (R$)</Label>
                          <Input
                            value={formData.cpaValue}
                            onChange={(e) => setFormData({ ...formData, cpaValue: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="150.00"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Percentual RevShare (%)</Label>
                          <Input
                            value={formData.revshareValue}
                            onChange={(e) => setFormData({ ...formData, revshareValue: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="30"
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="api" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">URL Base da API</Label>
                        <Input
                          value={formData.apiBaseUrl}
                          onChange={(e) => setFormData({ ...formData, apiBaseUrl: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://api.casa.com"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Tipo de Autenticação</Label>
                        <Select
                          value={formData.authType}
                          onValueChange={(value: any) => setFormData({ ...formData, authType: value })}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                            <SelectItem value="apikey">API Key</SelectItem>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                            <SelectItem value="custom">Custom Headers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.authType === 'bearer' && (
                      <div>
                        <Label className="text-slate-300">Bearer Token</Label>
                        <Input
                          value={formData.authToken}
                          onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                          type="password"
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="seu_token_aqui"
                        />
                      </div>
                    )}

                    {formData.authType === 'apikey' && (
                      <div>
                        <Label className="text-slate-300">API Key</Label>
                        <Input
                          value={formData.authApiKey}
                          onChange={(e) => setFormData({ ...formData, authApiKey: e.target.value })}
                          type="password"
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="sua_api_key_aqui"
                        />
                      </div>
                    )}

                    {formData.authType === 'basic' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300">Usuário</Label>
                          <Input
                            value={formData.authUsername}
                            onChange={(e) => setFormData({ ...formData, authUsername: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="usuario"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Senha</Label>
                          <Input
                            value={formData.authPassword}
                            onChange={(e) => setFormData({ ...formData, authPassword: e.target.value })}
                            type="password"
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="senha"
                          />
                        </div>
                      </div>
                    )}

                    {formData.authType === 'custom' && (
                      <div>
                        <Label className="text-slate-300">Headers Customizados (JSON)</Label>
                        <Textarea
                          value={formData.customHeaders}
                          onChange={(e) => setFormData({ ...formData, customHeaders: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white font-mono"
                          placeholder={`{
  "X-API-Key": "sua_chave",
  "Authorization": "Custom token"
}`}
                          rows={4}
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Endpoints da API</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-slate-300">Endpoint de Conversões</Label>
                          <Input
                            value={formData.conversionsEndpoint}
                            onChange={(e) => setFormData({ ...formData, conversionsEndpoint: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="/api/conversions"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Endpoint de Estatísticas</Label>
                          <Input
                            value={formData.affiliateStatsEndpoint}
                            onChange={(e) => setFormData({ ...formData, affiliateStatsEndpoint: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="/api/affiliate/stats"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="mapping" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Campo do SubID</Label>
                        <Input
                          value={formData.subidField}
                          onChange={(e) => setFormData({ ...formData, subidField: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="subid"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Campo do Valor</Label>
                        <Input
                          value={formData.amountField}
                          onChange={(e) => setFormData({ ...formData, amountField: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="amount"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Campo do Evento</Label>
                        <Input
                          value={formData.eventField}
                          onChange={(e) => setFormData({ ...formData, eventField: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="event_type"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300">Frequência de Sincronização</Label>
                      <Select
                        value={formData.syncSchedule}
                        onValueChange={(value: any) => setFormData({ ...formData, syncSchedule: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Tempo Real</SelectItem>
                          <SelectItem value="hourly">A cada Hora</SelectItem>
                          <SelectItem value="daily">Diariamente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedHouse?.id && (
                      <Card className="bg-slate-700 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <TestTube className="w-5 h-5" />
                            Teste de Conexão
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button
                            type="button"
                            onClick={() => handleTestConnection(selectedHouse.id)}
                            disabled={testConnectionMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {testConnectionMutation.isPending ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Testando...
                              </>
                            ) : (
                              <>
                                <TestTube className="w-4 h-4 mr-2" />
                                Testar Conexão
                              </>
                            )}
                          </Button>

                          {testResult && (
                            <div className={`p-4 rounded-lg ${
                              testResult.success ? 'bg-emerald-900/50 border border-emerald-500' : 'bg-red-900/50 border border-red-500'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {testResult.success ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className={testResult.success ? 'text-emerald-300' : 'text-red-300'}>
                                  {testResult.success ? 'Conexão bem-sucedida' : 'Falha na conexão'}
                                </span>
                              </div>
                              <p className="text-slate-300 text-sm">{testResult.message}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedHouse(null);
                      resetForm();
                    }}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      selectedHouse ? "Atualizar Casa" : "Criar Casa"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}