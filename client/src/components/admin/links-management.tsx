import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Link, 
  ExternalLink, 
  Copy, 
  Eye, 
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinksManagementProps {
  onPageChange?: (page: string) => void;
}

export default function LinksManagement({ onPageChange }: LinksManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: allLinks = [], isLoading } = useQuery({
    queryKey: ["/api/admin/all-links"],
    retry: false,
  });

  const { data: postbackTests = [] } = useQuery({
    queryKey: ["/api/admin/postback-tests"],
    retry: false,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência",
    });
  };

  const testPostback = async (houseId: number, houseName: string) => {
    try {
      const response = await fetch(`/api/postback/${houseName.toLowerCase()}/click?subid=testuser&customer_id=TEST123`);
      const result = await response.json();
      
      toast({
        title: response.ok ? "Postback OK!" : "Erro no Postback",
        description: result.message,
        variant: response.ok ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: "Falha ao testar postback",
        variant: "destructive",
      });
    }
  };

  const filteredLinks = allLinks.filter((link: any) =>
    link.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.houseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Links</h1>
          <p className="text-slate-400 mt-1">Visualize e teste todos os links de afiliados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link className="h-8 w-8 text-emerald-500" />
        </div>
      </div>

      {/* Busca e Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por afiliado ou casa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* URLs de Postback por Casa */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            URLs de Postback por Casa
          </CardTitle>
          <CardDescription className="text-slate-400">
            URLs que as casas devem usar para enviar postbacks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Brazino */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Brazino (RevShare 30%)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Click:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">
                      /api/postback/brazino/click?subid=USERNAME&customer_id=ID
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testPostback(7, 'brazino')}
                      className="h-6 text-xs"
                    >
                      Testar
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Registro:</span>
                  <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">
                    /api/postback/brazino/registration?subid=USERNAME&customer_id=ID
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Depósito:</span>
                  <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">
                    /api/postback/brazino/deposit?subid=USERNAME&customer_id=ID&amount=VALUE
                  </code>
                </div>
              </div>
            </div>

            {/* Bet365 */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Bet365 (CPA R$ 150)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Click:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">
                      /api/postback/bet365/click?subid=USERNAME&customer_id=ID
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testPostback(8, 'bet365')}
                      className="h-6 text-xs"
                    >
                      Testar
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Registro:</span>
                  <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">
                    /api/postback/bet365/registration?subid=USERNAME&customer_id=ID
                  </code>
                </div>
              </div>
            </div>

            {/* Pixbet */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Pixbet (RevShare 25%)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Click:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-slate-800 px-2 py-1 rounded text-purple-400">
                      /api/postback/pixbet/click?subid=USERNAME&customer_id=ID
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testPostback(9, 'pixbet')}
                      className="h-6 text-xs"
                    >
                      Testar
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Depósito:</span>
                  <code className="bg-slate-800 px-2 py-1 rounded text-purple-400">
                    /api/postback/pixbet/deposit?subid=USERNAME&customer_id=ID&amount=VALUE
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Links */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Links de Afiliados Gerados</CardTitle>
          <CardDescription className="text-slate-400">
            Todos os links ativos no sistema ({filteredLinks.length} links)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-slate-400 mt-2">Carregando links...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Afiliado</TableHead>
                  <TableHead className="text-slate-300">Casa de Apostas</TableHead>
                  <TableHead className="text-slate-300">Link Gerado</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Criado em</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link: any) => (
                  <TableRow key={link.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">
                      {link.userName}
                    </TableCell>
                    <TableCell className="text-white">
                      {link.houseName}
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono text-xs max-w-md truncate">
                      {link.generatedUrl}
                    </TableCell>
                    <TableCell>
                      <Badge className={link.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {link.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(link.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(link.generatedUrl)}
                          className="h-6"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(link.generatedUrl, '_blank')}
                          className="h-6"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}