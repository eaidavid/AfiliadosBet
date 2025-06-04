import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Building2, 
  ExternalLink, 
  Eye, 
  Users, 
  Search,
  Filter,
  Webhook,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Copy,
  TestTube,
  Link as LinkIcon,
  TrendingUp,
  Activity,
  Settings,
  CheckCircle2,
  XCircle,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/admin/sidebar";

// Enhanced schema for complete betting house management
const bettingHouseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  baseUrl: z.string().url("URL inválida"),
  primaryParam: z.string().min(1, "Parâmetro primário é obrigatório"),
  additionalParams: z.string().optional(),
  commissionType: z.enum(["CPA", "RevShare", "CPA+RevShare"], {
    required_error: "Tipo de comissão é obrigatório"
  }),
  cpaValue: z.union([z.number(), z.string().transform((val) => val === "" ? undefined : Number(val))]).optional(),
  revshareValue: z.union([z.number(), z.string().transform((val) => val === "" ? undefined : Number(val))]).optional(),
  minDeposit: z.union([z.number(), z.string().transform((val) => val === "" ? undefined : Number(val))]).optional(),
  paymentMethods: z.string().optional(),
  securityToken: z.string().optional(),
  identifier: z.string().min(1, "Identificador único é obrigatório"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean(),
  enabledPostbacks: z.array(z.string()).optional(),
  parameterMapping: z.string().optional(),
});

type BettingHouseFormData = z.infer<typeof bettingHouseSchema>;

interface BettingHouse {
  id: number;
  name: string;
  description?: string;
  baseUrl: string;
  primaryParam?: string;
  additionalParams?: string;
  commissionType?: string;
  cpaValue?: number;
  revshareValue?: number;
  minDeposit?: number;
  paymentMethods?: string;
  securityToken?: string;
  identifier?: string;
  logoUrl?: string;
  isActive: boolean;
  enabledPostbacks?: string[];
  parameterMapping?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    affiliateLinks: number;
    conversions: number;
  };
}

