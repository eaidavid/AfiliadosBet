import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Copy, 
  ExternalLink,
  Star,
  Shield,
  Timer,
  Award,
  Eye,
  MousePointer,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BettingHouse {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  commissionType: string;
  commissionValue: string | null;
  revshareValue?: string;
  cpaValue?: string;
  revshareAffiliatePercent?: number;
  cpaAffiliatePercent?: number;
  minDeposit: string | null;
  paymentMethods: any;
  isActive: boolean;
  createdAt: string;
  isAffiliated: boolean;
  affiliateLink?: string;
  highlights?: string[];
}

interface OpportunityCardProps {
  house: BettingHouse;
  onJoinAffiliate?: (houseId: number) => void;
  onCopyLink?: (link: string) => void;
  onOpenLink?: (link: string) => void;
  isPending?: boolean;
}

export function OpportunityCard({ 
  house, 
  onJoinAffiliate, 
  onCopyLink, 
  onOpenLink,
  isPending = false 
}: OpportunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const getBadgeInfo = () => {
    const badges = [];
    
    if (house.commissionType === 'hybrid') {
      badges.push({ text: '💎 PREMIUM', color: 'bg-gradient-to-r from-violet-500 to-purple-600', glow: 'shadow-violet-500/50' });
    }
    
    if (parseFloat(house.cpaValue || '0') > 50) {
      badges.push({ text: '🔥 HOT', color: 'bg-gradient-to-r from-orange-500 to-red-500', glow: 'shadow-orange-500/50' });
    }
    
    if (parseFloat(house.revshareValue || '0') > 35) {
      badges.push({ text: '⚡ ALTA CONVERSÃO', color: 'bg-gradient-to-r from-emerald-500 to-green-600', glow: 'shadow-emerald-500/50' });
    }
    
    const daysOld = Math.floor((new Date().getTime() - new Date(house.createdAt).getTime()) / (1000 * 3600 * 24));
    if (daysOld < 7) {
      badges.push({ text: '🆕 NOVA', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' });
    }
    
    return badges;
  };

  const getCommissionDisplay = () => {
    const commissionType = house.commissionType?.toLowerCase();
    
    if (commissionType === 'hybrid') {
      return (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 p-4 rounded-xl border border-emerald-400/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                <div>
                  <span className="text-sm font-bold text-emerald-400">CPA</span>
                  <p className="text-xs text-emerald-300/80">Por cadastro</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">
                  R$ {parseFloat(house.cpaValue || '0').toFixed(0)}
                </span>
                <p className="text-xs text-emerald-300/70">imediato</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-400/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                <div>
                  <span className="text-sm font-bold text-blue-400">RevShare</span>
                  <p className="text-xs text-blue-300/80">Vitalício</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-400">
                  {house.revshareValue}%
                </span>
                <p className="text-xs text-blue-300/70">mensal</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (commissionType === 'cpa') {
      return (
        <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 p-4 rounded-xl border border-emerald-400/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <div>
                <span className="text-sm font-bold text-emerald-400">CPA</span>
                <p className="text-xs text-emerald-300/80">Pagamento único</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">
                R$ {parseFloat(house.cpaValue || '0').toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-400/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <div>
              <span className="text-sm font-bold text-blue-400">RevShare</span>
              <p className="text-xs text-blue-300/80">Pagamento recorrente</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-400">
              {house.revshareValue}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  const badges = getBadgeInfo();
  const isAffiliated = house.isAffiliated;

  return (
    <Card 
      className={`
        bg-slate-800/60 border-slate-700/50 backdrop-blur-sm overflow-hidden 
        transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl
        ${isHovered ? 'shadow-emerald-500/25 border-emerald-500/30' : ''}
        group cursor-pointer
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with badges */}
      <CardHeader className="p-0 relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 via-transparent to-slate-800/30" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
        
        <div className="relative p-6 pb-4">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {badges.map((badge, index) => (
              <Badge 
                key={index}
                className={`${badge.color} ${badge.glow} text-white border-0 text-xs font-bold px-3 py-1 shadow-lg animate-pulse`}
              >
                {badge.text}
              </Badge>
            ))}
          </div>

          {/* House info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600/50 backdrop-blur-sm overflow-hidden">
              {house.logoUrl ? (
                <img 
                  src={house.logoUrl} 
                  alt={house.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Crown className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">
                {house.name}
              </h3>
              <p className="text-slate-400 text-sm">
                {house.description || 'Casa de apostas premium'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Verificada</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2 space-y-6">
        {/* Commission display */}
        {getCommissionDisplay()}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <MousePointer className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">4.8%</p>
            <p className="text-slate-400 text-xs">Taxa Conversão</p>
          </div>
          <div className="text-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <Award className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">892</p>
            <p className="text-slate-400 text-xs">Afiliados Ativos</p>
          </div>
        </div>

        {/* Revenue simulator preview */}
        <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-400/30">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-violet-400 font-semibold text-sm">Simulação de Ganhos</span>
          </div>
          <p className="text-white font-bold">10 conversões = R$ 1.250,00</p>
          <p className="text-slate-400 text-xs">Baseado na média mensal</p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {isAffiliated && house.affiliateLink ? (
            <div className="space-y-2">
              <Button
                onClick={() => onCopyLink?.(house.affiliateLink!)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300"
                disabled={isPending}
              >
                <Copy className="w-5 h-5 mr-2" />
                Copiar Link de Afiliado
              </Button>
              <Button
                onClick={() => onOpenLink?.(house.affiliateLink!)}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Visitar Casa
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onJoinAffiliate?.(house.id)}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group"
              disabled={isPending}
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              {isPending ? 'Processando...' : '🚀 Ativar Link Premium'}
            </Button>
          )}
        </div>

        {/* Urgency indicator */}
        <div className="flex items-center gap-2 text-orange-400 text-sm">
          <Timer className="w-4 h-4" />
          <span>67 afiliados se afiliaram nas últimas 24h</span>
        </div>
      </CardContent>
    </Card>
  );
}