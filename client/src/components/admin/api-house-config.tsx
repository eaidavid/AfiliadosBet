import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Settings, 
  Key, 
  Globe, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Sync,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";

const apiConfigSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  baseUrl: z.string().min(1, "URL do afiliado é obrigatória"),
  primaryParam: z.string().min(1, "Parâmetro principal é obrigatório"),
  commissionType: z.enum(["CPA", "RevShare", "Hybrid"]),
  commissionValue: z.string().min(1, "Valor da comissão é obrigatório"),
  cpaValue: z.string().optional(),
  revshareValue: z.string().optional(),
  minDeposit: z.string().optional(),
  identifier: z.string().min(1, "Identificador é obrigatório"),
  securityToken: z.string().min(1, "Token de segurança é obrigatório"),
  integrationType: z.enum(["postback", "api"]),
  
  // Configurações de API
  apiBaseUrl: z.string().url("URL da API inválida").optional(),
  authType: z.enum(["bearer", "apikey", "basic", "custom"]).optional(),
  authToken: z.string().optional(),
  authApiKey: z.string().optional(),
  authUsername: z.string().optional(),
  authPassword: z.string().optional(),
  customHeaders: z.string().optional(),
  
  // Endpoints
  affiliateStatsEndpoint: z.string().optional(),
  conversionsEndpoint: z.string().optional(),
  commissionsEndpoint: z.string().optional(),
  
  // Mapeamento de dados
  subidField: z.string().optional(),
  amountField: z.string().optional(),
  eventField: z.string().optional(),
  
  syncSchedule: z.enum(["realtime", "hourly", "daily"]).optional(),
});

type ApiConfigFormData = z.infer<typeof apiConfigSchema>;

