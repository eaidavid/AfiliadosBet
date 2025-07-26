import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  Zap, 
  Crown,
  Sparkles,
  Target,
  Activity,
  ChevronRight,
  ArrowUp,
  Star,
  Rocket
} from 'lucide-react';

interface HeroSectionProps {
  userStats?: {
    totalClicks: number;
    totalRegistrations: number;
    totalDeposits: number;
    totalCommission: string;
    conversionRate: number;
  };
  onNavigate?: (path: string) => void;
}

export function HeroSection({ userStats, onNavigate }: HeroSectionProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setAnimateStats(true);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: 'Ganhos Hoje',
      value: 'R$ 847,90',
      icon: DollarSign,
      trend: '+12%',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30'
    },
    {
      label: 'Conversões',
      value: userStats?.totalDeposits?.toString() || '23',
      icon: Target,
      trend: '+8%',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      label: 'Taxa Conversão',
      value: `${userStats?.conversionRate?.toFixed(1) || '4.8'}%`,
      icon: TrendingUp,
      trend: '+2.1%',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background with premium gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 rounded-2xl" />
      
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-violet-400/10 to-emerald-400/10 rounded-full blur-3xl translate-y-32 -translate-x-32 animate-pulse delay-1000" />

      <div className="relative p-8">
        {/* Header with time and greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-emerald-400 font-semibold">Sistema Online</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Bom dia, Afiliado! 👋
            </h1>
            <p className="text-slate-400">
              {currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 px-4 py-2 text-sm font-bold shadow-lg shadow-emerald-500/25">
              <Crown className="w-4 h-4 mr-2" />
              PREMIUM
            </Badge>
          </div>
        </div>

        {/* Real-time stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.label} className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden group transition-all duration-700 hover:scale-105 hover:shadow-2xl ${animateStats ? 'animate-in slide-in-from-bottom duration-700' : ''}`} style={{ animationDelay: `${index * 200}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                    <ArrowUp className="w-4 h-4" />
                    {stat.trend}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dynamic call-to-actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary CTA */}
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-400/30 backdrop-blur-sm overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Começar a Lucrar Agora</h3>
                  <p className="text-emerald-300/80 text-sm">Média de ganho: R$ 2.847/mês</p>
                </div>
              </div>
              <Button 
                onClick={() => onNavigate?.('/betting-houses')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300"
              >
                Ver Oportunidades
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Secondary CTA */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-violet-500/20 border-blue-400/30 backdrop-blur-sm overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Analytics Avançado</h3>
                  <p className="text-blue-300/80 text-sm">Próximo pagamento em 3 dias</p>
                </div>
              </div>
              <Button 
                onClick={() => onNavigate?.('/analytics')}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300"
              >
                Ver Relatórios
                <Activity className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Motivational progress indicator */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold">Você está a 2 afiliações do próximo nível!</h4>
              <p className="text-slate-400 text-sm">Desbloqueie comissões VIP de até 70%</p>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" style={{ width: '75%' }} />
          </div>
          <p className="text-emerald-400 text-sm font-medium mt-2">8 de 10 afiliações completas</p>
        </div>
      </div>
    </div>
  );
}