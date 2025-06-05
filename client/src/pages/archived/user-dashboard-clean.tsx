import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, TrendingUp, Users, DollarSign, MousePointer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Conversion {
  id: number;
  affiliateId: number;
  house: string;
  event: string;
  value: string;
  status: string;
  convertedAt: string;
}

interface AffiliateLink {
  id: number;
  affiliateId: number;
  house: string;
  url: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalCommission: number;
  totalConversions: number;
  totalClicks: number;
  conversionRate: number;
}

export default function UserDashboard() {
  const [affiliateId] = useState(1);

  const { data: conversions = [] } = useQuery<Conversion[]>({
    queryKey: ['/api/conversions', affiliateId],
  });

  const { data: links = [] } = useQuery<AffiliateLink[]>({
    queryKey: ['/api/affiliate-links', affiliateId],
  });

  const stats: DashboardStats = {
    totalCommission: conversions.reduce((sum, conv) => sum + parseFloat(conv.value || '0'), 0),
    totalConversions: conversions.length,
    totalClicks: 150, // Dados exemplo
    conversionRate: conversions.length > 0 ? (conversions.length / 150) * 100 : 0
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard do Afiliado</h1>
        <Badge variant="outline" className="text-sm">
          Usuário: eaidav
        </Badge>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +5% desde o último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              Confirmadas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Total de visitantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa média mensal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Links de Afiliado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Seus Links de Afiliado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum link de afiliado encontrado
              </p>
            ) : (
              links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{link.house}</div>
                    <div className="text-sm text-muted-foreground break-all">
                      {link.url}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={link.isActive ? "default" : "secondary"}>
                      {link.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversões Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Conversões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma conversão encontrada
              </p>
            ) : (
              conversions.slice(0, 5).map((conversion) => (
                <div key={conversion.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{conversion.house}</div>
                    <div className="text-sm text-muted-foreground">
                      {conversion.event} • {new Date(conversion.convertedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">R$ {conversion.value}</div>
                      <Badge variant={conversion.status === 'confirmed' ? "default" : "secondary"}>
                        {conversion.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}