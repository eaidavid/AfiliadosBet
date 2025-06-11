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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  DollarSign,
  Users,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AdminSidebar } from "@/components/admin/sidebar";

// Types
interface PaymentStats {
  totalPendingAmount: string;
  totalCompletedAmount: string;
  totalFailedAmount: string;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  monthlyVolume: string;
  averagePayment: string;
}

interface Payment {
  id: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  method: 'pix' | 'bank_transfer';
  userId: number;
  userEmail: string;
  userName: string;
  pixKey?: string;
  bankDetails?: string;
  transactionId?: string;
  notes?: string;
  requestDate: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentFilters {
  page: number;
  limit: number;
  search: string;
  status: string;
  method: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30'
  },
  approved: {
    label: 'Aprovado',
    icon: CheckCircle,
    color: 'text-green-400 bg-green-900/30 border-green-500/30'
  },
  rejected: {
    label: 'Rejeitado',
    icon: XCircle,
    color: 'text-red-400 bg-red-900/30 border-red-500/30'
  },
  processing: {
    label: 'Processando',
    icon: RefreshCw,
    color: 'text-blue-400 bg-blue-900/30 border-blue-500/30'
  }
};

const methodConfig = {
  pix: {
    label: 'PIX',
    icon: '◉',
    color: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30'
  },
  bank_transfer: {
    label: 'TED',
    icon: '🏦',
    color: 'text-blue-400 bg-blue-900/30 border-blue-500/30'
  }
};