export default function AdminBettingHouses() {
  const [editingHouse, setEditingHouse] = useState<BettingHouse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingHouse, setViewingHouse] = useState<BettingHouse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPostbackDialogOpen, setIsPostbackDialogOpen] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [commissionFilter, setCommissionFilter] = useState("all");
  const [postbackFilter, setPostbackFilter] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BettingHouseFormData>({
    resolver: zodResolver(bettingHouseSchema),
    defaultValues: {
      name: "",
      description: "",
      baseUrl: "",
      primaryParam: "subid",
      additionalParams: "",
      commissionType: "CPA",
      cpaValue: 0,
      revshareValue: 0,
      minDeposit: 0,
      paymentMethods: "",
      securityToken: "",
      identifier: "",
      logoUrl: "",
      isActive: true,
      enabledPostbacks: [],
      parameterMapping: "",
    },
  });

  // Query para buscar casas
  const { data: houses = [], isLoading, error } = useQuery<BettingHouse[]>({
    queryKey: ["/api/admin/betting-houses"],
    refetchInterval: 30000,
  });

  // Add error handling for data loading
  if (error) {
    console.error("Error loading betting houses:", error);
  }

  // Filtering logic
  const filteredHouses = (houses || []).filter((house) => {
    if (!house) return false;
    
    const matchesSearch = house.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && house.isActive) ||
      (statusFilter === "inactive" && !house.isActive);
    
    const matchesCommission = commissionFilter === "all" ||
      (commissionFilter === "cpa" && house.commissionType?.includes("CPA")) ||
      (commissionFilter === "revshare" && house.commissionType?.includes("RevShare")) ||
      (commissionFilter === "both" && house.commissionType === "CPA+RevShare");
    
    const matchesPostback = postbackFilter === "all" ||
      (postbackFilter === "configured" && house.enabledPostbacks && Array.isArray(house.enabledPostbacks) && house.enabledPostbacks.length > 0) ||
      (postbackFilter === "not-configured" && (!house.enabledPostbacks || !Array.isArray(house.enabledPostbacks) || house.enabledPostbacks.length === 0));
    
    return matchesSearch && matchesStatus && matchesCommission && matchesPostback;
  });

  // Mutations
  const createHouseMutation = useMutation({
    mutationFn: async (data: BettingHouseFormData) => {
      const response = await fetch("/api/admin/betting-houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar casa");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Casa criada com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Erro ao criar casa", description: error.message, variant: "destructive" });
    },
  });

  const updateHouseMutation = useMutation({
    mutationFn: async (data: BettingHouseFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/admin/betting-houses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Erro ao atualizar casa");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Casa atualizada com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
      setIsDialogOpen(false);
      setEditingHouse(null);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar casa", description: error.message, variant: "destructive" });
    },
  });

  const deleteHouseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/betting-houses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar casa");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Casa deletada com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao deletar casa", description: error.message, variant: "destructive" });
    },
  });

  const toggleHouseStatus = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/betting-houses/${id}/toggle`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Erro ao alterar status da casa");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Status alterado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" });
    },
  });

  // Action handlers
  const handleView = (house: BettingHouse) => {
    setViewingHouse(house);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (house: BettingHouse) => {
    setEditingHouse(house);
    form.reset({
      name: house.name,
      description: house.description || "",
      baseUrl: house.baseUrl,
      primaryParam: house.primaryParam || "subid",
      additionalParams: house.additionalParams || "",
      commissionType: house.commissionType as any || "CPA",
      cpaValue: house.cpaValue || 0,
      revshareValue: house.revshareValue || 0,
      minDeposit: house.minDeposit || 0,
      paymentMethods: house.paymentMethods || "",
      securityToken: house.securityToken || "",
      identifier: house.identifier || "",
      logoUrl: house.logoUrl || "",
      isActive: house.isActive,
      enabledPostbacks: house.enabledPostbacks || [],
      parameterMapping: house.parameterMapping || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta casa?")) {
      deleteHouseMutation.mutate(id);
    }
  };

  const handleCopyLink = (house: BettingHouse) => {
    const link = `${house.baseUrl}?${house.primaryParam}={SUBID}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado para a área de transferência" });
  };

  const handlePostbacks = (houseId: number) => {
    setSelectedHouseId(houseId);
    setIsPostbackDialogOpen(true);
  };

  const onSubmit = (data: BettingHouseFormData) => {
    // Process data to ensure correct types
    const processedData = {
      ...data,
      cpaValue: data.cpaValue ? Number(data.cpaValue) : undefined,
      revshareValue: data.revshareValue ? Number(data.revshareValue) : undefined,
      minDeposit: data.minDeposit ? Number(data.minDeposit) : undefined,
      enabledPostbacks: data.enabledPostbacks || [],
      additionalParams: data.additionalParams || "",
      parameterMapping: data.parameterMapping || ""
    };

    if (editingHouse) {
      updateHouseMutation.mutate({ ...processedData, id: editingHouse.id });
    } else {
      createHouseMutation.mutate(processedData);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <AdminSidebar currentPage="betting-houses" onPageChange={() => {}} />
        <div className="lg:ml-64 transition-all duration-300 ease-in-out min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Carregando casas de apostas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminSidebar currentPage="betting-houses" onPageChange={() => {}} />
      
      <div className="lg:ml-64 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="pt-12 lg:pt-0">
              <h1 className="text-xl lg:text-2xl font-bold text-white">Gerenciamento de Casas de Apostas</h1>
              <p className="text-slate-400 mt-1 text-sm lg:text-base">
                Gerencie suas casas de apostas, comissões e configurações de postback
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 lg:px-6 text-sm lg:text-base w-full lg:w-auto"
                  onClick={() => {
                    setEditingHouse(null);
                    form.reset();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Casa
                </Button>
              </DialogTrigger>
              
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-[95vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 lg:mx-0">
                <DialogHeader>
                  <DialogTitle className="text-xl text-white">
                    {editingHouse ? "Editar Casa de Apostas" : "Nova Casa de Apostas"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">
                          Informações Básicas
                        </h3>
                        
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Nome da Casa *</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Descrição</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="bg-slate-700 border-slate-600 text-white" />
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
                              <FormLabel className="text-slate-300">Identificador Único *</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">URL do Logo</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <FormLabel className="text-slate-300">Casa Ativa</FormLabel>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* URL Configuration */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-400 border-b border-slate-600 pb-2">
                          Configuração de URL
                        </h3>
                        
                        <FormField
                          control={form.control}
                          name="baseUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">URL Base *</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryParam"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Parâmetro Primário *</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="additionalParams"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Parâmetros Adicionais</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="parameterMapping"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Mapeamento de Parâmetros (JSON)</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Commission Configuration */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-yellow-400 border-b border-slate-600 pb-2">
                          Configuração de Comissão
                        </h3>
                        
                        <FormField
                          control={form.control}
                          name="commissionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Tipo de Comissão *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="CPA">CPA (Custo Por Aquisição)</SelectItem>
                                  <SelectItem value="RevShare">RevShare (Divisão de Receita)</SelectItem>
                                  <SelectItem value="CPA+RevShare">CPA + RevShare (Híbrido)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {(form.watch("commissionType") === "CPA" || form.watch("commissionType") === "CPA+RevShare") && (
                          <>
                            <FormField
                              control={form.control}
                              name="cpaValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-300">Valor CPA (R$)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      className="bg-slate-700 border-slate-600 text-white" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="minDeposit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-300">Depósito Mínimo para CPA (R$)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      className="bg-slate-700 border-slate-600 text-white" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {(form.watch("commissionType") === "RevShare" || form.watch("commissionType") === "CPA+RevShare") && (
                          <FormField
                            control={form.control}
                            name="revshareValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-300">Percentual RevShare (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="bg-slate-700 border-slate-600 text-white" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="paymentMethods"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Métodos de Pagamento</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Postback Configuration */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-400 border-b border-slate-600 pb-2">
                          Configuração de Postback
                        </h3>
                        
                        <FormField
                          control={form.control}
                          name="securityToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Token de Segurança</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enabledPostbacks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Postbacks Habilitados</FormLabel>
                              <div className="space-y-2">
                                {["click", "registro", "deposito", "lucro"].map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={type}
                                      checked={field.value?.includes(type) || false}
                                      onChange={(e) => {
                                        const currentValue = field.value || [];
                                        if (e.target.checked) {
                                          field.onChange([...currentValue, type]);
                                        } else {
                                          field.onChange(currentValue.filter((v) => v !== type));
                                        }
                                      }}
                                      className="rounded border-slate-600"
                                    />
                                    <label htmlFor={type} className="text-slate-300 capitalize">
                                      {type}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-slate-600">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createHouseMutation.isPending || updateHouseMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        {editingHouse ? "Atualizar" : "Criar"} Casa
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Enhanced KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Casas Ativas</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.filter(h => h.isActive).length}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        de {houses.length} casas
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-400 text-sm font-medium">Com CPA</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.filter(h => h.commissionType?.includes('CPA')).length}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        com comissão CPA
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400 text-sm font-medium">Com Postback</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.filter(h => h.enabledPostbacks && h.enabledPostbacks.length > 0).length}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        casas com postback
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Webhook className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-400 text-sm font-medium">Total Afiliações</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.reduce((acc, house) => acc + (house._count?.affiliateLinks || 0), 0)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        links ativos
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Advanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome da casa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="active">Ativas</SelectItem>
                        <SelectItem value="inactive">Inativas</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Comissão" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="cpa">Apenas CPA</SelectItem>
                        <SelectItem value="revshare">Apenas RevShare</SelectItem>
                        <SelectItem value="both">CPA + RevShare</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={postbackFilter} onValueChange={setPostbackFilter}>
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Postbacks" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="configured">Configurado</SelectItem>
                        <SelectItem value="not-configured">Não Configurado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Betting Houses Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Lista de Casas de Apostas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Logo</TableHead>
                        <TableHead className="text-slate-300">Nome</TableHead>
                        <TableHead className="text-slate-300">Tipo de Comissão</TableHead>
                        <TableHead className="text-slate-300">Valor Comissão</TableHead>
                        <TableHead className="text-slate-300">Postbacks</TableHead>
                        <TableHead className="text-slate-300">Afiliados</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300 text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                            Carregando casas...
                          </TableCell>
                        </TableRow>
                      ) : filteredHouses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Nenhuma casa encontrada</p>
                            <p className="text-slate-500 text-sm">Tente ajustar os filtros ou adicione uma nova casa</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHouses.map((house) => (
                          <TableRow key={house.id} className="border-slate-700 hover:bg-slate-700/50">
                            <TableCell>
                              {house.logoUrl ? (
                                <img 
                                  src={house.logoUrl} 
                                  alt={house.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-white font-medium">{house.name}</p>
                                {house.description && (
                                  <p className="text-slate-400 text-sm truncate max-w-[200px]">{house.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {house.commissionType === 'CPA' && (
                                  <Badge variant="secondary" className="w-fit bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    CPA
                                  </Badge>
                                )}
                                {house.commissionType === 'RevShare' && (
                                  <Badge variant="secondary" className="w-fit bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    RevShare
                                  </Badge>
                                )}
                                {house.commissionType === 'CPA+RevShare' && (
                                  <div className="flex flex-col gap-1">
                                    <Badge variant="secondary" className="w-fit bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                      CPA
                                    </Badge>
                                    <Badge variant="secondary" className="w-fit bg-blue-500/20 text-blue-400 border-blue-500/30">
                                      RevShare
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 text-sm">
                                {house.cpaValue && (
                                  <span className="text-emerald-400">CPA: R$ {house.cpaValue}</span>
                                )}
                                {house.revshareValue && (
                                  <span className="text-blue-400">Rev: {house.revshareValue}%</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {house.enabledPostbacks && house.enabledPostbacks.length > 0 ? (
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Configurado
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Não Configurado
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-300 font-medium">{house._count?.affiliateLinks || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={house.isActive ? "default" : "secondary"} 
                                     className={house.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                                {house.isActive ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Ativa
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Inativa
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleView(house)}
                                  title="Ver detalhes"
                                  className="h-8 w-8 p-0 hover:bg-slate-600"
                                >
                                  <Eye className="h-4 w-4 text-slate-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(house)}
                                  title="Editar"
                                  className="h-8 w-8 p-0 hover:bg-blue-600"
                                >
                                  <Pencil className="h-4 w-4 text-blue-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleHouseStatus.mutate(house.id)}
                                  disabled={toggleHouseStatus.isPending}
                                  title={house.isActive ? "Desativar" : "Ativar"}
                                  className="h-8 w-8 p-0 hover:bg-yellow-600"
                                >
                                  {house.isActive ? (
                                    <ToggleLeft className="h-4 w-4 text-yellow-400" />
                                  ) : (
                                    <ToggleRight className="h-4 w-4 text-yellow-400" />
                                  )}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCopyLink(house)}
                                  title="Copiar Link de Afiliado"
                                  className="h-8 w-8 p-0 hover:bg-green-600"
                                >
                                  <Copy className="h-4 w-4 text-green-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePostbacks(house.id)}
                                  title="Configurar Postbacks"
                                  className="h-8 w-8 p-0 hover:bg-purple-600"
                                >
                                  <Webhook className="h-4 w-4 text-purple-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDelete(house.id)}
                                  title="Excluir"
                                  className="h-8 w-8 p-0 hover:bg-red-600"
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Detalhes da Casa de Apostas</DialogTitle>
          </DialogHeader>
          {viewingHouse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Nome</Label>
                  <p className="text-white font-medium">{viewingHouse.name}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Identificador</Label>
                  <p className="text-white font-medium">{viewingHouse.identifier}</p>
                </div>
                <div>
                  <Label className="text-slate-300">URL Base</Label>
                  <p className="text-blue-400">{viewingHouse.baseUrl}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Parâmetro Primário</Label>
                  <p className="text-white">{viewingHouse.primaryParam}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Tipo de Comissão</Label>
                  <p className="text-white">{viewingHouse.commissionType}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Status</Label>
                  <Badge variant={viewingHouse.isActive ? "default" : "secondary"}>
                    {viewingHouse.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </div>
              {viewingHouse.description && (
                <div>
                  <Label className="text-slate-300">Descrição</Label>
                  <p className="text-slate-400">{viewingHouse.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Postback Configuration Dialog */}
      <Dialog open={isPostbackDialogOpen} onOpenChange={setIsPostbackDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Configurações de Postback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-400">
              Configurações de postback para a casa selecionada serão implementadas aqui.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsPostbackDialogOpen(false)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}