import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Home,
  Building2,
  Link2,
  BarChart3,
  CreditCard,
  User,
  Users,
  Settings,
  Activity,
  Crown,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  label: string;
  gradient: string;
  premium?: boolean;
}

const affiliateNavigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/home',
    icon: Home,
    label: 'Home',
    gradient: 'from-emerald-500 to-teal-600',
    premium: true
  },
  {
    title: 'Casas Premium',
    href: '/betting-houses',
    icon: Building2,
    label: 'Casas',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    title: 'Meus Links',
    href: '/my-links',
    icon: Link2,
    label: 'Links',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    title: 'Analytics Pro',
    href: '/click-analytics',
    icon: BarChart3,
    label: 'Analytics',
    gradient: 'from-orange-500 to-red-600',
    premium: true
  },
  {
    title: 'Pagamentos',
    href: '/affiliate/payments',
    icon: CreditCard,
    label: 'Pix',
    gradient: 'from-green-500 to-emerald-600'
  }
];

const adminNavigationItems: NavigationItem[] = [
  {
    title: 'Admin Central',
    href: '/admin',
    icon: Shield,
    label: 'Admin',
    gradient: 'from-red-500 to-rose-600',
    premium: true
  },
  {
    title: 'Casas de Apostas',
    href: '/admin/houses',
    icon: Building2,
    label: 'Casas',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    title: 'Afiliados',
    href: '/admin/manage',
    icon: Users,
    label: 'Afiliados',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    title: 'Analytics Elite',
    href: '/admin/analytics',
    icon: TrendingUp,
    label: 'Analytics',
    gradient: 'from-orange-500 to-amber-600',
    premium: true
  },
  {
    title: 'Pagamentos',
    href: '/admin/payments',
    icon: CreditCard,
    label: 'Pagamentos',
    gradient: 'from-green-500 to-emerald-600'
  }
];

export function PremiumBottomNav2026() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;

  const navigationItems = user.role === 'admin' ? adminNavigationItems : affiliateNavigationItems;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassmorphism Background with Ultra Premium Effects */}
      <div className="relative">
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-800/90 to-transparent backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10" />
        
        {/* Ultra Premium Border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        
        <div className="relative px-2 py-3">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navigationItems.map((item, index) => {
              const isActive = location === item.href || 
                (item.href !== '/home' && location.startsWith(item.href));
              
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 group",
                    "hover:scale-110 hover:-translate-y-1",
                    isActive ? "scale-110 -translate-y-1" : ""
                  )}
                >
                  {/* Premium Background Effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl transition-all duration-300",
                    isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-2xl shadow-${item.gradient.split('-')[1]}-500/30`
                      : "bg-slate-800/30 group-hover:bg-slate-700/50"
                  )} />
                  
                  {/* Ultra Premium Glow */}
                  {isActive && (
                    <div className={cn(
                      "absolute inset-0 rounded-2xl blur-xl opacity-60",
                      `bg-gradient-to-br ${item.gradient}`
                    )} />
                  )}
                  
                  {/* Premium Badge for Special Items */}
                  {item.premium && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse z-10">
                      <Crown className="w-2 h-2 text-white" />
                    </div>
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    {/* Icon with Ultra Premium Effects */}
                    <div className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300",
                      isActive 
                        ? "text-white transform rotate-3" 
                        : "text-slate-400 group-hover:text-white group-hover:rotate-3"
                    )}>
                      <item.icon className="w-5 h-5" />
                      
                      {/* Sparkle Effect for Active Items */}
                      {isActive && (
                        <Sparkles className="absolute w-3 h-3 text-yellow-300 animate-pulse opacity-60" />
                      )}
                    </div>
                    
                    {/* Ultra Premium Label */}
                    <span className={cn(
                      "text-[10px] font-bold tracking-wider uppercase transition-all duration-300",
                      isActive 
                        ? "text-white drop-shadow-lg" 
                        : "text-slate-500 group-hover:text-slate-300"
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Premium Active Indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Ultra Premium User Role Indicator */}
          <div className="absolute top-1 right-4">
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              user.role === 'admin' 
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30" 
                : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
            )}>
              <div className="flex items-center gap-1">
                {user.role === 'admin' ? (
                  <Shield className="w-3 h-3" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                {user.role === 'admin' ? 'ADMIN' : 'PRO'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Safe Area for Mobile Devices */}
      <div className="h-safe-area-inset-bottom bg-gradient-to-t from-slate-900 to-transparent" />
    </div>
  );
}