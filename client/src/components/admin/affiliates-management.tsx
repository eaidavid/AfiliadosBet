import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Shield, 
  ShieldOff, 
  RotateCcw, 
  Trash2,
  Calendar,
  Mail,
  CreditCard,
  TrendingUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AffiliatesManagementProps {
  onPageChange?: (page: string) => void;
}

export default function AffiliatesManagement({ onPageChange }: AffiliatesManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);

  const { data: affiliates = [] } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    retry: false,
  });

  const toggleAffiliateStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/affiliates/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Status do afiliado atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do afiliado.",
        variant: "destructive",
      });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/admin/affiliates/${id}/reset-password`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Nova senha enviada por email para o afiliado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao resetar senha do afiliado.",
        variant: "destructive",
      });
    },
  });

  const deleteAffiliate = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/affiliates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Afiliado excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      setSelectedAffiliate(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir afiliado.",
        variant: "destructive",
      });
    },
  });

  const filteredAffiliates = affiliates.filter((affiliate: any) => {
    const matchesSearch = affiliate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && affiliate.isActive) ||
                         (statusFilter === "inactive" && !affiliate.isActive);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ativo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Inativo</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Afiliados</h1>
          <p className="text-slate-400 mt-1">Administre todos os afiliados da plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-emerald-500" />
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Afiliados ({filteredAffiliates.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            Lista completa de afiliados cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Usuário</TableHead>
                  <TableHead className="text-slate-300">Nome Completo</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">CPF</TableHead>
                  <TableHead className="text-slate-300">Cadastro</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Casas</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.map((affiliate: any) => (
                  <TableRow key={affiliate.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">
                      {affiliate.username}
                    </TableCell>
                    <TableCell className="text-white">
                      {affiliate.fullName}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {affiliate.email}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {affiliate.cpf}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(affiliate.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(affiliate.isActive)}
                    </TableCell>
                    <TableCell className="text-white">
                      {affiliate.affiliateHouses || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAffiliate(affiliate)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Detalhes do Afiliado: {affiliate.fullName}
                              </DialogTitle>
                              <DialogDescription className="text-slate-400">
                                Informações completas e histórico de atividades
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-emerald-500" />
                                  <span className="text-slate-300">Email:</span>
                                  <span className="text-white">{affiliate.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-blue-500" />
                                  <span className="text-slate-300">CPF:</span>
                                  <span className="text-white">{affiliate.cpf}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-yellow-500" />
                                  <span className="text-slate-300">Membro desde:</span>
                                  <span className="text-white">
                                    {new Date(affiliate.createdAt).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                                  <span className="text-slate-300">Comissão Total:</span>
                                  <span className="text-emerald-400 font-medium">
                                    R$ {affiliate.totalCommission?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="bg-slate-700 p-3 rounded-lg">
                                  <h4 className="text-white font-medium mb-2">Estatísticas</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-300">Cliques:</span>
                                      <span className="text-white">{affiliate.totalClicks || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-300">Registros:</span>
                                      <span className="text-white">{affiliate.totalRegistrations || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-300">Depósitos:</span>
                                      <span className="text-white">{affiliate.totalDeposits || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                              <Button
                                onClick={() => resetPassword.mutate(affiliate.id)}
                                disabled={resetPassword.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Resetar Senha
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir Conta
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-800 border-slate-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      Confirmar Exclusão
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                      Tem certeza que deseja excluir a conta de {affiliate.fullName}? 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-700 text-white border-slate-600">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteAffiliate.mutate(affiliate.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAffiliateStatus.mutate({
                            id: affiliate.id,
                            isActive: !affiliate.isActive
                          })}
                          disabled={toggleAffiliateStatus.isPending}
                          className={affiliate.isActive 
                            ? "text-red-400 hover:text-red-300" 
                            : "text-green-400 hover:text-green-300"
                          }
                        >
                          {affiliate.isActive ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredAffiliates.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhum afiliado encontrado</p>
              <p className="text-slate-500 text-sm">
                {searchTerm || statusFilter !== "all" 
                  ? "Tente ajustar os filtros de busca"
                  : "Aguarde os primeiros afiliados se cadastrarem"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}