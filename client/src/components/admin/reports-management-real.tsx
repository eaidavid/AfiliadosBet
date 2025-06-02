import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  UserPlus, 
  DollarSign,
  Download,
  Building2,
  Calendar
} from "lucide-react";

interface ReportsManagementProps {
  onPageChange?: (page: string) => void;
}

interface AffiliateReport {
  affiliateId: number;
  affiliateName: string;
  clicks: number;
  registrations: number;
  deposits: number;
  profits: number;
  totalCommission: string;
  totalVolume: string;
  conversionRate: string;
}

interface HouseReport {
  houseId: number;
  houseName: string;
  clicks: number;
  registrations: number;
  deposits: number;
  profits: number;
  totalCommission: string;
  totalVolume: string;
  conversionRate: string;
}

export default function ReportsManagementReal({ onPageChange }: ReportsManagementProps) {
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("all");
  const [selectedHouse, setSelectedHouse] = useState<string>("all");

  // Fetch affiliate reports (dados reais)
  const { data: affiliateReports = [], isLoading: affiliateReportsLoading } = useQuery<AffiliateReport[]>({
    queryKey: ["/api/admin/reports/by-affiliate"],
    retry: 1,
  });

  // Fetch house reports (dados reais)
  const { data: houseReports = [], isLoading: houseReportsLoading } = useQuery<HouseReport[]>({
    queryKey: ["/api/admin/reports/by-house"],
    retry: 1,
  });

  // Fetch affiliates list
  const { data: affiliates = [] } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    retry: 1,
  });

  // Fetch houses list
  const { data: houses = [] } = useQuery({
    queryKey: ["/api/admin/betting-houses"],
    retry: 1,
  });

  // Safe arrays with fallbacks
  const safeAffiliateReports = Array.isArray(affiliateReports) ? affiliateReports : [];
  const safeHouseReports = Array.isArray(houseReports) ? houseReports : [];
  const safeAffiliates = Array.isArray(affiliates) ? affiliates : [];
  const safeHouses = Array.isArray(houses) ? houses : [];

  // Calculate totals from real data
  const totalAffiliates = safeAffiliateReports.length;
  const totalConversions = safeAffiliateReports.reduce((sum, report) => 
    sum + report.registrations + report.deposits + report.profits, 0);
  const totalCommission = safeAffiliateReports.reduce((sum, report) => 
    sum + parseFloat(report.totalCommission || '0'), 0);
  const totalVolume = safeAffiliateReports.reduce((sum, report) => 
    sum + parseFloat(report.totalVolume || '0'), 0);

  const exportCSV = (type: 'affiliate' | 'house') => {
    const data = type === 'affiliate' ? safeAffiliateReports : safeHouseReports;
    const filename = `relatorio_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (data.length === 0) return;
    
    const headers = type === 'affiliate' 
      ? ['Nome', 'Cliques', 'Registros', 'Depósitos', 'Lucros', 'Volume Total', 'Comissão Total', 'Taxa Conversão']
      : ['Casa', 'Cliques', 'Registros', 'Depósitos', 'Lucros', 'Volume Total', 'Comissão Total', 'Taxa Conversão'];
    
    const csvContent = [
      headers.join(','),
      ...data.map((item: any) => [
        type === 'affiliate' ? item.affiliateName : item.houseName,
        item.clicks,
        item.registrations,
        item.deposits,
        item.profits,
        `"R$ ${item.totalVolume}"`,
        `"R$ ${item.totalCommission}"`,
        `"${item.conversionRate}%"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (affiliateReportsLoading || houseReportsLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Relatórios Administrativos
        </h1>
        <p className="text-slate-400">
          Análise completa de performance dos afiliados e casas de apostas
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total de Afiliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {totalAffiliates}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Total de Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {totalConversions}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Volume Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              R$ {totalVolume.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Comissão Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              R$ {totalCommission.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliate" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger 
            value="affiliate" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            Por Afiliado
          </TabsTrigger>
          <TabsTrigger 
            value="house" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            Por Casa de Apostas
          </TabsTrigger>
        </TabsList>

        {/* Relatório por Afiliado */}
        <TabsContent value="affiliate" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Relatório Detalhado por Afiliado
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Performance completa de todos os afiliados ativos
                  </CardDescription>
                </div>
                <Button
                  onClick={() => exportCSV('affiliate')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {safeAffiliateReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nenhum dado de afiliado encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Afiliado</TableHead>
                        <TableHead className="text-slate-300">Cliques</TableHead>
                        <TableHead className="text-slate-300">Registros</TableHead>
                        <TableHead className="text-slate-300">Depósitos</TableHead>
                        <TableHead className="text-slate-300">Lucros</TableHead>
                        <TableHead className="text-slate-300">Volume Total</TableHead>
                        <TableHead className="text-slate-300">Comissão Total</TableHead>
                        <TableHead className="text-slate-300">Taxa Conversão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeAffiliateReports.map((affiliate) => (
                        <TableRow key={affiliate.affiliateId} className="border-slate-700">
                          <TableCell className="text-white font-medium">
                            {affiliate.affiliateName}
                          </TableCell>
                          <TableCell className="text-white">{affiliate.clicks}</TableCell>
                          <TableCell className="text-white">{affiliate.registrations}</TableCell>
                          <TableCell className="text-white">{affiliate.deposits}</TableCell>
                          <TableCell className="text-white">{affiliate.profits}</TableCell>
                          <TableCell className="text-slate-300">R$ {affiliate.totalVolume}</TableCell>
                          <TableCell className="text-emerald-400 font-medium">
                            R$ {affiliate.totalCommission}
                          </TableCell>
                          <TableCell className="text-blue-400">{affiliate.conversionRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório por Casa de Apostas */}
        <TabsContent value="house" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    Relatório Detalhado por Casa de Apostas
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Performance completa de todas as casas de apostas
                  </CardDescription>
                </div>
                <Button
                  onClick={() => exportCSV('house')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {safeHouseReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nenhum dado de casa de apostas encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Casa de Apostas</TableHead>
                        <TableHead className="text-slate-300">Cliques</TableHead>
                        <TableHead className="text-slate-300">Registros</TableHead>
                        <TableHead className="text-slate-300">Depósitos</TableHead>
                        <TableHead className="text-slate-300">Lucros</TableHead>
                        <TableHead className="text-slate-300">Volume Total</TableHead>
                        <TableHead className="text-slate-300">Comissão Total</TableHead>
                        <TableHead className="text-slate-300">Taxa Conversão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeHouseReports.map((house) => (
                        <TableRow key={house.houseId} className="border-slate-700">
                          <TableCell className="text-white font-medium">
                            {house.houseName}
                          </TableCell>
                          <TableCell className="text-white">{house.clicks}</TableCell>
                          <TableCell className="text-white">{house.registrations}</TableCell>
                          <TableCell className="text-white">{house.deposits}</TableCell>
                          <TableCell className="text-white">{house.profits}</TableCell>
                          <TableCell className="text-slate-300">R$ {house.totalVolume}</TableCell>
                          <TableCell className="text-emerald-400 font-medium">
                            R$ {house.totalCommission}
                          </TableCell>
                          <TableCell className="text-blue-400">{house.conversionRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}