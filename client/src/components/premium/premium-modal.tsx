import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes, useEffect } from "react";
import { X } from "lucide-react";
import { PremiumButton, PremiumIconButton } from "./premium-button";

// Premium Modal com glassmorphism e animações suaves
interface PremiumModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  children: React.ReactNode;
}

const PremiumModal = forwardRef<HTMLDivElement, PremiumModalProps>(
  ({ 
    className, 
    open, 
    onClose, 
    title, 
    description, 
    size = 'md', 
    closable = true,
    children, 
    ...props 
  }, ref) => {
    
    // Lock body scroll quando modal está aberto
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [open]);

    // Fecha modal com ESC
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closable) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, onClose, closable]);

    if (!open) return null;

    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw] max-h-[95vh]'
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop com glassmorphism */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={closable ? onClose : undefined}
        />
        
        {/* Modal Content */}
        <div
          ref={ref}
          className={cn(
            "relative w-full rounded-2xl glass-premium shadow-2xl animate-scale-in",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || closable) && (
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="space-y-1">
                {title && (
                  <h2 className="text-title text-white font-bold">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-body text-slate-400">
                    {description}
                  </p>
                )}
              </div>
              
              {closable && (
                <PremiumIconButton
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  icon={<X className="w-4 h-4" />}
                />
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="px-6 pb-6">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

PremiumModal.displayName = "PremiumModal";

// Premium Modal Actions (Footer)
interface PremiumModalActionsProps {
  children: React.ReactNode;
  className?: string;
}

const PremiumModalActions = ({ children, className }: PremiumModalActionsProps) => {
  return (
    <div className={cn(
      "flex items-center justify-end gap-3 pt-6 border-t border-white/10",
      className
    )}>
      {children}
    </div>
  );
};

// Premium Confirmation Modal
interface PremiumConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const PremiumConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'info',
  loading = false
}: PremiumConfirmModalProps) => {
  const variantStyles = {
    danger: {
      icon: "🗑️",
      confirmVariant: 'danger' as const
    },
    warning: {
      icon: "⚠️",
      confirmVariant: 'primary' as const
    },
    info: {
      icon: "ℹ️",
      confirmVariant: 'primary' as const
    }
  };

  return (
    <PremiumModal
      open={open}
      onClose={onClose}
      size="sm"
    >
      <div className="text-center space-y-4">
        <div className="text-4xl">
          {variantStyles[variant].icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-title text-white font-bold">
            {title}
          </h3>
          <p className="text-body text-slate-400">
            {description}
          </p>
        </div>
        
        <PremiumModalActions>
          <PremiumButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </PremiumButton>
          
          <PremiumButton
            variant={variantStyles[variant].confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </PremiumButton>
        </PremiumModalActions>
      </div>
    </PremiumModal>
  );
};

export { PremiumModal, PremiumModalActions, PremiumConfirmModal };