import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  Zap,
  BarChart3,
  PieChart,
  Sparkles,
  Crown,
  Award,
  ArrowRight
} from 'lucide-react';

interface RevenueSimulatorProps {
  selectedHouse?: {
    name: string;
    commissionType: string;
    cpaValue?: string;
    revshareValue?: string;
  };
  onSelectHouse?: () => void;
}

export function RevenueSimulator({ selectedHouse, onSelectHouse }: RevenueSimulatorProps) {
  const [conversions, setConversions] = useState([15]);
  const [depositValue, setDepositValue] = useState([250]);
  const [conversionRate, setConversionRate] = useState([4.5]);
  const [results, setResults] = useState({
    cpaRevenue: 0,
    revshareRevenue: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0
  });

  useEffect(() => {
    calculateRevenue();
  }, [conversions, depositValue, conversionRate, selectedHouse]);

  const calculateRevenue = () => {
    if (!selectedHouse) {
      setResults({
        cpaRevenue: 0,
        revshareRevenue: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0
      });
      return;
    }

    const numConversions = conversions[0];
    const avgDeposit = depositValue[0];
    const rate = conversionRate[0];

    let cpaRevenue = 0;
    let revshareRevenue = 0;

    if (selectedHouse.commissionType === 'cpa' || selectedHouse.commissionType === 'hybrid') {
      cpaRevenue = numConversions * parseFloat(selectedHouse.cpaValue || '0');
    }

    if (selectedHouse.commissionType === 'revshare' || selectedHouse.commissionType === 'hybrid') {
      const revsharePercent = parseFloat(selectedHouse.revshareValue || '0') / 100;
      revshareRevenue = numConversions * avgDeposit * revsharePercent;
    }

    const totalRevenue = cpaRevenue + revshareRevenue;
    const monthlyRevenue = totalRevenue * (30 / 7); // Estimate weekly to monthly
    const yearlyRevenue = monthlyRevenue * 12;

    setResults({
      cpaRevenue,
      revshareRevenue,
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/50">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white">Simulador de Receita</CardTitle>
            <p className="text-slate-400 text-sm">Calcule seu potencial de ganhos</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!selectedHouse ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Selecione uma Casa</h3>
            <p className="text-slate-400 text-sm mb-4">
              Escolha uma casa de apostas para simular seus ganhos
            </p>
            <Button
              onClick={onSelectHouse}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-xl"
            >
              Escolher Casa
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <>
            {/* Selected house info */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-emerald-400/30">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{selectedHouse.name}</span>
                <Badge className="bg-violet-500/20 text-violet-400 border-0">
                  {selectedHouse.commissionType.toUpperCase()}
                </Badge>
              </div>
              <div className="flex gap-4 text-sm">
                {selectedHouse.cpaValue && (
                  <div>
                    <span className="text-slate-400">CPA: </span>
                    <span className="text-emerald-400 font-semibold">R$ {selectedHouse.cpaValue}</span>
                  </div>
                )}
                {selectedHouse.revshareValue && (
                  <div>
                    <span className="text-slate-400">RevShare: </span>
                    <span className="text-blue-400 font-semibold">{selectedHouse.revshareValue}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simulation controls */}
            <div className="space-y-6">
              {/* Conversions slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-white font-medium">Conversões por Semana</label>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    {conversions[0]} conversões
                  </Badge>
                </div>
                <Slider
                  value={conversions}
                  onValueChange={setConversions}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1 conversão</span>
                  <span>100 conversões</span>
                </div>
              </div>

              {/* Deposit value slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-white font-medium">Valor Médio do Depósito</label>
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                    {formatCurrency(depositValue[0])}
                  </Badge>
                </div>
                <Slider
                  value={depositValue}
                  onValueChange={setDepositValue}
                  max={1000}
                  min={50}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>R$ 50</span>
                  <span>R$ 1.000</span>
                </div>
              </div>

              {/* Conversion rate slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-white font-medium">Taxa de Conversão</label>
                  <Badge className="bg-violet-500/20 text-violet-400 border-0">
                    {conversionRate[0]}%
                  </Badge>
                </div>
                <Slider
                  value={conversionRate}
                  onValueChange={setConversionRate}
                  max={15}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Projeção de Ganhos
              </h4>

              {/* Weekly results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.cpaRevenue > 0 && (
                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-semibold">CPA Semanal</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">
                      {formatCurrency(results.cpaRevenue)}
                    </p>
                  </div>
                )}

                {results.revshareRevenue > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm font-semibold">RevShare Semanal</span>
                    </div>
                    <p className="text-2xl font-black text-blue-400">
                      {formatCurrency(results.revshareRevenue)}
                    </p>
                  </div>
                )}
              </div>

              {/* Total results */}
              <div className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-400/30">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-violet-400" />
                  <span className="text-violet-400 font-bold">Receita Total</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Semanal</p>
                    <p className="text-2xl font-black text-white">
                      {formatCurrency(results.totalRevenue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Mensal</p>
                    <p className="text-2xl font-black text-emerald-400">
                      {formatCurrency(results.monthlyRevenue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Anual</p>
                    <p className="text-2xl font-black text-yellow-400">
                      {formatCurrency(results.yearlyRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance insights */}
              <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                  <span className="text-white font-semibold text-sm">Insights de Performance</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clicks necessários (estimativa):</span>
                    <span className="text-white font-medium">
                      {Math.ceil(conversions[0] / (conversionRate[0] / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ganho por click:</span>
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(results.totalRevenue / Math.ceil(conversions[0] / (conversionRate[0] / 100)))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROI estimado:</span>
                    <span className="text-blue-400 font-bold">
                      {((results.totalRevenue / (conversions[0] * 10)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}