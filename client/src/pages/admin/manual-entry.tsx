import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Plus, 
  DollarSign, 
  CreditCard, 
  Search, 
  Filter,
  Download,
  Clock,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  Calculator,
  Calendar,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  manualConversionFormSchema, 
  commissionAdjustmentFormSchema, 
  manualPaymentFormSchema,
  type ManualConversionForm,
  type CommissionAdjustmentForm,
  type ManualPaymentForm 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AffiliateOption {
  id: number;
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
}

interface BettingHouse {
  id: number;
  name: string;
  commissionType: string;
  commissionValue: string;
  isActive: boolean;
}

interface CommissionPreview {
  amount: number;
  commission: number;
  type: string;
  houseId: number;
}

export default function ManualEntryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("conversion");
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [showCommissionPreview, setShowCommissionPreview] = useState(false);

  // Fetch betting houses
  const { data: bettingHouses = [] } = useQuery<BettingHouse[]>({
    queryKey: ["/api/admin/houses"],
    queryFn: () => apiRequest("/api/admin/houses").then(res => res.houses || []),
  });

  // Search affiliates
  const { data: affiliatesData } = useQuery({
    queryKey: ["/api/admin/manual/affiliates/search", affiliateSearch],
    queryFn: () => apiRequest(`/api/admin/manual/affiliates/search?search=${encodeURIComponent(affiliateSearch)}&limit=10`),
    enabled: affiliateSearch.length >= 2,
  });

  const affiliates: AffiliateOption[] = affiliatesData?.affiliates || [];

  // Commission preview
  const commissionPreviewMutation = useMutation({
    mutationFn: (data: { houseId: number; amount: string; type: string }) =>
      apiRequest("/api/admin/manual/commission-preview", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });

  // Manual conversion form
  const conversionForm = useForm<ManualConversionForm>({
    resolver: zodResolver(manualConversionFormSchema),
    defaultValues: {
      affiliateId: 0,
      houseId: 0,
      type: "register",
      amount: "",
      customerId: "",
      reason: "",
      timestamp: "",
    },
  });

  // Commission adjustment form
  const adjustmentForm = useForm<CommissionAdjustmentForm>({
    resolver: zodResolver(commissionAdjustmentFormSchema),
    defaultValues: {
      affiliateId: 0,
      type: "bonus",
      amount: "",
      reason: "",
      referenceId: undefined,
    },
  });

  // Manual payment form
  const paymentForm = useForm<ManualPaymentForm>({
    resolver: zodResolver(manualPaymentFormSchema),
    defaultValues: {
      affiliateId: 0,
      amount: "",
      method: "pix",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  // Create conversion mutation
  const createConversionMutation = useMutation({
    mutationFn: (data: ManualConversionForm) =>
      apiRequest("/api/admin/manual/conversion", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      toast({
        title: "Conversão registrada",
        description: `Conversão criada com comissão de R$ ${data.calculatedCommission?.toFixed(2)}`,
      });
      conversionForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/conversions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conversão",
        description: error.error || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  // Create adjustment mutation
  const createAdjustmentMutation = useMutation({
    mutationFn: (data: CommissionAdjustmentForm) =>
      apiRequest("/api/admin/manual/commission-adjustment", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Ajuste aplicado",
        description: "Ajuste de comissão aplicado com sucesso",
      });
      adjustmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/conversions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aplicar ajuste",
        description: error.error || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (data: ManualPaymentForm) =>
      apiRequest("/api/admin/manual/payment", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Pagamento registrado",
        description: "Pagamento manual registrado com sucesso",
      });
      paymentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.error || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  // Preview commission calculation
  const handlePreviewCommission = async () => {
    const values = conversionForm.getValues();
    if (values.houseId && values.amount && values.type) {
      try {
        const preview = await commissionPreviewMutation.mutateAsync({
          houseId: values.houseId,
          amount: values.amount,
          type: values.type,
        });
        setShowCommissionPreview(true);
      } catch (error) {
        toast({
          title: "Erro ao calcular comissão",
          description: "Não foi possível calcular a prévia da comissão",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Sistema de Inserção Manual
          </h1>
          <p className="text-slate-400 text-lg">
            Registre conversões, ajustes de comissão e pagamentos manualmente
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Conversões Hoje
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-400">
                +0% em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Ajustes Aplicados
              </CardTitle>
              <Calculator className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-400">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Pagamentos Registrados
              </CardTitle>
              <CreditCard className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-400">
                Este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="conversion" className="data-[state=active]:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Conversão
            </TabsTrigger>
            <TabsTrigger value="adjustment" className="data-[state=active]:bg-blue-600">
              <Calculator className="w-4 h-4 mr-2" />
              Ajuste Comissão
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-purple-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Registro Pagamento
            </TabsTrigger>
          </TabsList>

          {/* Conversion Tab */}
          <TabsContent value="conversion">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Registrar Nova Conversão
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Use este formulário quando uma conversão não foi registrada automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...conversionForm}>
                  <form
                    onSubmit={conversionForm.handleSubmit((data) => createConversionMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Affiliate Selection */}
                      <FormField
                        control={conversionForm.control}
                        name="affiliateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Afiliado</FormLabel>
                            <div className="space-y-2">
                              <Input
                                placeholder="Digite o nome ou email do afiliado..."
                                value={affiliateSearch}
                                onChange={(e) => setAffiliateSearch(e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white"
                              />
                              {affiliates.length > 0 && (
                                <Select
                                  value={field.value?.toString()}
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                >
                                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Selecione o afiliado" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-slate-700">
                                    {affiliates.map((affiliate) => (
                                      <SelectItem key={affiliate.id} value={affiliate.id.toString()}>
                                        <div className="flex items-center gap-2">
                                          <User className="w-4 h-4" />
                                          <div>
                                            <div className="font-medium">{affiliate.fullName}</div>
                                            <div className="text-sm text-slate-400">{affiliate.email}</div>
                                          </div>
                                          {!affiliate.isActive && (
                                            <Badge variant="destructive" className="ml-2">Inativo</Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* House Selection */}
                      <FormField
                        control={conversionForm.control}
                        name="houseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Casa de Apostas</FormLabel>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Selecione a casa" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                {bettingHouses.map((house) => (
                                  <SelectItem key={house.id} value={house.id.toString()}>
                                    <div className="flex items-center gap-2">
                                      <Building className="w-4 h-4" />
                                      <div>
                                        <div className="font-medium">{house.name}</div>
                                        <div className="text-sm text-slate-400">
                                          {house.commissionType} - {house.commissionValue}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Conversion Type */}
                      <FormField
                        control={conversionForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Tipo de Conversão</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="register">Registro</SelectItem>
                                <SelectItem value="deposit">Depósito</SelectItem>
                                <SelectItem value="profit">Lucro</SelectItem>
                                <SelectItem value="chargeback">Chargeback</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Amount */}
                      <FormField
                        control={conversionForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Valor (R$)</FormLabel>
                            <div className="relative">
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-slate-700/50 border-slate-600 text-white pl-8"
                              />
                              <DollarSign className="absolute left-2 top-3 h-4 w-4 text-slate-400" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Customer ID */}
                      <FormField
                        control={conversionForm.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">ID do Cliente (Opcional)</FormLabel>
                            <Input
                              {...field}
                              placeholder="ID do cliente na casa de apostas"
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Timestamp */}
                      <FormField
                        control={conversionForm.control}
                        name="timestamp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Data/Hora (Opcional)</FormLabel>
                            <Input
                              {...field}
                              type="datetime-local"
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Reason */}
                    <FormField
                      control={conversionForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Justificativa</FormLabel>
                          <Textarea
                            {...field}
                            placeholder="Descreva o motivo da inserção manual desta conversão..."
                            className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Commission Preview */}
                    {commissionPreviewMutation.data && showCommissionPreview && (
                      <Card className="bg-emerald-900/20 border-emerald-700">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Prévia da Comissão
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Valor da Conversão:</span>
                              <div className="text-white font-medium">
                                R$ {commissionPreviewMutation.data.amount?.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400">Comissão Calculada:</span>
                              <div className="text-emerald-400 font-medium text-lg">
                                R$ {commissionPreviewMutation.data.commission?.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreviewCommission}
                        disabled={commissionPreviewMutation.isPending}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calcular Comissão
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={createConversionMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {createConversionMutation.isPending ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registrar Conversão
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Adjustment Tab */}
          <TabsContent value="adjustment">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  Ajuste de Comissão
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Aplique bônus, correções ou penalidades nas comissões dos afiliados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...adjustmentForm}>
                  <form
                    onSubmit={adjustmentForm.handleSubmit((data) => createAdjustmentMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Affiliate Selection */}
                      <FormField
                        control={adjustmentForm.control}
                        name="affiliateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Afiliado</FormLabel>
                            <div className="space-y-2">
                              <Input
                                placeholder="Digite o nome ou email do afiliado..."
                                value={affiliateSearch}
                                onChange={(e) => setAffiliateSearch(e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white"
                              />
                              {affiliates.length > 0 && (
                                <Select
                                  value={field.value?.toString()}
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                >
                                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Selecione o afiliado" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-slate-700">
                                    {affiliates.map((affiliate) => (
                                      <SelectItem key={affiliate.id} value={affiliate.id.toString()}>
                                        <div className="flex items-center gap-2">
                                          <User className="w-4 h-4" />
                                          <div>
                                            <div className="font-medium">{affiliate.fullName}</div>
                                            <div className="text-sm text-slate-400">{affiliate.email}</div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Adjustment Type */}
                      <FormField
                        control={adjustmentForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Tipo de Ajuste</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="bonus">Bônus</SelectItem>
                                <SelectItem value="correction">Correção</SelectItem>
                                <SelectItem value="penalty">Penalidade</SelectItem>
                                <SelectItem value="special">Especial</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Amount */}
                      <FormField
                        control={adjustmentForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Valor do Ajuste (R$)</FormLabel>
                            <div className="relative">
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-slate-700/50 border-slate-600 text-white pl-8"
                              />
                              <DollarSign className="absolute left-2 top-3 h-4 w-4 text-slate-400" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reference ID */}
                      <FormField
                        control={adjustmentForm.control}
                        name="referenceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">ID de Referência (Opcional)</FormLabel>
                            <Input
                              {...field}
                              type="number"
                              placeholder="ID da conversão relacionada"
                              className="bg-slate-700/50 border-slate-600 text-white"
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Reason */}
                    <FormField
                      control={adjustmentForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Justificativa Detalhada</FormLabel>
                          <Textarea
                            {...field}
                            placeholder="Descreva detalhadamente o motivo do ajuste de comissão..."
                            className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={createAdjustmentMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createAdjustmentMutation.isPending ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Aplicando Ajuste...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aplicar Ajuste
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Registration Tab */}
          <TabsContent value="payment">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  Registrar Pagamento Manual
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Registre pagamentos feitos externamente ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form
                    onSubmit={paymentForm.handleSubmit((data) => createPaymentMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Affiliate Selection */}
                      <FormField
                        control={paymentForm.control}
                        name="affiliateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Afiliado</FormLabel>
                            <div className="space-y-2">
                              <Input
                                placeholder="Digite o nome ou email do afiliado..."
                                value={affiliateSearch}
                                onChange={(e) => setAffiliateSearch(e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white"
                              />
                              {affiliates.length > 0 && (
                                <Select
                                  value={field.value?.toString()}
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                >
                                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Selecione o afiliado" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-slate-700">
                                    {affiliates.map((affiliate) => (
                                      <SelectItem key={affiliate.id} value={affiliate.id.toString()}>
                                        <div className="flex items-center gap-2">
                                          <User className="w-4 h-4" />
                                          <div>
                                            <div className="font-medium">{affiliate.fullName}</div>
                                            <div className="text-sm text-slate-400">{affiliate.email}</div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Amount */}
                      <FormField
                        control={paymentForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Valor Pago (R$)</FormLabel>
                            <div className="relative">
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-slate-700/50 border-slate-600 text-white pl-8"
                              />
                              <DollarSign className="absolute left-2 top-3 h-4 w-4 text-slate-400" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Method */}
                      <FormField
                        control={paymentForm.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Método de Pagamento</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="pix">PIX</SelectItem>
                                <SelectItem value="transfer">Transferência Bancária</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Date */}
                      <FormField
                        control={paymentForm.control}
                        name="paymentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Data do Pagamento</FormLabel>
                            <Input
                              {...field}
                              type="date"
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Notes */}
                    <FormField
                      control={paymentForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Observações (Opcional)</FormLabel>
                          <Textarea
                            {...field}
                            placeholder="Informações adicionais sobre o pagamento..."
                            className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={createPaymentMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {createPaymentMutation.isPending ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Registrando Pagamento...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Registrar Pagamento
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}