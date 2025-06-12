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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/admin/sidebar";
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
  RefreshCw,
  Wallet,
  Calendar,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard as CreditCardIcon,
  Banknote,
  ExternalLink,
  Receipt,
  Info,
  Coins,
  PiggyBank,
  Target,
  Activity,
  TrendingDown,
  Menu
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Types
interface PaymentStats {
  totalPendingAmount: string;
  totalCompletedAmount: string;
  totalFailedAmount: string;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  monthlyVolume: string;
  averagePayment: string;
  totalVolume: string;
  totalPayments: number;
  conversionRate: string;
  highestPayment: string;
  lowestPayment: string;
}

interface UserCommissionData {
  userId: number;
  availableBalance: string;
  totalEarned: string;
  totalWithdrawn: string;
  pendingPayments: string;
  lastPaymentDate?: string;
  commissionBreakdown: {
    revShare: string;
    cpa: string;
    bonus: string;
  };
  paymentHistory: {
    totalPayments: number;
    successRate: string;
    averageAmount: string;
  };
}

interface Payment {
  id: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  method: 'pix' | 'bank_transfer';
  userId: number;
  userEmail: string;
  userName: string;
  userPhone?: string;
  userDocument?: string;
  pixKey?: string;
  bankDetails?: string;
  transactionId?: string;
  notes?: string;
  adminNotes?: string;
  requestDate: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

interface PaymentAction {
  paymentId: number;
  action: 'approve' | 'reject';
  notes: string;
  adminName: string;
  transactionId?: string;
  estimatedProcessingTime?: string;
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
  priority: string;
  userId: string;
}

const statusConfig = {
  pending: {
    label: 'Aguardando Análise',
    icon: Clock,
    color: 'text-amber-400 bg-amber-900/20 border-amber-500/30',
    bgColor: 'bg-amber-50 dark:bg-amber-900/10'
  },
  approved: {
    label: 'Aprovado',
    icon: CheckCircle,
    color: 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/10'
  },
  rejected: {
    label: 'Rejeitado',
    icon: XCircle,
    color: 'text-red-400 bg-red-900/20 border-red-500/30',
    bgColor: 'bg-red-50 dark:bg-red-900/10'
  },
  processing: {
    label: 'Em Processamento',
    icon: RefreshCw,
    color: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10'
  }
};

const priorityConfig = {
  low: { label: 'Baixa', color: 'text-gray-400 bg-gray-900/20', dot: 'bg-gray-400' },
  medium: { label: 'Média', color: 'text-yellow-400 bg-yellow-900/20', dot: 'bg-yellow-400' },
  high: { label: 'Alta', color: 'text-red-400 bg-red-900/20', dot: 'bg-red-400' }
};

export default function AdminPayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State Management
  const [currentPage, setCurrentPage] = useState("payments");
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    priority: '',
    userId: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUserCommissions, setShowUserCommissions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // API Queries
  const { data: paymentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/payments/stats'],
    refetchInterval: 30000
  });

  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ['/api/admin/payments', filters],
    refetchInterval: 15000
  });

  const { data: userCommissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ['/api/admin/users/commissions', selectedUserId],
    enabled: !!selectedUserId && showUserCommissions
  });

  // Mutations
  const approvePaymentMutation = useMutation({
    mutationFn: async (data: PaymentAction) => {
      return apiRequest(`/api/admin/payments/${data.paymentId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          notes: data.notes,
          adminName: data.adminName,
          transactionId: data.transactionId,
          estimatedProcessingTime: data.estimatedProcessingTime
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Pagamento Aprovado",
        description: "O pagamento foi aprovado com sucesso e o usuário foi notificado.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/stats'] });
      setActionType(null);
      setActionNotes('');
      setTransactionId('');
      setProcessingTime('');
    },
    onError: (error) => {
      toast({
        title: "Erro ao Aprovar",
        description: "Não foi possível aprovar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: async (data: PaymentAction) => {
      return apiRequest(`/api/admin/payments/${data.paymentId}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          notes: data.notes,
          adminName: data.adminName
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Pagamento Rejeitado",
        description: "O pagamento foi rejeitado e o usuário foi notificado.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/stats'] });
      setActionType(null);
      setActionNotes('');
    },
    onError: (error) => {
      toast({
        title: "Erro ao Rejeitar",
        description: "Não foi possível rejeitar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: async (data: { paymentIds: number[], action: string, notes: string }) => {
      return apiRequest('/api/admin/payments/bulk-action', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Ação em Lote Concluída",
        description: "A ação foi aplicada a todos os pagamentos selecionados.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/stats'] });
      setSelectedPayments([]);
    }
  });

  // Handlers
  const handleApprovePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setActionType('approve');
  };

  const handleRejectPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setActionType('reject');
  };

  const handleConfirmAction = () => {
    if (!selectedPayment || !actionType) return;

    const actionData: PaymentAction = {
      paymentId: selectedPayment.id,
      action: actionType,
      notes: actionNotes,
      adminName: 'Admin', // This should come from auth context
      transactionId: actionType === 'approve' ? transactionId : undefined,
      estimatedProcessingTime: actionType === 'approve' ? processingTime : undefined
    };

    if (actionType === 'approve') {
      approvePaymentMutation.mutate(actionData);
    } else {
      rejectPaymentMutation.mutate(actionData);
    }
  };

  const handleViewUserCommissions = (userId: number) => {
    setSelectedUserId(userId);
    setShowUserCommissions(true);
  };

  const handleBulkAction = (action: string) => {
    if (selectedPayments.length === 0) return;
    
    bulkActionMutation.mutate({
      paymentIds: selectedPayments,
      action,
      notes: `Ação em lote: ${action}`
    });
  };

  const togglePaymentSelection = (paymentId: number) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} px-3 py-1 font-medium`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    );
  };

  const payments = (paymentsData as any)?.payments || [];
  const totalPages = Math.ceil(((paymentsData as any)?.total || 0) / filters.limit);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-slate-800"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out`}>
        <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    💳 Gerenciamento de Pagamentos
                  </h1>
                  <p className="text-slate-400 text-lg">
                    Controle total sobre solicitações de saque e comissões dos afiliados
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => refetchPayments()}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Clock className="h-5 w-5 text-amber-400" />
                      </div>
                      <CardTitle className="text-slate-300 text-sm font-medium">
                        Pendentes
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency((paymentStats as any)?.totalPendingAmount || '0')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {(paymentStats as any)?.pendingCount || 0} solicitações
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                      <CardTitle className="text-slate-300 text-sm font-medium">
                        Aprovados
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency((paymentStats as any)?.totalCompletedAmount || '0')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {(paymentStats as any)?.completedCount || 0} pagamentos
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <CardTitle className="text-slate-300 text-sm font-medium">
                        Rejeitados
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency((paymentStats as any)?.totalFailedAmount || '0')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {(paymentStats as any)?.failedCount || 0} solicitações
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                      </div>
                      <CardTitle className="text-slate-300 text-sm font-medium">
                        Volume Mensal
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency((paymentStats as any)?.monthlyVolume || '0')}
                    </div>
                    <div className="text-xs text-slate-400">
                      Média: {formatCurrency((paymentStats as any)?.averagePayment || '0')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-slate-900 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros Avançados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Nome, email ou ID..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                        <SelectItem value="processing">Processando</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Método</Label>
                    <Select value={filters.method} onValueChange={(value) => setFilters(prev => ({ ...prev, method: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Todos os métodos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os métodos</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Valor Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="R$ 0,00"
                      value={filters.minAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedPayments.length > 0 && (
              <Card className="bg-slate-900 border-slate-700 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-300">
                        {selectedPayments.length} pagamentos selecionados
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBulkAction('approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar Selecionados
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBulkAction('reject')}
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
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Solicitações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedPayments.length === payments.length && payments.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPayments(payments.map((p: any) => p.id));
                              } else {
                                setSelectedPayments([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="text-slate-300">Usuário</TableHead>
                        <TableHead className="text-slate-300">Valor</TableHead>
                        <TableHead className="text-slate-300">Método</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Prioridade</TableHead>
                        <TableHead className="text-slate-300">Data</TableHead>
                        <TableHead className="text-slate-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => (
                        <TableRow key={payment.id} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedPayments.includes(payment.id)}
                              onCheckedChange={() => togglePaymentSelection(payment.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-800 rounded-lg">
                                <User className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{payment.userName}</div>
                                <div className="text-xs text-slate-400">{payment.userEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-white text-lg">
                              {formatCurrency(payment.amount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {payment.method === 'pix' ? (
                                <Banknote className="h-4 w-4 text-green-400" />
                              ) : (
                                <Building className="h-4 w-4 text-blue-400" />
                              )}
                              <span className="text-slate-300">
                                {payment.method === 'pix' ? 'PIX' : 'Transferência'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(payment.priority || 'medium')}
                          </TableCell>
                          <TableCell>
                            <div className="text-slate-300">
                              {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewUserCommissions(payment.userId)}
                                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-white flex items-center gap-2">
                                      <Wallet className="h-5 w-5" />
                                      Detalhes do Pagamento - {payment.userName}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                      Informações completas sobre o pagamento e comissões do usuário
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    {/* Payment Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <Card className="bg-slate-800 border-slate-700">
                                        <CardHeader>
                                          <CardTitle className="text-white text-lg">Detalhes do Pagamento</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="flex justify-between">
                                            <span className="text-slate-400">Valor:</span>
                                            <span className="text-white font-bold text-lg">
                                              {formatCurrency(payment.amount)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-400">Método:</span>
                                            <span className="text-white">
                                              {payment.method === 'pix' ? 'PIX' : 'Transferência Bancária'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-400">Status:</span>
                                            <div>{getStatusBadge(payment.status)}</div>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-400">Chave PIX:</span>
                                            <span className="text-white font-mono text-sm">
                                              {payment.pixKey || 'Não informado'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-400">Solicitado em:</span>
                                            <span className="text-white">
                                              {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card className="bg-slate-800 border-slate-700">
                                        <CardHeader>
                                          <CardTitle className="text-white text-lg">Informações do Usuário</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-slate-400" />
                                            <div>
                                              <div className="text-white font-medium">{payment.userName}</div>
                                              <div className="text-slate-400 text-sm">ID: {payment.userId}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                            <span className="text-white">{payment.userEmail}</span>
                                          </div>
                                          {payment.userPhone && (
                                            <div className="flex items-center gap-3">
                                              <Phone className="h-5 w-5 text-slate-400" />
                                              <span className="text-white">{payment.userPhone}</span>
                                            </div>
                                          )}
                                          {payment.userDocument && (
                                            <div className="flex items-center gap-3">
                                              <FileText className="h-5 w-5 text-slate-400" />
                                              <span className="text-white">{payment.userDocument}</span>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Commission Overview */}
                                    <Card className="bg-slate-800 border-slate-700">
                                      <CardHeader>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                          <PiggyBank className="h-5 w-5" />
                                          Resumo de Comissões
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                          <div className="bg-slate-900 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Coins className="h-4 w-4 text-green-400" />
                                              <span className="text-slate-400 text-sm">Saldo Disponível</span>
                                            </div>
                                            <div className="text-green-400 font-bold text-xl">
                                              {formatCurrency((userCommissions as any)?.availableBalance || '0')}
                                            </div>
                                          </div>
                                          <div className="bg-slate-900 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <TrendingUp className="h-4 w-4 text-blue-400" />
                                              <span className="text-slate-400 text-sm">Total Ganho</span>
                                            </div>
                                            <div className="text-blue-400 font-bold text-xl">
                                              {formatCurrency((userCommissions as any)?.totalEarned || '0')}
                                            </div>
                                          </div>
                                          <div className="bg-slate-900 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <TrendingDown className="h-4 w-4 text-orange-400" />
                                              <span className="text-slate-400 text-sm">Total Sacado</span>
                                            </div>
                                            <div className="text-orange-400 font-bold text-xl">
                                              {formatCurrency((userCommissions as any)?.totalWithdrawn || '0')}
                                            </div>
                                          </div>
                                          <div className="bg-slate-900 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Clock className="h-4 w-4 text-yellow-400" />
                                              <span className="text-slate-400 text-sm">Pendente</span>
                                            </div>
                                            <div className="text-yellow-400 font-bold text-xl">
                                              {formatCurrency((userCommissions as any)?.pendingPayments || '0')}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {payment.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprovePayment(payment)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectPayment(payment)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-400">
                    Mostrando {((filters.page - 1) * filters.limit) + 1} a {Math.min(filters.page * filters.limit, (paymentsData as any)?.total || 0)} de {(paymentsData as any)?.total || 0} pagamentos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={filters.page === 1}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-300 px-3">
                      {filters.page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                      disabled={filters.page === totalPages}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Aprovar Pagamento
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  Rejeitar Pagamento
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {actionType === 'approve' 
                ? `Você está aprovando o pagamento de ${formatCurrency(selectedPayment?.amount || '0')} para ${selectedPayment?.userName}.`
                : `Você está rejeitando o pagamento de ${formatCurrency(selectedPayment?.amount || '0')} para ${selectedPayment?.userName}.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {actionType === 'approve' && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-300">ID da Transação (Opcional)</Label>
                  <Input
                    placeholder="Digite o ID da transação bancária..."
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Tempo Estimado de Processamento</Label>
                  <Select value={processingTime} onValueChange={setProcessingTime}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o tempo estimado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediato (PIX)</SelectItem>
                      <SelectItem value="1_hour">1 hora</SelectItem>
                      <SelectItem value="24_hours">24 horas</SelectItem>
                      <SelectItem value="2_days">2 dias úteis</SelectItem>
                      <SelectItem value="5_days">5 dias úteis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label className="text-slate-300">
                {actionType === 'approve' ? 'Observações da Aprovação' : 'Motivo da Rejeição'} *
              </Label>
              <Textarea
                placeholder={actionType === 'approve' 
                  ? "Observações sobre a aprovação (obrigatório para log)..."
                  : "Explique o motivo da rejeição (obrigatório)..."
                }
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={!actionNotes.trim() || (actionType === 'approve' && approvePaymentMutation.isPending) || (actionType === 'reject' && rejectPaymentMutation.isPending)}
              className={actionType === 'approve' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {((actionType === 'approve' && approvePaymentMutation.isPending) || (actionType === 'reject' && rejectPaymentMutation.isPending)) && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              {actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}