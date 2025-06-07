import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPostbackDisplay() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
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
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const testPostback = async (url: string, houseName: string, event: string) => {
    try {
      const testUrl = url.replace('{username}', 'test_user')
                        .replace('{customer_id}', '12345')
                        .replace('{amount}', '50.00');
      
      const response = await fetch(testUrl);
      const result = await response.json();
      
      toast({
        title: response.ok ? "Teste bem-sucedido!" : "Erro no teste",
        description: response.ok ? `Postback ${event} de ${houseName} funcionando` : result.error || "Erro desconhecido",
        variant: response.ok ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha na conexão",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-slate-400">Carregando postbacks...</div>
        </div>
      </div>
    );
  }

  const totalPostbacks = houses.length * 4; // 4 events per house
  const activePostbacks = houses.filter(h => h.isActive).length * 4;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Postbacks do Sistema</h1>
        <p className="text-slate-400">URLs automáticas geradas para todas as casas de apostas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Postbacks</p>
                <p className="text-2xl font-bold text-white">{totalPostbacks}</p>
                <p className="text-slate-500 text-xs">URLs disponíveis</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Postbacks Ativos</p>
                <p className="text-2xl font-bold text-emerald-400">{activePostbacks}</p>
                <p className="text-slate-500 text-xs">em operação</p>
              </div>
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Casas Cadastradas</p>
                <p className="text-2xl font-bold text-white">{houses.length}</p>
                <p className="text-slate-500 text-xs">casas registradas</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Postbacks List */}
      <div className="space-y-4">
        {houses.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma casa cadastrada</h3>
              <p className="text-slate-400">Cadastre uma casa de apostas para ver os postbacks gerados automaticamente.</p>
            </CardContent>
          </Card>
        ) : (
          houses.map((house: any) => {
            const postbackEvents = [
              { 
                name: 'Click', 
                event: 'click',
                url: `${baseUrl}/postback/click?token=${house.securityToken}&subid={username}&customer_id={customer_id}`,
                description: 'Registra cliques nos links de afiliado'
              },
              { 
                name: 'Registration', 
                event: 'register',
                url: `${baseUrl}/postback/register?token=${house.securityToken}&subid={username}&customer_id={customer_id}`,
                description: 'Registra cadastros de novos usuários'
              },
              { 
                name: 'Deposit', 
                event: 'deposit',
                url: `${baseUrl}/postback/deposit?token=${house.securityToken}&subid={username}&customer_id={customer_id}&value={amount}`,
                description: 'Registra depósitos (requer parâmetro value)'
              },
              { 
                name: 'Revenue', 
                event: 'revenue',
                url: `${baseUrl}/postback/revenue?token=${house.securityToken}&subid={username}&customer_id={customer_id}&value={amount}`,
                description: 'Registra receita/profit (requer parâmetro value)'
              }
            ];

            return (
              <Card key={house.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {house.logoUrl && (
                        <img 
                          src={house.logoUrl} 
                          alt={house.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <CardTitle className="text-white">{house.name}</CardTitle>
                        <p className="text-slate-400 text-sm">Token: {house.securityToken}</p>
                      </div>
                    </div>
                    <Badge variant={house.isActive ? "default" : "secondary"} className={house.isActive ? "bg-emerald-600" : "bg-slate-600"}>
                      {house.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {postbackEvents.map((postback) => {
                    const urlId = `${house.id}-${postback.event}`;
                    return (
                      <div key={postback.event} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Label className="text-white font-medium">{postback.name}</Label>
                            <Badge variant="secondary" className="bg-emerald-600 text-white text-xs">
                              Ativo
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(postback.url, urlId)}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedUrl === urlId ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => testPostback(postback.url, house.name, postback.name)}
                              className="text-slate-400 hover:text-white"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Input 
                          value={postback.url} 
                          readOnly 
                          className="bg-slate-700 border-slate-600 text-slate-300 font-mono text-xs mb-2"
                        />
                        <p className="text-slate-500 text-xs">{postback.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Usage Guide */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">Parâmetros Obrigatórios</h4>
              <ul className="text-slate-400 text-sm space-y-1">
                <li><code className="text-emerald-400">token</code> - Token de segurança da casa</li>
                <li><code className="text-emerald-400">subid</code> - Username do afiliado</li>
                <li><code className="text-emerald-400">customer_id</code> - ID único do cliente</li>
                <li><code className="text-emerald-400">value</code> - Valor da transação (para deposit/revenue)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">Exemplo de Uso</h4>
              <div className="bg-slate-700 p-3 rounded text-xs text-slate-300 font-mono">
                {baseUrl}/postback/deposit?token=abc123&subid=eadavid&customer_id=67890&value=50.00
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}