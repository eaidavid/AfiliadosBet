import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  MoreHorizontal
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

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
  method: string;
  pixKey: string | null;
  status: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  userUsername: string;
  userPixKeyType: string | null;
  userPixKeyValue: string | null;
}

interface PaymentFilters {
  page: number;
  limit: number;
  status?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  minAmount?: string;
  maxAmount?: string;
}

// Status configuration
const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-500/30',
    icon: Clock
  },
  completed: {
    label: 'Pago',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500/30',
    icon: CheckCircle
  },
  failed: {
    label: 'Falhado',
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500/30',
    icon: XCircle
  }
};

// Payment method configuration
const PAYMENT_METHODS = {
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
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ transactionId: '' });
  const [editData, setEditData] = useState({
    status: '',
    method: '',
    pixKey: '',
    transactionId: ''
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<PaymentStats>({
    queryKey: ['/api/admin/payments/stats'],
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/admin/payments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/admin/payments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    }
  });

  // Mutations
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/stats'] });
      toast({ title: "Pagamento atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar pagamento", variant: "destructive" });
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: async (data: { action: string; paymentIds: number[]; transactionId?: string }) => {
      return apiRequest('/api/admin/payments/bulk', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/stats'] });
      setSelectedPayments([]);
      toast({ title: data.message });
    },
    onError: () => {
      toast({ title: "Erro na ação em lote", variant: "destructive" });
    }
  });

  // Handlers
  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSelectPayment = (paymentId: number, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(paymentsData?.payments?.map((p: Payment) => p.id) || []);
    } else {
      setSelectedPayments([]);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;
    
    await updatePaymentMutation.mutateAsync({
      id: selectedPayment.id,
      data: {
        status: 'completed',
        transactionId: approvalData.transactionId
      }
    });
    
    setShowApprovalModal(false);
    setApprovalData({ transactionId: '' });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPayments.length === 0) return;
    
    await bulkActionMutation.mutateAsync({
      action,
      paymentIds: selectedPayments,
      ...(action === 'approve' && { transactionId: approvalData.transactionId })
    });
  };

  const handleEditPayment = async () => {
    if (!selectedPayment) return;
    
    await updatePaymentMutation.mutateAsync({
      id: selectedPayment.id,
      data: editData
    });
    
    setShowEditModal(false);
  };

  // Utils
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const config = PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS];
    if (!config) return method;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    if (!paymentsData?.payments) return;
    
    const headers = ['ID', 'Afiliado', 'Email', 'Valor', 'Método', 'Status', 'Chave PIX', 'Data Criação', 'Data Pagamento'];
    const csvData = paymentsData.payments.map((payment: Payment) => [
      payment.id,
      payment.userFullName,
      payment.userEmail,
      payment.amount,
      payment.method,
      payment.status,
      payment.pixKey || '',
      format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm'),
      payment.paidAt ? format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm') : ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pagamentos_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
  };

  // Memoized calculations
  const pagination = useMemo(() => paymentsData?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  }, [paymentsData]);

  return (
    <SidebarLayout>
      <div className="p-6 pt-[69px] pb-[69px]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-emerald-400 flex items-center gap-3">
                <CreditCard className="h-10 w-10" />
                Gerenciamento de Pagamentos
              </h1>
              <p className="text-slate-300 text-lg mt-2">
                Controle total sobre pagamentos de afiliados
              </p>
            </div>
            <Button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>

          {/* Statistics Cards */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Pendente</p>
                      <p className="text-2xl font-bold text-amber-400">
                        {formatCurrency(stats.totalPendingAmount)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.pendingCount} pagamentos
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Pago</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(stats.totalCompletedAmount)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.completedCount} pagamentos
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Falhado</p>
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

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:scale-105 transition-all">
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

          {/* Filters */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-300">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Nome, email, ID..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Pago</SelectItem>
                        <SelectItem value="failed">Falhado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Método</Label>
                    <Select value={filters.method} onValueChange={(value) => handleFilterChange('method', value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Todos os métodos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="bank_transfer">TED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Itens por página</Label>
                    <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-300">Data inicial</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Data final</Label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Valor mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Valor máximo</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Bulk Actions */}
          {selectedPayments.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-white">
                      {selectedPayments.length} pagamentos selecionados
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBulkAction('approve')}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={bulkActionMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprovar Selecionados
                    </Button>
                    <Button
                      onClick={() => handleBulkAction('reject')}
                      variant="destructive"
                      disabled={bulkActionMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar Selecionados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payments Table */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Pagamentos
                {pagination.total > 0 && (
                  <span className="text-slate-400 text-sm font-normal ml-2">
                    ({pagination.total} total)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : paymentsData?.payments?.length > 0 ? (
                <>
                  <div className="rounded-md border border-slate-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedPayments.length === paymentsData.payments.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="text-slate-300">ID</TableHead>
                          <TableHead className="text-slate-300">Afiliado</TableHead>
                          <TableHead className="text-slate-300">Valor</TableHead>
                          <TableHead className="text-slate-300">Método</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Chave PIX</TableHead>
                          <TableHead className="text-slate-300">Data Criação</TableHead>
                          <TableHead className="text-slate-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentsData.payments.map((payment: Payment) => (
                          <TableRow key={payment.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell>
                              <Checkbox
                                checked={selectedPayments.includes(payment.id)}
                                onCheckedChange={(checked) => handleSelectPayment(payment.id, !!checked)}
                              />
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono">
                              #{payment.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-slate-200 font-medium">
                                  {payment.userFullName}
                                </div>
                                <div className="text-slate-400 text-sm">
                                  {payment.userEmail}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-emerald-400 font-bold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              {getMethodBadge(payment.method)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(payment.status)}
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono text-sm">
                              {payment.pixKey || '-'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowPaymentModal(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {payment.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-emerald-600 hover:bg-emerald-700"
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        setShowApprovalModal(true);
                                      }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        updatePaymentMutation.mutate({
                                          id: payment.id,
                                          data: { status: 'failed' }
                                        });
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setEditData({
                                      status: payment.status,
                                      method: payment.method,
                                      pixKey: payment.pixKey || '',
                                      transactionId: payment.transactionId || ''
                                    });
                                    setShowEditModal(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-slate-400 text-sm">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={pagination.page === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pagamento encontrado.</p>
                  <p className="text-sm">Ajuste os filtros para ver mais resultados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">ID do Pagamento</Label>
                  <p className="font-mono">#{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <Label className="text-slate-400">Valor</Label>
                  <p className="text-emerald-400 font-bold">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400">Método</Label>
                  <div className="mt-1">{getMethodBadge(selectedPayment.method)}</div>
                </div>
                <div>
                  <Label className="text-slate-400">Afiliado</Label>
                  <p>{selectedPayment.userFullName}</p>
                  <p className="text-slate-400 text-sm">{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Username</Label>
                  <p className="font-mono">{selectedPayment.userUsername}</p>
                </div>
                {selectedPayment.pixKey && (
                  <div className="col-span-2">
                    <Label className="text-slate-400">Chave PIX</Label>
                    <p className="font-mono bg-slate-800 p-2 rounded">
                      {selectedPayment.pixKey}
                    </p>
                  </div>
                )}
                {selectedPayment.transactionId && (
                  <div className="col-span-2">
                    <Label className="text-slate-400">ID da Transação</Label>
                    <p className="font-mono bg-slate-800 p-2 rounded">
                      {selectedPayment.transactionId}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-slate-400">Data de Criação</Label>
                  <p>{format(new Date(selectedPayment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                </div>
                {selectedPayment.paidAt && (
                  <div>
                    <Label className="text-slate-400">Data de Pagamento</Label>
                    <p>{format(new Date(selectedPayment.paidAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Aprovar Pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded">
                <p className="text-slate-400">Pagamento: #{selectedPayment.id}</p>
                <p className="text-emerald-400 font-bold text-lg">
                  {formatCurrency(selectedPayment.amount)}
                </p>
                <p className="text-slate-300">{selectedPayment.userFullName}</p>
              </div>
              <div>
                <Label htmlFor="transactionId">ID da Transação *</Label>
                <Input
                  id="transactionId"
                  value={approvalData.transactionId}
                  onChange={(e) => setApprovalData({ transactionId: e.target.value })}
                  placeholder="Digite o ID da transação"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleApprovePayment}
                  disabled={!approvalData.transactionId || updatePaymentMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Aprovar Pagamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Pago</SelectItem>
                      <SelectItem value="failed">Falhado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editMethod">Método</Label>
                  <Select value={editData.method} onValueChange={(value) => setEditData(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="bank_transfer">TED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editPixKey">Chave PIX</Label>
                  <Input
                    id="editPixKey"
                    value={editData.pixKey}
                    onChange={(e) => setEditData(prev => ({ ...prev, pixKey: e.target.value }))}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editTransactionId">ID da Transação</Label>
                  <Input
                    id="editTransactionId"
                    value={editData.transactionId}
                    onChange={(e) => setEditData(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditPayment}
                  disabled={updatePaymentMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}