interface ApiHouseConfigProps {
  house?: any;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ApiHouseConfig({ house, onSave, onCancel }: ApiHouseConfigProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApiConfigFormData>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      name: house?.name || "",
      description: house?.description || "",
      logoUrl: house?.logoUrl || "",
      baseUrl: house?.baseUrl || "",
      primaryParam: house?.primaryParam || "subid",
      commissionType: house?.commissionType || "CPA",
      commissionValue: house?.commissionValue || "",
      cpaValue: house?.cpaValue || "",
      revshareValue: house?.revshareValue || "",
      minDeposit: house?.minDeposit || "",
      identifier: house?.identifier || "",
      securityToken: house?.securityToken || "",
      integrationType: house?.integrationType || "postback",
      
      // API específico
      apiBaseUrl: house?.apiConfig?.baseUrl || "",
      authType: house?.apiConfig?.authType || "bearer",
      authToken: house?.apiConfig?.authData?.token || "",
      authApiKey: house?.apiConfig?.authData?.apiKey || "",
      authUsername: house?.apiConfig?.authData?.username || "",
      authPassword: house?.apiConfig?.authData?.password || "",
      customHeaders: house?.apiConfig?.authData?.headers ? JSON.stringify(house.apiConfig.authData.headers, null, 2) : "",
      
      affiliateStatsEndpoint: house?.apiConfig?.endpoints?.affiliateStats || "/api/affiliate/stats",
      conversionsEndpoint: house?.apiConfig?.endpoints?.conversions || "/api/conversions",
      commissionsEndpoint: house?.apiConfig?.endpoints?.commissions || "/api/commissions",
      
      subidField: house?.apiConfig?.dataMapping?.subidField || "subid",
      amountField: house?.apiConfig?.dataMapping?.amountField || "amount",
      eventField: house?.apiConfig?.dataMapping?.eventField || "event_type",
      
      syncSchedule: house?.apiConfig?.syncSchedule || "hourly",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ApiConfigFormData) => {
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

      if (house?.id) {
        return apiRequest(`/api/admin/houses/${house.id}`, {
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
        description: house ? "Casa atualizada com sucesso" : "Casa criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/houses"] });
      onSave?.();
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
    },
    onError: (error: any) => {
      setTestResult({
        success: false,
        message: error.message || "Erro ao testar conexão",
      });
    },
    onSettled: () => {
      setIsTestingConnection(false);
    },
  });

  const handleTestConnection = async () => {
    if (!house?.id) {
      toast({
        title: "Aviso",
        description: "Salve a casa primeiro para testar a conexão",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    testConnectionMutation.mutate(house.id);
  };

  const onSubmit = (data: ApiConfigFormData) => {
    saveMutation.mutate(data);
  };

  const integrationType = form.watch("integrationType");
  const authType = form.watch("authType");
  const commissionType = form.watch("commissionType");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {house ? "Editar Casa de Apostas" : "Nova Casa de Apostas"}
          </h2>
          <p className="text-slate-400">
            Configure uma casa para integração por postback ou API
          </p>
        </div>
        
        {integrationType === 'api' && (
          <div className="flex items-center gap-2">
            <Badge variant={testResult?.success ? "default" : "destructive"} className="gap-1">
              {testResult?.success ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  API Conectada
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  API Offline
                </>
              )}
            </Badge>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="basic" className="data-[state=active]:bg-slate-600">
                <Settings className="w-4 h-4 mr-2" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="commission" className="data-[state=active]:bg-slate-600">
                <Globe className="w-4 h-4 mr-2" />
                Comissões
              </TabsTrigger>
              <TabsTrigger value="integration" className="data-[state=active]:bg-slate-600">
                <Key className="w-4 h-4 mr-2" />
                Integração
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-slate-600">
                <TestTube className="w-4 h-4 mr-2" />
                API Config
              </TabsTrigger>
            </TabsList>

            {/* Configurações Básicas */}
            <TabsContent value="basic" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Informações Básicas</CardTitle>
                  <CardDescription>
                    Configure os dados principais da casa de apostas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Nome da Casa</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="Ex: Betano"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Identificador</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="Ex: betano"
                            />
                          </FormControl>
                          <FormDescription>
                            Usado nos URLs de postback (apenas letras minúsculas)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="bg-slate-600 border-slate-500 text-white"
                            placeholder="Descrição da casa de apostas..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">URL do Logo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="https://example.com/logo.png"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="baseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">URL de Afiliação</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="https://casa.com/register?ref=VALUE"
                            />
                          </FormControl>
                          <FormDescription>
                            Use VALUE onde o subid deve ser inserido
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de Comissão */}
            <TabsContent value="commission" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Estrutura de Comissões</CardTitle>
                  <CardDescription>
                    Configure como as comissões são calculadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="commissionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Tipo de Comissão</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CPA">CPA (Custo Por Aquisição)</SelectItem>
                              <SelectItem value="RevShare">RevShare (Divisão de Receita)</SelectItem>
                              <SelectItem value="Hybrid">Híbrido (CPA + RevShare)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Depósito Mínimo (R$)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="10.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {commissionType === "CPA" && (
                    <FormField
                      control={form.control}
                      name="commissionValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Valor CPA (R$)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="150.00"
                            />
                          </FormControl>
                          <FormDescription>
                            Valor fixo pago por cada conversão qualificada
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {commissionType === "RevShare" && (
                    <FormField
                      control={form.control}
                      name="commissionValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Percentual RevShare (%)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="30"
                            />
                          </FormControl>
                          <FormDescription>
                            Percentual da receita líquida da casa
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {commissionType === "Hybrid" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cpaValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">Valor CPA (R$)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-600 border-slate-500 text-white"
                                placeholder="150.00"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="revshareValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">Percentual RevShare (%)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-600 border-slate-500 text-white"
                                placeholder="30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de Integração */}
            <TabsContent value="integration" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Método de Integração</CardTitle>
                  <CardDescription>
                    Escolha como receber dados de conversão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="integrationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Tipo de Integração</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="postback">Postback (Webhooks)</SelectItem>
                            <SelectItem value="api">API (Consulta Ativa)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {integrationType === 'postback' 
                            ? 'A casa envia dados automaticamente via webhook'
                            : 'Nosso sistema consulta a API da casa periodicamente'
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryParam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Parâmetro Principal</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-600 border-slate-500 text-white"
                              placeholder="subid"
                            />
                          </FormControl>
                          <FormDescription>
                            Nome do parâmetro usado para identificar afiliados
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="securityToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Token de Segurança</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                className="bg-slate-600 border-slate-500 text-white pr-10"
                                placeholder="token123..."
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-slate-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Token para validação de postbacks
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {integrationType === 'postback' && (
                    <div className="p-4 bg-slate-600 rounded-lg">
                      <h4 className="text-white font-medium mb-2">URLs de Postback</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Registro:</span>
                          <code className="text-emerald-400 text-xs">
                            /api/postback/{form.watch("identifier") || "casa"}/registration
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Depósito:</span>
                          <code className="text-emerald-400 text-xs">
                            /api/postback/{form.watch("identifier") || "casa"}/deposit
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de API */}
            <TabsContent value="api" className="space-y-4">
              {integrationType === 'api' ? (
                <>
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Configuração da API
                      </CardTitle>
                      <CardDescription>
                        Configure a integração com a API da casa
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="apiBaseUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">URL Base da API</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="https://api.casa.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="authType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Tipo de Autenticação</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bearer">Bearer Token</SelectItem>
                                  <SelectItem value="apikey">API Key</SelectItem>
                                  <SelectItem value="basic">Basic Auth</SelectItem>
                                  <SelectItem value="custom">Custom Headers</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Campos de autenticação baseados no tipo */}
                      {authType === 'bearer' && (
                        <FormField
                          control={form.control}
                          name="authToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Bearer Token</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="seu_token_aqui"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {authType === 'apikey' && (
                        <FormField
                          control={form.control}
                          name="authApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">API Key</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="sua_api_key_aqui"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {authType === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="authUsername"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-300">Usuário</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="usuario"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="authPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-300">Senha</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="senha"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {authType === 'custom' && (
                        <FormField
                          control={form.control}
                          name="customHeaders"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Headers Customizados (JSON)</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white font-mono"
                                  placeholder={`{
  "X-API-Key": "sua_chave",
  "Authorization": "Custom token"
}`}
                                  rows={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Endpoints da API</CardTitle>
                      <CardDescription>
                        Configure os endpoints para diferentes tipos de dados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="conversionsEndpoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Endpoint de Conversões</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="/api/conversions"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="affiliateStatsEndpoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Endpoint de Estatísticas</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="/api/affiliate/stats"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="commissionsEndpoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Endpoint de Comissões</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="/api/commissions"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Mapeamento de Dados</CardTitle>
                      <CardDescription>
                        Configure como os dados da API são interpretados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="subidField"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Campo do SubID</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="subid"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="amountField"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Campo do Valor</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="amount"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="eventField"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Campo do Evento</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="event_type"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="syncSchedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">Frequência de Sincronização</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="realtime">Tempo Real</SelectItem>
                                <SelectItem value="hourly">A cada Hora</SelectItem>
                                <SelectItem value="daily">Diariamente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Teste de Conexão */}
                  {house?.id && (
                    <Card className="bg-slate-700 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TestTube className="w-5 h-5" />
                          Teste de Conexão
                        </CardTitle>
                        <CardDescription>
                          Verifique se a configuração da API está funcionando
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          type="button"
                          onClick={handleTestConnection}
                          disabled={isTestingConnection}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isTestingConnection ? (
                            <>
                              <Sync className="w-4 h-4 mr-2 animate-spin" />
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
                            {testResult.data && (
                              <div className="mt-2 text-xs text-slate-400">
                                <p>Status: {testResult.data.status}</p>
                                <p>Tamanho da resposta: {testResult.data.responseSize} bytes</p>
                                <p>Contém dados: {testResult.data.hasData ? 'Sim' : 'Não'}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">
                      Configuração de API Indisponível
                    </h3>
                    <p className="text-slate-400">
                      Selecione "API (Consulta Ativa)" na aba Integração para configurar a API
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="bg-slate-600" />

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
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
                  <Sync className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                house ? "Atualizar Casa" : "Criar Casa"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}