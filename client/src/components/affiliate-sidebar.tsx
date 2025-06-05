import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Building2,
  Link2,
  BarChart3,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Bell,
  Crown
} from 'lucide-react';

interface AffiliateSidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/home',
    icon: Home,
    description: 'Visão geral e estatísticas'
  },
  {
    title: 'Casas de Apostas',
    href: '/betting-houses',
    icon: Building2,
    description: 'Casas disponíveis para afiliação'
  },
  {
    title: 'Meus Links',
    href: '/my-links',
    icon: Link2,
    description: 'Visualizar e gerenciar meus links'
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    description: 'Relatórios e analytics'
  },
  {
    title: 'Pagamentos',
    href: '/payments',
    icon: CreditCard,
    description: 'Histórico de pagamentos'
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    description: 'Configurações da conta'
  }
];

export function AffiliateSidebar({ className }: AffiliateSidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300",
      collapsed ? "w-16" : "w-72",
      className
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Crown className="h-8 w-8 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">AfiliadosBet</h2>
                <p className="text-xs text-slate-400">Painel do Afiliado</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Afiliado Demo</p>
                <p className="text-xs text-slate-400 truncate">afiliado@demo.com</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                Ativo
              </Badge>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.href || 
                             (item.href === '/home' && location === '/') ||
                             (item.href === '/betting-houses' && location === '/houses');
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-12 text-left font-normal",
                      collapsed && "justify-center px-2",
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-emerald-400" : "text-slate-400"
                    )} />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs opacity-70 truncate">{item.description}</div>
                      </div>
                    )}
                    {isActive && !collapsed && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-800">
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-slate-300 border-slate-700 hover:bg-slate-800">
                <Bell className="h-4 w-4" />
                Notificações
                <Badge variant="destructive" className="ml-auto">3</Badge>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-slate-300 border-slate-700 hover:bg-slate-800">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed quick actions */}
        {collapsed && (
          <div className="p-2 border-t border-slate-800 space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-center text-slate-400 hover:text-white">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-center text-slate-400 hover:text-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}