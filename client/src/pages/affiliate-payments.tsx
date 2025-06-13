import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Copy,
  Eye,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
  CreditCard,
  Info
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import SidebarLayout from '@/components/sidebar-layout';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface Payment {
  id: number;
  amount: string;
  method: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  pixKey?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  requestedAt: string;
}

interface FinancialSummary {
  availableBalance: number;
  totalPaid: number;
  pendingPayments: number;
  monthlyEarnings: number;
  weeklyGrowth: number;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  processing: {
    label: 'Processando',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: ArrowUpRight
  },
  paid: {
    label: 'Pago',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
};

export default function AffiliatePayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    method: 'pix',
    pixKey: ''
  });

  // Fetch financial summary
  const { data: financialSummary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ['/api/affiliate/financial-summary'],
  });

  // Fetch payment history
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/affiliate/payments'],
  });

  // Request withdrawal mutation
  const requestWithdrawal = useMutation({
    mutationFn: async (data: typeof withdrawalData) => {
      const response = await fetch('/api/affiliate/request-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to request withdrawal');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de saque foi registrada e será processada em breve.",
      });
      setShowWithdrawalModal(false);
      setWithdrawalData({ amount: '', method: 'pix', pixKey: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/financial-summary'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na solicitação",
        description: error.message || "Não foi possível processar sua solicitação.",
        variant: "destructive"
      });
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const handleWithdrawal = () => {
    if (!withdrawalData.amount || !withdrawalData.pixKey) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawalData.amount);
    if (amount <= 0 || amount > (financialSummary?.availableBalance || 0)) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero e não exceder o saldo disponível.",
        variant: "destructive"
      });
      return;
    }

    requestWithdrawal.mutate(withdrawalData);
  };

  if (summaryLoading || paymentsLoading) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-800 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 max-w-7xl mx-auto pt-[67px] pb-[67px]">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-blue-400 flex items-center gap-3">
                  <Wallet className="h-10 w-10" />
                  Pagamentos
                </h1>
                <p className="text-slate-400 mt-2">
                  Acompanhe seus ganhos e gerencie seus pagamentos
                </p>
              </div>
              
              <Button
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                disabled={!financialSummary?.availableBalance || financialSummary.availableBalance <= 0}
              >
                <Plus className="h-4 w-4" />
                Solicitar Saque
              </Button>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Saldo Disponível</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency(financialSummary?.availableBalance || 0)}
                    </p>
                    <p className="text-green-200 text-xs mt-1">Para saque</p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Recebido</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency(financialSummary?.totalPaid || 0)}
                    </p>
                    <p className="text-blue-200 text-xs mt-1">Todos os tempos</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pagamentos Pendentes</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency(financialSummary?.pendingPayments || 0)}
                    </p>
                    <p className="text-yellow-200 text-xs mt-1">Em análise</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Ganhos do Mês</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency(financialSummary?.monthlyEarnings || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-purple-200" />
                      <p className="text-purple-200 text-xs">
                        +{financialSummary?.weeklyGrowth || 0}% na semana
                      </p>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History Table */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <CreditCard className="h-5 w-5" />
                Histórico de Pagamentos
              </CardTitle>
              <CardDescription className="text-slate-400">
                Acompanhe o status de todos os seus pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Data da Solicitação</TableHead>
                        <TableHead className="text-slate-300">Valor</TableHead>
                        <TableHead className="text-slate-300">Método</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">PIX / Dados</TableHead>
                        <TableHead className="text-slate-300">Transação</TableHead>
                        <TableHead className="text-slate-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => {
                        const StatusIcon = STATUS_CONFIG[payment.status].icon;
                        return (
                          <TableRow key={payment.id} className="border-slate-700">
                            <TableCell className="text-slate-200">
                              {formatDate(payment.requestedAt)}
                            </TableCell>
                            <TableCell className="text-slate-200 font-medium">
                              {formatCurrency(parseFloat(payment.amount))}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {payment.method.toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`${STATUS_CONFIG[payment.status].color} border`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {STATUS_CONFIG[payment.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {payment.pixKey && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{payment.pixKey}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(payment.pixKey!)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {payment.transactionId && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono">{payment.transactionId}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(payment.transactionId!)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">
                    Nenhum pagamento ainda
                  </h3>
                  <p className="text-slate-500">
                    Seus pagamentos aparecerão aqui quando forem solicitados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Rules */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Info className="h-5 w-5" />
                Informações sobre Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-slate-200 mb-2">Valor Mínimo</h4>
                  <p className="text-2xl font-bold text-green-400">R$ 50,00</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-slate-200 mb-2">Prazo de Processamento</h4>
                  <p className="text-2xl font-bold text-blue-400">1-3 dias úteis</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-slate-200 mb-2">Métodos Disponíveis</h4>
                  <p className="text-2xl font-bold text-purple-400">PIX</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Modal */}
          <Dialog open={showWithdrawalModal} onOpenChange={setShowWithdrawalModal}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Solicitar Saque
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Preencha os dados para solicitar um saque
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert className="border-blue-600 bg-blue-950/50">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    Saldo disponível: {formatCurrency(financialSummary?.availableBalance || 0)}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label className="text-slate-300">Valor do Saque</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData(prev => ({ ...prev, amount: e.target.value }))}
                    className="bg-slate-800 border-slate-700"
                    min="50"
                    max={financialSummary?.availableBalance}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Método de Pagamento</Label>
                  <Select 
                    value={withdrawalData.method} 
                    onValueChange={(value) => setWithdrawalData(prev => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Chave PIX</Label>
                  <Input
                    placeholder="Digite sua chave PIX"
                    value={withdrawalData.pixKey}
                    onChange={(e) => setWithdrawalData(prev => ({ ...prev, pixKey: e.target.value }))}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleWithdrawal}
                    disabled={requestWithdrawal.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {requestWithdrawal.isPending ? 'Processando...' : 'Confirmar Solicitação'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowWithdrawalModal(false)}
                    className="border-slate-600"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      {isMobile && <BottomNavigation />}
    </SidebarLayout>
  );
}