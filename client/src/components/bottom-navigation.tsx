import { useLocation } from 'wouter';
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
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50 h-16 flex items-center justify-around px-2 md:hidden">
      {navigationItems.map((item) => {
        const isActive = location === item.href || 
                        (item.href === '/home' && location === '/') ||
                        (item.href === '/betting-houses' && location === '/houses');
        
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