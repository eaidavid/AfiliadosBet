import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface PostbackGeneratorProps {
  onPageChange?: (page: string) => void;
}

export default function PostbackGenerator({ onPageChange }: PostbackGeneratorProps) {
  const [selectedHouse, setSelectedHouse] = useState('');
  const [eventType, setEventType] = useState('');
  const [subid, setSubid] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const { data: houses = [] } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
  });

  const baseUrl = window.location.origin;

  const eventTypes = [
    { value: 'click', label: 'Click (Clique)', needsAmount: false },
    { value: 'registration', label: 'Registration (Cadastro)', needsAmount: false },
    { value: 'deposit', label: 'Deposit (Depósito)', needsAmount: true },
    { value: 'revenue', label: 'Revenue (Receita)', needsAmount: true },
    { value: 'withdrawal', label: 'Withdrawal (Saque)', needsAmount: true },
    { value: 'recurring-deposit', label: 'Recurring Deposit', needsAmount: true }
  ];

  const generatePostbackUrl = () => {
    if (!selectedHouse || !eventType) return '';

    const selectedEvent = eventTypes.find(e => e.value === eventType);
    const housesArray = Array.isArray(houses) ? houses : [];
    const house = housesArray.find((h: any) => h.id.toString() === selectedHouse);
    
    if (!house) return '';

    let url = `${baseUrl}/api/postback/${eventType}?house=${house.name.toLowerCase()}`;
    
    if (subid) url += `&subid=${subid}`;
    if (customerId) url += `&customer_id=${customerId}`;
    if (amount && selectedEvent?.needsAmount) url += `&amount=${amount}`;

    return url;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const testPostback = async () => {
    const url = generatePostbackUrl();
    if (!url) return;

    try {
      const response = await fetch(url);
      const result = await response.json();
      
      toast({
        title: response.ok ? "Teste realizado!" : "Erro no teste",
        description: response.ok ? "Postback executado com sucesso" : result.error || "Erro desconhecido",
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

  const generatedUrl = generatePostbackUrl();
  const selectedEvent = eventTypes.find(e => e.value === eventType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Gerador de Postbacks</h2>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Configurar Postback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Casa de Apostas</Label>
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione uma casa" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {Array.isArray(houses) && (houses as any[]).map((house: any) => (
                    <SelectItem 
                      key={house.id} 
                      value={house.id.toString()}
                      className="text-white hover:bg-slate-600"
                    >
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Tipo de Evento</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {eventTypes.map((event) => (
                    <SelectItem 
                      key={event.value} 
                      value={event.value}
                      className="text-white hover:bg-slate-600"
                    >
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300">SubID (Afiliado)</Label>
              <Input
                value={subid}
                onChange={(e) => setSubid(e.target.value)}
                placeholder="ex: eaidavid"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Customer ID</Label>
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="ex: 12345"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {selectedEvent?.needsAmount && (
              <div>
                <Label className="text-slate-300">Valor (R$)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ex: 100"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedUrl && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">URL Gerada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <code className="text-emerald-400 text-sm break-all">
                {generatedUrl}
              </code>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => copyToClipboard(generatedUrl)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar URL
              </Button>
              
              <Button
                onClick={testPostback}
                variant="outline"
                className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Testar Postback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <p><strong>1.</strong> Selecione a casa de apostas e o tipo de evento</p>
          <p><strong>2.</strong> Preencha os parâmetros obrigatórios (SubID e Customer ID)</p>
          <p><strong>3.</strong> Para eventos monetários, informe o valor</p>
          <p><strong>4.</strong> Copie a URL gerada e configure na casa de apostas</p>
          <p><strong>5.</strong> Teste o postback para verificar se está funcionando</p>
        </CardContent>
      </Card>
    </div>
  );
}