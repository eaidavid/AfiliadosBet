import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Eye, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { ViewAffiliateModal } from '@/components/admin/view-affiliate-modal';
import { DeleteAffiliateDialog } from '@/components/admin/delete-affiliate-dialog';

const SIDEBAR_PROPS = {
  currentPage: 'manage',
  onPageChange: () => {}
};

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

export default function AdminManageSimple() {
  const [search, setSearch] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<number | null>(null);
  const [affiliateToDelete, setAffiliateToDelete] = useState<Affiliate | null>(null);

  // Fetch affiliates
  const { data: affiliates = [], isLoading, error } = useQuery<Affiliate[]>({
    queryKey: ['/api/admin/affiliates', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/admin/affiliates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch affiliates');
      return response.json();
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Mutation para deletar afiliado
  const deleteAffiliateMutation = useMutation({
    mutationFn: async (affiliateId: number) => {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete affiliate');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Afiliado excluído com sucesso!",
      });
      setDeleteDialogOpen(false);
      setAffiliateToDelete(null);
      // Refetch a lista de afiliados
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir afiliado: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    }
  });

  // Função para visualizar afiliado
  const handleViewAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliateId(affiliate.id);
    setViewModalOpen(true);
  };

  // Função para editar afiliado
  const handleEditAffiliate = (affiliateId: number) => {
    setLocation(`/admin/manage/${affiliateId}/edit`);
  };

  // Função para excluir afiliado
  const handleDeleteAffiliate = (affiliate: Affiliate) => {
    setAffiliateToDelete(affiliate);
    setDeleteDialogOpen(true);
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = () => {
    if (affiliateToDelete) {
      deleteAffiliateMutation.mutate(affiliateToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AdminSidebar {...SIDEBAR_PROPS} />
        <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-slate-400 text-sm sm:text-base">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AdminSidebar {...SIDEBAR_PROPS} />
        <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-red-400 text-sm sm:text-base">Erro ao carregar dados</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar {...SIDEBAR_PROPS} />
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Gerenciar Afiliados</h1>
                <p className="text-sm sm:text-base text-slate-400">Gerencie todos os afiliados da plataforma</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg text-slate-100">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100 text-sm sm:text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-slate-100">
                Afiliados ({affiliates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile Cards View */}
              <div className="block lg:hidden space-y-4">
                {affiliates.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    Nenhum afiliado encontrado
                  </div>
                ) : (
                  affiliates.map((affiliate) => (
                    <Card key={affiliate.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-slate-100 truncate">
                                {affiliate.fullName}
                              </h3>
                              <p className="text-xs text-slate-400 truncate">
                                @{affiliate.username}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {affiliate.email}
                              </p>
                            </div>
                            <Badge 
                              variant={affiliate.isActive ? "default" : "secondary"}
                              className={`text-xs ${
                                affiliate.isActive 
                                  ? "bg-green-600 hover:bg-green-700" 
                                  : "bg-red-600 hover:bg-red-700"
                              } text-white`}
                            >
                              {affiliate.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400">Cliques:</span>
                              <span className="text-slate-200 ml-1">{affiliate.totalClicks}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Registros:</span>
                              <span className="text-slate-200 ml-1">{affiliate.totalRegistrations}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Depósitos:</span>
                              <span className="text-slate-200 ml-1">{affiliate.totalDeposits}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Comissão:</span>
                              <span className="text-slate-200 ml-1">R$ {affiliate.totalCommissions}</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-slate-400">
                            Cadastro: {formatDate(affiliate.createdAt)}
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600 hover:bg-slate-700 text-xs"
                              onClick={() => handleViewAffiliate(affiliate)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600 hover:bg-slate-700 text-xs"
                              onClick={() => handleEditAffiliate(affiliate.id)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-900/20 text-xs px-2"
                              onClick={() => handleDeleteAffiliate(affiliate)}
                              disabled={deleteAffiliateMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-300 text-sm">Nome</TableHead>
                      <TableHead className="text-slate-300 text-sm">Email</TableHead>
                      <TableHead className="text-slate-300 text-sm">Username</TableHead>
                      <TableHead className="text-slate-300 text-sm">Status</TableHead>
                      <TableHead className="text-slate-300 text-sm">Cliques</TableHead>
                      <TableHead className="text-slate-300 text-sm">Registros</TableHead>
                      <TableHead className="text-slate-300 text-sm">Depósitos</TableHead>
                      <TableHead className="text-slate-300 text-sm">Comissão</TableHead>
                      <TableHead className="text-slate-300 text-sm">Cadastro</TableHead>
                      <TableHead className="text-slate-300 text-sm">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-slate-400 py-8">
                          Nenhum afiliado encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      affiliates.map((affiliate) => (
                        <TableRow key={affiliate.id} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="text-slate-200 font-medium">
                            {affiliate.fullName}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.email}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.username}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={affiliate.isActive 
                                ? "bg-green-900 text-green-200 border-green-700" 
                                : "bg-red-900 text-red-200 border-red-700"
                              }
                            >
                              {affiliate.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.totalClicks}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.totalRegistrations}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.totalDeposits}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            R$ {affiliate.totalCommissions}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {formatDate(affiliate.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 hover:bg-slate-700"
                                onClick={() => handleViewAffiliate(affiliate)}
                                title="Visualizar dados do afiliado"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 hover:bg-slate-700"
                                onClick={() => handleEditAffiliate(affiliate.id)}
                                title="Editar afiliado"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                                onClick={() => handleDeleteAffiliate(affiliate)}
                                disabled={deleteAffiliateMutation.isPending}
                                title="Excluir afiliado"
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
        </div>

        {/* Modals */}
        <ViewAffiliateModal
          affiliateId={selectedAffiliateId}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedAffiliateId(null);
          }}
        />

        <DeleteAffiliateDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setAffiliateToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          affiliateName={affiliateToDelete?.fullName || ''}
          isDeleting={deleteAffiliateMutation.isPending}
        />
      </div>
    </div>
  );
}