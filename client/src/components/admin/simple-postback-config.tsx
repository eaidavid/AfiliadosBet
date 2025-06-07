import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimplePostbackConfigProps {
  house: any;
  onClose: () => void;
}

export default function SimplePostbackConfig({ house, onClose }: SimplePostbackConfigProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const baseUrl = window.location.origin;

  const postbackUrls = {
    click: `${baseUrl}/postback/click?token=${house.securityToken}&subid={username}&customer_id={customer_id}`,
    register: `${baseUrl}/postback/register?token=${house.securityToken}&subid={username}&customer_id={customer_id}`,
    deposit: `${baseUrl}/postback/deposit?token=${house.securityToken}&subid={username}&customer_id={customer_id}&value={amount}`,
    revenue: `${baseUrl}/postback/revenue?token=${house.securityToken}&subid={username}&customer_id={customer_id}&value={amount}`,
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copiado!",
      description: `URL de ${type} copiada para a área de transferência`,
    });
  };

  const testPostback = async (url: string, type: string) => {
    try {
      const testUrl = url.replace('{username}', 'test_user')
                        .replace('{customer_id}', '12345')
                        .replace('{amount}', '50.00');
      
      const response = await fetch(testUrl);
      const result = await response.json();
      
      toast({
        title: response.ok ? "Teste bem-sucedido!" : "Erro no teste",
        description: response.ok ? `Postback ${type} funcionando` : result.error || "Erro desconhecido",
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">
                Configuração de Postbacks - {house.name}
              </CardTitle>
              <p className="text-slate-400 mt-1">
                URLs prontas para integração com a casa de apostas
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Token Info */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <Label className="text-slate-300 text-sm font-medium">Token de Segurança</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input 
                value={house.securityToken} 
                readOnly 
                className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(house.securityToken, 'token')}
                className="text-slate-400 hover:text-white"
              >
                {copied === 'token' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Postback URLs */}
          <div className="grid gap-4">
            {Object.entries(postbackUrls).map(([type, url]) => (
              <div key={type} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Label className="text-white font-medium capitalize">{type}</Label>
                    <Badge variant="secondary" className="bg-emerald-600 text-white">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(url, type)}
                      className="text-slate-400 hover:text-white"
                    >
                      {copied === type ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => testPostback(url, type)}
                      className="text-slate-400 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Input 
                  value={url} 
                  readOnly 
                  className="bg-slate-700 border-slate-600 text-slate-300 font-mono text-xs"
                />
                <p className="text-slate-500 text-xs mt-2">
                  {type === 'click' && 'Registra cliques nos links de afiliado'}
                  {type === 'register' && 'Registra cadastros de novos usuários'}
                  {type === 'deposit' && 'Registra depósitos (requer parâmetro value)'}
                  {type === 'revenue' && 'Registra receita/profit (requer parâmetro value)'}
                </p>
              </div>
            ))}
          </div>

          {/* Parameter Guide */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-3">Parâmetros Obrigatórios</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-400 font-mono">token</span>
                <p className="text-slate-400">Token de segurança da casa</p>
              </div>
              <div>
                <span className="text-emerald-400 font-mono">subid</span>
                <p className="text-slate-400">Username do afiliado</p>
              </div>
              <div>
                <span className="text-emerald-400 font-mono">customer_id</span>
                <p className="text-slate-400">ID único do cliente</p>
              </div>
              <div>
                <span className="text-emerald-400 font-mono">value</span>
                <p className="text-slate-400">Valor da transação (para deposit/revenue)</p>
              </div>
            </div>
          </div>

          {/* Example Usage */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-3">Exemplo de Uso</h3>
            <div className="bg-slate-800 p-3 rounded font-mono text-xs text-slate-300">
              <p className="text-emerald-400">// Usuário "eadavid" fez depósito de R$ 50</p>
              <p className="break-all">
                {baseUrl}/postback/deposit?token={house.securityToken}&subid=eadavid&customer_id=67890&value=50.00
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}