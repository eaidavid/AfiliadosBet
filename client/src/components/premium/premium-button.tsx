import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

// Premium Button Variants siguiendo el estándar definido
export type PremiumButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'glass' | 'gradient';
export type PremiumButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PremiumButtonVariant;
  size?: PremiumButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled,
    icon,
    children, 
    ...props 
  }, ref) => {
    
    const baseClasses = "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary", 
      danger: "btn-danger",
      success: "btn-success",
      glass: "btn-glass",
      gradient: "bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 hover:from-emerald-600 hover:via-blue-600 hover:to-violet-600 text-white shadow-lg hover:shadow-xl btn-scale"
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-3 text-sm min-h-[44px]", 
      lg: "px-6 py-4 text-base min-h-[52px]",
      xl: "px-8 py-5 text-lg min-h-[60px]"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
        <span className={loading ? "opacity-70" : ""}>{children}</span>
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

// Premium Icon Button - para casos específicos
interface PremiumIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PremiumButtonVariant;
  size?: PremiumButtonSize;
  loading?: boolean;
  icon: React.ReactNode;
}

const PremiumIconButton = forwardRef<HTMLButtonElement, PremiumIconButtonProps>(
  ({ 
    className, 
    variant = 'secondary', 
    size = 'md', 
    loading = false,
    disabled,
    icon, 
    ...props 
  }, ref) => {
    
    const baseClasses = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary", 
      danger: "btn-danger",
      success: "btn-success",
      glass: "btn-glass",
      gradient: "bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 hover:from-emerald-600 hover:via-blue-600 hover:to-violet-600 text-white shadow-lg hover:shadow-xl btn-scale"
    };

    const sizeClasses = {
      sm: "w-9 h-9 text-sm",
      md: "w-11 h-11 text-base", 
      lg: "w-13 h-13 text-lg",
      xl: "w-15 h-15 text-xl"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </button>
    );
  }
);

PremiumIconButton.displayName = "PremiumIconButton";

export { PremiumButton, PremiumIconButton };