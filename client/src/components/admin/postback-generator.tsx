import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle, AlertTriangle, Webhook, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface PostbackGeneratorProps {
  onPageChange?: (page: string) => void;
}

export default function PostbackGenerator({ onPageChange }: PostbackGeneratorProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: houses = [], isLoading } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
  });

  const housesList = Array.isArray(houses) ? houses : [];
  const baseUrl = window.location.origin;

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(identifier);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({
      title: "URL copiada!",
      description: "URL copiada para a área de transferência",
    });
  };

  const testPostback = async (url: string, houseName: string, event: string) => {
    setTestingUrl(url);
    try {
      const testUrl = url.replace('{username}', 'eadavid')
                        .replace('{customer_id}', '12345')
                        .replace('{amount}', '50.00');
      
      const response = await fetch(testUrl);
      const result = await response.json();
      
      toast({
        title: response.ok ? "✅ Teste bem-sucedido!" : "❌ Erro no teste",
        description: response.ok 
          ? `Postback ${event} de ${houseName} funcionando corretamente` 
          : result.error || "Erro desconhecido",
        variant: response.ok ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "❌ Erro no teste",
        description: "Falha na conexão com o servidor",
        variant: "destructive"
      });
    } finally {
      setTestingUrl(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-slate-400">Carregando casas de apostas...</div>
        </div>
      </div>
    );
  }

  const postbackEvents = [
    { 
      name: 'Click', 
      event: 'click',
      description: 'Registra cliques nos links de afiliado',
      icon: '🖱️'
    },
    { 
      name: 'Registration', 
      event: 'register',
      description: 'Registra cadastros de novos usuários',
      icon: '📝'
    },
    { 
      name: 'Deposit', 
      event: 'deposit',
      description: 'Registra depósitos (requer parâmetro value)',
      icon: '💰'
    },
    { 
      name: 'Revenue', 
      event: 'revenue',
      description: 'Registra receita/profit (requer parâmetro value)',
      icon: '📈'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Gerador de Postbacks</h2>
        <p className="text-slate-400">URLs automáticas geradas para todas as casas de apostas cadastradas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Casas Ativas</p>
                <p className="text-2xl font-bold text-emerald-400">{housesList.filter(h => h.isActive).length}</p>
              </div>
              <Webhook className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total URLs</p>
                <p className="text-2xl font-bold text-blue-400">{housesList.length * 4}</p>
              </div>
              <ExternalLink className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Eventos</p>
                <p className="text-2xl font-bold text-purple-400">4</p>
              </div>
              <TestTube className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <p className="text-2xl font-bold text-emerald-400">✓</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Houses and Postbacks */}
      <div className="space-y-6">
        {housesList.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma casa cadastrada</h3>
              <p className="text-slate-400 mb-4">Cadastre uma casa de apostas para gerar postbacks automaticamente.</p>
              <Button 
                onClick={() => onPageChange?.('houses')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Cadastrar Casa de Apostas
              </Button>
            </CardContent>
          </Card>
        ) : (
          housesList.map((house: any) => (
            <Card key={house.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {house.logoUrl && (
                      <img 
                        src={house.logoUrl} 
                        alt={house.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-white text-xl">{house.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={house.isActive ? "default" : "secondary"} 
                               className={house.isActive ? "bg-emerald-600" : "bg-slate-600"}>
                          {house.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                        <span className="text-slate-400 text-sm">Token: {house.securityToken}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {postbackEvents.map((postback) => {
                    const postbackUrl = `${baseUrl}/postback/${postback.event}?token=${house.securityToken}&subid={username}&customer_id={customer_id}${postback.event === 'deposit' || postback.event === 'revenue' ? '&value={amount}' : ''}`;
                    const urlId = `${house.id}-${postback.event}`;
                    const isTestingThis = testingUrl === postbackUrl;

                    return (
                      <div key={postback.event} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{postback.icon}</span>
                            <div>
                              <Label className="text-white font-medium text-lg">{postback.name}</Label>
                              <p className="text-slate-400 text-sm">{postback.description}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(postbackUrl, urlId)}
                              className="text-slate-400 hover:text-white hover:bg-slate-600"
                              disabled={isTestingThis}
                            >
                              {copiedUrl === urlId ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => testPostback(postbackUrl, house.name, postback.name)}
                              className="text-slate-400 hover:text-white hover:bg-slate-600"
                              disabled={isTestingThis}
                            >
                              {isTestingThis ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <TestTube className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm">URL do Postback:</Label>
                          <div className="bg-slate-800 p-3 rounded border">
                            <code className="text-emerald-400 text-sm break-all">{postbackUrl}</code>
                          </div>
                        </div>

                        {/* Example usage */}
                        <div className="mt-3 p-3 bg-slate-800 rounded border-l-4 border-emerald-500">
                          <Label className="text-emerald-400 text-sm font-medium">Exemplo de uso:</Label>
                          <div className="mt-1">
                            <code className="text-slate-300 text-xs break-all">
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
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Webhook className="w-5 h-5" />
            <span>Como Usar os Postbacks</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-emerald-400 font-medium mb-3">Parâmetros Obrigatórios</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span><code className="text-emerald-400">token</code> - Token de segurança da casa</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span><code className="text-emerald-400">subid</code> - Username do afiliado</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span><code className="text-emerald-400">customer_id</code> - ID único do cliente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span><code className="text-blue-400">value</code> - Valor (apenas deposit/revenue)</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-3">Eventos Disponíveis</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <span>🖱️</span>
                  <span><strong>Click:</strong> Rastreamento de cliques</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📝</span>
                  <span><strong>Register:</strong> Cadastros de usuários</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>💰</span>
                  <span><strong>Deposit:</strong> Depósitos (CPA: R$ 150)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📈</span>
                  <span><strong>Revenue:</strong> Receita (RevShare: 30%)</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-600 pt-4">
            <h4 className="text-emerald-400 font-medium mb-2">Integração</h4>
            <p className="text-slate-400 text-sm">
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