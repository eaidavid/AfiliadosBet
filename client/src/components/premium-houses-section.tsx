import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, Copy, UserPlus } from 'lucide-react';

interface BettingHouse {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  commissionType: string;
  commissionValue: string | null;
  cpaValue: string | null;
  revshareValue: string | null;
  minDeposit: string | null;
  paymentMethods: any;
  isActive: boolean;
  createdAt: string;
}

interface AffiliateLink {
  id: number;
  houseName: string;
  generatedUrl: string;
  createdAt: string;
  houseId: number;
}

interface PremiumHousesSectionProps {
  premium: BettingHouse[];
  affiliateLinks?: AffiliateLink[];
  onJoinAffiliate: (houseId: number) => void;
  onCopyLink: (url: string) => void;
  isJoining: boolean;
}

export function PremiumHousesSection({ 
  premium, 
  affiliateLinks = [], 
  onJoinAffiliate, 
  onCopyLink, 
  isJoining 
}: PremiumHousesSectionProps) {
  if (premium.length === 0) return null;

  const getPaymentMethods = (paymentMethods: any) => {
    if (!paymentMethods) return [];
    
    const methods = Array.isArray(paymentMethods) ? paymentMethods : 
                   typeof paymentMethods === 'string' ? paymentMethods.split(',') :
                   Object.keys(paymentMethods);
    
    return methods.map((method: string) => {
      const lowercaseMethod = method.toLowerCase().trim();
      if (lowercaseMethod.includes('pix')) return { 
        name: 'PIX', 
        icon: '◉', 
        className: 'text-emerald-400 font-bold bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-500/30' 
      };
      if (lowercaseMethod.includes('cartão') || lowercaseMethod.includes('card')) return { name: 'Cartão', icon: '💳' };
      if (lowercaseMethod.includes('boleto')) return { name: 'Boleto', icon: '📄' };
      if (lowercaseMethod.includes('cripto') || lowercaseMethod.includes('crypto')) return { name: 'Cripto', icon: '🪙' };
      return { name: method, icon: '💰' };
    });
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-2xl"></div>
      <Card className="relative border-2 border-yellow-500/30 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-black text-yellow-400 flex items-center justify-center gap-3 mb-2">
            <Crown className="h-8 w-8 animate-bounce" />
            💎 CASAS PREMIUM
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold animate-pulse">
              EXCLUSIVO
            </Badge>
          </CardTitle>
          <p className="text-yellow-300/90 text-lg font-medium">
            🚀 DUPLA COMISSÃO: Ganhe CPA + RevShare! Receba por cada cadastro E uma porcentagem mensal recorrente!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premium.map((house) => {
              const affiliateLink = affiliateLinks?.find(link => link.houseId === house.id);
              const paymentMethods = getPaymentMethods(house.paymentMethods);
              
              return (
                <div key={house.id} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                  <Card className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                    {/* VIP Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
                      VIP
                    </div>
                    
                    <CardHeader className="pb-3 text-center">
                      <CardTitle className="text-xl font-bold text-white mb-2">{house.name}</CardTitle>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
                        💎 DUPLA COMISSÃO
                      </Badge>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Enhanced Commission Display */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-emerald-400/50">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-green-400">CPA</span>
                          </div>
                          <span className="text-2xl font-black text-green-400">
                            R$ {parseFloat(house.cpaValue || '0').toFixed(0)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/50">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-blue-400">RevShare</span>
                          </div>
                          <span className="text-2xl font-black text-blue-400">
                            {parseFloat(house.revshareValue || '0').toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Payment Methods */}
                      {paymentMethods.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {paymentMethods.slice(0, 3).map((method, idx) => (
                            <Badge key={idx} variant="outline" className={method.className || "text-xs border-slate-600"}>
                              <span className="mr-1">{method.icon}</span>
                              {method.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <div className="text-center pt-2">
                        {affiliateLink ? (
                          <Button
                            onClick={() => onCopyLink(affiliateLink.generatedUrl)}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 font-bold shadow-lg text-white"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            COPIAR LINK VIP
                          </Button>
                        ) : (
                          <Button
                            onClick={() => onJoinAffiliate(house.id)}
                            disabled={isJoining}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 font-bold shadow-lg text-white"
                          >
                            {isJoining ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Afiliando...
                              </div>
                            ) : (
                              <>
                                <Crown className="h-4 w-4 mr-2" />
                                COMEÇAR AGORA
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}