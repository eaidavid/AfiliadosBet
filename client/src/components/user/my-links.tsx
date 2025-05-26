import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MousePointer, UserPlus, CreditCard, DollarSign, Copy, BarChart3, Unlink, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MyLinks() {
  const { toast } = useToast();

  const { data: links, isLoading } = useQuery({
    queryKey: ["/api/my-links"],
  });

  const { data: linkStats } = useQuery({
    queryKey: ["/api/stats/user"],
  });

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-slate-400">Carregando seus links...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meus Links</h1>
          <p className="text-slate-400">Gerencie todos os seus links de afiliado e acompanhe seu desempenho.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Links Ativos</p>
                <p className="text-2xl font-bold text-white mt-1">{links?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Cliques Total</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {linkStats?.totalClicks?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {linkStats?.conversionRate?.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Links */}
      {links && links.length > 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Links Ativos</h3>
            <div className="space-y-6">
              {links.map((link: any) => (
                <div key={link.id} className="border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {link.house?.name?.charAt(0) || "H"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-lg">{link.house?.name}</h4>
                        <p className="text-slate-400 text-sm">
                          Ativo desde {new Date(link.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => copyLink(link.generatedUrl)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Estatísticas
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                    <div className="text-slate-400 text-sm mb-2">Seu Link:</div>
                    <div className="text-white font-mono text-sm break-all">
                      {link.generatedUrl}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {link.stats?.clicks || 0}
                      </div>
                      <div className="text-slate-400 text-sm">Cliques</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-500">
                        {link.stats?.registrations || 0}
                      </div>
                      <div className="text-slate-400 text-sm">Registros</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {link.stats?.deposits || 0}
                      </div>
                      <div className="text-slate-400 text-sm">Depósitos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        R$ {link.stats?.commission?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-slate-400 text-sm">Comissão</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            <LinkIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum link ativo</h3>
            <p className="text-slate-400 mb-6">
              Você ainda não se afiliou a nenhuma casa de apostas. Comece agora!
            </p>
            <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white">
              Ver Casas Disponíveis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
