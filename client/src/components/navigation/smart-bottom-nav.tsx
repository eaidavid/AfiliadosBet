import { motion, AnimatePresence } from "framer-motion";
import { useNavigationContext } from "@/hooks/use-navigation-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  route: any;
  isActive: boolean;
  onClick?: () => void;
}

function NavigationItem({ route, isActive, onClick }: NavigationItemProps) {
  const Icon = route.icon;
  
  return (
    <Link href={route.path} onClick={onClick}>
      <motion.div
        className={cn(
          "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300",
          "min-h-[72px] min-w-[72px]",
          isActive
            ? "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20"
            : "hover:bg-white/10 backdrop-blur-sm"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Premium glow effect for active items */}
        {isActive && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-30",
              route.gradient ? `bg-gradient-to-r ${route.gradient}` : "bg-gradient-to-r from-emerald-500 to-blue-500"
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Icon with gradient background */}
        <motion.div
          className={cn(
            "relative w-8 h-8 rounded-xl flex items-center justify-center mb-1",
            isActive && route.gradient
              ? `bg-gradient-to-r ${route.gradient}`
              : isActive
              ? "bg-gradient-to-r from-emerald-500 to-blue-500"
              : "bg-white/10"
          )}
          animate={{
            scale: isActive ? 1.1 : 1,
            rotate: isActive ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon 
            className={cn(
              "w-4 h-4 transition-colors duration-300",
              isActive ? "text-white" : "text-slate-300"
            )} 
          />
          
          {/* Premium badge for premium features */}
          {route.premium && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border border-white/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            />
          )}
        </motion.div>
        
        {/* Label */}
        <span
          className={cn(
            "text-xs font-medium transition-colors duration-300 text-center leading-tight",
            isActive ? "text-white" : "text-slate-400"
          )}
        >
          {route.label}
        </span>
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-1/2 w-8 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
            initial={{ scale: 0, x: "-50%" }}
            animate={{ scale: 1, x: "-50%" }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

export function SmartBottomNav() {
  const { navigationRoutes, isActiveRoute, getUserType } = useNavigationContext();
  const isMobile = useIsMobile();
  
  // Only show on mobile for authenticated users
  if (!isMobile || getUserType() === 'guest') {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Background with glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-800/90 to-transparent backdrop-blur-2xl" />
        
        {/* Navigation content */}
        <div className="relative px-4 py-3">
          <motion.div
            className="flex items-center justify-around space-x-2 max-w-md mx-auto"
            layout
          >
            {navigationRoutes.map((route) => (
              <motion.div
                key={route.path}
                layout
                className="flex-1 flex justify-center"
              >
                <NavigationItem
                  route={route}
                  isActive={isActiveRoute(route.path)}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full opacity-60" />
        </div>
        
        {/* Ambient lighting effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}