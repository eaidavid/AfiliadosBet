import { motion } from "framer-motion";
import { useNavigationContext } from "@/hooks/use-navigation-context";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface BreadcrumbItemProps {
  label: string;
  path: string;
  isLast: boolean;
  index: number;
}

function BreadcrumbItem({ label, path, isLast, index }: BreadcrumbItemProps) {
  const content = (
    <motion.span
      className={cn(
        "px-3 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium",
        isLast
          ? "text-white bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
          : "text-slate-400 hover:text-white hover:bg-white/10"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={!isLast ? { scale: 1.05 } : undefined}
    >
      {label}
    </motion.span>
  );

  if (isLast) {
    return content;
  }

  return (
    <Link href={path}>
      {content}
    </Link>
  );
}

export function SmartBreadcrumbs() {
  const { breadcrumbs, location } = useNavigationContext();
  
  // Don't show breadcrumbs on home page or if only one item
  if (location === '/' || breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <motion.nav
      className="flex items-center space-x-2 mb-6 overflow-x-auto scrollbar-hide"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Breadcrumb"
    >
      <div className="flex items-center space-x-2 min-w-max">
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.path} className="flex items-center space-x-2">
            {/* Home icon for first breadcrumb if it's home */}
            {index === 0 && breadcrumb.path === '/' && (
              <Home className="w-4 h-4 text-slate-400 mr-1" />
            )}
            
            <BreadcrumbItem
              label={breadcrumb.label}
              path={breadcrumb.path}
              isLast={index === breadcrumbs.length - 1}
              index={index}
            />
            
            {/* Separator */}
            {index < breadcrumbs.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.nav>
  );
}