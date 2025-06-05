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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Search,
  Filter,
  Eye,
  Pencil, 
  Trash2, 
  ToggleLeft,
  ToggleRight,
  Copy,
  Download,
  Users,
  Building2,
  DollarSign,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Hash,
  Shield,
  Clock,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/admin/sidebar";

// Schema for affiliate form
const affiliateSchema = z.object({
  subid: z.string().min(1, "SubID é obrigatório"),
  casa_id: z.number().min(1, "Casa de apostas é obrigatória"),
  tipo_comissao: z.enum(["cpa", "revshare", "cpa+revshare"], {
    required_error: "Tipo de comissão é obrigatório"
  }),
  valor_cpa: z.number().optional(),
  percentual_revshare: z.number().min(0).max(100).optional(),
  status: z.boolean().default(true),
});

type AffiliateFormData = z.infer<typeof affiliateSchema>;

interface Affiliate {
  id: number;
  subid: string;
  token: string;
  casa_id: number;
  casa_nome: string;
  tipo_comissao: 'cpa' | 'revshare' | 'cpa+revshare';
  valor_cpa?: number;
  percentual_revshare?: number;
  status: boolean;
  data_criacao: string;
}

interface BettingHouse {
  id: number;
  name: string;
  token: string;
  url_base: string;
  parametro_primario: string;
  tipo_comissao: string;
  status: boolean;
}

interface PostbackLog {
  id: number;
  data_hora: string;
  tipo_evento: string;
  url_disparada: string;
  status_resposta: string;
  corpo_resposta?: string;
}

