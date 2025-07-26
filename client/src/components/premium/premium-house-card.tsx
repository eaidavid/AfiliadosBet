import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Copy, 
  ExternalLink,
  Zap,
  Target,
  Award,
  Sparkles,
  Shield,
  Timer,
  BarChart3,
  MousePointer,
  Banknote,
  CheckCircle,
  Star,
  Flame,
  ArrowUp
} from 'lucide-react';

interface PremiumHouseCardProps {
  house: {
    id: number;
    name: string;
    description: string | null;
    logoUrl: string | null;
    commissionType: string;
    commissionValue: string | null;
    cpaValue: string | null;
    revshareValue: string | null;
    revshareAffiliatePercent?: number;
    cpaAffiliatePercent?: number;
    minDeposit: string | null;
    paymentMethods: any;
    isActive: boolean;
    isAffiliated: boolean;
    affiliateLink?: string;
    // Dados dinâmicos editáveis pelo admin
    conversionRate?: number;
    avgTicket?: number;
    monthlyPotential?: number;
    playerRetention?: number;
    popularityScore?: number;
    trustScore?: number;
  };
  onJoinAffiliate: (houseId: number) => void;
  onCopyLink: (link: string) => void;
  onOpenLink: (link: string) => void;
  isPending?: boolean;
}

