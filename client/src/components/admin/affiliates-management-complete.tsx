import { useState, useMemo } from "react";
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
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  FileText,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
  Edit,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AffiliatesManagementProps {
  onPageChange?: (page: string) => void;
}

// Componente de modal para detalhes completos do afiliado
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

  const stats = affiliateDetails?.stats || {};
  const conversions = affiliateDetails?.conversions || [];
  const links = affiliateDetails?.links || [];
  const paymentInfo = affiliateDetails?.paymentInfo;

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue || 0);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTypeBadge = (type: string) => {
    const config = {
      registration: { color: 'bg-green-500', label: 'Cadastro' },
      deposit: { color: 'bg-blue-500', label: 'Depósito' },
      first_deposit: { color: 'bg-blue-600', label: 'Primeiro Depósito' },
      profit: { color: 'bg-purple-500', label: 'Lucro' },
      click: { color: 'bg-yellow-500', label: 'Clique' }
    };
    
    const { color, label } = config[type as keyof typeof config] || { color: 'bg-gray-500', label: type };
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  if (detailsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-slate-800 border-slate-700">
          <div className="flex items-center justify-center p-8">
            <div className="text-white">Carregando dados completos do afiliado...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-emerald-500" />
            Relatório Completo - {affiliate.full_name || affiliate.username}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Análise detalhada de performance, conversões e dados do afiliado
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="overview" className="text-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="profile" className="text-white">Perfil Completo</TabsTrigger>
            <TabsTrigger value="conversions" className="text-white">Conversões</TabsTrigger>
            <TabsTrigger value="links" className="text-white">Links & Casas</TabsTrigger>
          </TabsList>

          {/* ABA: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-blue-400">Cliques Totais</h3>
                    <MousePointer className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {stats?.totalClicks || 0}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Todos os cliques nos links</p>
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
                  <p className="text-xs text-slate-400 mt-2">Novos usuários captados</p>
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
                  <p className="text-xs text-slate-400 mt-2">Depósitos confirmados</p>
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
                  <p className="text-xs text-slate-400 mt-2">Ganhos acumulados</p>
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
                  <p className="text-xs text-slate-400 mt-2">Movimentação financeira</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-300">Taxa de Conversão</h3>
                    <Target className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {stats?.conversionRate || 0}%
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Cliques para registros</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-300">Links Ativos</h3>
                    <Activity className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {links?.filter(link => link.isActive)?.length || 0}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Links funcionais</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA: Perfil Completo */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400">Nome Completo</label>
                      <p className="text-white font-medium">{affiliate.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Username</label>
                      <p className="text-white font-medium">{affiliate.username}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">CPF</label>
                      <p className="text-white font-medium">{affiliate.cpf || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Data de Nascimento</label>
                      <p className="text-white font-medium">{formatDate(affiliate.birth_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-white font-medium">{affiliate.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </label>
                    <p className="text-white font-medium">{affiliate.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localização
                    </label>
                    <p className="text-white font-medium">
                      {[affiliate.city, affiliate.state, affiliate.country].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Status da Conta */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Status da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400">Status</label>
                      <div className="mt-1">
                        <Badge variant={affiliate.is_active ? 'default' : 'secondary'}>
                          {affiliate.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Tipo</label>
                      <p className="text-white font-medium capitalize">{affiliate.role || 'user'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Membro desde</label>
                      <p className="text-white font-medium">{formatDate(affiliate.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Última atualização</label>
                      <p className="text-white font-medium">{formatDate(affiliate.updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Financeiras */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Dados Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">PIX (Recebimento)</label>
                    <p className="text-white font-medium">{paymentInfo?.pix_key || 'Não cadastrado'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400">Total Ganho</label>
                      <p className="text-emerald-400 font-bold text-lg">
                        {formatCurrency(stats?.totalCommission || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Volume Gerado</label>
                      <p className="text-blue-400 font-bold text-lg">
                        {formatCurrency(stats?.totalVolume || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA: Conversões */}
          <TabsContent value="conversions" className="space-y-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Histórico Completo de Conversões</CardTitle>
                <CardDescription className="text-slate-400">
                  Todas as conversões registradas com detalhes completos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Nenhuma conversão encontrada</p>
                    <p className="text-slate-500 text-sm">Este afiliado ainda não gerou conversões</p>
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
                          <TableHead className="text-slate-300">Cliente ID</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conversions.map((conversion: any) => (
                          <TableRow key={conversion.id} className="border-slate-700 hover:bg-slate-600/20">
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {formatDate(conversion.converted_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getTypeBadge(conversion.type)}
                            </TableCell>
                            <TableCell className="text-white font-medium">
                              {formatCurrency(conversion.amount || 0)}
                            </TableCell>
                            <TableCell className="text-emerald-400 font-medium">
                              {formatCurrency(conversion.commission || 0)}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                Casa {conversion.house_id}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-400 font-mono text-sm">
                              {conversion.customer_id || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                Confirmado
                              </Badge>
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
                <CardTitle className="text-white">Links de Afiliação por Casa</CardTitle>
                <CardDescription className="text-slate-400">
                  Todos os links de afiliação ativos e inativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Nenhum link encontrado</p>
                    <p className="text-slate-500 text-sm">Este afiliado ainda não possui links gerados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-600">
                          <TableHead className="text-slate-300">Casa de Apostas</TableHead>
                          <TableHead className="text-slate-300">Link Gerado</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Criado em</TableHead>
                          <TableHead className="text-slate-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {links.map((link: any) => (
                          <TableRow key={link.id} className="border-slate-700 hover:bg-slate-600/20">
                            <TableCell className="text-white font-medium">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-orange-400" />
                                {link.houseName || `Casa ${link.houseId}`}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="max-w-md truncate font-mono text-sm bg-slate-800 p-2 rounded">
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
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(link.generatedUrl)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Copiar
                              </Button>
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

export default function AffiliatesManagementComplete({ onPageChange }: AffiliatesManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Buscar todos os afiliados
  const { data: affiliates = [], isLoading: affiliatesLoading, error } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    retry: false,
  });

  // Mutations para ações dos afiliados
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



  const deleteAffiliate = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/affiliates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Afiliado removido!",
        description: "Afiliado removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover afiliado.",
        variant: "destructive",
      });
    },
  });

  // Filtrar e ordenar afiliados
  const filteredAndSortedAffiliates = useMemo(() => {
    if (!Array.isArray(affiliates)) return [];

    let filtered = affiliates.filter((affiliate: any) => {
      const matchesSearch = 
        affiliate.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.cpf?.includes(searchTerm);

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && affiliate.is_active) ||
        (statusFilter === "inactive" && !affiliate.is_active);

      const matchesRole = 
        roleFilter === "all" || 
        affiliate.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });

    // Ordenação
    filtered.sort((a: any, b: any) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Tratar datas
      if (sortBy.includes('_at')) {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Tratar strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [affiliates, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 text-white">Ativo</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">Inativo</Badge>
    );
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">Erro ao carregar afiliados. Tente recarregar a página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gerenciamento Completo de Afiliados
          </h1>
          <p className="text-slate-400">
            {filteredAndSortedAffiliates.length} de {Array.isArray(affiliates) ? affiliates.length : 0} afiliados
          </p>
        </div>
        <Button
          onClick={() => onPageChange?.('create-affiliate')}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Afiliado
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Afiliados</p>
                <p className="text-2xl font-bold text-white">{Array.isArray(affiliates) ? affiliates.length : 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Ativos</p>
                <p className="text-2xl font-bold text-white">
                  {Array.isArray(affiliates) ? affiliates.filter((a: any) => a.is_active).length : 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Inativos</p>
                <p className="text-2xl font-bold text-white">
                  {Array.isArray(affiliates) ? affiliates.filter((a: any) => !a.is_active).length : 0}
                </p>
              </div>
              <ShieldOff className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Novos (30 dias)</p>
                <p className="text-2xl font-bold text-white">
                  {Array.isArray(affiliates) ? 
                    affiliates.filter((a: any) => {
                      const createdAt = new Date(a.created_at);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return createdAt > thirtyDaysAgo;
                    }).length : 0
                  }
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email, usuário ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="affiliate">Afiliado</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setRoleFilter("all");
                  setSortBy("created_at");
                  setSortOrder("desc");
                }}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
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
                  <TableHead 
                    className="text-slate-300 cursor-pointer hover:text-white"
                    onClick={() => handleSort('username')}
                  >
                    <div className="flex items-center gap-2">
                      Usuário
                      {sortBy === 'username' && (
                        sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-slate-300 cursor-pointer hover:text-white"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center gap-2">
                      Nome Completo
                      {sortBy === 'full_name' && (
                        sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-slate-300 cursor-pointer hover:text-white"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      Email
                      {sortBy === 'email' && (
                        sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-300">CPF</TableHead>
                  <TableHead 
                    className="text-slate-300 cursor-pointer hover:text-white"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      Cadastro
                      {sortBy === 'created_at' && (
                        sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Tipo</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAffiliates.map((affiliate: any) => (
                  <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-600/20">
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(affiliate.full_name || affiliate.username)?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        {affiliate.username}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {affiliate.full_name || affiliate.fullName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {affiliate.email || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono text-sm">
                      {affiliate.cpf || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {affiliate.created_at ? new Date(affiliate.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(affiliate.is_active)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {affiliate.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* Ver Detalhes */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAffiliate(affiliate);
                            setIsDetailsOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                          title="Ver detalhes completos"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Toggle Status */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAffiliateStatus.mutate({ 
                            id: affiliate.id, 
                            isActive: !affiliate.is_active 
                          })}
                          className={affiliate.is_active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                          title={affiliate.is_active ? "Desativar" : "Ativar"}
                        >
                          {affiliate.is_active ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>



                        {/* Deletar */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover este afiliado? Esta ação não pode ser desfeita.')) {
                              deleteAffiliate.mutate(affiliate.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-400"
                          title="Remover afiliado"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAndSortedAffiliates.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nenhum afiliado encontrado</p>
                <p className="text-slate-500 text-sm">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Cadastre o primeiro afiliado para começar'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes Completos */}
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