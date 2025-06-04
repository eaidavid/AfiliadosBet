import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Building2,
  DollarSign,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

interface Lead {
  customerId: string;
  totalConversions: number;
  totalCommission: number;
  totalAmount: number;
  firstConversion: string;
  lastConversion: string;
  affiliates: string[];
  houses: string[];
}

interface LeadDetail {
  customerId: string;
  totalConversions: number;
  totalCommission: number;
  totalAmount: number;
  events: {
    id: number;
    type: string;
    amount: number;
    commission: number;
    convertedAt: string;
    house: {
      id: number;
      name: string;
    };
    affiliate: {
      username: string;
      fullName: string;
      email: string;
    };
    data: any;
  }[];
  eventsSummary: {
    click: number;
    registration: number;
    deposit: number;
    profit: number;
  };
}

const EventTypeBadge = ({ type }: { type: string }) => {
  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case 'click':
        return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Clique' };
      case 'registration':
        return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Registro' };
      case 'deposit':
        return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Depósito' };
      case 'profit':
        return { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Lucro' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: type };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Badge className={`${config.color} border text-xs`}>
      {config.label}
    </Badge>
  );
};

const LeadDetailDialog = ({ customerId, trigger }: { customerId: string; trigger: React.ReactNode }) => {
  const { data: leadDetail, isLoading } = useQuery<LeadDetail>({
    queryKey: ['/api/admin/leads', customerId],
    enabled: !!customerId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#1C1F26] border-[#1E293B] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Detalhes do Lead: {customerId}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[#94A3B8]">Carregando detalhes...</div>
          </div>
        ) : leadDetail ? (
          <div className="space-y-6 overflow-y-auto">
            {/* Resumo do Lead */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{leadDetail.totalConversions}</div>
                    <div className="text-sm text-[#94A3B8]">Total Eventos</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00C39A]">R$ {leadDetail.totalCommission.toLocaleString()}</div>
                    <div className="text-sm text-[#94A3B8]">Comissão Total</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#3B82F6]">R$ {leadDetail.totalAmount.toLocaleString()}</div>
                    <div className="text-sm text-[#94A3B8]">Valor Total</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#F59E0B]">{leadDetail.eventsSummary.deposit}</div>
                    <div className="text-sm text-[#94A3B8]">Depósitos</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo de Eventos */}
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Resumo de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{leadDetail.eventsSummary.click}</div>
                    <div className="text-sm text-[#94A3B8]">Cliques</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{leadDetail.eventsSummary.registration}</div>
                    <div className="text-sm text-[#94A3B8]">Registros</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{leadDetail.eventsSummary.deposit}</div>
                    <div className="text-sm text-[#94A3B8]">Depósitos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{leadDetail.eventsSummary.profit}</div>
                    <div className="text-sm text-[#94A3B8]">Lucros</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline de Eventos */}
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Timeline de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {leadDetail.events.map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00C39A]/20 rounded-full flex items-center justify-center text-xs text-[#00C39A] font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <EventTypeBadge type={event.type} />
                            <span className="text-white font-medium">{event.house.name}</span>
                          </div>
                          <div className="text-sm text-[#94A3B8]">
                            {event.affiliate.fullName} (@{event.affiliate.username})
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#00C39A] font-bold">R$ {event.commission.toLocaleString()}</div>
                        <div className="text-xs text-[#94A3B8]">
                          {new Date(event.convertedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-[#94A3B8]">
            Nenhum detalhe encontrado para este lead.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function AdminLeadsManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("lastConversion");

  const { data: leadsData, isLoading, refetch } = useQuery<{
    leads: Lead[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalLeads: number;
      limit: number;
    };
  }>({
    queryKey: ['/api/admin/leads', { page: currentPage, limit: 20 }],
    refetchInterval: 30000,
  });

  const filteredLeads = leadsData?.leads?.filter(lead =>
    lead.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.affiliates.some(affiliate => affiliate.toLowerCase().includes(searchTerm.toLowerCase())) ||
    lead.houses.some(house => house.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'totalCommission':
        return b.totalCommission - a.totalCommission;
      case 'totalConversions':
        return b.totalConversions - a.totalConversions;
      case 'lastConversion':
        return new Date(b.lastConversion).getTime() - new Date(a.lastConversion).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="bg-[#1C1F26] border-b border-[#1E293B] p-4 sm:p-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Gerenciar Leads</h1>
            <p className="text-[#94A3B8] mt-1">Controle de leads por customer_id</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="bg-gradient-to-r from-[#00C39A] to-[#3B82F6] border-0 hover:opacity-90"
            >
              <Activity className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <Input
                placeholder="Buscar por customer_id, afiliado ou casa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1E293B] border-[#334155] text-white placeholder-[#94A3B8] focus:border-[#00C39A]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#94A3B8]" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] bg-[#1E293B] border-[#334155] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#334155]">
                <SelectItem value="lastConversion">Última conversão</SelectItem>
                <SelectItem value="totalCommission">Maior comissão</SelectItem>
                <SelectItem value="totalConversions">Mais eventos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Total de Leads</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {leadsData?.pagination?.totalLeads || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#00C39A]/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#00C39A]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Comissão Total</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      R$ {sortedLeads.reduce((sum, lead) => sum + lead.totalCommission, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Conversões Totais</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {sortedLeads.reduce((sum, lead) => sum + lead.totalConversions, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium">Casas Ativas</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {new Set(sortedLeads.flatMap(lead => lead.houses)).size}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-[#10B981]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabela de Leads */}
        <Card className="bg-[#1C1F26] border-[#1E293B] shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00C39A]" />
              Lista de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-[#94A3B8]">Carregando leads...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#334155]">
                      <TableHead className="text-[#94A3B8]">Customer ID</TableHead>
                      <TableHead className="text-[#94A3B8]">Afiliados</TableHead>
                      <TableHead className="text-[#94A3B8]">Casas</TableHead>
                      <TableHead className="text-[#94A3B8]">Eventos</TableHead>
                      <TableHead className="text-[#94A3B8]">Comissão</TableHead>
                      <TableHead className="text-[#94A3B8]">Última Atividade</TableHead>
                      <TableHead className="text-[#94A3B8]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeads.map((lead) => (
                      <TableRow key={lead.customerId} className="border-[#334155] hover:bg-[#1E293B]/50">
                        <TableCell className="text-white font-medium">{lead.customerId}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lead.affiliates.slice(0, 2).map((affiliate, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {affiliate}
                              </Badge>
                            ))}
                            {lead.affiliates.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{lead.affiliates.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lead.houses.slice(0, 2).map((house, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {house}
                              </Badge>
                            ))}
                            {lead.houses.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{lead.houses.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{lead.totalConversions}</TableCell>
                        <TableCell className="text-[#00C39A] font-bold">
                          R$ {lead.totalCommission.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[#94A3B8] text-sm">
                          {new Date(lead.lastConversion).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <LeadDetailDialog
                            customerId={lead.customerId}
                            trigger={
                              <Button variant="ghost" size="sm" className="text-[#00C39A] hover:bg-[#00C39A]/10">
                                <Eye className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginação */}
        {leadsData?.pagination && leadsData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-[#1E293B] border-[#334155] text-white hover:bg-[#334155]"
            >
              Anterior
            </Button>
            
            <span className="text-[#94A3B8]">
              Página {currentPage} de {leadsData.pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(leadsData.pagination.totalPages, prev + 1))}
              disabled={currentPage === leadsData.pagination.totalPages}
              className="bg-[#1E293B] border-[#334155] text-white hover:bg-[#334155]"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}