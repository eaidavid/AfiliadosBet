import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, MousePointer, Copy, ExternalLink } from "lucide-react";

export default function DashboardSimple() {
  const userStats = {
    totalClicks: 25,
    totalRegistrations: 1,
    totalDeposits: 1,
    totalCommission: 110,
    conversionRate: 4.0
  };

  const userCommissions = [
    {
      id: 1,
      house: "Brazino777",
      amount: 110,
      type: "CPA + Depósito",
      status: "Pago",
      date: "2024-12-01"
    }
  ];

  const affiliateLinks = [
    {
      id: 1,
      house: "Brazino777",
      url: "https://brasino777.com/?btag=eaidav",
      clicks: 25,
      conversions: 1
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Afiliado</h1>
          <Badge variant="outline" className="text-sm">
            Usuário: eaidav
          </Badge>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cliques</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalClicks}</div>
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
              <div className="text-2xl font-bold">{userStats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                Novos registros gerados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depósitos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalDeposits}</div>
              <p className="text-xs text-muted-foreground">
                Depósitos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {userStats.totalCommission.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total acumulado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Taxa de conversão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Links de Afiliado */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Links de Afiliado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {affiliateLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{link.house}</div>
                    <div className="text-sm text-muted-foreground font-mono">{link.url}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{link.clicks} cliques</div>
                      <div className="text-sm text-muted-foreground">
                        {link.conversions} conversões
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(link.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Comissões */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userCommissions.map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{commission.house}</div>
                    <div className="text-sm text-muted-foreground">
                      {commission.type} • {commission.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">R$ {commission.amount.toFixed(2)}</div>
                    </div>
                    <Badge variant={commission.status === "Pago" ? "default" : "secondary"}>
                      {commission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}