export default function AdminManage() {
  const [currentPage, setCurrentPage] = useState("manage");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [viewingAffiliate, setViewingAffiliate] = useState<Affiliate | null>(null);
  
  // Filters
  const [searchSubid, setSearchSubid] = useState("");
  const [filterCasa, setFilterCasa] = useState("all");
  const [filterComissao, setFilterComissao] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: {
      subid: "",
      casa_id: 0,
      tipo_comissao: "cpa",
      valor_cpa: 0,
      percentual_revshare: 0,
      status: true,
    },
  });

  // Fetch affiliates
  const { data: affiliates = [], isLoading: loadingAffiliates } = useQuery({
    queryKey: ["/api/admin/affiliates"],
  });

  // Fetch betting houses for dropdown
  const { data: bettingHouses = [] } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
  });

  // Fetch postback logs for selected affiliate
  const { data: postbackLogs = [] } = useQuery({
    queryKey: ["/api/admin/postback-logs", viewingAffiliate?.id],
    enabled: !!viewingAffiliate,
  });

  // Statistics calculations
  const stats = useMemo(() => {
    const affiliateList = Array.isArray(affiliates) ? affiliates : [];
    const total = affiliateList.length;
    const ativos = affiliateList.filter((a: Affiliate) => a.status).length;
    const inativos = total - ativos;
    const ultimoCadastro = affiliateList.length > 0 
      ? new Date(Math.max(...affiliateList.map((a: Affiliate) => new Date(a.data_criacao).getTime())))
      : null;

    return { total, ativos, inativos, ultimoCadastro };
  }, [affiliates]);

  // Filtered affiliates
  const filteredAffiliates = useMemo(() => {
    const affiliateList = Array.isArray(affiliates) ? affiliates : [];
    return affiliateList.filter((affiliate: Affiliate) => {
      const matchesSubid = searchSubid === "" || 
        affiliate.subid.toLowerCase().includes(searchSubid.toLowerCase());
      
      const matchesCasa = filterCasa === "all" || 
        affiliate.casa_id.toString() === filterCasa;
      
      const matchesComissao = filterComissao === "all" || 
        affiliate.tipo_comissao === filterComissao;
      
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "ativo" && affiliate.status) ||
        (filterStatus === "inativo" && !affiliate.status);

      return matchesSubid && matchesCasa && matchesComissao && matchesStatus;
    });
  }, [affiliates, searchSubid, filterCasa, filterComissao, filterStatus]);

  // Mutations
  const createAffiliateMutation = useMutation({
    mutationFn: async (data: AffiliateFormData) => {
      const response = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar afiliado");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Afiliado criado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Erro ao criar afiliado", description: error.message, variant: "destructive" });
    },
  });

  const updateAffiliateMutation = useMutation({
    mutationFn: async (data: AffiliateFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Erro ao atualizar afiliado");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Afiliado atualizado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      setIsDialogOpen(false);
      setEditingAffiliate(null);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar afiliado", description: error.message, variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/affiliates/${id}/toggle`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Erro ao alterar status");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Status alterado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" });
    },
  });

  const deleteAffiliateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao excluir afiliado");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Afiliado excluído com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir afiliado", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePostbackUrls = (token: string) => {
    const baseUrl = window.location.origin;
    return {
      click: `${baseUrl}/postback/click?token=${token}`,
      register: `${baseUrl}/postback/register?token=${token}`,
      deposit: `${baseUrl}/postback/deposit?token=${token}`,
      revenue: `${baseUrl}/postback/revenue?token=${token}`,
    };
  };

  // Event handlers
  const handleAdd = () => {
    form.reset();
    setEditingAffiliate(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    form.reset({
      subid: affiliate.subid,
      casa_id: affiliate.casa_id,
      tipo_comissao: affiliate.tipo_comissao,
      valor_cpa: affiliate.valor_cpa || 0,
      percentual_revshare: affiliate.percentual_revshare || 0,
      status: affiliate.status,
    });
    setIsDialogOpen(true);
  };

  const handleView = (affiliate: Affiliate) => {
    setViewingAffiliate(affiliate);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este afiliado?")) {
      deleteAffiliateMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Token copiado com sucesso!" });
  };

  const handleCopyUrl = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: `URL de ${type} copiada com sucesso!` });
  };

  const clearFilters = () => {
    setSearchSubid("");
    setFilterCasa("all");
    setFilterComissao("all");
    setFilterStatus("all");
  };

  const onSubmit = (data: AffiliateFormData) => {
    if (editingAffiliate) {
      updateAffiliateMutation.mutate({ ...data, id: editingAffiliate.id });
    } else {
      createAffiliateMutation.mutate(data);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  Administração de Afiliados
                </h1>
                <p className="text-slate-400 mt-2">
                  Gerencie afiliados, comissões e tokens de postback
                </p>
              </div>
              <Button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Afiliado
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total de Afiliados</p>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Ativos</p>
                      <p className="text-2xl font-bold text-green-400">{stats.ativos}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Inativos</p>
                      <p className="text-2xl font-bold text-red-400">{stats.inativos}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Último Cadastro</p>
                      <p className="text-sm font-medium text-white">
                        {stats.ultimoCadastro ? formatDate(stats.ultimoCadastro.toISOString()) : "Nenhum"}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros Avançados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label className="text-slate-300 text-sm">SubID</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar por SubID..."
                        value={searchSubid}
                        onChange={(e) => setSearchSubid(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Casa de Apostas</Label>
                    <Select value={filterCasa} onValueChange={setFilterCasa}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Todas as casas" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">Todas as casas</SelectItem>
                        {Array.isArray(bettingHouses) && bettingHouses.map((house: BettingHouse) => (
                          <SelectItem key={house.id} value={house.id.toString()}>
                            {house.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Tipo de Comissão</Label>
                    <Select value={filterComissao} onValueChange={setFilterComissao}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="cpa">CPA</SelectItem>
                        <SelectItem value="revshare">RevShare</SelectItem>
                        <SelectItem value="cpa+revshare">CPA + RevShare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Affiliates Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Afiliados ({filteredAffiliates.length})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingAffiliates ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-4 text-slate-400 animate-spin" />
                    <p className="text-slate-400">Carregando afiliados...</p>
                  </div>
                ) : filteredAffiliates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-750">
                        <TableRow className="border-slate-600 hover:bg-slate-750">
                          <TableHead className="text-slate-300 font-semibold">SubID</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Casa de Apostas</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Tipo de Comissão</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Valor CPA</TableHead>
                          <TableHead className="text-slate-300 font-semibold">RevShare (%)</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Token</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Data de Criação</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAffiliates.map((affiliate: Affiliate) => (
                          <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="text-white font-mono">
                              {affiliate.subid}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {affiliate.casa_nome}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {affiliate.tipo_comissao === 'cpa' && (
                                  <Badge className="bg-green-600 text-white">CPA</Badge>
                                )}
                                {affiliate.tipo_comissao === 'revshare' && (
                                  <Badge className="bg-blue-600 text-white">RevShare</Badge>
                                )}
                                {affiliate.tipo_comissao === 'cpa+revshare' && (
                                  <>
                                    <Badge className="bg-green-600 text-white">CPA</Badge>
                                    <Badge className="bg-blue-600 text-white">RevShare</Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-green-400">
                              {affiliate.valor_cpa ? formatCurrency(affiliate.valor_cpa) : "-"}
                            </TableCell>
                            <TableCell className="text-blue-400">
                              {affiliate.percentual_revshare ? formatPercentage(affiliate.percentual_revshare) : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                  {affiliate.token.substring(0, 12)}...
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopyToken(affiliate.token)}
                                  className="h-6 w-6 p-0 hover:bg-slate-600"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={affiliate.status ? "default" : "secondary"}
                                className={affiliate.status ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                              >
                                {affiliate.status ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {formatDate(affiliate.data_criacao)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleView(affiliate)}
                                  title="Ver Detalhes"
                                  className="h-8 w-8 p-0 hover:bg-blue-600"
                                >
                                  <Eye className="h-4 w-4 text-blue-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(affiliate)}
                                  title="Editar"
                                  className="h-8 w-8 p-0 hover:bg-yellow-600"
                                >
                                  <Pencil className="h-4 w-4 text-yellow-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleToggleStatus(affiliate.id)}
                                  title={affiliate.status ? "Inativar" : "Ativar"}
                                  className="h-8 w-8 p-0 hover:bg-purple-600"
                                >
                                  {affiliate.status ? (
                                    <ToggleRight className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-red-400" />
                                  )}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDelete(affiliate.id)}
                                  title="Excluir"
                                  className="h-8 w-8 p-0 hover:bg-red-600"
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">Nenhum afiliado encontrado</h3>
                    <p className="text-sm">
                      {searchSubid || filterCasa !== "all" || filterComissao !== "all" || filterStatus !== "all" 
                        ? "Tente ajustar os filtros ou limpar a busca."
                        : "Comece criando seu primeiro afiliado."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {editingAffiliate ? "Editar Afiliado" : "Novo Afiliado"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">SubID *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-slate-700 border-slate-600 text-white"
                          disabled={!!editingAffiliate}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        Identificador único do afiliado (não pode ser alterado)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="casa_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Casa de Apostas *</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione uma casa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {bettingHouses.map((house: BettingHouse) => (
                            <SelectItem key={house.id} value={house.id.toString()}>
                              {house.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_comissao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Tipo de Comissão *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="cpa">CPA</SelectItem>
                          <SelectItem value="revshare">RevShare</SelectItem>
                          <SelectItem value="cpa+revshare">CPA + RevShare</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-slate-300">Status Ativo</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(form.watch("tipo_comissao") === "cpa" || form.watch("tipo_comissao") === "cpa+revshare") && (
                  <FormField
                    control={form.control}
                    name="valor_cpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Valor CPA (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-slate-700 border-slate-600 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(form.watch("tipo_comissao") === "revshare" || form.watch("tipo_comissao") === "cpa+revshare") && (
                  <FormField
                    control={form.control}
                    name="percentual_revshare"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Percentual RevShare (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-slate-700 border-slate-600 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-end gap-3">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createAffiliateMutation.isPending || updateAffiliateMutation.isPending}
                >
                  {createAffiliateMutation.isPending || updateAffiliateMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingAffiliate ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-400" />
              Detalhes do Afiliado
            </DialogTitle>
          </DialogHeader>
          
          {viewingAffiliate && (
            <Tabs defaultValue="info" className="mt-6">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                <TabsTrigger value="info" className="data-[state=active]:bg-slate-600">
                  Informações
                </TabsTrigger>
                <TabsTrigger value="postbacks" className="data-[state=active]:bg-slate-600">
                  URLs de Postback
                </TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-slate-600">
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-400">Dados do Afiliado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-slate-400 text-sm">SubID</Label>
                        <p className="text-white font-mono text-lg">{viewingAffiliate.subid}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Token</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-yellow-400 font-mono text-sm bg-slate-800 px-3 py-2 rounded flex-1 break-all">
                            {viewingAffiliate.token}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyToken(viewingAffiliate.token)}
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Casa Vinculada</Label>
                        <p className="text-white">{viewingAffiliate.casa_nome}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Data de Criação</Label>
                        <p className="text-white">{formatDate(viewingAffiliate.data_criacao)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-400">Comissão</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-slate-400 text-sm">Tipo de Comissão</Label>
                        <div className="flex gap-2 mt-1">
                          {viewingAffiliate.tipo_comissao === 'cpa' && (
                            <Badge className="bg-green-600 text-white">CPA</Badge>
                          )}
                          {viewingAffiliate.tipo_comissao === 'revshare' && (
                            <Badge className="bg-blue-600 text-white">RevShare</Badge>
                          )}
                          {viewingAffiliate.tipo_comissao === 'cpa+revshare' && (
                            <>
                              <Badge className="bg-green-600 text-white">CPA</Badge>
                              <Badge className="bg-blue-600 text-white">RevShare</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {viewingAffiliate.valor_cpa && (
                        <div>
                          <Label className="text-slate-400 text-sm">Valor CPA</Label>
                          <p className="text-green-400 text-lg font-semibold">
                            {formatCurrency(viewingAffiliate.valor_cpa)}
                          </p>
                        </div>
                      )}
                      {viewingAffiliate.percentual_revshare && (
                        <div>
                          <Label className="text-slate-400 text-sm">Percentual RevShare</Label>
                          <p className="text-blue-400 text-lg font-semibold">
                            {formatPercentage(viewingAffiliate.percentual_revshare)}
                          </p>
                        </div>
                      )}
                      <div>
                        <Label className="text-slate-400 text-sm">Status</Label>
                        <div className="mt-1">
                          <Badge 
                            className={`${
                              viewingAffiliate.status ? 'bg-green-600' : 'bg-red-600'
                            } text-white`}
                          >
                            {viewingAffiliate.status ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="postbacks" className="space-y-6">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      URLs de Postback Automáticos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(generatePostbackUrls(viewingAffiliate.token)).map(([type, url]) => {
                        const typeLabels = {
                          click: 'Click',
                          register: 'Register', 
                          deposit: 'Deposit',
                          revenue: 'Revenue'
                        };
                        
                        return (
                          <div key={type} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-slate-300 font-medium">
                                {typeLabels[type as keyof typeof typeLabels]}
                              </Label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyUrl(url, type)}
                                className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-2 rounded break-all">
                              {url}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="space-y-6">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Histórico de Postbacks
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {postbackLogs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-600">
                              <TableHead className="text-slate-300">Data/Hora</TableHead>
                              <TableHead className="text-slate-300">Evento</TableHead>
                              <TableHead className="text-slate-300">URL</TableHead>
                              <TableHead className="text-slate-300">Status</TableHead>
                              <TableHead className="text-slate-300">Resposta</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {postbackLogs.map((log: PostbackLog) => (
                              <TableRow key={log.id} className="border-slate-600">
                                <TableCell className="text-slate-300">
                                  {formatDate(log.data_hora)}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-purple-600 text-white">
                                    {log.tipo_evento}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-blue-400 text-xs font-mono max-w-xs truncate">
                                  {log.url_disparada}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      log.status_resposta.startsWith('2') 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-red-600 text-white'
                                    }
                                  >
                                    {log.status_resposta}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400 text-xs max-w-xs truncate">
                                  {log.corpo_resposta || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                        <h3 className="text-lg font-medium text-slate-300 mb-2">
                          Nenhum log encontrado
                        </h3>
                        <p className="text-sm text-slate-400">
                          Este afiliado ainda não possui histórico de postbacks.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}