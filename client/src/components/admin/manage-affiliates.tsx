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
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Affiliate {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  lastAccess?: string;
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommissions: string;
  houses: string[];
}

interface AffiliateDetails {
  personalData: Record<string, any>;
  performance: Array<{
    houseName: string;
    clicks: number;
    registrations: number;
    deposits: number;
    totalRevenue: number;
    events: Record<string, number>;
  }>;
  commissions: Array<{
    id: number;
    date: string;
    type: string;
    amount: string;
    status: string;
    houseName: string;
    linkId: number;
    postbackData?: any;
  }>;
  links: Array<{
    id: number;
    houseName: string;
    url: string;
    isActive: boolean;
    createdAt: string;
  }>;
}

interface ManageAffiliatesProps {
  onPageChange?: (page: string) => void;
}

export default function ManageAffiliates({ onPageChange }: ManageAffiliatesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [houseFilter, setHouseFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  // Estados para modal de detalhes
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<number | null>(null);
  const [detailsTab, setDetailsTab] = useState("personal");

  // Query para listar afiliados
  const { data: affiliatesData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/affiliates", searchTerm, statusFilter, houseFilter, dateFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (houseFilter !== "all") params.append("house", houseFilter);
        if (dateFilter) params.append("date", dateFilter);
        
        const response = await fetch(`/api/admin/affiliates?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Garantir que sempre retornamos um array
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erro ao carregar afiliados:', error);
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const affiliates = affiliatesData || [];

  // Query para casas de apostas (para filtro)
  const { data: houses = [] } = useQuery({
    queryKey: ["/api/betting-houses"],
  });

  // Query para detalhes do afiliado
  const { data: affiliateDetails } = useQuery({
    queryKey: ["/api/admin/affiliate-details", selectedAffiliateId],
    queryFn: async () => {
      if (!selectedAffiliateId) return null;
      const response = await fetch(`/api/admin/affiliate-details/${selectedAffiliateId}`);
      return response.json();
    },
    enabled: !!selectedAffiliateId,
  });

  // Mutations para ações administrativas
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/admin/affiliate/${id}/status`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "Status atualizado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/admin/affiliate/${id}/reset-password`);
    },
    onSuccess: () => {
      toast({ title: "Link de redefinição enviado por email" });
    },
    onError: () => {
      toast({ title: "Erro ao enviar link de redefinição", variant: "destructive" });
    },
  });

  const clearAffiliationsMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/affiliate/${id}/affiliations`);
    },
    onSuccess: () => {
      toast({ title: "Afiliações removidas com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-details", selectedAffiliateId] });
    },
    onError: () => {
      toast({ title: "Erro ao remover afiliações", variant: "destructive" });
    },
  });

  const updateCommissionStatusMutation = useMutation({
    mutationFn: async ({ commissionId, status }: { commissionId: number; status: string }) => {
      return apiRequest("PUT", `/api/admin/commission/${commissionId}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status da comissão atualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-details", selectedAffiliateId] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar comissão", variant: "destructive" });
    },
  });

  // Filtrar afiliados
  const filteredAffiliates = affiliates.filter((affiliate: Affiliate) => {
    const matchesSearch = affiliate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && affiliate.isActive) ||
                         (statusFilter === "inactive" && !affiliate.isActive);
                         
    const matchesHouse = houseFilter === "all" || affiliate.houses.includes(houseFilter);
    
    return matchesSearch && matchesStatus && matchesHouse;
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

  const getCommissionStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pago":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "pendente":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "aprovado":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "rejeitado":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderPersonalDataTab = () => {
    if (!affiliateDetails?.personalData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(affiliateDetails.personalData).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label className="text-slate-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <div className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white">
                {typeof value === "boolean" ? (value ? "Sim" : "Não") : 
                 typeof value === "object" ? JSON.stringify(value, null, 2) :
                 String(value || "N/A")}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => toggleStatusMutation.mutate({
              id: selectedAffiliateId!,
              isActive: !affiliateDetails.personalData.isActive
            })}
            variant={affiliateDetails.personalData.isActive ? "destructive" : "default"}
            disabled={toggleStatusMutation.isPending}
          >
            {affiliateDetails.personalData.isActive ? (
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
            onClick={() => resetPasswordMutation.mutate(selectedAffiliateId!)}
            variant="outline"
            disabled={resetPasswordMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Redefinir Senha
          </Button>

          <Button
            onClick={() => clearAffiliationsMutation.mutate(selectedAffiliateId!)}
            variant="destructive"
            disabled={clearAffiliationsMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Afiliações
          </Button>
        </div>

        {affiliateDetails.links && affiliateDetails.links.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Links de Afiliado</h3>
            <div className="space-y-2">
              {affiliateDetails.links.map((link) => (
                <div key={link.id} className="p-3 bg-slate-700 border border-slate-600 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{link.houseName}</p>
                      <p className="text-slate-400 text-sm break-all">{link.url}</p>
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
    if (!affiliateDetails?.performance) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Cliques</p>
                  <p className="text-2xl font-bold text-white">
                    {affiliateDetails.performance.reduce((sum, p) => sum + p.clicks, 0)}
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
                    {affiliateDetails.performance.reduce((sum, p) => sum + p.registrations, 0)}
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
                    {affiliateDetails.performance.reduce((sum, p) => sum + p.deposits, 0)}
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
                  <p className="text-slate-400 text-sm">Receita Total</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    R$ {affiliateDetails.performance.reduce((sum, p) => sum + p.totalRevenue, 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Casa</TableHead>
              <TableHead className="text-slate-300">Cliques</TableHead>
              <TableHead className="text-slate-300">Registros</TableHead>
              <TableHead className="text-slate-300">Depósitos</TableHead>
              <TableHead className="text-slate-300">Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliateDetails.performance.map((perf, index) => (
              <TableRow key={index} className="border-slate-700">
                <TableCell className="text-white font-medium">{perf.houseName}</TableCell>
                <TableCell className="text-slate-300">{perf.clicks}</TableCell>
                <TableCell className="text-slate-300">{perf.registrations}</TableCell>
                <TableCell className="text-slate-300">{perf.deposits}</TableCell>
                <TableCell className="text-emerald-400">R$ {perf.totalRevenue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderCommissionsTab = () => {
    if (!affiliateDetails?.commissions) return null;

    const totalCommissions = affiliateDetails.commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const paidCommissions = affiliateDetails.commissions
      .filter(c => c.status.toLowerCase() === "pago")
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const pendingCommissions = affiliateDetails.commissions
      .filter(c => c.status.toLowerCase() === "pendente")
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    return (
      <div className="space-y-6">
        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total Acumulado</p>
              <p className="text-2xl font-bold text-white">R$ {totalCommissions.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total Pago</p>
              <p className="text-2xl font-bold text-emerald-500">R$ {paidCommissions.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Pendente</p>
              <p className="text-2xl font-bold text-yellow-500">R$ {pendingCommissions.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">A Pagar</p>
              <p className="text-2xl font-bold text-orange-500">
                R$ {(totalCommissions - paidCommissions).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Histórico Detalhado */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Histórico de Comissões</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Data</TableHead>
                <TableHead className="text-slate-300">Tipo</TableHead>
                <TableHead className="text-slate-300">Valor</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Casa</TableHead>
                <TableHead className="text-slate-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliateDetails.commissions.map((commission) => (
                <TableRow key={commission.id} className="border-slate-700">
                  <TableCell className="text-slate-300">
                    {new Date(commission.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-slate-300">{commission.type}</TableCell>
                  <TableCell className="text-emerald-400">R$ {parseFloat(commission.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getCommissionStatusIcon(commission.status)}
                      <span className="text-slate-300">{commission.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{commission.houseName}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {commission.status.toLowerCase() === "pendente" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateCommissionStatusMutation.mutate({
                              commissionId: commission.id,
                              status: "aprovado"
                            })}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateCommissionStatusMutation.mutate({
                              commissionId: commission.id,
                              status: "rejeitado"
                            })}
                          >
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {commission.status.toLowerCase() === "aprovado" && (
                        <Button
                          size="sm"
                          onClick={() => updateCommissionStatusMutation.mutate({
                            commissionId: commission.id,
                            status: "pago"
                          })}
                        >
                          Marcar como Pago
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Afiliados</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div className="space-y-2">
              <Label className="text-slate-300">Casa de Apostas</Label>
              <Select value={houseFilter} onValueChange={setHouseFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {houses.map((house: any) => (
                    <SelectItem key={house.id} value={house.name}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Data de Cadastro</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Afiliados */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Afiliados Cadastrados ({filteredAffiliates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Carregando...</div>
          ) : filteredAffiliates.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Nenhum afiliado encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Usuário</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Cadastro</TableHead>
                  <TableHead className="text-slate-300">Conversões</TableHead>
                  <TableHead className="text-slate-300">Comissões</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.map((affiliate: Affiliate) => (
                  <TableRow key={affiliate.id} className="border-slate-700">
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{affiliate.username}</p>
                        <p className="text-slate-400 text-sm">{affiliate.fullName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{affiliate.email}</TableCell>
                    <TableCell>{getStatusBadge(affiliate.isActive)}</TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(affiliate.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="text-sm">
                        <div>Cliques: {affiliate.totalClicks}</div>
                        <div>Registros: {affiliate.totalRegistrations}</div>
                        <div>Depósitos: {affiliate.totalDeposits}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-emerald-400">
                      R$ {parseFloat(affiliate.totalCommissions || "0").toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedAffiliateId(affiliate.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Detalhes do Afiliado: {affiliate.username}
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