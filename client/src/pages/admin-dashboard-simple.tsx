import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, MousePointer } from "lucide-react";

export default function AdminDashboardSimple() {
  // Dados estáticos para evitar erros de fetch
  const stats = {
    totalClicks: 150,
    totalRegistrations: 1,
    totalDeposits: 1,
    totalVolume: 100,
    paidCommissions: 110
  };

  const affiliates = [
    {
      id: 1,
      username: "eaidav",
      email: "eaidavidalves@gmail.com",
      totalCommission: 110,
      totalConversions: 3,
      isActive: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <Badge variant="outline" className="text-sm">
            Admin: admin@afiliadosbet.com
          </Badge>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cliques</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                Cliques únicos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                Novos registros este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depósitos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeposits}</div>
              <p className="text-xs text-muted-foreground">
                Depósitos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.paidCommissions.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total em comissões
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Afiliados */}
        <Card>
          <CardHeader>
            <CardTitle>Afiliados Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {affiliates.map((affiliate) => (
                <div key={affiliate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{affiliate.username}</div>
                    <div className="text-sm text-muted-foreground">{affiliate.email}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">R$ {affiliate.totalCommission.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {affiliate.totalConversions} conversões
                      </div>
                    </div>
                    <Badge variant={affiliate.isActive ? "default" : "secondary"}>
                      {affiliate.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu de Ações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Gerenciar Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualizar e gerenciar todos os afiliados cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Casas de Apostas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configurar e gerenciar as casas de apostas disponíveis
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acessar relatórios detalhados de performance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}