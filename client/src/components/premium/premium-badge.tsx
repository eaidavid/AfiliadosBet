import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

// Premium Badge Component
export type PremiumBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'glass';
export type PremiumBadgeSize = 'sm' | 'md' | 'lg';

interface PremiumBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PremiumBadgeVariant;
  size?: PremiumBadgeSize;
  animated?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const PremiumBadge = forwardRef<HTMLSpanElement, PremiumBadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    animated = false,
    icon,
    children, 
    ...props 
  }, ref) => {
    
    const baseClasses = "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200";

    const variantClasses = {
      default: "bg-slate-700 text-slate-300 border border-slate-600",
      primary: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      success: "bg-green-500/20 text-green-400 border border-green-500/30",
      warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      danger: "bg-red-500/20 text-red-400 border border-red-500/30",
      info: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      glass: "glass text-white border border-white/20"
    };

    const sizeClasses = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base"
    };

    const animationClasses = animated ? "animate-premium-pulse hover:scale-105" : "";

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          animationClasses,
          className
        )}
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

PremiumBadge.displayName = "PremiumBadge";

// Premium Status Badge
interface PremiumStatusBadgeProps {
  status: 'online' | 'offline' | 'pending' | 'error' | 'success';
  text?: string;
  size?: PremiumBadgeSize;
  animated?: boolean;
  className?: string;
}

const PremiumStatusBadge = ({
  status,
  text,
  size = 'md',
  animated = true,
  className
}: PremiumStatusBadgeProps) => {
  const statusConfig = {
    online: {
      variant: 'success' as const,
      icon: <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />,
      defaultText: "Online"
    },
    offline: {
      variant: 'default' as const,
      icon: <div className="w-2 h-2 bg-slate-400 rounded-full" />,
      defaultText: "Offline"
    },
    pending: {
      variant: 'warning' as const,
      icon: <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />,
      defaultText: "Pendente"
    },
    error: {
      variant: 'danger' as const,
      icon: <div className="w-2 h-2 bg-red-400 rounded-full" />,
      defaultText: "Erro"
    },
    success: {
      variant: 'success' as const,
      icon: <div className="w-2 h-2 bg-green-400 rounded-full" />,
      defaultText: "Sucesso"
    }
  };

  const config = statusConfig[status];

  return (
    <PremiumBadge
      variant={config.variant}
      size={size}
      animated={animated}
      icon={config.icon}
      className={className}
    >
      {text || config.defaultText}
    </PremiumBadge>
  );
};

// Premium Count Badge
interface PremiumCountBadgeProps {
  count: number;
  max?: number;
  variant?: PremiumBadgeVariant;
  size?: PremiumBadgeSize;
  showZero?: boolean;
  className?: string;
}

const PremiumCountBadge = ({
  count,
  max = 99,
  variant = 'danger',
  size = 'sm',
  showZero = false,
  className
}: PremiumCountBadgeProps) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <PremiumBadge
      variant={variant}
      size={size}
      animated={count > 0}
      className={cn("min-w-[20px] justify-center", className)}
    >
      {displayCount}
    </PremiumBadge>
  );
};

// Premium Progress Badge
interface PremiumProgressBadgeProps {
  current: number;
  total: number;
  variant?: PremiumBadgeVariant;
  size?: PremiumBadgeSize;
  showPercentage?: boolean;
  className?: string;
}

const PremiumProgressBadge = ({
  current,
  total,
  variant = 'info',
  size = 'md',
  showPercentage = false,
  className
}: PremiumProgressBadgeProps) => {
  const percentage = Math.round((current / total) * 100);
  const displayText = showPercentage ? `${percentage}%` : `${current}/${total}`;

  return (
    <PremiumBadge
      variant={variant}
      size={size}
      className={className}
    >
      {displayText}
    </PremiumBadge>
  );
};

export { 
  PremiumBadge, 
  PremiumStatusBadge, 
  PremiumCountBadge, 
  PremiumProgressBadge 
};