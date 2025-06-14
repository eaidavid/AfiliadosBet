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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Search,
  Users,
  Edit,
  Eye,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  RefreshCw,
  Settings,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import CenteredLayout from "@/components/centered-layout";
import { useToast } from "@/hooks/use-toast";

// Form schema for editing affiliate
const editAffiliateSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  email: z.string().email("Email inválido"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  isActive: z.boolean(),
});

type EditAffiliateFormData = z.infer<typeof editAffiliateSchema>;

// Types
interface Affiliate {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommissions: string;
  houses: string[];
}

interface PostbackLog {
  id: number;
  data_hora: string;
  tipo_evento: string;
  url_disparada: string;
  status_resposta: string;
  corpo_resposta?: string;
}

export default function AdminManageFixed() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [viewingAffiliate, setViewingAffiliate] = useState<Affiliate | null>(null);
  
  // Filters
  const [searchSubid, setSearchSubid] = useState("");
  const [filterCasa, setFilterCasa] = useState("all");

  const [filterStatus, setFilterStatus] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<EditAffiliateFormData>({
    resolver: zodResolver(editAffiliateSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      isActive: true,
    },
  });

  // Update form when editing affiliate changes
  React.useEffect(() => {
    if (editingAffiliate) {
      form.reset({
        username: editingAffiliate.username,
        email: editingAffiliate.email,
        fullName: editingAffiliate.fullName,
        isActive: editingAffiliate.isActive,
      });
    }
  }, [editingAffiliate, form]);

  // Update affiliate mutation
  const updateAffiliateMutation = useMutation({
    mutationFn: async (data: EditAffiliateFormData & { id: number }) => {
      const response = await fetch(`/api/admin/affiliates/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update affiliate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      toast({ title: "Afiliado atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingAffiliate(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar afiliado", variant: "destructive" });
    },
  });

  // Handle form submission
  const onSubmit = (data: EditAffiliateFormData) => {
    if (editingAffiliate) {
      updateAffiliateMutation.mutate({ ...data, id: editingAffiliate.id });
    }
  };

  // Fetch affiliates
  const { data: affiliates = [], isLoading: loadingAffiliates } = useQuery({
    queryKey: ["/api/admin/affiliates"],
  });

  // Fetch betting houses for dropdown
  const { data: bettingHouses = [] } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
  });

  // Statistics calculations
  const stats = useMemo(() => {
    const affiliateList = Array.isArray(affiliates) ? affiliates : [];
    const total = affiliateList.length;
    const ativos = affiliateList.filter((a: Affiliate) => a.isActive).length;
    const inativos = total - ativos;
    const ultimoCadastro = affiliateList.length > 0 
      ? new Date(Math.max(...affiliateList.map((a: Affiliate) => {
          const date = new Date(a.createdAt);
          return isNaN(date.getTime()) ? 0 : date.getTime();
        })))
      : null;

    return { total, ativos, inativos, ultimoCadastro };
  }, [affiliates]);

  // Filtered affiliates
  const filteredAffiliates = useMemo(() => {
    const affiliateList = Array.isArray(affiliates) ? affiliates : [];
    return affiliateList.filter((affiliate: Affiliate) => {
      const matchesSearch = searchSubid === "" || 
        affiliate.username.toLowerCase().includes(searchSubid.toLowerCase()) ||
        affiliate.email.toLowerCase().includes(searchSubid.toLowerCase()) ||
        affiliate.fullName.toLowerCase().includes(searchSubid.toLowerCase());
      
      const matchesCasa = filterCasa === "all" || 
        affiliate.houses.includes(filterCasa);
      
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "ativo" && affiliate.isActive) ||
        (filterStatus === "inativo" && !affiliate.isActive);

      return matchesSearch && matchesCasa && matchesStatus;
    });
  }, [affiliates, searchSubid, filterCasa, filterStatus]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <CenteredLayout>
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

        {/* Affiliates Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Afiliados ({filteredAffiliates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAffiliates ? (
              <div className="text-center text-slate-400 py-8">
                Carregando afiliados...
              </div>
            ) : filteredAffiliates.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum afiliado encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Usuário</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Nome Completo</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Criado em</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAffiliates.map((affiliate: Affiliate) => (
                      <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-slate-200 font-medium">
                          {affiliate.username}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {affiliate.email}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {affiliate.fullName}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={affiliate.isActive ? "default" : "destructive"}
                            className={affiliate.isActive ? "bg-green-600" : "bg-red-600"}
                          >
                            {affiliate.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {formatDate(affiliate.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                console.log("Clicou no botão Ver Detalhes para:", affiliate.username);
                                setViewingAffiliate(affiliate);
                              }}
                              className="h-8 w-8 p-0 text-slate-300 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                console.log("Clicou no botão Editar para:", affiliate.username);
                                setEditingAffiliate(affiliate);
                                setIsDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 text-slate-300 hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Editar Afiliado
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Edite as informações do afiliado
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Nome de usuário"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="email@exemplo.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome Completo</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Nome completo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-white">Status Ativo</FormLabel>
                      <FormDescription className="text-slate-400">
                        Ativar ou desativar o afiliado no sistema
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
              
              <div className="flex justify-end gap-3 pt-4">
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
                  disabled={updateAffiliateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateAffiliateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!viewingAffiliate} onOpenChange={() => setViewingAffiliate(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Detalhes do Afiliado: {viewingAffiliate?.username}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Visualize as informações detalhadas do afiliado
            </DialogDescription>
          </DialogHeader>
          
          {viewingAffiliate && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">Nome de Usuário</p>
                      <p className="text-white font-medium">{viewingAffiliate.username}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="text-white font-medium">{viewingAffiliate.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Nome Completo</p>
                      <p className="text-white font-medium">{viewingAffiliate.fullName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <Badge 
                        variant={viewingAffiliate.isActive ? "default" : "destructive"}
                        className={viewingAffiliate.isActive ? "bg-green-600" : "bg-red-600"}
                      >
                        {viewingAffiliate.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Data de Cadastro</p>
                      <p className="text-white font-medium">{formatDate(viewingAffiliate.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Statistics */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Estatísticas de Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">Total de Cliques</p>
                      <p className="text-white font-medium text-lg">{viewingAffiliate.totalClicks}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Registros</p>
                      <p className="text-white font-medium text-lg">{viewingAffiliate.totalRegistrations}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Depósitos</p>
                      <p className="text-white font-medium text-lg">{viewingAffiliate.totalDeposits}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Comissões Totais</p>
                      <p className="text-green-400 font-bold text-lg">
                        R$ {parseFloat(viewingAffiliate.totalCommissions).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Affiliate Links */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Copy className="w-5 h-5" />
                    Casas de Apostas Vinculadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewingAffiliate.houses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {viewingAffiliate.houses.map((house, index) => (
                        <div key={index} className="p-3 bg-slate-600 rounded-lg">
                          <p className="text-white font-medium">{house}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Nenhuma casa de apostas vinculada</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CenteredLayout>
  );
}