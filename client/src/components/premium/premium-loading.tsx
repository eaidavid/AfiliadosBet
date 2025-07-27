import { cn } from "@/lib/utils";

// Premium Loading States
export type PremiumLoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';
export type PremiumLoadingSize = 'sm' | 'md' | 'lg';

interface PremiumLoadingProps {
  variant?: PremiumLoadingVariant;
  size?: PremiumLoadingSize;
  className?: string;
  text?: string;
}

const PremiumLoading = ({ 
  variant = 'spinner', 
  size = 'md', 
  className,
  text 
}: PremiumLoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const LoadingSpinner = () => (
    <div className={cn(
      "border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin",
      sizeClasses[size],
      className
    )} />
  );

  const LoadingDots = () => (
    <div className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div 
          key={i}
          className={cn(
            "bg-emerald-500 rounded-full animate-bounce",
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <div className={cn(
      "bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full animate-premium-pulse",
      sizeClasses[size],
      className
    )} />
  );

  const LoadingSkeleton = () => (
    <div className={cn(
      "bg-slate-700 rounded animate-shimmer",
      size === 'sm' ? 'h-4' : size === 'md' ? 'h-8' : 'h-12',
      className
    )} />
  );

  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots />;
      case 'pulse':
        return <LoadingPulse />;
      case 'skeleton':
        return <LoadingSkeleton />;
      default:
        return <LoadingSpinner />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {renderLoading()}
      {text && (
        <p className={cn(
          "text-slate-400 font-medium animate-fade-in",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

// Premium Page Loading
interface PremiumPageLoadingProps {
  title?: string;
  subtitle?: string;
}

const PremiumPageLoading = ({ 
  title = "Carregando...",
  subtitle = "Aguarde um momento"
}: PremiumPageLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-violet-500/20 rounded-full blur-xl animate-float" />
        
        {/* Loading spinner */}
        <div className="relative w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-title text-white font-bold animate-fade-in">
          {title}
        </h3>
        <p className="text-body text-slate-400 animate-fade-in">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

// Premium Skeleton Components
interface PremiumSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
}

const PremiumSkeleton = ({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: PremiumSkeletonProps) => {
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  return (
    <div 
      className={cn(
        "bg-slate-700 animate-shimmer",
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Premium Card Skeleton
const PremiumCardSkeleton = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <PremiumSkeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <PremiumSkeleton className="h-4 w-3/4" />
          <PremiumSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      
      <div className="space-y-2">
        <PremiumSkeleton className="h-3 w-full" />
        <PremiumSkeleton className="h-3 w-5/6" />
        <PremiumSkeleton className="h-3 w-4/6" />
      </div>
      
      <div className="flex gap-2 pt-2">
        <PremiumSkeleton className="h-8 w-20" />
        <PremiumSkeleton className="h-8 w-24" />
      </div>
    </div>
  );
};

// Premium Table Skeleton
const PremiumTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PremiumSkeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-slate-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <PremiumSkeleton key={j} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { 
  PremiumLoading, 
  PremiumPageLoading, 
  PremiumSkeleton, 
  PremiumCardSkeleton, 
  PremiumTableSkeleton 
};