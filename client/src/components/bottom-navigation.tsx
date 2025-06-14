import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  Home,
  Building2,
  Link2,
  BarChart3,
  CreditCard,
  User,
  Users,
  Settings,
  Activity
} from 'lucide-react';

interface BottomNavigationProps {
  className?: string;
}

const affiliateNavigationItems = [
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

const adminNavigationItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    label: 'Admin'
  },
  {
    title: 'Casas',
    href: '/admin/houses',
    icon: Building2,
    label: 'Casas'
  },
  {
    title: 'Afiliados',
    href: '/admin/manage',
    icon: Users,
    label: 'Users'
  },
  {
    title: 'Pagamentos',
    href: '/admin/payments',
    icon: CreditCard,
    label: 'Pagtos'
  },
  {
    title: 'Logs',
    href: '/admin/postback-logs',
    icon: Activity,
    label: 'Logs'
  },
  {
    title: 'Config',
    href: '/admin/settings',
    icon: Settings,
    label: 'Config'
  }
];

export function BottomNavigation({ className }: BottomNavigationProps) {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  // Detectar se está em área admin baseado na URL
  const isAdminArea = location.startsWith('/admin');
  
  // Escolher navegação baseada na área atual (admin ou afiliado)
  const navigationItems = isAdminArea ? adminNavigationItems : affiliateNavigationItems;

  // Não mostrar navegação se não estiver autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-[9999] h-16 flex items-center justify-around px-2 lg:hidden">
      {navigationItems.map((item) => {
        const isActive = location === item.href || 
                        (item.href === '/home' && location === '/') ||
                        (item.href === '/betting-houses' && location === '/houses') ||
                        (item.href === '/admin' && location === '/admin');
        
        return (
          <button
            key={item.href}
            onClick={() => handleNavigation(item.href)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 ${
              isActive ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}