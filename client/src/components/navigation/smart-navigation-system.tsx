import { useEffect, useState } from "react";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { PremiumDesktopSidebar } from "./premium-desktop-sidebar";
import { cn } from "@/lib/utils";

interface SmartNavigationSystemProps {
  children: React.ReactNode;
  className?: string;
}

export function SmartNavigationSystem({ children, className }: SmartNavigationSystemProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    setMounted(true);

    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        className
      )}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-emerald-500 text-xl font-medium">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
      className
    )}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="flex h-screen relative">
        {/* Desktop Sidebar - Hidden on mobile */}
        <PremiumDesktopSidebar />
        
        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          // Add left margin on desktop when sidebar is visible
          "lg:ml-20 xl:ml-20"
        )}>
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <MobileBottomNav />

      {/* Custom CSS for safe area and scrollbar */}
      <style>{`
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .h-safe-area-inset-bottom {
          height: env(safe-area-inset-bottom);
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}