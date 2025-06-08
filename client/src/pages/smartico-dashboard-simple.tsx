import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/admin/sidebar';
import { RefreshCw, BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function SmarticoDashboard() {
  const [currentPage, setCurrentPage] = useState("smartico");
  const [stats, setStats] = useState({
    totalClick: 0,
    totalRegistration: 0,
    totalDeposit: 0,
    totalProfit: 0,
    totalCommissions: '0.00',
    totalAmount: '0.00'
  });
  const [loading, setLoading] = useState(true);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversions?limit=1');
      const data = await response.json();
      
      if (data.success && data.totals) {
        setStats(data.totals);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard Smartico</h1>
              <p className="text-gray-400">Relatório de conversões da API Smartico</p>
            </div>
            <Button
              onClick={fetchStats}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total de Clicks</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalClick}</div>
                <p className="text-xs text-gray-400">Clicks registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Registros</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalRegistration}</div>
                <p className="text-xs text-gray-400">Novos registros</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Depósitos</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalDeposit}</div>
                <p className="text-xs text-gray-400">Depósitos realizados</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Comissões</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalCommissions)}</div>
                <p className="text-xs text-gray-400">Total em comissões</p>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Sistema Smartico</CardTitle>
              <CardDescription className="text-gray-400">
                Integração com API Smartico para coleta automática de dados de conversão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Status da Integração</h3>
                    <p className="text-sm text-gray-400">Sistema funcionando corretamente</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Total de Receita</h3>
                    <p className="text-sm text-gray-400">Valor total processado</p>
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(stats.totalAmount)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Lucros Gerados</h3>
                    <p className="text-sm text-gray-400">Total de eventos de lucro</p>
                  </div>
                  <div className="text-lg font-bold text-yellow-400">
                    {stats.totalProfit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}