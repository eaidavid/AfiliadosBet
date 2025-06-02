import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, UserPlus, Wallet } from "lucide-react";
import UserSidebar from "@/components/user/sidebar";

// Função helper para formatação de moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function UserReportsSimple() {
  const { user } = useAuth();

  const { data: conversions, isLoading: conversionsLoading } = useQuery({
    queryKey: ['/api/user/conversions'],
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  const isLoading = conversionsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <UserSidebar currentPage="reports" onPageChange={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-emerald-500 text-xl">Carregando relatórios...</div>
        </div>
      </div>
    );
  }

  // Garantir que os dados existem
  const safeConversions = Array.isArray(conversions) ? conversions : [];
  const safeStats = stats || {};

  return (
    <div className="flex min-h-screen bg-slate-950">
      <UserSidebar currentPage="reports" onPageChange={() => {}} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
            <p className="text-slate-400">Análise do seu desempenho como afiliado</p>
          </div>

          {/* Cards de estatísticas gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Registros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {safeStats.totalRegistrations || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Depósitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {safeStats.totalDeposits || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Comissões Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">
                  {formatCurrency(parseFloat(safeStats.totalCommission || '0'))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Conversões */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Histórico de Conversões</CardTitle>
              <CardDescription className="text-slate-400">
                Todas as suas conversões registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeConversions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Casa</TableHead>
                      <TableHead className="text-slate-300">Tipo</TableHead>
                      <TableHead className="text-slate-300">Valor</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeConversions.map((conversion: any) => (
                      <TableRow key={conversion.id} className="border-slate-800">
                        <TableCell className="text-slate-300">
                          {new Date(conversion.criadoEm).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-white">{conversion.casa}</TableCell>
                        <TableCell>
                          <Badge variant={
                            conversion.evento === 'registration' ? 'secondary' :
                            conversion.evento === 'deposit' ? 'default' : 'destructive'
                          }>
                            {conversion.evento === 'registration' ? 'Registro' :
                             conversion.evento === 'deposit' ? 'Depósito' : 
                             conversion.evento === 'profit' ? 'Lucro' : conversion.evento}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-emerald-500">
                          {formatCurrency(parseFloat(conversion.valor || '0'))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={conversion.status === 'approved' ? 'default' : 'secondary'}>
                            {conversion.status === 'approved' ? 'Aprovado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Nenhuma conversão registrada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}