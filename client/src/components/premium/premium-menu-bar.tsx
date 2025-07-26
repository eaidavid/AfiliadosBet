import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Building2, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Crown, 
  Zap,
  TrendingUp,
  Users,
  Award,
  Bell,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Target,
  DollarSign
} from 'lucide-react';

interface MenuBarProps {
  userStats?: {
    totalClicks?: number;
    totalCommission?: string;
    totalRegistrations?: number;
  };
  activeRoute?: string;
}

export function PremiumMenuBar({ userStats, activeRoute }: MenuBarProps) {
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      route: '/home',
      gradient: 'from-emerald-500 to-teal-500',
      vipBadge: true
    },
    {
      id: 'houses',
      label: 'Casas Premium',
      icon: Building2,
      route: '/betting-houses',
      gradient: 'from-blue-500 to-cyan-500',
      counter: 12
    },
    {
      id: 'analytics',
      label: 'Analytics Pro',
      icon: BarChart3,
      route: '/analytics',
      gradient: 'from-violet-500 to-purple-500',
      vipBadge: true
    },
    {
      id: 'payments',
      label: 'Pagamentos',
      icon: CreditCard,
      route: '/payments',
      gradient: 'from-orange-500 to-red-500',
      counter: userStats?.totalCommission || '0'
    },
    {
      id: 'profile',
      label: 'Perfil VIP',
      icon: Settings,
      route: '/profile',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  const isActive = (route: string) => {
    return activeRoute === route || window.location.pathname === route;
  };

  return (
    <>
      {/* Desktop Premium Menu Bar */}
      <div className="hidden lg:block">
        <Card className="bg-slate-900/95 backdrop-blur-sm border-slate-700/50 shadow-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Logo & Brand */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AfiliadosBet</h1>
                  <p className="text-xs text-emerald-400 font-semibold">PRO AFFILIATE</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="flex items-center gap-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    variant="ghost"
                    className={`
                      relative px-4 py-2 h-auto group transition-all duration-300
                      ${isActive(item.route) 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105` 
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                      
                      {item.vipBadge && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-1 py-0 h-4">
                          VIP
                        </Badge>
                      )}
                      
                      {item.counter && (
                        <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-emerald-400 text-xs px-1 py-0 h-4">
                          {item.counter}
                        </Badge>
                      )}
                    </div>
                    
                    {isActive(item.route) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse rounded-lg" />
                    )}
                  </Button>
                ))}
              </div>

              {/* Stats & Notifications */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-400">{userStats?.totalClicks || 0}</div>
                    <div className="text-xs text-slate-400">Cliques</div>
                  </div>
                  <div className="w-px h-8 bg-slate-600" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">R$ {userStats?.totalCommission || '0'}</div>
                    <div className="text-xs text-slate-400">Ganhos</div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="relative p-2">
                  <Bell className="w-5 h-5 text-slate-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Premium Menu */}
      <div className="lg:hidden">
        <Card className="bg-slate-900/95 backdrop-blur-sm border-slate-700/50 shadow-xl mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AfiliadosBet</h1>
                  <p className="text-xs text-emerald-400">PRO</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-300" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-300" />
                )}
              </Button>
            </div>
            
            {isMobileMenuOpen && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top duration-300">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => {
                      navigate(item.route);
                      setIsMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className={`
                      w-full justify-start gap-3 p-3 h-auto
                      ${isActive(item.route) 
                        ? `bg-gradient-to-r ${item.gradient} text-white` 
                        : 'text-slate-300 hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    
                    <div className="flex items-center gap-2">
                      {item.vipBadge && (
                        <Badge className="bg-yellow-500 text-black text-xs px-1 py-0 h-4">
                          VIP
                        </Badge>
                      )}
                      {item.counter && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {item.counter}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}