import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Download, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PostbacksManagementProps {
  onPageChange?: (page: string) => void;
}

export default function PostbacksManagement({ onPageChange }: PostbacksManagementProps) {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    type: "all",
    user: "",
    dateFrom: "",
    dateTo: "",
  });

  const { data: postbacks = [], isLoading } = useQuery({
    queryKey: ["/api/admin/postbacks", filters],
    retry: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    retry: false,
  });

  const getTypeBadge = (type: string) => {
    const colors = {
      click: "bg-blue-500",
      registration: "bg-green-500", 
      deposit: "bg-yellow-500",
      recurring_deposit: "bg-orange-500",
      profit: "bg-purple-500",
    };
    return (
      <Badge className={`${colors[type as keyof typeof colors] || "bg-gray-500"} text-white`}>
        {type.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const exportPostbacks = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados dos postbacks serão baixados em breve.",
    });
  };

  const filteredPostbacks = postbacks.filter((postback: any) => {
    if (filters.type !== "all" && postback.type !== filters.type) return false;
    if (filters.user && !postback.username?.toLowerCase().includes(filters.user.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Postbacks Recebidos</h1>
          <p className="text-slate-400 mt-2">
            Acompanhe em tempo real todos os postbacks recebidos das casas de apostas
          </p>
        </div>
        <Button onClick={exportPostbacks} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-emerald-500" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Tipo de Evento</label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="click">Cliques</SelectItem>
                  <SelectItem value="registration">Registros</SelectItem>
                  <SelectItem value="deposit">Depósitos</SelectItem>
                  <SelectItem value="recurring_deposit">Depósitos Recorrentes</SelectItem>
                  <SelectItem value="profit">Lucro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Usuário</label>
              <Input
                placeholder="Filtrar por usuário..."
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Data Final</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Postbacks", value: filteredPostbacks.length, color: "text-blue-400" },
          { label: "Cliques", value: filteredPostbacks.filter(p => p.type === "click").length, color: "text-blue-400" },
          { label: "Registros", value: filteredPostbacks.filter(p => p.type === "registration").length, color: "text-green-400" },
          { label: "Depósitos", value: filteredPostbacks.filter(p => p.type === "deposit").length, color: "text-yellow-400" },
          { label: "Lucro Total", value: `R$ ${filteredPostbacks.filter(p => p.type === "profit").reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}`, color: "text-purple-400" },
        ].map((stat, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Postbacks */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Postbacks Recebidos ({filteredPostbacks.length})</span>
            <Badge className="bg-emerald-600 text-white">
              Tempo Real
            </Badge>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Lista completa de todos os postbacks processados pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Data/Hora</TableHead>
                  <TableHead className="text-slate-300">Tipo</TableHead>
                  <TableHead className="text-slate-300">Usuário</TableHead>
                  <TableHead className="text-slate-300">Casa</TableHead>
                  <TableHead className="text-slate-300">Customer ID</TableHead>
                  <TableHead className="text-slate-300">Valor</TableHead>
                  <TableHead className="text-slate-300">Comissão</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPostbacks.map((postback: any) => (
                  <TableRow key={postback.id} className="border-slate-700">
                    <TableCell className="text-white">
                      {new Date(postback.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(postback.type)}
                    </TableCell>
                    <TableCell className="text-white">
                      {postback.username || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {postback.houseName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {postback.customerId || 'N/A'}
                    </TableCell>
                    <TableCell className="text-white">
                      {postback.amount ? `R$ ${postback.amount.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-green-400">
                      {postback.commission ? `R$ ${postback.commission.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPostbacks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">Nenhum postback encontrado com os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}