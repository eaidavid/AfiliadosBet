import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { Copy, Send, ExternalLink, Download, Filter, Zap, Globe, Code, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BettingHouse {
  id: number;
  name: string;
  identifier: string;
  security_token?: string;
  enabled_postbacks?: string[];
  status: boolean;
}

interface RegisteredPostback {
  id: number;
  house_id: number;
  house_name: string;
  name: string;
  url: string;
  event_type: string;
  description?: string;
  parameter_mapping?: string;
  is_active: boolean;
}

interface TestParameters {
  subid: string;
  customer_id: string;
  valor: string;
  evento: string;
  token?: string;
  [key: string]: string | undefined;
}

interface TestResponse {
  status: number;
  statusText: string;
  data: any;
  url: string;
  method: string;
}

export default function PostbackGenerator() {
  const [selectedHouse, setSelectedHouse] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [testParams, setTestParams] = useState<TestParameters>({
    subid: "TEST001",
    customer_id: "CUST123",
    valor: "100.00",
    evento: "deposit"
  });
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [testResponse, setTestResponse] = useState<TestResponse | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [expandedHouse, setExpandedHouse] = useState<string>("");

  // Fetch betting houses
  const { data: bettingHouses = [], isLoading: loadingHouses } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
  });

  // Fetch registered postbacks
  const { data: postbacks = [], isLoading: loadingPostbacks } = useQuery({
    queryKey: ["/api/admin/registered-postbacks"],
  });

  // Test postback mutation
  const testPostbackMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.text();
      return {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: url,
        method: 'GET'
      };
    },
    onSuccess: (data) => {
      setTestResponse(data);
      setShowResponseModal(true);
      toast({
        title: "Teste realizado",
        description: `Status: ${data.status} ${data.statusText}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no teste",
        description: error.message || "Falha ao enviar requisição de teste",
        variant: "destructive",
      });
    },
  });

  // Filter postbacks based on selected house and event
  const filteredPostbacks = useMemo(() => {
    let filtered = Array.isArray(postbacks) ? postbacks : [];
    
    if (selectedHouse !== "all") {
      filtered = filtered.filter(pb => pb.house_id.toString() === selectedHouse);
    }
    
    if (selectedEvent !== "all") {
      filtered = filtered.filter(pb => pb.event_type === selectedEvent);
    }
    
    return filtered;
  }, [postbacks, selectedHouse, selectedEvent]);

  // Group postbacks by house
  const postbacksByHouse = useMemo(() => {
    const grouped: { [key: string]: { house: BettingHouse; postbacks: RegisteredPostback[] } } = {};
    
    filteredPostbacks.forEach(postback => {
      const house = Array.isArray(bettingHouses) ? 
        bettingHouses.find((h: BettingHouse) => h.id === postback.house_id) : null;
      
      if (house) {
        if (!grouped[house.id]) {
          grouped[house.id] = { house, postbacks: [] };
        }
        grouped[house.id].postbacks.push(postback);
      }
    });
    
    return grouped;
  }, [filteredPostbacks, bettingHouses]);

  // Get unique event types
  const eventTypes = useMemo(() => {
    const events = new Set<string>();
    if (Array.isArray(postbacks)) {
      postbacks.forEach(pb => events.add(pb.event_type));
    }
    return Array.from(events);
  }, [postbacks]);

  // Generate test URL
  const generateTestUrl = (postback: RegisteredPostback) => {
    let url = postback.url;
    
    // Find the house for security token
    const house = Array.isArray(bettingHouses) ? 
      bettingHouses.find((h: BettingHouse) => h.id === postback.house_id) : null;
    
    // Replace parameters
    Object.entries(testParams).forEach(([key, value]) => {
      if (value) {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
        url = url.replace(`{{${key}}}`, encodeURIComponent(value));
        url = url.replace(`[${key}]`, encodeURIComponent(value));
      }
    });
    
    // Add security token if available
    if (house?.security_token) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}token=${house.security_token}`;
    }
    
    return url;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "URL copiada para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao copiar para área de transferência",
        variant: "destructive",
      });
    }
  };

  // Export postbacks
  const exportPostbacks = () => {
    const exportData = filteredPostbacks.map(pb => ({
      casa: pb.house_name,
      nome: pb.name,
      evento: pb.event_type,
      url: pb.url,
      ativo: pb.is_active
    }));
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postbacks_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportado!",
      description: "Arquivo JSON baixado com sucesso",
    });
  };

  if (loadingHouses || loadingPostbacks) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerador de Postbacks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Teste e valide URLs de postback das casas de apostas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={exportPostbacks}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="house-filter">Casa de Apostas</Label>
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as casas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as casas</SelectItem>
                  {Array.isArray(bettingHouses) && bettingHouses.map((house: BettingHouse) => (
                    <SelectItem key={house.id} value={house.id.toString()}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="event-filter">Tipo de Evento</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os eventos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os eventos</SelectItem>
                  {eventTypes.map(event => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedHouse("all");
                  setSelectedEvent("all");
                }}
                variant="outline"
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Parâmetros de Teste
          </CardTitle>
          <CardDescription>
            Configure os valores que serão usados para gerar as URLs de teste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="subid">SubID</Label>
              <Input
                id="subid"
                value={testParams.subid}
                onChange={(e) => setTestParams(prev => ({ ...prev, subid: e.target.value }))}
                placeholder="Ex: TEST001"
              />
            </div>
            
            <div>
              <Label htmlFor="customer_id">Customer ID</Label>
              <Input
                id="customer_id"
                value={testParams.customer_id}
                onChange={(e) => setTestParams(prev => ({ ...prev, customer_id: e.target.value }))}
                placeholder="Ex: CUST123"
              />
            </div>
            
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                value={testParams.valor}
                onChange={(e) => setTestParams(prev => ({ ...prev, valor: e.target.value }))}
                placeholder="Ex: 100.00"
              />
            </div>
            
            <div>
              <Label htmlFor="evento">Evento</Label>
              <Select 
                value={testParams.evento} 
                onValueChange={(value) => setTestParams(prev => ({ ...prev, evento: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="bet">Bet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Postbacks by House */}
      <div className="space-y-4">
        {Object.keys(postbacksByHouse).length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum postback encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ajuste os filtros ou cadastre novos postbacks para as casas de apostas
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible value={expandedHouse} onValueChange={setExpandedHouse}>
            {Object.entries(postbacksByHouse).map(([houseId, { house, postbacks: housePostbacks }]) => (
              <AccordionItem key={houseId} value={houseId}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{house.name}</span>
                      <Badge variant={house.status ? "default" : "secondary"}>
                        {house.status ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <Badge variant="outline">{housePostbacks.length} postbacks</Badge>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {housePostbacks.map(postback => {
                      const testUrl = generateTestUrl(postback);
                      
                      return (
                        <Card key={postback.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {postback.name}
                                  <Badge variant={postback.is_active ? "default" : "secondary"}>
                                    {postback.is_active ? "Ativo" : "Inativo"}
                                  </Badge>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{postback.event_type}</Badge>
                                  {postback.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="w-4 h-4 text-gray-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{postback.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Original URL Template */}
                            <div>
                              <Label className="text-sm font-medium">URL Template</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  value={postback.url}
                                  readOnly
                                  className="font-mono text-sm bg-gray-50 dark:bg-gray-800"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(postback.url)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Generated Test URL */}
                            <div>
                              <Label className="text-sm font-medium">URL de Teste Gerada</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  value={testUrl}
                                  readOnly
                                  className="font-mono text-sm bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(testUrl)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => window.open(testUrl, '_blank')}
                                  variant="outline"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Test Button */}
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => testPostbackMutation.mutate(testUrl)}
                                disabled={testPostbackMutation.isPending}
                                className="flex items-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                {testPostbackMutation.isPending ? "Testando..." : "Enviar Teste"}
                              </Button>
                              
                              {testResponse && (
                                <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      Ver Última Resposta
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Resposta do Teste
            </DialogTitle>
            <DialogDescription>
              Resultado da requisição enviada para o endpoint
            </DialogDescription>
          </DialogHeader>
          
          {testResponse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status HTTP</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={testResponse.status < 400 ? "default" : "destructive"}>
                      {testResponse.status}
                    </Badge>
                    <span className="text-sm">{testResponse.statusText}</span>
                    {testResponse.status < 400 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Método</Label>
                  <Badge variant="outline" className="mt-1">{testResponse.method}</Badge>
                </div>
              </div>
              
              <div>
                <Label>URL Testada</Label>
                <Input
                  value={testResponse.url}
                  readOnly
                  className="font-mono text-sm mt-1"
                />
              </div>
              
              <div>
                <Label>Resposta</Label>
                <Textarea
                  value={typeof testResponse.data === 'string' ? testResponse.data : JSON.stringify(testResponse.data, null, 2)}
                  readOnly
                  className="font-mono text-sm mt-1 min-h-[200px]"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}