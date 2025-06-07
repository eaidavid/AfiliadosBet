import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Copy, TestTube, CheckCircle, AlertTriangle, Webhook, ExternalLink } from "lucide-react";

interface PostbackGeneratorProps {
  onPageChange?: (page: string) => void;
}

export default function PostbackGenerator({ onPageChange }: PostbackGeneratorProps) {
  const [copiedUrl, setCopiedUrl] = useState<string>("");
  const [testingUrl, setTestingUrl] = useState<string>("");

  const { data: houses = [] } = useQuery({
    queryKey: ['/api/admin/houses'],
  });

  const housesList = Array.isArray(houses) ? houses : [];
  const baseUrl = window.location.origin;

  const postbackEvents = [
    {
      event: 'click',
      name: 'Click',
      description: 'Registra cliques nos links de afiliado',
      icon: '👆'
    },
    {
      event: 'register',
      name: 'Cadastro',
      description: 'Registra novos cadastros de usuários',
      icon: '👤'
    },
    {
      event: 'deposit',
      name: 'Depósito',
      description: 'Registra depósitos realizados pelos usuários',
      icon: '💰'
    },
    {
      event: 'revenue',
      name: 'Receita',
      description: 'Registra receitas geradas pelos usuários',
      icon: '📈'
    }
  ];

  const copyToClipboard = async (text: string, urlId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(urlId);
      toast({
        title: "URL copiada!",
        description: "A URL do postback foi copiada para a área de transferência.",
      });
      setTimeout(() => setCopiedUrl(""), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const testPostback = async (url: string, houseName: string, eventName: string) => {
    setTestingUrl(url);
    try {
      const testUrl = url
        .replace('{username}', 'teste')
        .replace('{customer_id}', '999')
        .replace('{amount}', '100.00');

      const response = await fetch(testUrl, {
        method: 'GET',
      });

      if (response.ok) {
        toast({
          title: "Teste realizado com sucesso!",
          description: `Postback de ${eventName} para ${houseName} funcionando corretamente.`,
        });
      } else {
        toast({
          title: "Erro no teste",
          description: `O postback retornou status ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o postback.",
        variant: "destructive",
      });
    } finally {
      setTestingUrl("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
          Gerador de Postbacks
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          URLs automáticas geradas para todas as casas de apostas cadastradas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs md:text-sm truncate">Casas Ativas</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-400">
                  {housesList.filter(h => h.isActive).length}
                </p>
              </div>
              <Webhook className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs md:text-sm truncate">Total URLs</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-400">
                  {housesList.length * 4}
                </p>
              </div>
              <ExternalLink className="w-6 h-6 md:w-8 md:h-8 text-blue-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs md:text-sm truncate">Eventos</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-400">4</p>
              </div>
              <TestTube className="w-6 h-6 md:w-8 md:h-8 text-purple-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs md:text-sm truncate">Status</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-400">✓</p>
              </div>
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Houses and Postbacks */}
      <div className="space-y-4 md:space-y-6">
        {housesList.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 md:p-12 text-center">
              <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                Nenhuma casa cadastrada
              </h3>
              <p className="text-slate-400 mb-4 text-sm md:text-base">
                Cadastre uma casa de apostas para gerar postbacks automaticamente.
              </p>
              <Button 
                onClick={() => onPageChange?.('houses')}
                className="bg-emerald-600 hover:bg-emerald-700 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                Cadastrar Casa de Apostas
              </Button>
            </CardContent>
          </Card>
        ) : (
          housesList.map((house: any) => (
            <Card key={house.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {house.logoUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={house.logoUrl} 
                          alt={house.name}
                          className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-white text-lg md:text-xl lg:text-2xl truncate">
                        {house.name}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                        <Badge 
                          variant={house.isActive ? "default" : "secondary"} 
                          className={`${house.isActive ? "bg-emerald-600" : "bg-slate-600"} text-xs md:text-sm`}
                        >
                          {house.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                        <span className="text-slate-400 text-xs md:text-sm truncate">
                          Token: <span className="font-mono">{house.securityToken}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                <div className="grid gap-3 md:gap-4">
                  {postbackEvents.map((postback) => {
                    const postbackUrl = `${baseUrl}/postback/${postback.event}?token=${house.securityToken}&subid={username}&customer_id={customer_id}${postback.event === 'deposit' || postback.event === 'revenue' ? '&value={amount}' : ''}`;
                    const urlId = `${house.id}-${postback.event}`;
                    const isTestingThis = testingUrl === postbackUrl;

                    return (
                      <div key={postback.event} className="bg-slate-700/30 hover:bg-slate-700/50 p-3 md:p-4 rounded-lg border border-slate-600/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex items-start space-x-3 min-w-0 flex-1">
                            <span className="text-xl md:text-2xl flex-shrink-0">{postback.icon}</span>
                            <div className="min-w-0 flex-1">
                              <Label className="text-white font-medium text-sm md:text-lg block">
                                {postback.name}
                              </Label>
                              <p className="text-slate-400 text-xs md:text-sm mt-1">
                                {postback.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(postbackUrl, urlId)}
                              className="text-slate-400 hover:text-white hover:bg-slate-600 h-8 w-8 md:h-9 md:w-9"
                              disabled={isTestingThis}
                            >
                              {copiedUrl === urlId ? (
                                <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                              ) : (
                                <Copy className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => testPostback(postbackUrl, house.name, postback.name)}
                              className="text-slate-400 hover:text-white hover:bg-slate-600 h-8 w-8 md:h-9 md:w-9"
                              disabled={isTestingThis}
                            >
                              {isTestingThis ? (
                                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                              ) : (
                                <TestTube className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-xs md:text-sm">URL do Postback:</Label>
                          <div className="bg-slate-800/50 p-2 md:p-3 rounded border border-slate-600/30">
                            <code className="text-emerald-400 text-xs md:text-sm break-all font-mono leading-relaxed">
                              {postbackUrl}
                            </code>
                          </div>
                        </div>

                        <div className="mt-3 p-2 md:p-3 bg-slate-800/30 rounded border-l-4 border-emerald-500/50">
                          <Label className="text-emerald-400 text-xs md:text-sm font-medium">
                            Exemplo de uso:
                          </Label>
                          <div className="mt-1">
                            <code className="text-slate-300 text-xs break-all font-mono leading-relaxed">
                              {postbackUrl
                                .replace('{username}', 'eadavid')
                                .replace('{customer_id}', '12345')
                                .replace('{amount}', '50.00')
                              }
                            </code>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Usage Instructions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2 text-lg md:text-xl">
            <Webhook className="w-5 h-5 md:w-6 md:h-6" />
            <span>Como Usar os Postbacks</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm md:text-base">
            Instruções para integração dos postbacks em suas aplicações
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h4 className="text-emerald-400 font-medium mb-2 text-sm md:text-base">Parâmetros</h4>
              <ul className="text-slate-400 text-xs md:text-sm space-y-1">
                <li><code className="bg-slate-700 px-1 rounded">token</code> - Token de segurança da casa</li>
                <li><code className="bg-slate-700 px-1 rounded">subid</code> - Username do afiliado</li>
                <li><code className="bg-slate-700 px-1 rounded">customer_id</code> - ID do cliente</li>
                <li><code className="bg-slate-700 px-1 rounded">value</code> - Valor (para depósito/receita)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-emerald-400 font-medium mb-2 text-sm md:text-base">Eventos</h4>
              <ul className="text-slate-400 text-xs md:text-sm space-y-1">
                <li><strong>Click:</strong> Registra cliques nos links</li>
                <li><strong>Register:</strong> Novo cadastro de usuário</li>
                <li><strong>Deposit:</strong> Depósito realizado</li>
                <li><strong>Revenue:</strong> Receita gerada</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-600 pt-4 mt-4">
            <h4 className="text-emerald-400 font-medium mb-2 text-sm md:text-base">Integração</h4>
            <p className="text-slate-400 text-xs md:text-sm">
              As URLs são geradas automaticamente quando você cria uma casa de apostas. 
              Cada casa possui um token único de segurança. Use o botão de teste para verificar 
              se os postbacks estão funcionando corretamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}