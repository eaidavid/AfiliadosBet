import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { PremiumIconButton } from "./premium-button";
import { useEffect, useState } from "react";

// Premium Toast Types
export type PremiumToastVariant = 'success' | 'error' | 'warning' | 'info';

interface PremiumToastProps {
  id: string;
  variant: PremiumToastVariant;
  title: string;
  description?: string;
  duration?: number;
  closable?: boolean;
  onClose: (id: string) => void;
}

const PremiumToast = ({
  id,
  variant,
  title,
  description,
  duration = 5000,
  closable = true,
  onClose
}: PremiumToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrada com delay para animação
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const variantConfig = {
    success: {
      icon: CheckCircle,
      bgClass: "bg-green-500/10 border-green-500/30",
      iconClass: "text-green-400",
      titleClass: "text-green-300"
    },
    error: {
      icon: AlertCircle,
      bgClass: "bg-red-500/10 border-red-500/30",
      iconClass: "text-red-400",
      titleClass: "text-red-300"
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-yellow-500/10 border-yellow-500/30",
      iconClass: "text-yellow-400",
      titleClass: "text-yellow-300"
    },
    info: {
      icon: Info,
      bgClass: "bg-blue-500/10 border-blue-500/30",
      iconClass: "text-blue-400",
      titleClass: "text-blue-300"
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "glass-premium border rounded-xl p-4 shadow-lg transition-all duration-300 max-w-sm",
        config.bgClass,
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconClass)} />
        
        <div className="flex-1 space-y-1">
          <h4 className={cn("font-semibold text-sm", config.titleClass)}>
            {title}
          </h4>
          {description && (
            <p className="text-slate-400 text-sm">
              {description}
            </p>
          )}
        </div>
        
        {closable && (
          <PremiumIconButton
            variant="secondary"
            size="sm"
            onClick={handleClose}
            icon={<X className="w-4 h-4" />}
            className="opacity-70 hover:opacity-100"
          />
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-white/10 rounded-full h-1 overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all ease-linear",
            variant === 'success' && "bg-green-400",
            variant === 'error' && "bg-red-400",
            variant === 'warning' && "bg-yellow-400",
            variant === 'info' && "bg-blue-400"
          )}
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

// Premium Toast Container
interface PremiumToastContainerProps {
  toasts: Array<{
    id: string;
    variant: PremiumToastVariant;
    title: string;
    description?: string;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}

const PremiumToastContainer = ({
  toasts,
  onRemove,
  position = 'top-right',
  maxToasts = 5
}: PremiumToastContainerProps) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const visibleToasts = toasts.slice(-maxToasts);

  if (visibleToasts.length === 0) return null;

  return (
    <div className={cn(
      "fixed z-50 flex flex-col gap-2",
      positionClasses[position]
    )}>
      {visibleToasts.map((toast) => (
        <PremiumToast
          key={toast.id}
          {...toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

// Premium Toast Hook
interface Toast {
  id: string;
  variant: PremiumToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export const usePremiumToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (title: string, description?: string, duration?: number) => {
    addToast({ variant: 'success', title, description, duration });
  };

  const error = (title: string, description?: string, duration?: number) => {
    addToast({ variant: 'error', title, description, duration });
  };

  const warning = (title: string, description?: string, duration?: number) => {
    addToast({ variant: 'warning', title, description, duration });
  };

  const info = (title: string, description?: string, duration?: number) => {
    addToast({ variant: 'info', title, description, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  };
};

// CSS Animation para progress bar
const toastStyles = `
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = toastStyles;
  document.head.appendChild(style);
}

export { PremiumToast, PremiumToastContainer };