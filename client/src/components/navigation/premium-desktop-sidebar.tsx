import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { getNavigationRoutes } from "@/config/routes.config";
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User, 
  Crown,
  Menu,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PremiumDesktopSidebarProps {
  className?: string;
}

export function PremiumDesktopSidebar({ className }: PremiumDesktopSidebarProps) {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const logoutMutation = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auto-collapse on medium screens
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationRoutes = getNavigationRoutes(isAdmin ? 'admin' : 'user');
  const shouldExpand = (isHovered && isCollapsed) || !isCollapsed;

  const isActiveRoute = (path: string): boolean => {
    if (path === location) return true;
    if (location.startsWith(path) && path !== '/') return true;
    return false;
  };

  if (!mounted) return null;

  const sidebarVariants = {
    expanded: { 
      width: 280,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 300 
      }
    },
    collapsed: { 
      width: 80,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 300 
      }
    }
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
    <motion.div
      variants={sidebarVariants}
      animate={shouldExpand ? "expanded" : "collapsed"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col",
        "bg-gradient-to-b from-slate-950/95 via-slate-900/95 to-slate-950/95",
        "backdrop-blur-xl border-r border-slate-800/50",
        "shadow-2xl shadow-slate-950/20",
        className
      )}
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/30 to-slate-900/70 backdrop-blur-sm rounded-r-2xl" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <AnimatePresence mode="wait">
            {shouldExpand ? (
              <motion.div
                key="expanded-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="font-bold text-slate-200 text-lg">AfiliadosBet</h1>
                  <p className="text-xs text-slate-400">
                    {isAdmin ? 'Admin Panel' : 'Affiliate Panel'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg mx-auto"
              >
                <span className="text-white font-bold text-sm">A</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Collapse Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200",
              !shouldExpand && "hidden"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </motion.button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-slate-800/50">
          <AnimatePresence mode="wait">
            {shouldExpand ? (
              <motion.div
                key="expanded-profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center space-x-3"
              >
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-purple-600 text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {user?.fullName || user?.username || 'Usuário'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isAdmin ? "destructive" : "default"} className="text-xs">
                      {isAdmin ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        'Afiliado'
                      )}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-purple-600 text-white text-sm">
                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navigationRoutes.map((route, index) => {
            const Icon = route.icon;
            const isActive = isActiveRoute(route.path);
            
            return (
              <motion.div
                key={route.path}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={route.path}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      x: shouldExpand ? 4 : 0
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 group relative overflow-hidden",
                      shouldExpand ? "p-3 space-x-3" : "p-3 justify-center",
                      isActive 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-white" 
                        : "hover:bg-slate-800/50 text-slate-300 hover:text-slate-100"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl"
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      />
                    )}
                    
                    {/* Icon with premium glow effect */}
                    <div className="relative z-10">
                      <motion.div
                        animate={isActive ? { 
                          rotate: [0, -5, 5, 0],
                          scale: [1, 1.1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.5 }}
                        className={cn(
                          "relative",
                          route.premium && !isActive && "drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-white" : "text-slate-300 group-hover:text-slate-100"
                        )} />
                        
                        {/* Premium indicator */}
                        {route.premium && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Label */}
                    <AnimatePresence>
                      {shouldExpand && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="relative z-10 flex-1 min-w-0"
                        >
                          <span className={cn(
                            "font-medium truncate",
                            isActive ? "text-white" : "text-slate-300 group-hover:text-slate-100"
                          )}>
                            {route.label}
                          </span>
                          {route.description && (
                            <p className={cn(
                              "text-xs truncate mt-0.5",
                              isActive ? "text-emerald-100" : "text-slate-500"
                            )}>
                              {route.description}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Hover effect shimmer */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent",
                      "transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000",
                      !isActive && "opacity-0 group-hover:opacity-100"
                    )} />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <Button
            onClick={() => logoutMutation.mutate()}
            variant="ghost"
            disabled={logoutMutation.isPending}
            className={cn(
              "w-full transition-all duration-200",
              "hover:bg-red-500/10 hover:text-red-400 text-slate-400",
              shouldExpand ? "justify-start" : "justify-center px-0"
            )}
          >
            <LogOut className="h-4 w-4" />
            <AnimatePresence>
              {shouldExpand && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}