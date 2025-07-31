import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { 
  Home, 
  Building2, 
  Link2, 
  CreditCard, 
  User, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Crown,
  DollarSign,
  FileText,
  Shield,
  Users,
  Database,
  Zap
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  gradient?: string;
  adminOnly?: boolean;
  premium?: boolean;
}

// Core navigation items for user and admin
const USER_NAV_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    path: '/home',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'houses',
    label: 'Casas',
    path: '/betting-houses',
    icon: Building2,
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    id: 'links',
    label: 'Links',
    path: '/my-links',
    icon: Link2,
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'payments',
    label: 'Pagamentos',
    path: '/payments',
    icon: CreditCard,
    gradient: 'from-green-500 to-emerald-600',
  }
];

const ADMIN_NAV_ITEMS: NavigationItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Admin',
    path: '/admin',
    icon: Shield,
    gradient: 'from-red-500 to-rose-600',
    adminOnly: true,
  },
  {
    id: 'admin-casas',
    label: 'Casas',
    path: '/admin/casas',
    icon: Building2,
    gradient: 'from-purple-500 to-violet-600',
    adminOnly: true,
  },
  {
    id: 'admin-manage',
    label: 'Afiliados',
    path: '/admin/manage',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-600',
    adminOnly: true,
  },
  {
    id: 'admin-payments',
    label: 'Pagamentos',
    path: '/admin/payments',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-600',
    adminOnly: true,
  }
];

const EXPANDED_ITEMS: NavigationItem[] = [
  {
    id: 'reports',
    label: 'Relatórios',
    path: '/reports',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'profile',
    label: 'Perfil',
    path: '/profile',
    icon: User,
    gradient: 'from-slate-500 to-gray-600',
  },
  {
    id: 'admin-postback',
    label: 'Postbacks',
    path: '/admin/postback',
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-600',
    adminOnly: true,
  },
  {
    id: 'admin-logs',
    label: 'Logs',
    path: '/admin/logs',
    icon: FileText,
    gradient: 'from-teal-500 to-cyan-600',
    adminOnly: true,
  },
  {
    id: 'settings',
    label: 'Configurações',
    path: '/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-slate-600',
  }
];

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigationFixed({ className }: MobileNavigationProps) {
  const [location] = useLocation();
  const { user, isAdmin, isLoading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get navigation items based on user role
  const primaryItems = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
  const expandedItems = EXPANDED_ITEMS.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  // Check if current route is active
  const isActiveRoute = (path: string) => {
    if (path === '/home' && location === '/') return true;
    if (path === '/admin' && location === '/admin') return true;
    return location === path || location.startsWith(path + '/');
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    setIsExpanded(false);
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95",
          "backdrop-blur-xl border-t border-slate-700/50",
          "safe-area-pb",
          className
        )}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {/* Primary Navigation Items */}
          {primaryItems.map((item) => (
            <Link key={item.id} href={item.path}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "px-3 py-2 rounded-xl transition-all duration-200",
                  "min-w-[60px] text-xs font-medium",
                  isActiveRoute(item.path)
                    ? "text-white bg-gradient-to-t from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="leading-tight">{item.label}</span>
              </motion.button>
            </Link>
          ))}

          {/* Expandable Menu */}
          <Drawer open={isExpanded} onOpenChange={setIsExpanded}>
            <DrawerTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "px-3 py-2 rounded-xl transition-all duration-200",
                  "min-w-[60px] text-xs font-medium",
                  "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <Menu className="h-5 w-5 mb-1" />
                <span className="leading-tight">Mais</span>
              </motion.button>
            </DrawerTrigger>
            
            <DrawerContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700">
              <DrawerHeader className="pb-4">
                <DrawerTitle className="text-slate-200 flex items-center gap-2">
                  {isAdmin && <Crown className="h-5 w-5 text-amber-500" />}
                  Menu Completo
                  {isAdmin && (
                    <Badge variant="destructive" className="text-xs">Admin</Badge>
                  )}
                </DrawerTitle>
              </DrawerHeader>
              
              <div className="px-6 pb-8">
                <div className="grid grid-cols-2 gap-3">
                  {expandedItems.map((item) => (
                    <Link key={item.id} href={item.path}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-xl",
                          "bg-gradient-to-r from-slate-800/50 to-slate-700/50",
                          "border border-slate-600/30 hover:border-slate-500/50",
                          "transition-all duration-200",
                          isActiveRoute(item.path) && "ring-2 ring-emerald-500/50 bg-emerald-900/20"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-br",
                          item.gradient || "from-slate-600 to-slate-700"
                        )}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-slate-200 font-medium text-sm">
                            {item.label}
                          </div>
                        </div>
                      </motion.button>
                    </Link>
                  ))}
                </div>

                {/* Logout Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Add logout logic here
                    console.log('Logout clicked');
                  }}
                  className="w-full mt-4 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-600/30 hover:border-red-500/50 transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700">
                    <LogOut className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-red-300 font-medium text-sm">Sair</span>
                </motion.button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </motion.div>

      {/* Safe area spacer */}
      <div className="h-20 lg:hidden" />
    </>
  );
}