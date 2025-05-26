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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, Plus, Edit, Trash2, Users, TrendingUp, DollarSign, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBettingHouseSchema, type InsertBettingHouse } from "@shared/schema";

function generatePostbackPreview(houseName: string, primaryParam: string) {
  const houseNameLower = houseName.toLowerCase().replace(/\s+/g, '');
  return {
    click: `/api/postback/click?house=${houseNameLower}&subid={subid}&customer_id={customer_id}`,
    registration: `/api/postback/registration?house=${houseNameLower}&subid={subid}&customer_id={customer_id}`,
    deposit: `/api/postback/deposit?house=${houseNameLower}&subid={subid}&amount={amount}&customer_id={customer_id}`,
    'recurring-deposit': `/api/postback/recurring-deposit?house=${houseNameLower}&subid={subid}&amount={amount}&customer_id={customer_id}`,
    profit: `/api/postback/profit?house=${houseNameLower}&subid={subid}&amount={amount}&customer_id={customer_id}`
  };
}

export default function AdminHousesManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: houses, isLoading } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
    staleTime: 0, // Forçar atualização dos dados
    cacheTime: 0, // Não usar cache
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
      const response = await apiRequest("POST", "/api/admin/betting-houses", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Casa de apostas criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
      setIsAddModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar casa de apostas",
        variant: "destructive",
      });
    },
  });

  const updateHouseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBettingHouse> }) => {
      const response = await apiRequest("PUT", `/api/admin/betting-houses/${id}`, data);
      return response.json();
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
      const response = await apiRequest("DELETE", `/api/admin/betting-houses/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao remover casa de apostas");
      }
      return response.json();
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
        title: "Não é possível excluir",
        description: error.message || "Falha ao remover casa de apostas",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBettingHouse) => {
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
                    onValueChange={(value) => form.setValue("commissionType", value as "revshare" | "cpa")}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="revshare">RevShare (%)</SelectItem>
                      <SelectItem value="cpa">CPA (Valor Fixo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionValue" className="text-slate-300">
                    Valor da Comissão <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    {...form.register("commissionValue")}
                    placeholder="35% ou R$ 150"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                  />
                  {form.formState.errors.commissionValue && (
                    <p className="text-red-400 text-sm">{form.formState.errors.commissionValue.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethods" className="text-slate-300">Métodos de Pagamento</Label>
                <Input
                  {...form.register("paymentMethods")}
                  placeholder="PIX, TED, Crypto..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                />
              </div>

              {/* Preview das Rotas de Postback */}
              {form.watch("name") && form.watch("primaryParam") && (
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Preview das Rotas de Postback</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-emerald-400 font-semibold">Click:</span>
                      <span className="text-slate-300 font-mono ml-2 break-all text-xs">
                        /api/postback/click?house={form.watch("name").toLowerCase()}&subid={`{subid}`}&customer_id={`{customer_id}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">Registration:</span>
                      <span className="text-slate-300 font-mono ml-2 break-all text-xs">
                        /api/postback/registration?house={form.watch("name").toLowerCase()}&subid={`{subid}`}&customer_id={`{customer_id}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">Deposit:</span>
                      <span className="text-slate-300 font-mono ml-2 break-all text-xs">
                        /api/postback/deposit?house={form.watch("name").toLowerCase()}&subid={`{subid}`}&amount={`{amount}`}&customer_id={`{customer_id}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">Recurring Deposit:</span>
                      <span className="text-slate-300 font-mono ml-2 break-all text-xs">
                        /api/postback/recurring-deposit?house={form.watch("name").toLowerCase()}&subid={`{subid}`}&amount={`{amount}`}&customer_id={`{customer_id}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">Profit:</span>
                      <span className="text-slate-300 font-mono ml-2 break-all text-xs">
                        /api/postback/profit?house={form.watch("name").toLowerCase()}&subid={`{subid}`}&amount={`{amount}`}&customer_id={`{customer_id}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
          houses.map((house: any) => (
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
                        {house.isActive ? "Ativa" : "Inativa"} desde {new Date(house.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                        {house.commissionType === "revshare" ? "RS" : "CPA"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Volume</div>
                        <div className="text-2xl font-bold text-yellow-500">
                          R$ {house.stats?.totalVolume?.toFixed(0) || "0"}
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
                            onClick={() => navigator.clipboard.writeText(window.location.origin + `/api/postback/click?house=${house.name.toLowerCase()}&subid={subid}&customer_id={customer_id}`)}
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
                            onClick={() => navigator.clipboard.writeText(window.location.origin + `/api/postback/registration?house=${house.name.toLowerCase()}&subid={subid}&customer_id={customer_id}`)}
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
                            onClick={() => navigator.clipboard.writeText(window.location.origin + `/api/postback/deposit?house=${house.name.toLowerCase()}&subid={subid}&amount={amount}&customer_id={customer_id}`)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Recurring Deposit:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 text-xs">Ativo</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(window.location.origin + `/api/postback/recurring-deposit?house=${house.name.toLowerCase()}&subid={subid}&amount={amount}&customer_id={customer_id}`)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Profit:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 text-xs">Ativo</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(window.location.origin + `/api/postback/profit?house=${house.name.toLowerCase()}&subid={subid}&amount={amount}&customer_id={customer_id}`)}
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
    </div>
  );
}
