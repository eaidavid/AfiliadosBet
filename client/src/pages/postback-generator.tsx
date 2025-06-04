import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { Copy, Send, Download, Filter, Zap, Globe, Code, CheckCircle, XCircle, AlertTriangle, RefreshCw, Play, Clock, ChevronDown, ChevronRight } from "lucide-react";
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
  responseTime: number;
  timestamp: string;
}

interface TestLog {
  id: string;
  casa: string;
  evento: string;
  url: string;
  success: boolean;
  status: number;
  responseTime: number;
  timestamp: string;
}

export default function PostbackGenerator() {
  const [selectedHouse, setSelectedHouse] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [testParams, setTestParams] = useState<TestParameters>({
    subid: "TEST001",
    customer_id: "123456",
    valor: "100",
    evento: "deposito"
  });
  const [selectedPostback, setSelectedPostback] = useState<RegisteredPostback | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResponse, setTestResponse] = useState<TestResponse | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Fetch betting houses
  const { data: bettingHouses = [] } = useQuery({
    queryKey: ['/api/betting-houses'],
  });

  // Fetch registered postbacks
  const { data: postbacks = [] } = useQuery({
    queryKey: ['/api/admin/registered-postbacks'],
  });

  // Filter postbacks based on selected house and event
  const filteredPostbacks = useMemo(() => {
    if (!Array.isArray(postbacks)) return [];
    
    return postbacks.filter((postback: RegisteredPostback) => {
      const houseMatch = selectedHouse === "all" || postback.house_id.toString() === selectedHouse;
      const eventMatch = selectedEvent === "all" || postback.event_type === selectedEvent;
      return houseMatch && eventMatch;
    });
  }, [postbacks, selectedHouse, selectedEvent]);

  // Get unique event types for filter
  const eventTypes = useMemo(() => {
    if (!Array.isArray(postbacks)) return [];
    const events = postbacks.map((p: RegisteredPostback) => p.event_type);
    return [...new Set(events)];
  }, [postbacks]);

  // Dynamic parameter detection from URL
  const detectParameters = (url: string) => {
    const params: string[] = [];
    const matches = url.match(/\{([^}]+)\}/g);
    if (matches) {
      matches.forEach(match => {
        const param = match.replace(/[{}]/g, '');
        if (!params.includes(param)) {
          params.push(param);
        }
      });
    }
    return params;
  };

  // Generate test URL with parameters
  const generateTestUrl = (postback: RegisteredPostback) => {
    let url = postback.url;
    const house = Array.isArray(bettingHouses) ? 
      bettingHouses.find((h: BettingHouse) => h.id === postback.house_id) : null;
    
    // Replace parameters
    Object.entries(testParams).forEach(([key, value]) => {
      if (value) {
        url = url.replace(`{${key}}`, value);
      }
    });

    // Add security token if available
    if (house?.security_token) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}token=${house.security_token}`;
    }

    return url;
  };

  // Test postback mutation
  const testMutation = useMutation({
    mutationFn: async (postback: RegisteredPostback) => {
      const startTime = Date.now();
      const testUrl = generateTestUrl(postback);
      
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const responseTime = Date.now() - startTime;
        const data = await response.text();
        
        return {
          status: response.status,
          statusText: response.statusText,
          data,
          url: testUrl,
          method: 'GET',
          responseTime,
          timestamp: new Date().toISOString()
        };
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        return {
          status: 0,
          statusText: 'Network Error',
          data: error.message,
          url: testUrl,
          method: 'GET',
          responseTime,
          timestamp: new Date().toISOString()
        };
      }
    },
    onSuccess: (data) => {
      setTestResponse(data);
      
      // Add to test logs
      const newLog: TestLog = {
        id: Date.now().toString(),
        casa: selectedPostback?.house_name || 'Unknown',
        evento: selectedPostback?.event_type || 'Unknown',
        url: data.url,
        success: data.status >= 200 && data.status < 300,
        status: data.status,
        responseTime: data.responseTime,
        timestamp: new Date().toLocaleString()
      };
      
      setTestLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep last 10 logs
      
      toast({
        title: "Teste executado",
        description: `Status: ${data.status} - ${data.statusText}`,
        variant: data.status >= 200 && data.status < 300 ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleTest = (postback: RegisteredPostback) => {
    setSelectedPostback(postback);
    setIsTestModalOpen(true);
    setTestResponse(null);
  };

  const executeTest = () => {
    if (selectedPostback) {
      setIsTestLoading(true);
      testMutation.mutate(selectedPostback);
      setIsTestLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência"
    });
  };

  const clearFilters = () => {
    setSelectedHouse("all");
    setSelectedEvent("all");
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Casa,Evento,URL,Status,Tempo (ms),Data/Hora\n" +
      testLogs.map(log => 
        `${log.casa},${log.evento},${log.url},${log.status},${log.responseTime},${log.timestamp}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "postback_test_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-400" />
              Gerador de Postbacks Profissional
            </h1>
            <p className="text-slate-400 mt-2">
              Teste e valide postbacks de casas de apostas com interface moderna
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-400" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="house-filter" className="text-slate-300">Casa de Apostas</Label>
                <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione a casa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
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
                <Label htmlFor="event-filter" className="text-slate-300">Tipo de Evento</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    {eventTypes.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={exportLogs}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  disabled={testLogs.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Postbacks */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              Postbacks Disponíveis
            </CardTitle>
            <CardDescription className="text-slate-400">
              {filteredPostbacks.length} postback(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPostbacks.map((postback: RegisteredPostback) => (
                <Card key={postback.id} className="bg-slate-800/50 border-slate-600 hover:border-blue-500/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={postback.is_active ? "default" : "secondary"} className="mb-2">
                        {postback.is_active ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Ativo</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Inativo</>
                        )}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-sm">{postback.name}</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      {postback.house_name} • {postback.event_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-slate-400">URL Base:</Label>
                        <p className="text-xs text-slate-300 font-mono bg-slate-900/50 p-2 rounded break-all">
                          {postback.url}
                        </p>
                      </div>
                      
                      {postback.description && (
                        <p className="text-xs text-slate-400">{postback.description}</p>
                      )}
                      
                      <Button
                        onClick={() => handleTest(postback)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Play className="w-3 h-3 mr-2" />
                        Simular
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPostbacks.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhum postback encontrado</h3>
                <p className="text-slate-400">Ajuste os filtros ou registre novos postbacks</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Logs */}
        {testLogs.length > 0 && (
          <Collapsible open={isLogsOpen} onOpenChange={setIsLogsOpen}>
            <Card className="bg-slate-900/50 border-slate-700">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      Logs de Testes ({testLogs.length})
                    </div>
                    {isLogsOpen ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-2">
                    {testLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-600">
                        <div className="flex items-center gap-3">
                          {log.success ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">{log.casa}</p>
                            <p className="text-slate-400 text-xs">{log.evento}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={log.success ? "default" : "destructive"} className="mb-1">
                            {log.status}
                          </Badge>
                          <p className="text-xs text-slate-400">{log.responseTime}ms</p>
                          <p className="text-xs text-slate-500">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Test Modal */}
        <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Teste de Postback - {selectedPostback?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Configure os parâmetros e execute o teste do postback
              </DialogDescription>
            </DialogHeader>

            {selectedPostback && (
              <div className="space-y-6">
                {/* URL Template */}
                <div>
                  <Label className="text-slate-300">URL Template:</Label>
                  <p className="text-sm text-slate-400 font-mono bg-slate-800/50 p-3 rounded mt-1">
                    {selectedPostback.url}
                  </p>
                </div>

                {/* Dynamic Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detectParameters(selectedPostback.url).map((param) => (
                    <div key={param}>
                      <Label htmlFor={param} className="text-slate-300 capitalize">
                        {param.replace('_', ' ')}
                      </Label>
                      <Input
                        id={param}
                        value={testParams[param] || ''}
                        onChange={(e) => setTestParams(prev => ({
                          ...prev,
                          [param]: e.target.value
                        }))}
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder={`Valor para ${param}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Generated URL */}
                <div>
                  <Label className="text-slate-300">URL Gerada:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="flex-1 text-sm text-green-400 font-mono bg-slate-800/50 p-3 rounded">
                      {generateTestUrl(selectedPostback)}
                    </p>
                    <Button
                      onClick={() => copyToClipboard(generateTestUrl(selectedPostback))}
                      variant="outline"
                      size="sm"
                      className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={executeTest}
                    disabled={isTestLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isTestLoading ? "Enviando..." : "Enviar Teste"}
                  </Button>
                  
                  <Button
                    onClick={() => window.open(generateTestUrl(selectedPostback), '_blank')}
                    variant="outline"
                    className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Abrir no Navegador
                  </Button>
                </div>

                {/* Test Response */}
                {testResponse && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Resposta do Teste</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 p-3 rounded">
                        <Label className="text-slate-400 text-xs">Status</Label>
                        <p className="text-lg font-medium text-white">
                          {testResponse.status} {testResponse.statusText}
                        </p>
                      </div>
                      
                      <div className="bg-slate-800/50 p-3 rounded">
                        <Label className="text-slate-400 text-xs">Tempo de Resposta</Label>
                        <p className="text-lg font-medium text-white">
                          {testResponse.responseTime}ms
                        </p>
                      </div>
                      
                      <div className="bg-slate-800/50 p-3 rounded">
                        <Label className="text-slate-400 text-xs">Método</Label>
                        <p className="text-lg font-medium text-white">
                          {testResponse.method}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300">Corpo da Resposta:</Label>
                      <pre className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded mt-1 overflow-auto max-h-60">
                        {typeof testResponse.data === 'string' 
                          ? testResponse.data 
                          : JSON.stringify(testResponse.data, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}