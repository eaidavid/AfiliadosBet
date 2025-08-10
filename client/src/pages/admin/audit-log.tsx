import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Activity,
  DollarSign,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowUpDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

interface AuditEntry {
  id: number;
  entryType: string;
  actionType: string;
  amount: string | null;
  reason: string;
  metadata: any;
  createdAt: string;
  adminName: string;
  adminEmail: string;
}

interface AuditFilters {
  startDate: string;
  endDate: string;
  entryType: string;
  actionType: string;
  adminId: string;
  affiliateId: string;
}

export default function AuditLogPage() {
  const [filters, setFilters] = useState<AuditFilters>({
    startDate: "",
    endDate: "",
    entryType: "",
    actionType: "",
    adminId: "",
    affiliateId: "",
  });
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Fetch audit log
  const { data: auditData, isLoading } = useQuery({
    queryKey: ["/api/admin/manual/audit-log", filters, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });
      return apiRequest(`/api/admin/manual/audit-log?${params}`);
    },
  });

  const entries: AuditEntry[] = auditData?.entries || [];
  const pagination = auditData?.pagination;

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      entryType: "",
      actionType: "",
      adminId: "",
      affiliateId: "",
    });
    setPage(1);
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case "conversion": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "commission": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "payment": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getActionTypeIcon = (action: string) => {
    switch (action) {
      case "insert": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "update": return <Activity className="w-4 h-4 text-blue-500" />;
      case "adjustment": return <ArrowUpDown className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(amount));
  };

  const exportAuditLog = () => {
    const params = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      ),
    });
    window.open(`/api/admin/manual/audit-log/export?${params}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Log de Auditoria
          </h1>
          <p className="text-slate-400 text-lg">
            Acompanhe todas as ações manuais realizadas no sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Total de Ações
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {pagination?.total || 0}
              </div>
              <p className="text-xs text-slate-400">
                Registros encontrados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Conversões
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {entries.filter(e => e.entryType === "conversion").length}
              </div>
              <p className="text-xs text-slate-400">
                Nesta página
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Ajustes
              </CardTitle>
              <ArrowUpDown className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {entries.filter(e => e.entryType === "commission").length}
              </div>
              <p className="text-xs text-slate-400">
                Nesta página
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Pagamentos
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {entries.filter(e => e.entryType === "payment").length}
              </div>
              <p className="text-xs text-slate-400">
                Nesta página
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-slate-300">Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Data Final</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              {/* Entry Type */}
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Entrada</Label>
                <Select
                  value={filters.entryType}
                  onValueChange={(value) => handleFilterChange("entryType", value)}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="conversion">Conversão</SelectItem>
                    <SelectItem value="commission">Comissão</SelectItem>
                    <SelectItem value="payment">Pagamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Type */}
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Ação</Label>
                <Select
                  value={filters.actionType}
                  onValueChange={(value) => handleFilterChange("actionType", value)}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="insert">Inserção</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Label className="text-slate-300">Ações</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportAuditLog}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Registros de Auditoria
            </CardTitle>
            <CardDescription className="text-slate-400">
              {pagination?.total ? `${pagination.total} registros encontrados` : "Nenhum registro encontrado"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum registro de auditoria encontrado</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-700/30">
                        <TableHead className="text-slate-300">Data/Hora</TableHead>
                        <TableHead className="text-slate-300">Tipo</TableHead>
                        <TableHead className="text-slate-300">Ação</TableHead>
                        <TableHead className="text-slate-300">Admin</TableHead>
                        <TableHead className="text-slate-300">Valor</TableHead>
                        <TableHead className="text-slate-300">Justificativa</TableHead>
                        <TableHead className="text-slate-300">Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.id} className="border-slate-700 hover:bg-slate-700/30">
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="text-sm">
                                  {format(new Date(entry.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {format(new Date(entry.createdAt), "HH:mm:ss", { locale: ptBR })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getEntryTypeColor(entry.entryType)}>
                              {entry.entryType === "conversion" && "Conversão"}
                              {entry.entryType === "commission" && "Comissão"}
                              {entry.entryType === "payment" && "Pagamento"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionTypeIcon(entry.actionType)}
                              <span className="text-slate-300 capitalize">
                                {entry.actionType === "insert" && "Inserção"}
                                {entry.actionType === "update" && "Atualização"}
                                {entry.actionType === "adjustment" && "Ajuste"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="text-sm font-medium">{entry.adminName}</div>
                                <div className="text-xs text-slate-400">{entry.adminEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {entry.amount ? (
                              <span className="font-medium text-emerald-400">
                                {formatCurrency(entry.amount)}
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300 max-w-xs">
                            <div className="truncate" title={entry.reason}>
                              {entry.reason || "Sem justificativa"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedEntry(entry)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    Detalhes da Ação Manual
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    Informações completas sobre a ação realizada
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedEntry && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-slate-400">ID da Ação</Label>
                                        <p className="text-white font-mono">#{selectedEntry.id}</p>
                                      </div>
                                      <div>
                                        <Label className="text-slate-400">Data/Hora</Label>
                                        <p className="text-white">
                                          {format(new Date(selectedEntry.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-slate-400">Tipo de Entrada</Label>
                                        <p className="text-white">{selectedEntry.entryType}</p>
                                      </div>
                                      <div>
                                        <Label className="text-slate-400">Tipo de Ação</Label>
                                        <p className="text-white">{selectedEntry.actionType}</p>
                                      </div>
                                      {selectedEntry.amount && (
                                        <div>
                                          <Label className="text-slate-400">Valor</Label>
                                          <p className="text-emerald-400 font-medium">
                                            {formatCurrency(selectedEntry.amount)}
                                          </p>
                                        </div>
                                      )}
                                      <div>
                                        <Label className="text-slate-400">Administrador</Label>
                                        <p className="text-white">{selectedEntry.adminName}</p>
                                        <p className="text-slate-400 text-sm">{selectedEntry.adminEmail}</p>
                                      </div>
                                    </div>
                                    
                                    <Separator className="bg-slate-700" />
                                    
                                    <div>
                                      <Label className="text-slate-400">Justificativa</Label>
                                      <p className="text-white mt-1 bg-slate-700/50 p-3 rounded-md">
                                        {selectedEntry.reason || "Nenhuma justificativa fornecida"}
                                      </p>
                                    </div>
                                    
                                    {selectedEntry.metadata && (
                                      <div>
                                        <Label className="text-slate-400">Dados Técnicos</Label>
                                        <pre className="text-xs text-slate-300 mt-1 bg-slate-900/50 p-3 rounded-md overflow-auto max-h-40">
                                          {JSON.stringify(selectedEntry.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-400">
                      Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}