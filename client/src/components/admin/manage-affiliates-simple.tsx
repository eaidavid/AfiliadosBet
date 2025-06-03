import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  UserX, 
  RotateCcw, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ManageAffiliatesProps {
  onPageChange?: (page: string) => void;
}

export default function ManageAffiliatesSimple({ onPageChange }: ManageAffiliatesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Estados para modal de detalhes
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [detailsTab, setDetailsTab] = useState("personal");

  // Query para listar usuários afiliados (simplificada)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        
        // Filtrar apenas usuários normais (não admins)
        return Array.isArray(data) ? data.filter((user: any) => user.role === 'user') : [];
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        return [];
      }
    },
    retry: 2,
  });

  // Query para detalhes de um usuário específico
  const { data: userDetails } = useQuery({
    queryKey: ["/api/user", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      try {
        const response = await fetch(`/api/user/${selectedUserId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Erro ao carregar detalhes do usuário:', error);
        return null;
      }
    },
    enabled: !!selectedUserId,
  });

  // Query para estatísticas do usuário
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      try {
        const response = await fetch(`/api/user/stats/${selectedUserId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Erro ao carregar estatísticas do usuário:', error);
        return {
          totalClicks: 0,
          totalRegistrations: 0,
          totalDeposits: 0,
          totalCommission: '0.00',
          conversionRate: 0
        };
      }
    },
    enabled: !!selectedUserId,
  });

  // Query para links do usuário
  const { data: userLinks = [] } = useQuery({
    queryKey: ["/api/user/links", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      try {
        const response = await fetch(`/api/user/links/${selectedUserId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erro ao carregar links do usuário:', error);
        return [];
      }
    },
    enabled: !!selectedUserId,
  });

  // Mutations para ações administrativas
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/admin/user/${id}/status`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "Status atualizado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/admin/user/${id}/reset-password`);
    },
    onSuccess: () => {
      toast({ title: "Link de redefinição enviado por email" });
    },
    onError: () => {
      toast({ title: "Erro ao enviar link de redefinição", variant: "destructive" });
    },
  });

  // Filtrar usuários
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive) ||
                         (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        <UserCheck className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <UserX className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const renderPersonalDataTab = () => {
    if (!userDetails) {
      return (
        <div className="text-center py-8 text-slate-400">
          Carregando dados pessoais...
        </div>
      );
    }

    const personalFields = [
      { key: 'id', label: 'ID', value: userDetails.id },
      { key: 'username', label: 'Nome de Usuário', value: userDetails.username },
      { key: 'email', label: 'Email', value: userDetails.email },
      { key: 'fullName', label: 'Nome Completo', value: userDetails.fullName },
      { key: 'cpf', label: 'CPF', value: userDetails.cpf },
      { key: 'phone', label: 'Telefone', value: userDetails.phone },
      { key: 'birthDate', label: 'Data de Nascimento', value: userDetails.birthDate },
      { key: 'city', label: 'Cidade', value: userDetails.city },
      { key: 'state', label: 'Estado', value: userDetails.state },
      { key: 'country', label: 'País', value: userDetails.country },
      { key: 'isActive', label: 'Status', value: userDetails.isActive ? 'Ativo' : 'Inativo' },
      { key: 'createdAt', label: 'Data de Cadastro', value: userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString('pt-BR') : 'N/A' },
      { key: 'lastAccess', label: 'Último Acesso', value: userDetails.lastAccess ? new Date(userDetails.lastAccess).toLocaleDateString('pt-BR') : 'N/A' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-slate-300">{field.label}</Label>
              <div className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white">
                {field.value || "N/A"}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => toggleStatusMutation.mutate({
              id: userDetails.id,
              isActive: !userDetails.isActive
            })}
            variant={userDetails.isActive ? "destructive" : "default"}
            disabled={toggleStatusMutation.isPending}
          >
            {userDetails.isActive ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Desativar Conta
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Ativar Conta
              </>
            )}
          </Button>

          <Button
            onClick={() => resetPasswordMutation.mutate(userDetails.id)}
            variant="outline"
            disabled={resetPasswordMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Redefinir Senha
          </Button>
        </div>

        {userLinks && userLinks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Links de Afiliado</h3>
            <div className="space-y-2">
              {userLinks.map((link: any) => (
                <div key={link.id} className="p-3 bg-slate-700 border border-slate-600 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{link.houseName || `Casa ID: ${link.houseId}`}</p>
                      <p className="text-slate-400 text-sm break-all">{link.generatedUrl}</p>
                    </div>
                    <Badge variant={link.isActive ? "default" : "secondary"}>
                      {link.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!userStats) {
      return (
        <div className="text-center py-8 text-slate-400">
          Carregando estatísticas de desempenho...
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Cliques</p>
                  <p className="text-2xl font-bold text-white">
                    {userStats.totalClicks || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Registros</p>
                  <p className="text-2xl font-bold text-white">
                    {userStats.totalRegistrations || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Depósitos</p>
                  <p className="text-2xl font-bold text-white">
                    {userStats.totalDeposits || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Comissões</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    R$ {parseFloat(userStats.totalCommission || '0').toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-4">Taxa de Conversão</h3>
            <div className="text-2xl font-bold text-blue-500">
              {userStats.conversionRate ? `${userStats.conversionRate.toFixed(2)}%` : '0.00%'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCommissionsTab = () => {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Funcionalidade de comissões em desenvolvimento. 
            As estatísticas básicas estão disponíveis na aba de Desempenho.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciar Afiliados
          </h1>
          <p className="text-slate-400 mt-1">Administre todos os afiliados cadastrados no sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Nome, email ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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

      {/* Tabela de Afiliados */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Afiliados Cadastrados ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Nenhum afiliado encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Usuário</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Cadastro</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-slate-700">
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-slate-400 text-sm">{user.fullName || 'Nome não informado'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                    <TableCell className="text-slate-300">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Detalhes do Afiliado: {user.username}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Informações completas e ações administrativas
                            </DialogDescription>
                          </DialogHeader>

                          <Tabs value={detailsTab} onValueChange={setDetailsTab}>
                            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                              <TabsTrigger value="personal" className="text-slate-300">
                                Dados Pessoais
                              </TabsTrigger>
                              <TabsTrigger value="performance" className="text-slate-300">
                                Desempenho
                              </TabsTrigger>
                              <TabsTrigger value="commissions" className="text-slate-300">
                                Comissões
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
                              {renderPersonalDataTab()}
                            </TabsContent>

                            <TabsContent value="performance">
                              {renderPerformanceTab()}
                            </TabsContent>

                            <TabsContent value="commissions">
                              {renderCommissionsTab()}
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}