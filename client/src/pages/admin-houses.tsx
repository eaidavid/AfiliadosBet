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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
      <div className="flex-1 p-2 sm:p-4 lg:p-8 lg:ml-72 overflow-x-hidden ml-[13px] mr-[13px] mt-[62px] mb-[62px]">
        <div className="max-w-full lg:max-w-[1400px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  Administração de Casas de Apostas
                </h1>
                <p className="text-slate-400 mt-2">
                  Gerencie todas as casas de apostas, postbacks e configurações de comissão
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Casa
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Total de Casas</p>
                      <p className="text-2xl font-bold text-[#1b2538]">
                        {houses.length}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        casas registradas
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-400" />
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
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">Casas Ativas</p>
                      <p className="text-2xl font-bold text-[#1a2436]">
                        {houses.filter(h => h.isActive).length}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        em operação
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
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
                      <p className="text-purple-400 text-sm font-medium">Com Postbacks</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.length}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        configuradas
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  Casas de Apostas ({filteredHouses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-750">
                      <TableRow className="border-slate-600 hover:bg-slate-750">
                        <TableHead className="text-slate-300 font-semibold">Casa</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Comissão</TableHead>
                        <TableHead className="text-slate-300 font-semibold">URL Base</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Token</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              Carregando...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredHouses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                            Nenhuma casa encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHouses.map((house) => (
                          <TableRow key={house.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="text-white">
                              <div className="flex items-center gap-3">
                                {house.logoUrl && (
                                  <img 
                                    src={house.logoUrl} 
                                    alt={house.name}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{house.name}</p>
                                  {house.description && (
                                    <p className="text-xs text-slate-400 truncate max-w-[200px]">
                                      {house.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline" className="w-fit">
                                  {house.commissionType}
                                </Badge>
                                <div className="text-xs space-y-1">
                                  {(house.commissionType?.includes("CPA") && house.cpaValue) && (
                                    <div className="text-green-400">CPA: {formatCurrency(house.cpaValue)}</div>
                                  )}
                                  {(house.commissionType?.includes("RevShare") && house.revshareValue) && (
                                    <div className="text-blue-400">RevShare: {formatPercentage(house.revshareValue)}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="max-w-[200px] truncate text-blue-400">
                                {house.baseUrl}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-yellow-400" />
                                  <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded">
                                    {house.securityToken?.substring(0, 12)}...
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(house.securityToken || '');
                                    toast({ title: "Token copiado!" });
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={house.isActive ? "default" : "secondary"}>
                                {house.isActive ? "Ativa" : "Inativa"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleView(house)}
                                  title="Visualizar"
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
                                  title="Gerenciar Postbacks"
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
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Identificador Único *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 border-slate-600 text-white" placeholder="ex: brazino777" />
                        </FormControl>
                        <FormDescription className="text-slate-400 text-xs">
                          Identificador único usado nos postbacks (apenas letras, números e hífen)
                        </FormDescription>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cpaValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Valor CPA (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
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
                          <FormLabel className="text-slate-300">RevShare (%)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              max="100"
                              className="bg-slate-700 border-slate-600 text-white" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="minDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Depósito Mínimo (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            className="bg-slate-700 border-slate-600 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                {/* Security Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 border-b border-slate-600 pb-2">
                    Configuração de Segurança
                  </h3>

                  <FormField
                    control={form.control}
                    name="securityToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Token de Segurança
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              {...field} 
                              readOnly={!!editingHouse}
                              className="bg-slate-700 border-slate-600 text-white font-mono" 
                            />
                          </FormControl>
                          {!editingHouse && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generateSecurityToken}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              Gerar
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {editingHouse ? "Token imutável por segurança" : "Token único para identificar a casa nos postbacks"}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Automatic Postback Preview */}
                  {previewPostbacks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                        <Webhook className="h-4 w-4" />
                        Postbacks Automáticos {editingHouse ? "(Existentes)" : "(Serão Criados)"}
                      </h4>
                      <div className="space-y-2">
                        {previewPostbacks.map((postback, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-purple-500/20">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <div>
                                <p className="text-sm font-medium text-white capitalize">{postback.eventType}</p>
                                <p className="text-xs text-slate-400 font-mono">{postback.url}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(postback.url);
                                toast({ title: "URL copiada!", description: "URL do postback copiada para a área de transferência." });
                              }}
                              className="h-8 w-8 p-0 hover:bg-purple-600"
                            >
                              <Copy className="h-3 w-3 text-purple-400" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        {editingHouse 
                          ? "Postbacks já configurados para esta casa"
                          : "Estes postbacks serão criados automaticamente com tokens únicos e seguros quando a casa for salva."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-600">
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createHouseMutation.isPending || updateHouseMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </div>
                  ) : (
                    editingHouse ? "Atualizar" : "Criar Casa"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Enhanced View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-400" />
              Detalhes da Casa de Apostas
            </DialogTitle>
          </DialogHeader>
          
          {viewingHouse && (
            <div className="space-y-8 mt-6">
              {/* Main Information - Two Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações Básicas
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-400 text-sm">Nome da Casa</Label>
                        <p className="text-white font-medium text-lg">{viewingHouse.name}</p>
                      </div>
                      
                      <div>
                        <Label className="text-slate-400 text-sm">URL Base</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-blue-400 text-sm font-mono bg-slate-800 px-3 py-2 rounded flex-1 break-all">
                            {viewingHouse.baseUrl}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(viewingHouse)}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex-shrink-0"
                            title="Copiar URL"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-slate-400 text-sm">Tipo de Comissão</Label>
                        <div className="mt-2">
                          <Badge 
                            className={`text-white ${
                              viewingHouse.commissionType === 'CPA' ? 'bg-green-600' :
                              viewingHouse.commissionType === 'RevShare' ? 'bg-blue-600' :
                              'bg-purple-600'
                            }`}
                          >
                            {viewingHouse.commissionType}
                          </Badge>
                        </div>
                        
                        {/* Commission Values */}
                        {viewingHouse.commissionType && (
                          <div className="mt-2 space-y-1">
                            {(viewingHouse.commissionType.includes("CPA") && viewingHouse.cpaValue) && (
                              <div className="text-green-400 text-sm">CPA: {formatCurrency(viewingHouse.cpaValue)}</div>
                            )}
                            {(viewingHouse.commissionType.includes("RevShare") && viewingHouse.revshareValue) && (
                              <div className="text-blue-400 text-sm">RevShare: {formatPercentage(viewingHouse.revshareValue)}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Technical Info */}
                <div className="space-y-6">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Dados Técnicos
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-400 text-sm flex items-center gap-2">
                          Status
                        </Label>
                        <div className="mt-2">
                          <Badge 
                            variant={viewingHouse.isActive ? "default" : "secondary"}
                            className={`flex items-center gap-2 w-fit ${
                              viewingHouse.isActive 
                                ? 'bg-green-600 text-white' 
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {viewingHouse.isActive ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Ativa
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Inativa
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-slate-400 text-sm flex items-center gap-2">
                          Parâmetro Primário
                          <div className="group relative">
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-slate-500 hover:text-slate-300">
                              <span className="w-4 h-4 border border-slate-500 rounded-full flex items-center justify-center text-xs">?</span>
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Campo identificador do afiliado
                            </div>
                          </div>
                        </Label>
                        <p className="text-white font-mono bg-slate-800 px-3 py-2 rounded mt-1">{viewingHouse.primaryParam}</p>
                      </div>
                      
                      <div>
                        <Label className="text-slate-400 text-sm flex items-center gap-2">
                          Token de Segurança
                          <div className="group relative">
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-slate-500 hover:text-slate-300">
                              <span className="w-4 h-4 border border-slate-500 rounded-full flex items-center justify-center text-xs">?</span>
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Usado para validar a origem dos postbacks
                            </div>
                          </div>
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-yellow-400 font-mono text-sm bg-slate-800 px-3 py-2 rounded flex-1 break-all">
                            {viewingHouse.securityToken}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(viewingHouse.securityToken || '');
                              toast({ title: "Token copiado com sucesso!" });
                            }}
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white flex-shrink-0"
                            title="Copiar Token"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {viewingHouse.description && (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <Label className="text-slate-400 text-sm">Descrição</Label>
                  <p className="text-slate-300 mt-2">{viewingHouse.description}</p>
                </div>
              )}

              {/* Automatic Postbacks Section */}
              <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  URLs de Postback Automáticos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['click', 'register', 'deposit', 'revenue'].map((eventType) => {
                    const postbackUrl = `${window.location.origin}/postback/${eventType}?token=${viewingHouse.securityToken}`;
                    const eventLabels = {
                      click: 'Click',
                      register: 'Register', 
                      deposit: 'Deposit',
                      revenue: 'Revenue'
                    };
                    
                    return (
                      <div key={eventType} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-slate-300 font-medium">
                            {eventLabels[eventType as keyof typeof eventLabels]}
                          </Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(postbackUrl);
                              toast({ title: `URL ${eventType} copiada com sucesso!` });
                            }}
                            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                            title={`Copiar URL ${eventType}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-2 rounded break-all">
                          {postbackUrl}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Postback Management Modal */}
      <Dialog open={isPostbackModalOpen} onOpenChange={setIsPostbackModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Webhook className="w-5 h-5 text-purple-400" />
              Gerenciar Postbacks
            </DialogTitle>
            <p className="text-slate-400">
              Configure e gerencie postbacks para receber notificações de eventos desta casa de apostas
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Postbacks Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Postbacks Configurados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedHousePostbacks && selectedHousePostbacks.length > 0 ? (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-750">
                        <TableRow className="border-slate-600 hover:bg-slate-750">
                          <TableHead className="text-slate-300 font-semibold">Evento</TableHead>
                          <TableHead className="text-slate-300 font-semibold">URL de Postback</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedHousePostbacks.map((postback) => (
                          <TableRow key={postback.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="text-white">
                              <div className="flex flex-col gap-2">
                                <Badge className={`${eventTypeColors[postback.eventType as keyof typeof eventTypeColors]} text-white w-fit`}>
                                  {eventTypeLabels[postback.eventType as keyof typeof eventTypeLabels]}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  {postback.isAutomatic ? (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1 border-blue-500/30 text-blue-400">
                                      <Bot className="w-3 h-3" />
                                      Automático
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1 border-gray-500/30 text-gray-400">
                                      <User className="w-3 h-3" />
                                      Manual
                                    </Badge>
                                  )}
                                  {postback.active ? (
                                    <Badge variant="default" className="text-xs flex items-center gap-1 bg-green-600">
                                      <CheckCircle className="w-3 h-3" />
                                      Ativo
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Inativo
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-md text-slate-300">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-mono truncate text-slate-300 flex-1" title={postback.url}>
                                  {postback.url}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(postback.url);
                                    toast({ title: "URL copiada!", description: "URL do postback copiada para a área de transferência." });
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-purple-600"
                                >
                                  <Copy className="h-3 w-3 text-purple-400" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={postback.active || false}
                                  disabled
                                />
                                <span className={postback.active ? "text-green-600" : "text-red-600"}>
                                  {postback.active ? "Ativo" : "Inativo"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {!postback.isAutomatic ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Settings className="w-3 h-3" />
                                    Protegido
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Webhook className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">Nenhum postback configurado</h3>
                    <p className="text-sm">Esta casa ainda não possui postbacks configurados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}