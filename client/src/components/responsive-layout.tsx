import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: ReactNode;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function ResponsiveLayout({ 
  children, 
  sidebarCollapsed = false, 
  className 
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <main className={cn(
      "flex-1 transition-all duration-300 ease-in-out",
      "overflow-x-hidden max-w-full min-w-0",
      // Dynamic margin based on device and sidebar state
      isMobile 
        ? "ml-0" 
        : sidebarCollapsed 
          ? "ml-16" 
          : "ml-72",
      className
    )}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </div>
    </main>
  );
}

export default ResponsiveLayout;