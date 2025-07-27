import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useNavigationContext } from "@/hooks/use-navigation-context";
import { SmartBreadcrumbs } from "@/components/navigation/smart-breadcrumbs";
import { SmartBottomNav } from "@/components/navigation/smart-bottom-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showBottomNav?: boolean;
  className?: string;
  containerClassName?: string;
}

export function PageLayout({
  children,
  title,
  description,
  showBreadcrumbs = true,
  showBottomNav = true,
  className = "",
  containerClassName = ""
}: PageLayoutProps) {
  const { getPageTitle, location } = useNavigationContext();
  const isMobile = useIsMobile();
  
  const pageTitle = title || getPageTitle();
  
  // Set document title
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);
  
  // Auto-focus on page load for accessibility
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.focus();
    }
  }, [location]);
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.main
          key={location}
          className={cn(
            "relative",
            isMobile ? "pb-24" : "pb-8", // Extra padding for bottom nav on mobile
            containerClassName
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.22, 1, 0.36, 1] // Custom easing for premium feel
          }}
          tabIndex={-1}
          role="main"
          aria-label={`${pageTitle} page content`}
        >
          {/* Page header with breadcrumbs */}
          {showBreadcrumbs && (
            <div className="px-4 lg:px-8 pt-6">
              <SmartBreadcrumbs />
            </div>
          )}
          
          {/* Page title section */}
          {(title || description) && (
            <motion.div
              className="px-4 lg:px-8 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {title && (
                <h1 className="text-3xl font-bold text-white mb-2">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-slate-400 text-lg">
                  {description}
                </p>
              )}
            </motion.div>
          )}
          
          {/* Main content */}
          <motion.div
            className="px-4 lg:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {children}
          </motion.div>
          
          {/* Scroll to top functionality */}
          <ScrollToTopButton />
        </motion.main>
      </AnimatePresence>
      
      {/* Smart bottom navigation */}
      {showBottomNav && <SmartBottomNav />}
    </div>
  );
}

// Scroll to top button component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.button
      className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-xl flex items-center justify-center backdrop-blur-sm border border-white/20"
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6 text-white" />
    </motion.button>
  );
}

