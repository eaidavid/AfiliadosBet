import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { PremiumDesktopSidebar } from './premium-desktop-sidebar';
import { MobileNavigationFixed } from './mobile-navigation-fixed';
import { cn } from '@/lib/utils';

interface SmartNavigationFixedProps {
  children: ReactNode;
  className?: string;
}

export function SmartNavigationFixed({ children, className }: SmartNavigationFixedProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const isMobile = useIsMobile(1024); // Desktop breakpoint at 1024px

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-emerald-500 text-xl font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Desktop Navigation - Only show for admin on desktop */}
      {!isMobile && isAdmin && (
        <PremiumDesktopSidebar className="fixed left-0 top-0 z-40" />
      )}

      {/* Mobile Navigation - Always show on mobile/tablet */}
      {isMobile && (
        <MobileNavigationFixed />
      )}

      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen transition-all duration-300",
          // Desktop layout with sidebar for admin
          !isMobile && isAdmin && "lg:ml-64",
          // Mobile layout with bottom padding
          isMobile && "pb-20",
          // User desktop layout - full width, no sidebar
          !isMobile && !isAdmin && "w-full",
          className
        )}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}