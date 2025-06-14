import { useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  Building2,
  Link2,
  BarChart3,
  CreditCard,
  User,
  Crown
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

export function AffiliateSidebar({ className }: BottomNavigationProps) {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  // Não renderizar sidebar - usamos navegação inferior para todos os dispositivos
  return null;

  // Desktop: renderizar sidebar normal
  return (
    <div className={cn("w-64 h-screen bg-slate-900 border-r border-slate-800", className)}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center gap-2 px-4 border-b border-slate-800">
          <Crown className="h-8 w-8 text-emerald-400" />
          <div>
            <h2 className="text-lg font-bold text-white">AfiliadosBet</h2>
            <p className="text-xs text-slate-400">Painel do Afiliado</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const isActive = location === item.href || 
                            (item.href === '/home' && location === '/') ||
                            (item.href === '/betting-houses' && location === '/houses');
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-left",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                )}
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default AffiliateSidebar;