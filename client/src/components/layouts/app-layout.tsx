import { ReactNode } from 'react';
import { PremiumSidebar } from '@/components/navigation/premium-sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="flex h-screen relative">
        {/* Sidebar */}
        <PremiumSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Page Content */}
          <main className={cn(
            "flex-1 overflow-y-auto p-6",
            "bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50",
            "backdrop-blur-sm",
            className
          )}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}