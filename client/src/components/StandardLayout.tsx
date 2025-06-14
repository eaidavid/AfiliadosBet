import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StandardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function StandardLayout({ children, title, subtitle, className = '' }: StandardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen bg-slate-950 text-white ${className}`}>
      {/* Main Content with Dynamic Spacing */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="mb-6 space-y-2">
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-500">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-300 text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Responsive container for cards and grids
export function ResponsiveGrid({ children, className = '', columns = 3 }: { 
  children: ReactNode; 
  className?: string; 
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Standard card wrapper with consistent styling
export function StandardCard({ children, className = '', title, description }: { 
  children: ReactNode; 
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className={`
      bg-slate-900 
      border border-slate-700/50 
      rounded-2xl 
      shadow-lg
      backdrop-blur-sm
      ${className}
    `}>
      {(title || description) && (
        <div className="p-4 md:p-6 border-b border-slate-700/50">
          {title && (
            <h3 className="text-lg md:text-xl font-semibold text-white mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-slate-300 text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}