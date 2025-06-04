import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Building2, ExternalLink, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/admin/sidebar";

// Schema para validação do formulário
const houseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  baseUrl: z.string().url("URL deve ser válida"),
  logoUrl: z.string().url("URL do logo deve ser válida").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type HouseFormData = z.infer<typeof houseSchema>;

interface BettingHouse {
  id: number;
  name: string;
  description?: string;
  baseUrl: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    affiliateLinks: number;
    conversions: number;
  };
}

export default function AdminCasas() {
  const [currentPage, setCurrentPage] = useState("houses");
  const [editingHouse, setEditingHouse] = useState<BettingHouse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<HouseFormData>({
    resolver: zodResolver(houseSchema),
    defaultValues: {
      name: "",
      description: "",
      baseUrl: "",
      logoUrl: "",
      isActive: true,
    },
  });

  // Query para buscar casas
  const { data: houses = [], isLoading } = useQuery<BettingHouse[]>({
    queryKey: ["/api/admin/houses"],
    refetchInterval: 30000,
  });

  // Mutation para criar/editar casa
  const createHouseMutation = useMutation({
    mutationFn: async (data: HouseFormData) => {
      const url = editingHouse 
        ? `/api/admin/houses/${editingHouse.id}`
        : "/api/admin/houses";
      
      const response = await fetch(url, {
        method: editingHouse ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar casa");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/houses"] });
      setIsDialogOpen(false);
      setEditingHouse(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: editingHouse 
          ? "Casa atualizada com sucesso" 
          : "Casa criada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar casa
  const deleteHouseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/houses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar casa");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/houses"] });
      toast({
        title: "Sucesso",
        description: "Casa deletada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === "dashboard") {
      window.location.href = "/admin";
    } else if (page === "manage") {
      window.location.href = "/admin/manage";
    } else if (page === "leads") {
      window.location.href = "/admin/leads";
    }
  };

  const handleEdit = (house: BettingHouse) => {
    setEditingHouse(house);
    form.reset({
      name: house.name,
      description: house.description || "",
      baseUrl: house.baseUrl,
      logoUrl: house.logoUrl || "",
      isActive: house.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta casa?")) {
      deleteHouseMutation.mutate(id);
    }
  };

  const onSubmit = (data: HouseFormData) => {
    createHouseMutation.mutate(data);
  };

  const openCreateDialog = () => {
    setEditingHouse(null);
    form.reset({
      name: "",
      description: "",
      baseUrl: "",
      logoUrl: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <div className="bg-slate-900/30 backdrop-blur-sm border-b border-slate-700/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Casas de Apostas</h1>
              <p className="text-slate-400 mt-1">Gerencie as casas de apostas parceiras</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openCreateDialog}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Casa
                </Button>
              </DialogTrigger>
              
              <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingHouse ? "Editar Casa" : "Nova Casa de Apostas"}
                  </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Casa</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ex: Bet365"
                                className="bg-slate-800 border-slate-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="baseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Base</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://exemplo.com"
                                className="bg-slate-800 border-slate-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Logo (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://exemplo.com/logo.png"
                              className="bg-slate-800 border-slate-600 text-white"
                            />
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
                          <FormLabel>Descrição (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Descrição da casa de apostas..."
                              className="bg-slate-800 border-slate-600 text-white"
                              rows={3}
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
                        <FormItem className="flex items-center justify-between rounded-lg border border-slate-600 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Status Ativo</FormLabel>
                            <div className="text-sm text-slate-400">
                              Casa disponível para criação de links de afiliados
                            </div>
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
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createHouseMutation.isPending}
                        className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                      >
                        {createHouseMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total de Casas</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.length}
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
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Casas Ativas</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.filter(h => h.isActive).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-emerald-400" />
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
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total de Links</p>
                      <p className="text-2xl font-bold text-white">
                        {houses.reduce((acc, house) => acc + (house._count?.affiliateLinks || 0), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Houses Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Lista de Casas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Nome</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">URL</TableHead>
                        <TableHead className="text-slate-300">Links</TableHead>
                        <TableHead className="text-slate-300">Conversões</TableHead>
                        <TableHead className="text-slate-300">Criada em</TableHead>
                        <TableHead className="text-slate-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                            Carregando casas...
                          </TableCell>
                        </TableRow>
                      ) : houses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                            Nenhuma casa encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        houses.map((house) => (
                          <TableRow key={house.id} className="border-slate-700">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {house.logoUrl && (
                                  <img
                                    src={house.logoUrl}
                                    alt={house.name}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <p className="text-white font-medium">{house.name}</p>
                                  {house.description && (
                                    <p className="text-slate-400 text-sm truncate max-w-48">
                                      {house.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={house.isActive ? "default" : "secondary"}
                                className={
                                  house.isActive
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                    : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                                }
                              >
                                {house.isActive ? "Ativa" : "Inativa"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <a
                                href={house.baseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <span className="max-w-32 truncate">{house.baseUrl}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {house._count?.affiliateLinks || 0}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {house._count?.conversions || 0}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {new Date(house.createdAt).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(house)}
                                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(house.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
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
    </div>
  );
}