import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getNavigationRoutes } from "@/config/routes.config";
import { ChevronUp, Grid3X3 } from "lucide-react";

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const [location] = useLocation();
  const { isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationRoutes = getNavigationRoutes(isAdmin ? 'admin' : 'user');
  const primaryRoutes = navigationRoutes.slice(0, 4); // First 4 items
  const secondaryRoutes = navigationRoutes.slice(4); // Remaining items

  const isActiveRoute = (path: string): boolean => {
    if (path === location) return true;
    if (location.startsWith(path) && path !== '/') return true;
    return false;
  };

  if (!mounted) return null;

  return (
    <>
      {/* Bottom Navigation - Mobile/Tablet Only */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50",
        "safe-area-inset-bottom",
        className
      )}>
        {/* Main Navigation Items */}
        <div className="flex items-center justify-between px-2 py-2">
          {primaryRoutes.map((route, index) => {
            const Icon = route.icon;
            const isActive = isActiveRoute(route.path);
            
            return (
              <Link key={route.path} href={route.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] min-h-[64px]",
                    "transition-all duration-300 ease-out",
                    isActive 
                      ? "bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20" 
                      : "hover:bg-slate-800/50"
                  )}
                >
                  <motion.div
                    animate={isActive ? { 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Icon className={cn(
                      "h-5 w-5 mb-1",
                      isActive ? "text-white" : "text-slate-300"
                    )} />
                  </motion.div>
                  <span className={cn(
                    "text-xs font-medium",
                    isActive ? "text-white" : "text-slate-400"
                  )}>
                    {route.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 right-2 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
          
          {/* Expand Menu Button */}
          {secondaryRoutes.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] min-h-[64px]",
                "transition-all duration-300 ease-out",
                "hover:bg-slate-800/50",
                isExpanded && "bg-slate-800/50"
              )}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Grid3X3 className="h-5 w-5 mb-1 text-slate-300" />
              </motion.div>
              <span className="text-xs font-medium text-slate-400">
                Mais
              </span>
            </motion.button>
          )}
        </div>

        {/* Safe area for devices with notch */}
        <div className="h-safe-area-inset-bottom" />
      </div>

      {/* Expanded Menu Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Expanded Menu */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed bottom-20 left-4 right-4 z-50 lg:hidden"
            >
              <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">
                    Menu Completo
                  </h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full hover:bg-slate-800/50 transition-colors"
                  >
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                
                {/* All Navigation Items Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {navigationRoutes.map((route, index) => {
                    const Icon = route.icon;
                    const isActive = isActiveRoute(route.path);
                    
                    return (
                      <Link key={route.path} href={route.path}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsExpanded(false)}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-2xl",
                            "transition-all duration-200",
                            isActive 
                              ? "bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20" 
                              : "bg-slate-800/50 hover:bg-slate-700/50"
                          )}
                        >
                          <Icon className={cn(
                            "h-6 w-6 mb-2",
                            isActive ? "text-white" : "text-slate-300"
                          )} />
                          <span className={cn(
                            "text-xs font-medium text-center leading-tight",
                            isActive ? "text-white" : "text-slate-400"
                          )}>
                            {route.label}
                          </span>
                          
                          {route.premium && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}