import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { apiRequest } from "@/lib/queryClient";

const editAffiliateSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  email: z.string().email("Email inválido"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  isActive: z.boolean(),
});

type EditAffiliateFormData = z.infer<typeof editAffiliateSchema>;

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

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge 
    variant="outline" 
    className={`text-xs font-medium border ${
      isActive 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
        : 'bg-red-500/20 text-red-400 border-red-500/30'
    }`}
  >
    {isActive ? 'Ativo' : 'Inativo'}
  </Badge>
);

export default function AdminManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: affiliates = [], isLoading, refetch } = useQuery<Affiliate[]>({
    queryKey: ['/api/admin/affiliates'],
    refetchInterval: 30000,
  });

  const form = useForm<EditAffiliateFormData>({
    resolver: zodResolver(editAffiliateSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      isActive: true,
    },
  });

  const toggleAffiliateStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest(`/api/admin/affiliates/${id}/status`, { 
        method: "PUT", 
        body: { isActive } 
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Status do afiliado atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status do afiliado.",
        variant: "destructive",
      });
    },
  });

  const updateAffiliate = useMutation({
    mutationFn: async (data: EditAffiliateFormData & { id: number }) => {
      return await apiRequest(`/api/admin/affiliates/${data.id}`, { 
        method: "PUT", 
        body: data 
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Afiliado atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      setIsEditOpen(false);
      setSelectedAffiliate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar afiliado.",
        variant: "destructive",
      });
    },
  });

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter((affiliate) => {
      const matchesSearch = 
        affiliate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && affiliate.isActive) ||
        (statusFilter === "inactive" && !affiliate.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [affiliates, searchTerm, statusFilter]);

  const handleViewDetails = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsDetailsOpen(true);
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    form.reset({
      username: affiliate.username,
      email: affiliate.email,
      fullName: affiliate.fullName,
      isActive: affiliate.isActive,
    });
    setIsEditOpen(true);
  };

  const handleToggleStatus = (affiliate: Affiliate) => {
    toggleAffiliateStatus.mutate({
      id: affiliate.id,
      isActive: !affiliate.isActive,
    });
  };

  const onSubmitEdit = (data: EditAffiliateFormData) => {
    if (!selectedAffiliate) return;
    
    updateAffiliate.mutate({
      ...data,
      id: selectedAffiliate.id,
    });
  };

  if (isLoading) {
    return (
      <CenteredLayout>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-slate-300">Carregando afiliados...</p>
        </div>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Afiliados</h1>
            <p className="text-slate-400">Administre todos os afiliados da plataforma</p>
          </div>
          <Button 
            onClick={() => refetch()} 
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{affiliates.length}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Ativos</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {affiliates.filter(a => a.isActive).length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Inativos</p>
                  <p className="text-2xl font-bold text-red-400">
                    {affiliates.filter(a => !a.isActive).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Comissões Totais</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    R$ {affiliates.reduce((sum, a) => sum + parseFloat(a.totalCommissions || '0'), 0).toFixed(2)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nome, usuário ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Affiliates Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <span>Afiliados ({filteredAffiliates.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAffiliates.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Nome</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Cliques</TableHead>
                      <TableHead className="text-slate-300">Conversões</TableHead>
                      <TableHead className="text-slate-300">Comissões</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAffiliates.map((affiliate) => (
                      <motion.tr
                        key={affiliate.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-slate-700 hover:bg-slate-700/50"
                      >
                        <TableCell className="text-white font-medium">
                          <div>
                            <p>{affiliate.fullName || affiliate.username}</p>
                            <p className="text-slate-400 text-sm">@{affiliate.username}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{affiliate.email}</TableCell>
                        <TableCell>
                          <StatusBadge isActive={affiliate.isActive} />
                        </TableCell>
                        <TableCell className="text-slate-300">{affiliate.totalClicks || 0}</TableCell>
                        <TableCell className="text-slate-300">{affiliate.totalRegistrations || 0}</TableCell>
                        <TableCell className="text-emerald-400 font-medium">
                          R$ {affiliate.totalCommissions || '0,00'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(affiliate)}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditAffiliate(affiliate)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(affiliate)}
                              className={affiliate.isActive ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"}
                            >
                              {affiliate.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nenhum afiliado encontrado</p>
                <p className="text-slate-500 text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Detalhes do Afiliado</DialogTitle>
              <DialogDescription className="text-slate-400">
                Informações completas sobre o afiliado selecionado
              </DialogDescription>
            </DialogHeader>
            {selectedAffiliate && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Nome Completo</Label>
                    <p className="text-white font-medium">{selectedAffiliate.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Usuário</Label>
                    <p className="text-white font-medium">@{selectedAffiliate.username}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Email</Label>
                    <p className="text-white font-medium">{selectedAffiliate.email}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Status</Label>
                    <div className="mt-1">
                      <StatusBadge isActive={selectedAffiliate.isActive} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Label className="text-slate-300">Cliques</Label>
                    <p className="text-2xl font-bold text-emerald-400">{selectedAffiliate.totalClicks || 0}</p>
                  </div>
                  <div className="text-center">
                    <Label className="text-slate-300">Conversões</Label>
                    <p className="text-2xl font-bold text-blue-400">{selectedAffiliate.totalRegistrations || 0}</p>
                  </div>
                  <div className="text-center">
                    <Label className="text-slate-300">Comissões</Label>
                    <p className="text-2xl font-bold text-yellow-400">R$ {selectedAffiliate.totalCommissions || '0,00'}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Data de Cadastro</Label>
                  <p className="text-white font-medium">
                    {new Date(selectedAffiliate.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Editar Afiliado</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
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
                      <FormLabel className="text-slate-300">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-slate-700 border-slate-600 text-white" />
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
                      <FormLabel className="text-slate-300">Ativo</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditOpen(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={updateAffiliate.isPending}
                  >
                    {updateAffiliate.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </CenteredLayout>
  );
}