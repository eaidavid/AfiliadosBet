import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  UserPlus, 
  DollarSign,
  Download,
  Building2
} from "lucide-react";

interface ReportsManagementProps {
  onPageChange?: (page: string) => void;
}

export default function ReportsManagement({ onPageChange }: ReportsManagementProps) {
  const { data: generalStats } = useQuery({
    queryKey: ["/api/admin/reports/general"],
    retry: false,
  });

  const { data: affiliateReports = [] } = useQuery({
    queryKey: ["/api/admin/reports/by-affiliate"],
    retry: false,
  });

  const { data: houseReports = [] } = useQuery({
    queryKey: ["/api/admin/reports/by-house"],
    retry: false,
  });

  const exportCSV = (type: string) => {
    console.log('Exporting CSV for:', type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400 mt-1">Análise completa dos dados da plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-emerald-500" />
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger value="general" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
            Relatório Geral
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
            Por Afiliado
          </TabsTrigger>
          <TabsTrigger value="house" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
            Por Casa de Aposta
          </TabsTrigger>
        </TabsList>

        {/* Relatório Geral */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total de Cliques</p>
                    <p className="text-2xl font-bold text-white">{generalStats?.totalClicks || 0}</p>
                    <p className="text-green-400 text-xs">+12% vs mês anterior</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total de Registros</p>
                    <p className="text-2xl font-bold text-white">{generalStats?.totalRegistrations || 0}</p>
                    <p className="text-green-400 text-xs">+8% vs mês anterior</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total de Depósitos</p>
                    <p className="text-2xl font-bold text-white">{generalStats?.totalDeposits || 0}</p>
                    <p className="text-green-400 text-xs">+15% vs mês anterior</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Receita Total</p>
                    <p className="text-2xl font-bold text-white">R$ {generalStats?.totalVolume || '0.00'}</p>
                    <p className="text-green-400 text-xs">+22% vs mês anterior</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Casas Mais Rentáveis */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-500" />
                Casas Mais Rentáveis
              </CardTitle>
              <CardDescription className="text-slate-400">
                Ranking das casas por receita gerada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Casa de Aposta</TableHead>
                    <TableHead className="text-slate-300">Afiliados Ativos</TableHead>
                    <TableHead className="text-slate-300">Total Cliques</TableHead>
                    <TableHead className="text-slate-300">Receita</TableHead>
                    <TableHead className="text-slate-300">Conversão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {houseReports.slice(0, 5).map((house: any, index: number) => (
                    <TableRow key={house.houseId} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        #{index + 1} {house.houseName}
                      </TableCell>
                      <TableCell className="text-white">{house.activeAffiliates}</TableCell>
                      <TableCell className="text-white">{house.clicks}</TableCell>
                      <TableCell className="text-emerald-400 font-medium">
                        R$ {house.totalCommission}
                      </TableCell>
                      <TableCell className="text-blue-400">{house.conversionRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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
                    {affiliateReports.map((affiliate: any) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório por Casa de Aposta */}
        <TabsContent value="house" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    Relatório Detalhado por Casa de Aposta
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Casa de Aposta</TableHead>
                      <TableHead className="text-slate-300">Afiliados Ativos</TableHead>
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
                    {houseReports.map((house: any) => (
                      <TableRow key={house.houseId} className="border-slate-700">
                        <TableCell className="text-white font-medium">
                          {house.houseName}
                        </TableCell>
                        <TableCell className="text-white">{house.activeAffiliates}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}