export function PremiumHouseCard({ 
  house, 
  onJoinAffiliate, 
  onCopyLink, 
  onOpenLink, 
  isPending = false 
}: PremiumHouseCardProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  // Dados dinâmicos (editáveis pelo admin) com fallbacks realistas
  const conversionRate = house.conversionRate || (Math.random() * 15 + 5); // 5-20%
  const avgTicket = house.avgTicket || (Math.random() * 300 + 100); // R$ 100-400
  const monthlyPotential = house.monthlyPotential || (Math.random() * 5000 + 1000); // R$ 1000-6000
  const playerRetention = house.playerRetention || (Math.random() * 40 + 60); // 60-100%
  const popularityScore = house.popularityScore || (Math.random() * 30 + 70); // 70-100
  const trustScore = house.trustScore || (Math.random() * 20 + 80); // 80-100

  const getHouseTier = () => {
    if (house.commissionType === 'hybrid') {
      return {
        tier: 'PREMIUM TIER',
        icon: Crown,
        gradient: 'from-yellow-400 via-yellow-500 to-orange-500',
        bgGradient: 'from-yellow-500/20 to-orange-500/20',
        borderColor: 'border-yellow-500/50',
        textColor: 'text-yellow-400',
        badge: {
          text: '💎 DUPLA COMISSÃO',
          className: 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse shadow-lg text-white font-black'
        }
      };
    }
    
    if (popularityScore > 85) {
      return {
        tier: 'TOP TIER',
        icon: Star,
        gradient: 'from-emerald-400 to-teal-500',
        bgGradient: 'from-emerald-500/20 to-teal-500/20',
        borderColor: 'border-emerald-500/50',
        textColor: 'text-emerald-400',
        badge: {
          text: '⭐ TOP CHOICE',
          className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold'
        }
      };
    }
    
    return {
      tier: 'POPULAR',
      icon: TrendingUp,
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/50',
      textColor: 'text-blue-400',
      badge: {
        text: '🔥 EM ALTA',
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold'
      }
    };
  };

  const tier = getHouseTier();

  const simulateEarnings = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  const getCommissionDisplay = () => {
    if (house.commissionType === 'hybrid') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-lg border border-emerald-400/30">
            <span className="text-sm font-bold text-emerald-400">CPA</span>
            <span className="text-xl font-black text-emerald-400">
              R$ {parseFloat(house.cpaValue || '0').toFixed(0)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
            <span className="text-sm font-bold text-blue-400">RevShare</span>
            <span className="text-xl font-black text-blue-400">
              {parseFloat(house.revshareValue || '0').toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    
    const value = house.commissionType === 'CPA' 
      ? `R$ ${parseFloat(house.cpaValue || house.commissionValue || '0').toFixed(0)}`
      : `${parseFloat(house.revshareValue || house.commissionValue || '0').toFixed(1)}%`;
    
    return (
      <div className={`p-4 bg-gradient-to-r ${tier.bgGradient} rounded-lg border ${tier.borderColor}`}>
        <div className="text-center">
          <div className={`text-3xl font-black ${tier.textColor}`}>{value}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">{house.commissionType}</div>
        </div>
      </div>
    );
  };

  const getPaymentMethods = () => {
    if (!house.paymentMethods) return [];
    
    const methods = Array.isArray(house.paymentMethods) ? house.paymentMethods : 
                   typeof house.paymentMethods === 'string' ? house.paymentMethods.split(',') :
                   Object.keys(house.paymentMethods);
    
    return methods.slice(0, 3).map((method: string) => {
      const lowercaseMethod = method.toLowerCase().trim();
      if (lowercaseMethod.includes('pix')) return { name: 'PIX', icon: '⚡', color: 'text-emerald-400' };
      if (lowercaseMethod.includes('cartão') || lowercaseMethod.includes('card')) return { name: 'Card', icon: '💳', color: 'text-blue-400' };
      if (lowercaseMethod.includes('cripto')) return { name: 'Crypto', icon: '🪙', color: 'text-orange-400' };
      return { name: method.slice(0, 6), icon: '💰', color: 'text-slate-400' };
    });
  };

  return (
    <Card className={`
      bg-slate-900/70 backdrop-blur-sm border ${tier.borderColor} 
      hover:scale-105 transition-all duration-500 group
      shadow-2xl hover:shadow-3xl
      relative overflow-hidden
    `}>
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tier.bgGradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
      
      {/* Tier Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={tier.badge.className}>
          {tier.badge.text}
        </Badge>
      </div>

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative">
            {house.logoUrl ? (
              <img 
                src={house.logoUrl} 
                alt={house.name}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className={`w-16 h-16 bg-gradient-to-br ${tier.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <tier.icon className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* House Info */}
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              {house.name}
              {trustScore > 90 && <Shield className="w-5 h-5 text-emerald-400" />}
            </CardTitle>
            <p className="text-sm text-slate-300 line-clamp-2">
              {house.description || `Casa premium com ${conversionRate.toFixed(1)}% de conversão`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Commission Display */}
        {getCommissionDisplay()}

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Conversão
              </span>
              <span className={`font-bold ${tier.textColor}`}>{conversionRate.toFixed(1)}%</span>
            </div>
            <Progress value={conversionRate * 5} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Retenção
              </span>
              <span className="font-bold text-blue-400">{playerRetention.toFixed(0)}%</span>
            </div>
            <Progress value={playerRetention} className="h-2" />
          </div>
        </div>

        {/* Earnings Simulator */}
        <div className={`p-4 bg-gradient-to-r ${tier.bgGradient} rounded-lg border ${tier.borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Potencial Mensal
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={simulateEarnings}
              disabled={isSimulating}
              className="text-xs px-2 py-1 h-6"
            >
              {isSimulating ? <Timer className="w-3 h-3 animate-spin" /> : 'Simular'}
            </Button>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-black ${tier.textColor} ${isSimulating ? 'animate-pulse' : ''}`}>
              R$ {isSimulating ? '...' : monthlyPotential.toFixed(0)}
            </div>
            <div className="text-xs text-slate-400">
              Com ticket médio de R$ {avgTicket.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Métodos:</span>
          <div className="flex items-center gap-2">
            {getPaymentMethods().map((method, index) => (
              <Badge key={index} variant="outline" className={`${method.color} border-current text-xs px-2 py-1`}>
                {method.icon} {method.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {house.isAffiliated && house.affiliateLink ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onCopyLink(house.affiliateLink!)}
                variant="outline"
                size="sm"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </Button>
              <Button
                onClick={() => onOpenLink(house.affiliateLink!)}
                size="sm"
                className={`bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white`}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onJoinAffiliate(house.id)}
              disabled={isPending}
              size="lg"
              className={`
                w-full bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white
                shadow-lg hover:shadow-xl transition-all duration-300
                ${isPending ? 'animate-pulse' : 'hover:scale-105'}
              `}
            >
              {isPending ? (
                <Timer className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 mr-2" />
              )}
              {isPending ? 'Processando...' : 'Tornar-se Afiliado'}
            </Button>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Shield className="w-3 h-3" />
            Confiança: {trustScore.toFixed(0)}%
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <TrendingUp className="w-3 h-3" />
            Popular: {popularityScore.toFixed(0)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}