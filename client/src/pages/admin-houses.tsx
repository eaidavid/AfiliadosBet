import React, { useState, useMemo } from "react";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  Star,
  Bot,
  User,
  CheckCircle,
  Clock,
  Shield
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
  logoUrl?: string;
  isActive: boolean;
  parameterMapping?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    affiliateLinks: number;
    conversions: number;
  };
}

interface Postback {
  id: number;
  houseId: number;
  eventType: string;
  url: string;
  token: string;
  active: boolean;
  isAutomatic: boolean;
  createdAt: string;
  updatedAt?: string;
}

const eventTypeLabels = {
  click: "Clique",
  register: "Registro", 
  deposit: "Depósito",
  revenue: "Receita/Lucro"
} as const;

const eventTypeColors = {
  click: "bg-blue-500",
  register: "bg-green-500",
  deposit: "bg-orange-500", 
  revenue: "bg-purple-500"
} as const;

export default function AdminHouses() {
  const [editingHouse, setEditingHouse] = useState<BettingHouse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingHouse, setViewingHouse] = useState<BettingHouse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [previewPostbacks, setPreviewPostbacks] = useState<Array<{eventType: string; url: string}>>([]);
  const [isPostbackModalOpen, setIsPostbackModalOpen] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [selectedHousePostbacks, setSelectedHousePostbacks] = useState<Postback[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [commissionFilter, setCommissionFilter] = useState("all");
  
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
      parameterMapping: "",
    },
  });

  // Function to generate automatic postback previews
  const generatePostbackPreviews = (securityToken?: string) => {
    if (!securityToken) {
      setPreviewPostbacks([]);
      return;
    }

    const events = ['click', 'register', 'deposit', 'revenue'];
    
    const previews = events.map(eventType => ({
      eventType,
      url: `/postback/${eventType}?token=${securityToken}`
    }));
    
    setPreviewPostbacks(previews);
  };

  // Watch security token field to generate previews
  const watchedToken = form.watch('securityToken');
  
  // Generate previews when token changes
  React.useEffect(() => {
    generatePostbackPreviews(watchedToken);
  }, [watchedToken]);

  // Generate new security token
  const generateSecurityToken = () => {
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    form.setValue('securityToken', token);
    return token;
  };

  // Query para buscar casas
  const { data: housesData, isLoading, error } = useQuery<BettingHouse[]>({
    queryKey: ["/api/admin/betting-houses"],
    refetchInterval: 30000,
  });

  // Add error handling for data loading
  if (error) {
    console.error("Error loading betting houses:", error);
  }

  // Comprehensive safety check to ensure we always have valid data
  const houses = Array.isArray(housesData) ? housesData.filter(h => h && typeof h === 'object' && h.id) : [];
  const safeHouses = houses;

  // Filtering logic with comprehensive null safety
  const filteredHouses = useMemo(() => {
    if (!Array.isArray(safeHouses)) return [];
    
    return safeHouses.filter((house) => {
      // Garantir que house existe e tem as propriedades necessárias
      if (!house || typeof house !== 'object') return false;
      
      // Verificação de busca com proteção completa
      const houseName = house.name || '';
      const searchLower = (searchTerm || '').toLowerCase();
      const matchesSearch = houseName.toLowerCase().includes(searchLower);
      
      // Verificação de status com valores padrão
      const houseStatus = house.isActive === true;
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && houseStatus) ||
        (statusFilter === "inactive" && !houseStatus);
      
      // Verificação de comissão com proteção completa
      const houseCommission = house.commissionType || '';
      const matchesCommission = commissionFilter === "all" ||
        (commissionFilter === "cpa" && houseCommission.includes("CPA")) ||
        (commissionFilter === "revshare" && houseCommission.includes("RevShare")) ||
        (commissionFilter === "both" && houseCommission === "CPA+RevShare");
      
      return matchesSearch && matchesStatus && matchesCommission;
    });
  }, [safeHouses, searchTerm, statusFilter, commissionFilter]);

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
      if (!response.ok) throw new Error("Erro ao alterar status");
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

  // Event handlers
  const handleAdd = () => {
    form.reset();
    setEditingHouse(null);
    generateSecurityToken();
    setIsDialogOpen(true);
  };

  const handleEdit = (house: BettingHouse) => {
    setEditingHouse(house);
    form.reset({
      name: house.name,
      description: house.description || "",
      baseUrl: house.baseUrl,
      primaryParam: house.primaryParam || "subid",
      additionalParams: house.additionalParams || "",
      commissionType: house.commissionType as any,
      cpaValue: house.cpaValue || 0,
      revshareValue: house.revshareValue || 0,
      minDeposit: house.minDeposit || 0,
      paymentMethods: house.paymentMethods || "",
      securityToken: house.securityToken || "",
      identifier: (house as any).identifier || "",
      logoUrl: house.logoUrl || "",
      isActive: house.isActive,
      parameterMapping: house.parameterMapping || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (house: BettingHouse) => {
    setViewingHouse(house);
    setIsViewDialogOpen(true);
  };

  const handleCopyLink = (house: BettingHouse) => {
    const affiliateLink = `${house.baseUrl}?${house.primaryParam}=USER_ID`;
    navigator.clipboard.writeText(affiliateLink);
    toast({ title: "Link copiado!", description: "Link de afiliado copiado para a área de transferência." });
  };

  const handlePostbacks = async (houseId: number) => {
    try {
      const response = await fetch(`/api/admin/postbacks/${houseId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedHousePostbacks(data.postbacks || []);
      }
      setSelectedHouseId(houseId);
      setIsPostbackModalOpen(true);
    } catch (error) {
      toast({ title: "Erro ao carregar postbacks", variant: "destructive" });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta casa?")) {
      deleteHouseMutation.mutate(id);
    }
  };

  const onSubmit = (data: BettingHouseFormData) => {
    if (editingHouse) {
      updateHouseMutation.mutate({ ...data, id: editingHouse.id });
    } else {
      createHouseMutation.mutate(data);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value?: number) => {
    if (!value) return "0%";
    return `${value}%`;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar currentPage="houses" onPageChange={(page) => {
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
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Administração de Casas de Apostas
              </h1>
              <p className="text-slate-400 mt-1">
                Gerencie todas as casas de apostas, postbacks e configurações de comissão
              </p>
            </div>
            
            <Button 
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nova Casa
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total de Casas</p>
                    <p className="text-2xl font-bold text-white">{safeHouses.length}</p>
                    <p className="text-xs text-slate-500 mt-1">casas registradas</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Casas Ativas</p>
                    <p className="text-2xl font-bold text-green-400">{safeHouses.filter(h => h.isActive).length}</p>
                    <p className="text-xs text-slate-500 mt-1">em operação</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Com Postbacks</p>
                    <p className="text-2xl font-bold text-purple-400">{safeHouses.filter(h => h.securityToken).length}</p>
                    <p className="text-xs text-slate-500 mt-1">configuradas</p>
                  </div>
                  <Webhook className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Afiliações</p>
                    <p className="text-2xl font-bold text-orange-400">{safeHouses.reduce((sum, h) => sum + (h._count?.affiliateLinks || 0), 0)}</p>
                    <p className="text-xs text-slate-500 mt-1">links ativos</p>
                  </div>
                  <LinkIcon className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nome da casa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Todos Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="inactive">Inativas</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="cpa">CPA</SelectItem>
                    <SelectItem value="revshare">RevShare</SelectItem>
                    <SelectItem value="both">CPA+RevShare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Houses Table */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Casas de Apostas ({filteredHouses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Casa</TableHead>
                      <TableHead className="text-slate-300">Comissão</TableHead>
                      <TableHead className="text-slate-300">URL Base</TableHead>
                      <TableHead className="text-slate-300">Token</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHouses.map((house) => (
                      <TableRow key={house.id} className="border-slate-700">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {house.logoUrl ? (
                              <img 
                                src={house.logoUrl} 
                                alt={house.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <Building2 className="w-8 h-8 text-slate-400" />
                            )}
                            <div>
                              <div className="font-medium text-white">{house.name}</div>
                              <div className="text-sm text-slate-400">{house.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {house.commissionType || "N/A"}
                            </Badge>
                            {house.cpaValue && (
                              <div className="text-sm text-slate-400">{formatCurrency(house.cpaValue)}</div>
                            )}
                            {house.revshareValue && (
                              <div className="text-sm text-slate-400">{formatPercentage(house.revshareValue)}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm text-slate-300">{house.baseUrl}</div>
                        </TableCell>
                        <TableCell>
                          {house.securityToken ? (
                            <Badge variant="secondary" className="bg-green-900 text-green-300">
                              Configurado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-900 text-red-300">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={house.isActive ? "default" : "secondary"}
                            className={house.isActive ? "bg-green-600 text-white" : "bg-slate-600 text-slate-300"}
                          >
                            {house.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(house)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(house)}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(house)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleHouseStatus.mutate(house.id)}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              {house.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(house.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-[95vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 lg:mx-0">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {editingHouse ? "Editar Casa de Apostas" : "Nova Casa de Apostas"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nome da Casa</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
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
                      <FormLabel className="text-white">Identificador Único</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
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
                    <FormLabel className="text-white">Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-slate-700 border-slate-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* URL Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">URL Base</FormLabel>
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
                      <FormLabel className="text-white">URL do Logo</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryParam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Parâmetro Primário</FormLabel>
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
                      <FormLabel className="text-white">Parâmetros Adicionais</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Commission Configuration */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="commissionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tipo de Comissão</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="CPA">CPA (Custo por Aquisição)</SelectItem>
                          <SelectItem value="RevShare">RevShare (Participação na Receita)</SelectItem>
                          <SelectItem value="CPA+RevShare">CPA + RevShare</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cpaValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Valor CPA (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="bg-slate-700 border-slate-600 text-white" 
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
                        <FormLabel className="text-white">RevShare (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
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
                        <FormLabel className="text-white">Depósito Mínimo (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="bg-slate-700 border-slate-600 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Security Token */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-white">Token de Segurança</FormLabel>
                  <Button 
                    type="button"
                    onClick={generateSecurityToken}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Gerar Token
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="securityToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Postback Previews */}
                {previewPostbacks.length > 0 && (
                  <div className="bg-slate-900 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Preview dos Postbacks:</h4>
                    <div className="space-y-2">
                      {previewPostbacks.map((postback, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge className={eventTypeColors[postback.eventType as keyof typeof eventTypeColors]}>
                            {eventTypeLabels[postback.eventType as keyof typeof eventTypeLabels]}
                          </Badge>
                          <code className="text-slate-300 font-mono">{postback.url}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentMethods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Métodos de Pagamento</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
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
                      <FormLabel className="text-white">Mapeamento de Parâmetros</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-white">Casa Ativa</FormLabel>
                      <FormDescription className="text-slate-400">
                        Permite que afiliados criem links para esta casa
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={createHouseMutation.isPending || updateHouseMutation.isPending}
                >
                  {editingHouse ? "Atualizar" : "Criar"} Casa
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              {viewingHouse?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingHouse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Status</Label>
                  <Badge className={viewingHouse.isActive ? "bg-green-600" : "bg-red-600"}>
                    {viewingHouse.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-400">Tipo de Comissão</Label>
                  <div className="text-white">{viewingHouse.commissionType || "N/A"}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400">URL Base</Label>
                <div className="text-white font-mono text-sm">{viewingHouse.baseUrl}</div>
              </div>
              
              <div>
                <Label className="text-slate-400">Descrição</Label>
                <div className="text-white">{viewingHouse.description || "Sem descrição"}</div>
              </div>
              
              {viewingHouse.securityToken && (
                <div>
                  <Label className="text-slate-400">Token de Segurança</Label>
                  <div className="text-white font-mono text-sm bg-slate-900 p-2 rounded">
                    {viewingHouse.securityToken}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}