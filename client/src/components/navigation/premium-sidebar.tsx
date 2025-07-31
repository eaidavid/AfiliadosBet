import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Link2, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  User,
  Menu,
  X,
  Home,
  FileText,
  Zap,
  Target,
  DollarSign,
  Activity,
  Shield,
  Bell,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
  description: string;
  premium?: boolean;
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  // Admin Routes
  {
    id: 'admin-dashboard',
    label: 'Dashboard Admin',
    icon: LayoutDashboard,
    path: '/admin',
    description: 'Visão geral do sistema',
    premium: true,
    roles: ['admin']
  },
  {
    id: 'admin-affiliates',
    label: 'Gerenciar Afiliados',
    icon: Users,
    path: '/admin/manage',
    description: 'Controle total de afiliados',
    roles: ['admin']
  },
  {
    id: 'admin-houses',
    label: 'Casas de Apostas',
    icon: Building2,
    path: '/admin/houses',
    description: 'Configurar casas e comissões',
    premium: true,
    roles: ['admin']
  },
  {
    id: 'admin-postback',
    label: 'Gerador Postback',
    icon: Zap,
    path: '/admin/postback',
    description: 'URLs de integração avançada',
    premium: true,
    roles: ['admin']
  },
  {
    id: 'admin-logs',
    label: 'Logs Postback',
    icon: Activity,
    path: '/admin/logs',
    description: 'Monitoramento em tempo real',
    roles: ['admin']
  },
  {
    id: 'admin-settings',
    label: 'Configurações',
    icon: Settings,
    path: '/admin/settings',
    description: 'Configurações do sistema',
    roles: ['admin']
  },
  
  // User Routes
  {
    id: 'user-dashboard',
    label: 'Meu Dashboard',
    icon: Home,
    path: '/dashboard',
    description: 'Seu painel de controle',
    premium: true,
    roles: ['affiliate']
  },
  {
    id: 'user-houses',
    label: 'Casas Disponíveis',
    icon: Building2,
    path: '/houses',
    description: 'Explore oportunidades',
    roles: ['affiliate']
  },
  {
    id: 'user-links',
    label: 'Meus Links',
    icon: Link2,
    path: '/links',
    description: 'Gerencie seus links',
    roles: ['affiliate']
  },
  {
    id: 'user-reports',
    label: 'Relatórios',
    icon: TrendingUp,
    path: '/reports',
    description: 'Performance detalhada',
    premium: true,
    roles: ['affiliate']
  },
  {
    id: 'user-payments',
    label: 'Pagamentos',
    icon: CreditCard,
    path: '/payments',
    description: 'Histórico financeiro',
    roles: ['affiliate']
  },
  {
    id: 'user-profile',
    label: 'Meu Perfil',
    icon: User,
    path: '/profile',
    description: 'Dados pessoais',
    roles: ['affiliate']
  }
];

export function PremiumSidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || 'affiliate')
  );

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed && !isHovered ? "collapsed" : "expanded"}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "fixed left-0 top-0 h-full z-50 lg:relative",
          "bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95",
          "backdrop-blur-xl border-r border-emerald-500/20",
          "shadow-2xl shadow-emerald-500/10",
          "transition-all duration-300 ease-in-out"
        )}
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(15, 23, 42, 0.95) 0%, 
              rgba(30, 41, 59, 0.95) 50%, 
              rgba(15, 23, 42, 0.95) 100%
            ),
            radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-emerald-500/20">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {(!isCollapsed || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 p-2 shadow-lg">
                    <DollarSign className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                      AfiliadosBet
                    </h1>
                    <p className="text-xs text-slate-400">
                      {user?.role === 'admin' ? 'Painel Admin' : 'Painel Afiliado'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20",
                "text-slate-400 hover:text-emerald-400"
              )}
            >
              {isCollapsed && !isHovered ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
        </div>

        {/* User Info */}
        <AnimatePresence>
          {(!isCollapsed || isHovered) && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
                {user.role === 'admin' && (
                  <Shield className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <motion.div
                key={item.id}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={item.path}>
                  <div
                    className={cn(
                      "group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg"
                        : "hover:bg-slate-700/50 hover:border-emerald-500/20 border border-transparent",
                      "hover:shadow-lg hover:shadow-emerald-500/10"
                    )}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-blue-400 rounded-r-full"
                      />
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-br from-emerald-400/20 to-blue-400/20 text-emerald-400"
                        : "text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10"
                    )}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <AnimatePresence>
                      {(!isCollapsed || isHovered) && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 ml-3 min-w-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                "text-sm font-medium truncate transition-colors duration-200",
                                isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                              )}>
                                {item.label}
                                {item.premium && (
                                  <Sparkles className="inline w-3 h-3 ml-1 text-yellow-400" />
                                )}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {item.description}
                              </p>
                            </div>
                            
                            {item.badge && (
                              <span className="ml-2 px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            
                            <ChevronRight className={cn(
                              "w-4 h-4 ml-2 transition-all duration-200",
                              isActive ? "text-emerald-400 rotate-90" : "text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1"
                            )} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <AnimatePresence>
          {(!isCollapsed || isHovered) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-t border-emerald-500/20"
            >
              <div className="text-center">
                <p className="text-xs text-slate-400">
                  Sistema Premium de Afiliados
                </p>
                <p className="text-xs text-emerald-400 mt-1">
                  v2.0 - Powered by AfiliadosBet
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}