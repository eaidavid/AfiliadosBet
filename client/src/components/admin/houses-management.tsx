import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, Plus, Edit, Trash2, Users, TrendingUp, DollarSign, ExternalLink, Copy, CheckCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBettingHouseSchema, type InsertBettingHouse, type BettingHouse } from "@shared/schema";
import { useLocation } from "wouter";
import SimplePostbackConfig from "./simple-postback-config";

interface BettingHouseWithStats extends BettingHouse {
  stats?: {
    affiliateCount: number;
    totalVolume: number;
  };
}

// Postback URLs component removed - configuration handled in code

interface AdminHousesManagementProps {
  onPageChange?: (page: string) => void;
}

export default function AdminHousesManagement({ onPageChange }: AdminHousesManagementProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<any>(null);
  const [isPostbackModalOpen, setIsPostbackModalOpen] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: houses, isLoading } = useQuery<BettingHouseWithStats[]>({
    queryKey: ["/api/admin/betting-houses"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const form = useForm<InsertBettingHouse>({
    resolver: zodResolver(insertBettingHouseSchema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      baseUrl: "",
      primaryParam: "subid",
      additionalParams: null,
      commissionType: "RevShare",
      commissionValue: "30",
      minDeposit: "100",
      paymentMethods: "Pix",
      isActive: true,
    },
  });

  const createHouseMutation = useMutation({
    mutationFn: async (data: InsertBettingHouse) => {
      return await apiRequest("/api/admin/betting-houses", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (data) => {
      console.log("Casa criada com sucesso:", data);
      toast({
        title: "Sucesso!",
        description: "Casa de apostas criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
      setIsAddModalOpen(false);
      form.reset();
      // Postback events configuration removed
    },
    onError: (error: any) => {
      console.error("Erro ao criar casa:", error);
      toast({
        title: "Erro ao criar casa",
        description: error.message || "Falha ao criar casa de apostas. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateHouseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBettingHouse> }) => {
      return await apiRequest(`/api/admin/betting-houses/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Casa de apostas atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
      setEditingHouse(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar casa de apostas",
        variant: "destructive",
      });
    },
  });

  const deleteHouseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/admin/betting-houses/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Casa de apostas removida com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar casa",
        description: error.message || "Falha ao remover casa de apostas",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBettingHouse) => {
    // Generate identifier if creating new house
    if (!editingHouse) {
      const identifier = data.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now();
      data.identifier = identifier;
      // Postback configuration removed - will be handled in code
    }
    
    if (editingHouse) {
      updateHouseMutation.mutate({ id: editingHouse.id, data });
    } else {
      createHouseMutation.mutate(data);
    }
  };

  const handleEdit = (house: any) => {
    setEditingHouse(house);
    setIsAddModalOpen(true);
    form.reset({
      name: house.name,
      description: house.description || "",
      logoUrl: house.logoUrl || "",
      baseUrl: house.baseUrl,
      primaryParam: house.primaryParam,
      additionalParams: house.additionalParams,
      commissionType: house.commissionType,
      commissionValue: house.commissionValue,
      minDeposit: house.minDeposit || "",
      paymentMethods: house.paymentMethods || "",
      isActive: house.isActive,
    });
  };

  const generatePostbackPreview = (houseName: string, primaryParam: string) => {
    const houseSlug = houseName.toLowerCase().replace(/\s+/g, '');
    return {
      registration: `/api/postback/registration?house=${houseSlug}&${primaryParam}={${primaryParam}}`,
      deposit: `/api/postback/deposit?house=${houseSlug}&${primaryParam}={${primaryParam}}&amount={amount}`,
      profit: `/api/postback/profit?house=${houseSlug}&${primaryParam}={${primaryParam}}&amount={amount}`,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-slate-400">Carregando casas de apostas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Casas de Apostas</h1>
          <p className="text-slate-400">Gerencie as casas cadastradas na plataforma</p>
        </div>
        
        <Dialog open={isAddModalOpen || !!editingHouse} onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingHouse(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Casa
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingHouse ? "Editar Casa de Apostas" : "Adicionar Casa de Apostas"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingHouse ? "Atualize as informações da casa de apostas." : "Configure uma nova casa na plataforma."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Nome da Casa <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    {...form.register("name")}
                    placeholder="Ex: Bet365"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl" className="text-slate-300">URL do Logo</Label>
                  <Input
                    {...form.register("logoUrl")}
                    placeholder="https://..."
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Descrição</Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Descrição da casa de apostas..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUrl" className="text-slate-300">
                  Link Base <span className="text-red-400">*</span>
                </Label>
                <Input
                  {...form.register("baseUrl")}
                  placeholder="https://casa.com/?subid=VALUE"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-400">Use VALUE onde será inserido o SubID do afiliado</p>
                {form.formState.errors.baseUrl && (
                  <p className="text-red-400 text-sm">{form.formState.errors.baseUrl.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryParam" className="text-slate-300">
                    Parâmetro Principal <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    {...form.register("primaryParam")}
                    placeholder="subid, affid, ref..."
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                  />
                  {form.formState.errors.primaryParam && (
                    <p className="text-red-400 text-sm">{form.formState.errors.primaryParam.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minDeposit" className="text-slate-300">Depósito Mínimo</Label>
                  <Input
                    {...form.register("minDeposit")}
                    placeholder="R$ 20"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionType" className="text-slate-300">
                    Tipo de Comissão <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={form.watch("commissionType")}
                    onValueChange={(value) => form.setValue("commissionType", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="RevShare">RevShare (%)</SelectItem>
                      <SelectItem value="CPA">CPA (Valor Fixo)</SelectItem>
                      <SelectItem value="Hybrid">Hybrid (CPA + RevShare)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.watch("commissionType") === "Hybrid" ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                      <h4 className="text-emerald-400 font-medium mb-3">Configuração Híbrida</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">
                            Valor CPA (Registration) <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            {...form.register("cpaValue")}
                            placeholder="R$ 50.00"
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                          />
                          <p className="text-xs text-slate-400">Valor fixo pago por registro</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">
                            RevShare (Deposits/Profit) <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            {...form.register("revshareValue")}
                            placeholder="5.0"
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                          />
                          <p className="text-xs text-slate-400">Porcentagem sobre depósitos/lucros</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="commissionValue" className="text-slate-300">
                      Valor da Comissão <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...form.register("commissionValue")}
                      placeholder={form.watch("commissionType") === "RevShare" ? "35.0" : "150.00"}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                    />
                    <p className="text-xs text-slate-400">
                      {form.watch("commissionType") === "RevShare" 
                        ? "Porcentagem sobre depósitos/lucros" 
                        : "Valor fixo em reais por ação"}
                    </p>
                    {form.formState.errors.commissionValue && (
                      <p className="text-red-400 text-sm">{form.formState.errors.commissionValue.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethods" className="text-slate-300">Métodos de Pagamento</Label>
                <Input
                  {...form.register("paymentMethods")}
                  placeholder="PIX, TED, Crypto..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                />
              </div>

              {/* Configuração de Mapeamento de Parâmetros */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Mapeamento de Parâmetros</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Configure como os parâmetros da casa serão mapeados para o sistema padrão
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">SubID da Casa</Label>
                    <Input
                      placeholder="subid, click_id, aff_id..."
                      defaultValue="subid"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                      onChange={(e) => {
                        const currentMapping = form.watch("parameterMapping") || {};
                        form.setValue("parameterMapping", {
                          ...currentMapping,
                          subid: e.target.value || "subid"
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Valor/Amount da Casa</Label>
                    <Input
                      placeholder="amount, valor, val..."
                      defaultValue="amount"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                      onChange={(e) => {
                        const currentMapping = form.watch("parameterMapping") || {};
                        form.setValue("parameterMapping", {
                          ...currentMapping,
                          amount: e.target.value || "amount"
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Customer ID da Casa</Label>
                    <Input
                      placeholder="customer_id, user_id..."
                      defaultValue="customer_id"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                      onChange={(e) => {
                        const currentMapping = form.watch("parameterMapping") || {};
                        form.setValue("parameterMapping", {
                          ...currentMapping,
                          customer_id: e.target.value || "customer_id"
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Configuração de Postback */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Configuração de Postback</h4>
                <p className="text-slate-400 text-sm">
                  As configurações de postback são gerenciadas automaticamente no código do sistema. 
                  Todas as casas são configuradas para receber registros, depósitos e conversões.
                </p>
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="text-emerald-400 text-sm font-medium">Eventos Automáticos:</div>
                  <div className="text-emerald-300 text-xs mt-1">
                    Registro • Primeiro Depósito • Depósitos • Lucros
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingHouse(null);
                    form.reset();
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createHouseMutation.isPending || updateHouseMutation.isPending}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
                >
                  {createHouseMutation.isPending || updateHouseMutation.isPending
                    ? "Salvando..."
                    : editingHouse
                    ? "Atualizar Casa"
                    : "Criar Casa"
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Houses List */}
      <div className="space-y-6">
        {houses && houses.length > 0 ? (
          houses.map((house) => (
            <Card key={house.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      {house.logoUrl ? (
                        <img src={house.logoUrl} alt={house.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <Building className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{house.name}</h3>
                      <p className="text-slate-400">
                        {house.isActive ? "Ativa" : "Inativa"} desde {house.createdAt ? new Date(house.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedHouseId(house.id);
                        setIsPostbackModalOpen(true);
                      }}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20"
                      title="Configurar Postbacks"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Postbacks
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEdit(house)}
                      className="bg-slate-700 hover:bg-slate-600 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteHouseMutation.mutate(house.id)}
                      disabled={deleteHouseMutation.isPending}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Afiliados</div>
                        <div className="text-2xl font-bold text-white">{house.stats?.affiliateCount || 0}</div>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Comissão</div>
                        <div className="text-2xl font-bold text-emerald-500">{house.commissionValue}</div>
                      </div>
                      <div className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                        {house.commissionType || "CPA"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Volume</div>
                        <div className="text-2xl font-bold text-yellow-500">
                          R$ {Number(house.stats?.totalVolume || 0).toFixed(0)}
                        </div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Status</div>
                        <Badge className={house.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                          {house.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Configurações</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Link Base:</span>
                        <span className="text-white font-mono text-xs break-all max-w-xs">
                          {house.baseUrl}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parâmetro Principal:</span>
                        <span className="text-emerald-400">{house.primaryParam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Depósito Mínimo:</span>
                        <span className="text-white">{house.minDeposit || "Não especificado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Métodos de Pagamento:</span>
                        <span className="text-white">{house.paymentMethods || "Não especificado"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Postbacks</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Click:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 text-xs">Ativo</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/postback/click?token=${house.securityToken}&subid={username}&customer_id={customer_id}`)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Registration:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 text-xs">Ativo</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/postback/register?token=${house.securityToken}&subid={username}&customer_id={customer_id}`)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Deposit:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 text-xs">Ativo</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/postback/deposit?token=${house.securityToken}&subid={username}&customer_id={customer_id}&value={amount}`)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Revenue:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 text-xs">Ativo</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/postback/revenue?token=${house.securityToken}&subid={username}&customer_id={customer_id}&value={amount}`)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {house.description && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-slate-300 text-sm">{house.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma casa cadastrada</h3>
              <p className="text-slate-400 mb-6">
                Comece adicionando sua primeira casa de apostas à plataforma.
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Casa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Postback Configuration Modal */}
      {selectedHouseId && isPostbackModalOpen && houses && (
        <SimplePostbackConfig
          house={houses.find(h => h.id === selectedHouseId)}
          onClose={() => {
            setIsPostbackModalOpen(false);
            setSelectedHouseId(null);
          }}
        />
      )}
    </div>
  );
}
