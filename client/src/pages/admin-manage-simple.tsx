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
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-950">
        <AdminSidebar {...SIDEBAR_PROPS} />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-950">
        <AdminSidebar {...SIDEBAR_PROPS} />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400">Erro ao carregar dados</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSidebar {...SIDEBAR_PROPS} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Gerenciar Afiliados</h1>
                <p className="text-slate-400">Gerencie todos os afiliados da plataforma</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">
                Afiliados ({affiliates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-300">Nome</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Username</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Cliques</TableHead>
                      <TableHead className="text-slate-300">Registros</TableHead>
                      <TableHead className="text-slate-300">Depósitos</TableHead>
                      <TableHead className="text-slate-300">Comissão</TableHead>
                      <TableHead className="text-slate-300">Cadastro</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
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
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 hover:bg-slate-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
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
      </div>
    </div>
  );
}