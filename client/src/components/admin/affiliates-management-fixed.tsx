import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Eye, 
  Shield, 
  ShieldOff, 
  RotateCcw, 
  TrendingUp,
  MousePointer,
  UserPlus,
  DollarSign,
  BarChart3,
  Target,
  Activity,
  Clock,
  Percent,
  Building2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AffiliatesManagementProps {
  onPageChange?: (page: string) => void;
}

// Modal de detalhes do afiliado corrigido
function AffiliateDetailsModal({ affiliate, isOpen, onClose }: { 
  affiliate: any; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const { data: affiliateDetails = {}, isLoading: detailsLoading } = useQuery({
    queryKey: ["/api/admin/affiliate", affiliate?.id, "details"],
    enabled: !!affiliate?.id && isOpen,
  });

  if (!affiliate) return null;

  // Extrair dados do endpoint consolidado
  const stats = affiliateDetails?.stats || {};
  const conversions = affiliateDetails?.conversions || [];
  const links = affiliateDetails?.links || [];

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue || 0);
  };

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('pt-BR');

  const getTypeBadge = (type: string) => {
    const colors = {
      registration: 'bg-green-500',
      deposit: 'bg-blue-500',
      first_deposit: 'bg-blue-600',
      profit: 'bg-purple-500',
      click: 'bg-yellow-500'
    };
    const labels = {
      registration: 'Cadastro',
      deposit: 'Depósito',
      first_deposit: 'Primeiro Depósito',
      profit: 'Lucro',
      click: 'Clique'
    };
    
    const color = colors[type as keyof typeof colors] || 'bg-gray-500';
    const label = labels[type as keyof typeof labels] || type;
    
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  if (detailsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <div className="flex items-center justify-center p-8">
            <div className="text-white">Carregando dados do afiliado...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-emerald-500" />
            Relatório Detalhado - {affiliate.fullName}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Performance completa e histórico de conversões do afiliado
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="overview" className="text-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="conversions" className="text-white">Conversões</TabsTrigger>
            <TabsTrigger value="links" className="text-white">Links</TabsTrigger>
          </TabsList>

          {/* ABA: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-blue-400">Cliques Totais</h3>
                    <MousePointer className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {stats?.totalClicks || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-green-400">Registros</h3>
                    <UserPlus className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {stats?.totalRegistrations || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-purple-400">Depósitos</h3>
                    <DollarSign className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    {stats?.totalDeposits || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-emerald-400">Comissão Total</h3>
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(stats?.totalCommission || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-300">Volume Total</h3>
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(stats?.totalVolume || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-300">Taxa de Conversão</h3>
                    <Percent className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {stats?.conversionRate || 0}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-300">Links Ativos</h3>
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {links?.filter(link => link.isActive)?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA: Conversões */}
          <TabsContent value="conversions" className="space-y-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Conversões</CardTitle>
                <CardDescription className="text-slate-400">
                  Todas as conversões registradas para este afiliado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Nenhuma conversão encontrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-600">
                          <TableHead className="text-slate-300">Data</TableHead>
                          <TableHead className="text-slate-300">Tipo</TableHead>
                          <TableHead className="text-slate-300">Valor</TableHead>
                          <TableHead className="text-slate-300">Comissão</TableHead>
                          <TableHead className="text-slate-300">Casa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conversions.map((conversion: any) => (
                          <TableRow key={conversion.id} className="border-slate-700">
                            <TableCell className="text-slate-300">
                              {formatDate(conversion.convertedAt)}
                            </TableCell>
                            <TableCell>
                              {getTypeBadge(conversion.type)}
                            </TableCell>
                            <TableCell className="text-white">
                              {formatCurrency(conversion.amount || 0)}
                            </TableCell>
                            <TableCell className="text-emerald-400">
                              {formatCurrency(conversion.commission || 0)}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              Casa {conversion.houseId}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: Links */}
          <TabsContent value="links" className="space-y-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Links de Afiliação</CardTitle>
                <CardDescription className="text-slate-400">
                  Links de afiliação ativos por casa de apostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Nenhum link encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-600">
                          <TableHead className="text-slate-300">Casa</TableHead>
                          <TableHead className="text-slate-300">Link</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Criado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {links.map((link: any) => (
                          <TableRow key={link.id} className="border-slate-700">
                            <TableCell className="text-white font-medium">
                              {link.houseName || `Casa ${link.houseId}`}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="max-w-xs truncate">
                                {link.generatedUrl}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={link.isActive ? 'default' : 'secondary'}>
                                {link.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {formatDate(link.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function AffiliatesManagementFixed({ onPageChange }: AffiliatesManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: affiliates = [], isLoading: affiliatesLoading } = useQuery({
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
        title: "Senha redefinida!",
        description: "Nova senha enviada por email.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao redefinir senha.",
        variant: "destructive",
      });
    },
  });

  const safeAffiliates = Array.isArray(affiliates) ? affiliates : [];

  const filteredAffiliates = safeAffiliates.filter((affiliate: any) => {
    const matchesSearch = affiliate.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && affiliate.isActive) ||
                         (statusFilter === "inactive" && !affiliate.isActive);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 text-white">Ativo</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">Inativo</Badge>
    );
  };

  if (affiliatesLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gerenciamento de Afiliados
          </h1>
          <p className="text-slate-400">
            Lista completa de afiliados cadastrados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, usuário ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Afiliados */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
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
                      {affiliate.fullName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {affiliate.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {affiliate.cpf || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {affiliate.createdAt ? new Date(affiliate.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(affiliate.isActive)}
                    </TableCell>
                    <TableCell className="text-white">
                      {affiliate.affiliateHouses || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAffiliate(affiliate);
                            setIsDetailsOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAffiliateStatus.mutate({ 
                            id: affiliate.id, 
                            isActive: !affiliate.isActive 
                          })}
                          className={affiliate.isActive ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                        >
                          {affiliate.isActive ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetPassword.mutate(affiliate.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <RotateCcw className="h-4 w-4" />
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

      {/* Modal de Detalhes Corrigido */}
      <AffiliateDetailsModal 
        affiliate={selectedAffiliate}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAffiliate(null);
        }}
      />
    </div>
  );
}