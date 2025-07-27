import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import { useState } from "react";

// Premium Input Component padronizado
export type PremiumInputVariant = 'default' | 'glass' | 'filled';
export type PremiumInputSize = 'sm' | 'md' | 'lg';

interface PremiumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: PremiumInputVariant;
  size?: PremiumInputSize;
  label?: string;
  error?: string;
  help?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'md',
    label,
    error,
    help,
    icon,
    rightIcon,
    loading = false,
    type,
    ...props 
  }, ref) => {
    
    const baseClasses = "w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed mobile-input";

    const variantClasses = {
      default: "form-input",
      glass: "bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-slate-400 focus:border-emerald-500/50 focus:bg-white/10",
      filled: "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-600"
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-3 text-base min-h-[44px]",
      lg: "px-5 py-4 text-lg min-h-[52px]"
    };

    const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "";
    const iconPadding = icon ? "pl-12" : "";
    const rightIconPadding = rightIcon ? "pr-12" : "";

    return (
      <div className="space-y-2">
        {label && (
          <label className="form-label">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[size],
              errorClasses,
              iconPadding,
              rightIconPadding,
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
          
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="form-error">{error}</p>
        )}
        
        {help && !error && (
          <p className="form-help">{help}</p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

// Premium Search Input
interface PremiumSearchInputProps extends Omit<PremiumInputProps, 'icon' | 'type'> {
  onSearch?: (value: string) => void;
}

const PremiumSearchInput = forwardRef<HTMLInputElement, PremiumSearchInputProps>(
  ({ onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    return (
      <PremiumInput
        ref={ref}
        type="search"
        icon={<Search className="w-4 h-4" />}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PremiumSearchInput.displayName = "PremiumSearchInput";

// Premium Password Input
interface PremiumPasswordInputProps extends Omit<PremiumInputProps, 'type' | 'rightIcon'> {
  showToggle?: boolean;
}

const PremiumPasswordInput = forwardRef<HTMLInputElement, PremiumPasswordInputProps>(
  ({ showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    return (
      <PremiumInput
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={showToggle ? (
          <button
            type="button"
            onClick={togglePassword}
            className="text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : undefined}
        {...props}
      />
    );
  }
);

PremiumPasswordInput.displayName = "PremiumPasswordInput";

// Premium Textarea
interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: PremiumInputVariant;
  label?: string;
  error?: string;
  help?: string;
}

const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ 
    className, 
    variant = 'default',
    label,
    error,
    help,
    ...props 
  }, ref) => {
    
    const baseClasses = "w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none mobile-input";

    const variantClasses = {
      default: "form-input",
      glass: "bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-slate-400 focus:border-emerald-500/50 focus:bg-white/10",
      filled: "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-600"
    };

    const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "";

    return (
      <div className="space-y-2">
        {label && (
          <label className="form-label">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            errorClasses,
            "px-4 py-3 min-h-[100px]",
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="form-error">{error}</p>
        )}
        
        {help && !error && (
          <p className="form-help">{help}</p>
        )}
      </div>
    );
  }
);

PremiumTextarea.displayName = "PremiumTextarea";

export { 
  PremiumInput, 
  PremiumSearchInput, 
  PremiumPasswordInput, 
  PremiumTextarea 
};