import React, { useState } from 'react';
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Building2, 
  Users, 
  DollarSign, 
  Zap,
  FileText,
  Settings,
  LogOut,
  Crown,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  gradient?: string;
  description?: string;
}

const ADMIN_NAV_ITEMS: NavigationItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: Shield,
    gradient: 'from-red-500 to-rose-600',
    description: 'Visão geral do sistema'
  },
  {
    id: 'admin-casas',
    label: 'Casas de Apostas',
    path: '/admin/casas',
    icon: Building2,
    gradient: 'from-purple-500 to-violet-600',
    description: 'Gerenciar casas de apostas'
  },
  {
    id: 'admin-manage',
    label: 'Afiliados',
    path: '/admin/manage',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-600',
    description: 'Gerenciar afiliados'
  },
  {
    id: 'admin-payments',
    label: 'Pagamentos',
    path: '/admin/payments',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-600',
    description: 'Controle de pagamentos'
  },
  {
    id: 'admin-postback',
    label: 'Postbacks',
    path: '/admin/postback',
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-600',
    description: 'Configurar integrações'
  },
  {
    id: 'admin-logs',
    label: 'Logs',
    path: '/admin/logs',
    icon: FileText,
    gradient: 'from-teal-500 to-cyan-600',
    description: 'Monitorar atividades'
  },
  {
    id: 'settings',
    label: 'Configurações',
    path: '/admin/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-slate-600',
    description: 'Configurações do sistema'
  }
];

interface PremiumDesktopSidebarProps {
  className?: string;
}

export function PremiumDesktopSidebar({ className }: PremiumDesktopSidebarProps) {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if current route is active
  const isActiveRoute = (path: string) => {
    if (path === '/admin' && location === '/admin') return true;
    return location === path || location.startsWith(path + '/');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
        "border-r border-slate-700/50 backdrop-blur-xl",
        "flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">AfiliadosBet</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {user?.fullName || user?.email}
              </p>
              <div className="flex items-center gap-1">
                <Badge variant="destructive" className="text-xs px-2 py-0">
                  Admin
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link key={item.id} href={item.path}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "transition-all duration-200 text-left",
                isActiveRoute(item.path)
                  ? "bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 text-white border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50",
                isCollapsed && "justify-center px-2"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br transition-all duration-200",
                isActiveRoute(item.path) 
                  ? "from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25" 
                  : `${item.gradient || "from-slate-600 to-slate-700"} opacity-70 hover:opacity-100`
              )}>
                <item.icon className="h-4 w-4 text-white" />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-slate-500 truncate">{item.description}</div>
                  )}
                </div>
              )}

              {!isCollapsed && isActiveRoute(item.path) && (
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </motion.button>
          </Link>
        ))}
      </nav>

      <Separator className="bg-slate-700/50" />

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 space-y-3">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Status do Sistema
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Servidor</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 text-xs">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Database</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 text-xs">Conectado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-red-400 hover:text-red-300 hover:bg-red-900/20",
            isCollapsed && "px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </motion.div>
  );
}