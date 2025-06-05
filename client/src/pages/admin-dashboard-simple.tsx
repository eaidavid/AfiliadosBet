import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminSidebar } from "@/components/admin/sidebar";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Link,
  TrendingUp,
  DollarSign,
} from "lucide-react";

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

export default function AdminDashboardSimple() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Buscar dados reais do banco
  const { data: systemStats, isLoading: isLoadingStats } = useQuery<any>({
    queryKey: ['/api/stats/admin'],
    refetchInterval: 30000,
  });

  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useQuery<Affiliate[]>({
    queryKey: ['/api/admin/affiliates'],
    refetchInterval: 30000,
  });

  const { data: bettingHouses = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/betting-houses'],
    refetchInterval: 30000,
  });

  // Cálculos baseados em dados reais
  const activeAffiliates = affiliates.filter(a => a.isActive).length;
  const totalCommissions = affiliates.reduce((sum, a) => sum + parseFloat(a.totalCommissions || '0'), 0);
  const recentAffiliates = affiliates.slice(0, 5); // 5 mais recentes

  if (isLoadingStats || isLoadingAffiliates) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="ml-20 lg:ml-[110px] lg:mr-[110px]">
          <main className="p-4 lg:p-6 space-y-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-400">Carregando dados...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="ml-20 lg:ml-[110px] lg:mr-[110px]">
        
        <main className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Administrativo</h1>
              <p className="text-slate-400 mt-1">Visão geral do sistema em tempo real</p>
            </div>
          </div>

          {/* Métricas Principais - Dados Reais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Afiliados</p>
                      <p className="text-2xl font-bold text-white">{affiliates.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Afiliados Ativos</p>
                      <p className="text-2xl font-bold text-white">{activeAffiliates}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Casas Cadastradas</p>
                      <p className="text-2xl font-bold text-white">{bettingHouses.length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Comissões Totais</p>
                      <p className="text-2xl font-bold text-white">R$ {totalCommissions.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Estatísticas do Sistema */}
          {systemStats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Links</p>
                      <p className="text-2xl font-bold text-green-400">{systemStats.totalLinks || 0}</p>
                    </div>
                    <Link className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Conversões</p>
                      <p className="text-2xl font-bold text-purple-400">{systemStats.totalConversions || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Volume Total</p>
                      <p className="text-2xl font-bold text-blue-400">R$ {systemStats.totalVolume || '0,00'}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Afiliados Recentes - Dados Reais */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Afiliados Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAffiliates.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  Nenhum afiliado encontrado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Nome</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Cliques</TableHead>
                        <TableHead className="text-slate-300">Comissão</TableHead>
                        <TableHead className="text-slate-300">Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAffiliates.map((affiliate) => (
                        <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="text-slate-200 font-medium">
                            {affiliate.fullName}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {affiliate.email}
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
                            R$ {affiliate.totalCommissions}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(affiliate.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}