export default function AdminPayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 25,
    search: '',
    status: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Helper functions
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<PaymentStats>({
    queryKey: ['/api/admin/payments/stats'],
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/admin/payments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!response.ok) throw new Error('Erro ao carregar pagamentos');
      return response.json();
    },
  });

  const payments = paymentsData?.payments || [];
  const totalPages = Math.ceil((paymentsData?.total || 0) / filters.limit);

  // Mutations
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Payment> }) => {
      return apiRequest(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/stats'] });
      toast({ title: "Pagamento atualizado com sucesso!" });
      setShowEditModal(false);
      setSelectedPayment(null);
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar pagamento", 
        description: "Tente novamente em alguns instantes.",
        variant: "destructive" 
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: string }) => {
      return apiRequest('/api/admin/payments/bulk-update', {
        method: 'PATCH',
        body: JSON.stringify({ ids, status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/stats'] });
      toast({ title: "Pagamentos atualizados com sucesso!" });
      setSelectedPayments([]);
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar pagamentos", 
        description: "Tente novamente em alguns instantes.",
        variant: "destructive" 
      });
    },
  });

  // Handlers
  const handleFilterChange = (key: keyof PaymentFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1)
    }));
  };

  const handleSelectPayment = (paymentId: number) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedPayments(checked ? payments.map((p: Payment) => p.id) : []);
  };

  const handleBulkAction = async (status: string) => {
    if (selectedPayments.length === 0) return;
    
    try {
      await bulkUpdateMutation.mutateAsync({ ids: selectedPayments, status });
    } catch (error) {
      console.error('Erro na ação em lote:', error);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleUpdatePayment = async (data: Partial<Payment>) => {
    if (!selectedPayment) return;
    
    try {
      await updatePaymentMutation.mutateAsync({ 
        id: selectedPayment.id, 
        data 
      });
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
    }
  };

  const handleQuickAction = async (status: 'approved' | 'rejected') => {
    if (!selectedPayment) return;
    
    try {
      const updateData: Partial<Payment> = {
        status,
        processedAt: new Date().toISOString(),
        notes: `Pagamento ${status === 'approved' ? 'aprovado' : 'rejeitado'} pelo admin em ${new Date().toLocaleString('pt-BR')}`
      };
      
      await updatePaymentMutation.mutateAsync({ 
        id: selectedPayment.id, 
        data: updateData
      });
      
      toast({ 
        title: `Pagamento ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`,
        description: `O pagamento #${selectedPayment.id} foi ${status === 'approved' ? 'aprovado' : 'rejeitado'}.`
      });
    } catch (error) {
      console.error('Erro na ação rápida:', error);
      toast({ 
        title: "Erro ao processar pagamento", 
        description: "Tente novamente em alguns instantes.",
        variant: "destructive" 
      });
    }
  };

  const handleRowAction = async (payment: Payment, status: 'approved' | 'rejected') => {
    try {
      const updateData: Partial<Payment> = {
        status,
        processedAt: new Date().toISOString(),
        notes: `Pagamento ${status === 'approved' ? 'aprovado' : 'rejeitado'} pelo admin em ${new Date().toLocaleString('pt-BR')}`
      };
      
      await updatePaymentMutation.mutateAsync({ 
        id: payment.id, 
        data: updateData
      });
      
      toast({ 
        title: `Pagamento ${status === 'approved' ? 'aprovado' : 'rejeitado'}!`,
        description: `${payment.userName} - ${formatCurrency(payment.amount)}`
      });
    } catch (error) {
      console.error('Erro na ação da linha:', error);
      toast({ 
        title: "Erro ao processar pagamento", 
        description: "Tente novamente em alguns instantes.",
        variant: "destructive" 
      });
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/admin/payments/export?${params.toString()}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pagamentos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "Relatório exportado com sucesso!" });
    } catch (error) {
      toast({ 
        title: "Erro ao exportar", 
        description: "Tente novamente em alguns instantes.",
        variant: "destructive" 
      });
    }
  };

  if (statsLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  const [currentPage, setCurrentPage] = useState("payments");

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 lg:ml-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Gerenciamento de Pagamentos
                </h1>
                <p className="text-slate-400">
                  Controle completo dos pagamentos da plataforma
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {formatCurrency(stats.totalPendingAmount)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.pendingCount} pagamentos
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Aprovados</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(stats.totalCompletedAmount)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.completedCount} pagamentos
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Rejeitados</p>
                      <p className="text-2xl font-bold text-red-400">
                        {formatCurrency(stats.totalFailedAmount)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.failedCount} pagamentos
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Volume Mensal</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(stats.monthlyVolume)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Média: {formatCurrency(stats.averagePayment)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Lista de Pagamentos
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-slate-800 border-slate-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Filters */}
          {showFilters && (
            <CardContent className="border-b border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-slate-300">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Nome, email, ID..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Método</Label>
                  <Select
                    value={filters.method}
                    onValueChange={(value) => handleFilterChange('method', value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Todos os métodos" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">Todos os métodos</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="bank_transfer">TED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Valor Mínimo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* Bulk Actions */}
          {selectedPayments.length > 0 && (
            <CardContent className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-slate-400">
                  {selectedPayments.length} pagamento(s) selecionado(s)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('approved')}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={bulkUpdateMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('rejected')}
                    disabled={bulkUpdateMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          {/* Table */}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayments.length === payments.length && payments.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-slate-600"
                      />
                    </TableHead>
                    <TableHead className="text-slate-300">ID</TableHead>
                    <TableHead className="text-slate-300">Usuário</TableHead>
                    <TableHead className="text-slate-300">Valor</TableHead>
                    <TableHead className="text-slate-300">Método</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: Payment) => {
                    const StatusIcon = statusConfig[payment.status]?.icon || Clock;
                    const methodInfo = methodConfig[payment.method];
                    
                    return (
                      <TableRow 
                        key={payment.id} 
                        className="border-slate-700 hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedPayments.includes(payment.id)}
                            onCheckedChange={() => handleSelectPayment(payment.id)}
                            className="border-slate-600"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-slate-300">
                          #{payment.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{payment.userName}</div>
                            <div className="text-sm text-slate-400">{payment.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-white">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={methodInfo?.color}>
                            {methodInfo?.icon} {methodInfo?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[payment.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[payment.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {payment.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleRowAction(payment, 'approved')}
                                  disabled={updatePaymentMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRowAction(payment, 'rejected')}
                                  disabled={updatePaymentMutation.isPending}
                                  variant="destructive"
                                  className="px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPayment(payment)}
                              className="bg-slate-800 border-slate-700 hover:bg-slate-700 px-2"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPayment(payment)}
                              className="bg-slate-800 border-slate-700 hover:bg-slate-700 px-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Página {filters.page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="bg-slate-800 border-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page >= totalPages}
                    className="bg-slate-800 border-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                Detalhes do Pagamento #{selectedPayment?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Usuário</Label>
                    <p className="text-white font-medium">{selectedPayment.userName}</p>
                    <p className="text-slate-400 text-sm">{selectedPayment.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Valor</Label>
                    <p className="text-white font-bold text-lg">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Método</Label>
                    <Badge className={methodConfig[selectedPayment.method]?.color}>
                      {methodConfig[selectedPayment.method]?.icon} {methodConfig[selectedPayment.method]?.label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-slate-300">Status</Label>
                    <Badge className={statusConfig[selectedPayment.status]?.color}>
                      {statusConfig[selectedPayment.status]?.label}
                    </Badge>
                  </div>
                </div>

                {selectedPayment.pixKey && (
                  <div>
                    <Label className="text-slate-300">Chave PIX</Label>
                    <p className="text-white font-mono">{selectedPayment.pixKey}</p>
                  </div>
                )}

                {selectedPayment.transactionId && (
                  <div>
                    <Label className="text-slate-300">ID da Transação</Label>
                    <p className="text-white font-mono">{selectedPayment.transactionId}</p>
                  </div>
                )}

                {selectedPayment.notes && (
                  <div>
                    <Label className="text-slate-300">Observações</Label>
                    <p className="text-slate-400">{selectedPayment.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Data da Solicitação</Label>
                    <p className="text-slate-400">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  {selectedPayment.processedAt && (
                    <div>
                      <Label className="text-slate-300">Data do Processamento</Label>
                      <p className="text-slate-400">{formatDate(selectedPayment.processedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Payment Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                Processar Pagamento #{selectedPayment?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6">
                {/* Payment Info */}
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Usuário:</p>
                      <p className="text-white font-medium">{selectedPayment.userName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Valor:</p>
                      <p className="text-white font-bold">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Método:</p>
                      <p className="text-white">{methodConfig[selectedPayment.method]?.label}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status:</p>
                      <Badge className={statusConfig[selectedPayment.status]?.color}>
                        {statusConfig[selectedPayment.status]?.label}
                      </Badge>
                    </div>
                  </div>
                  {selectedPayment.pixKey && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-sm">Chave PIX:</p>
                      <p className="text-white font-mono text-sm">{selectedPayment.pixKey}</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleQuickAction('approved')}
                    disabled={updatePaymentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('rejected')}
                    disabled={updatePaymentMutation.isPending}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4 border-t border-slate-700 pt-4">
                  <div>
                    <Label className="text-slate-300">ID da Transação</Label>
                    <Input
                      placeholder="Digite o ID da transação (opcional)"
                      defaultValue={selectedPayment.transactionId || ''}
                      onBlur={(e) => handleUpdatePayment({ transactionId: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Observações Internas</Label>
                    <Textarea
                      placeholder="Adicione observações sobre o processamento"
                      defaultValue={selectedPayment.notes || ''}
                      onBlur={(e) => handleUpdatePayment({ notes: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Status Manual</Label>
                    <Select
                      defaultValue={selectedPayment.status}
                      onValueChange={(value) => handleUpdatePayment({ status: value as any })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="processing">Processando</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}