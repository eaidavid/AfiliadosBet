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
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/admin/sidebar";

// Form schema
const affiliateSchema = z.object({
  subid: z.string().min(1, "SubID é obrigatório"),
  casa_id: z.number().min(1, "Casa de apostas é obrigatória"),
  tipo_comissao: z.enum(["cpa", "revshare", "cpa+revshare"]),
  valor_cpa: z.number().min(0).optional(),
  percentual_revshare: z.number().min(0).max(100).optional(),
  status: z.boolean(),
});

type AffiliateFormData = z.infer<typeof affiliateSchema>;

// Types
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
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="lg:ml-72 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto transition-all duration-300 pl-[17px] pr-[17px] mt-[0px] mb-[0px] pt-[77px] pb-[77px] ml-[110px] mr-[110px]">
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
              <p className="text-slate-300 mt-2">
                Gerencie afiliados, comissões e tokens de postback
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white pl-[3px] pr-[3px] text-[12px] ml-[-2px] mr-[-2px]"
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
                    <p className="text-slate-300 text-sm">Total de Afiliados</p>
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
                    <p className="text-slate-300 text-sm">Ativos</p>
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
                    <p className="text-slate-300 text-sm">Inativos</p>
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
                    <p className="text-slate-300 text-sm">Último Cadastro</p>
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

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {filteredAffiliates.length} resultado(s)
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Affiliates Table */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Lista de Afiliados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAffiliates ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                  <span className="ml-2 text-slate-300">Carregando afiliados...</span>
                </div>
              ) : filteredAffiliates.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300 font-semibold">SubID</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Casa de Apostas</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Tipo Comissão</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Valor/Percentual</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Token</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Data Criação</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAffiliates.map((affiliate: Affiliate) => (
                        <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="font-medium text-blue-400">
                            {affiliate.subid}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.casa_nome}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                affiliate.tipo_comissao === 'cpa' 
                                  ? "border-green-500 text-green-400"
                                  : affiliate.tipo_comissao === 'revshare'
                                  ? "border-blue-500 text-blue-400"
                                  : "border-purple-500 text-purple-400"
                              }
                            >
                              {affiliate.tipo_comissao.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.tipo_comissao === 'cpa' && formatCurrency(affiliate.valor_cpa)}
                            {affiliate.tipo_comissao === 'revshare' && formatPercentage(affiliate.percentual_revshare)}
                            {affiliate.tipo_comissao === 'cpa+revshare' && 
                              `${formatCurrency(affiliate.valor_cpa)} + ${formatPercentage(affiliate.percentual_revshare)}`
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300 max-w-[100px] truncate">
                                {affiliate.token}
                              </code>
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
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Nenhum afiliado encontrado</h3>
                  <p className="text-sm text-slate-300">
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
                      <FormLabel className="text-slate-300">SubID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Ex: AFF001"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="casa_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Casa de Apostas</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione a casa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {Array.isArray(bettingHouses) && bettingHouses.map((house: BettingHouse) => (
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
                      <FormLabel className="text-slate-300">Tipo de Comissão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                            placeholder="0.00"
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
                            step="0.01"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-slate-300">Status do Afiliado</FormLabel>
                      <FormDescription className="text-slate-400">
                        Define se o afiliado está ativo e pode receber comissões
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-600"
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
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createAffiliateMutation.isPending || updateAffiliateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createAffiliateMutation.isPending || updateAffiliateMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingAffiliate ? "Atualizar" : "Criar Afiliado"
                  )}
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
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalhes do Afiliado
            </DialogTitle>
          </DialogHeader>
          
          {viewingAffiliate && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                <TabsTrigger value="info" className="text-slate-300 data-[state=active]:bg-slate-600">
                  Informações
                </TabsTrigger>
                <TabsTrigger value="postbacks" className="text-slate-300 data-[state=active]:bg-slate-600">
                  URLs Postback
                </TabsTrigger>
                <TabsTrigger value="logs" className="text-slate-300 data-[state=active]:bg-slate-600">
                  Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Dados do Afiliado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">SubID</Label>
                        <p className="text-white font-medium">{viewingAffiliate.subid}</p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Casa de Apostas</Label>
                        <p className="text-white font-medium">{viewingAffiliate.casa_nome}</p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Tipo de Comissão</Label>
                        <Badge className="mt-1">
                          {viewingAffiliate.tipo_comissao.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-slate-300">Status</Label>
                        <Badge 
                          variant={viewingAffiliate.status ? "default" : "secondary"}
                          className={`mt-1 ${viewingAffiliate.status ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {viewingAffiliate.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-slate-300">Valor CPA</Label>
                        <p className="text-white font-medium">
                          {formatCurrency(viewingAffiliate.valor_cpa)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Percentual RevShare</Label>
                        <p className="text-white font-medium">
                          {formatPercentage(viewingAffiliate.percentual_revshare)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-slate-300">Token</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-slate-600 px-3 py-2 rounded text-white flex-1">
                            {viewingAffiliate.token}
                          </code>
                          <Button
                            size="sm"
                            onClick={() => handleCopyToken(viewingAffiliate.token)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="postbacks" className="space-y-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      URLs de Postback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(generatePostbackUrls(viewingAffiliate.token)).map(([type, url]) => (
                      <div key={type} className="space-y-2">
                        <Label className="text-slate-300 capitalize">{type}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={url}
                            readOnly
                            className="bg-slate-600 border-slate-500 text-white"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCopyUrl(url, type)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Logs de Postback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(postbackLogs) && postbackLogs.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {postbackLogs.map((log: PostbackLog) => (
                          <div key={log.id} className="bg-slate-600 p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-slate-300">
                                {log.tipo_evento}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {formatDate(log.data_hora)}
                              </span>
                            </div>
                            <p className="text-sm text-white mb-1">
                              URL: {log.url_disparada}
                            </p>
                            <p className="text-sm text-slate-300">
                              Status: {log.status_resposta}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">
                        Nenhum log de postback encontrado
                      </p>
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