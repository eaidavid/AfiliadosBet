import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

// Premium Card Variants
export type PremiumCardVariant = 'default' | 'glass' | 'gradient' | 'glow' | 'elevated';

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PremiumCardVariant;
  animated?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = 'default', animated = false, interactive = false, children, ...props }, ref) => {
    const baseClasses = "rounded-2xl transition-all duration-300";
    
    const variantClasses = {
      default: "bg-slate-800/50 border border-slate-700/50",
      glass: "glass-card",
      gradient: "bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border border-slate-600/30",
      glow: "glass-premium animate-glow",
      elevated: "bg-slate-800/70 border border-slate-600/40 shadow-2xl hover:shadow-glow transition-shadow duration-500"
    };

    const animationClasses = animated ? "animate-fade-in" : "";
    const interactiveClasses = interactive ? "card-hover cursor-pointer" : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          animationClasses,
          interactiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

// Premium Card Header
interface PremiumCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

const PremiumCardHeader = forwardRef<HTMLDivElement, PremiumCardHeaderProps>(
  ({ className, gradient = false, children, ...props }, ref) => {
    const gradientClasses = gradient 
      ? "bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-violet-500/10 border-b border-slate-700/50" 
      : "";

    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 rounded-t-2xl", gradientClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PremiumCardHeader.displayName = "PremiumCardHeader";

// Premium Card Content
interface PremiumCardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const PremiumCardContent = forwardRef<HTMLDivElement, PremiumCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PremiumCardContent.displayName = "PremiumCardContent";

// Premium Card Footer
interface PremiumCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  actions?: boolean;
}

const PremiumCardFooter = forwardRef<HTMLDivElement, PremiumCardFooterProps>(
  ({ className, actions = false, children, ...props }, ref) => {
    const actionClasses = actions 
      ? "flex items-center justify-between gap-4 bg-slate-900/30 border-t border-slate-700/50" 
      : "";

    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 rounded-b-2xl", actionClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PremiumCardFooter.displayName = "PremiumCardFooter";

// Premium Stats Card
interface PremiumStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  variant?: PremiumCardVariant;
  animated?: boolean;
  className?: string;
}

const PremiumStatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  variant = 'glass',
  animated = true,
  className
}: PremiumStatsCardProps) => {
  const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400'
  };

  return (
    <PremiumCard 
      variant={variant} 
      animated={animated} 
      interactive
      className={cn("group", className)}
    >
      <PremiumCardContent className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-caption text-slate-400 group-hover:text-slate-300 transition-colors">
            {title}
          </p>
          <div className="flex items-end gap-2">
            <p className="text-headline text-white font-black">
              {value}
            </p>
            {change && (
              <span className={cn("text-caption font-medium", changeColors[changeType])}>
                {change}
              </span>
            )}
          </div>
        </div>
        
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
};

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  PremiumStatsCard
};