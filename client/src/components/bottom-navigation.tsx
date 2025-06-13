import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Home,
  Building2,
  Link2,
  BarChart3,
  CreditCard,
  User
} from 'lucide-react';

interface BottomNavigationProps {
  className?: string;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/home',
    icon: Home,
    label: 'Home'
  },
  {
    title: 'Casas',
    href: '/betting-houses',
    icon: Building2,
    label: 'Casas'
  },
  {
    title: 'Links',
    href: '/my-links',
    icon: Link2,
    label: 'Links'
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    label: 'Stats'
  },
  {
    title: 'Pagamentos',
    href: '/payments',
    icon: CreditCard,
    label: 'Pix'
  },
  {
    title: 'Perfil',
    href: '/profile',
    icon: User,
    label: 'Perfil'
  }
];

export function BottomNavigation({ className }: BottomNavigationProps) {
  const [location, navigate] = useLocation();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 md:hidden",
      "safe-area-inset-bottom", // Para dispositivos com notch
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = location === item.href || 
                          (item.href === '/home' && location === '/') ||
                          (item.href === '/betting-houses' && location === '/houses');
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 touch-target",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                isActive
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-slate-300 active:text-emerald-300"
              )}
              aria-label={item.title}
            >
              <div className={cn(
                "relative flex items-center justify-center w-8 h-8 mb-1 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "text-slate-400 group-hover:bg-slate-800/50"
              )}>
                <item.icon className="h-5 w-5" />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium truncate max-w-full transition-colors duration-200",
                isActive 
                  ? "text-emerald-400" 
                  : "text-slate-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}