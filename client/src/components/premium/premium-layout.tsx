import { cn } from "@/lib/utils";

// Layout Premium padronizado - base para todos os layouts
interface PremiumLayoutProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'gradient' | 'pattern';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PremiumLayout = ({ 
  children, 
  className, 
  background = 'default',
  padding = 'md' 
}: PremiumLayoutProps) => {
  const backgroundClasses = {
    default: "bg-slate-950",
    gradient: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
    pattern: "bg-slate-950 relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.1)_0%,transparent_50%)] before:pointer-events-none"
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6 lg:p-8", 
    lg: "p-8 lg:p-12"
  };

  return (
    <div className={cn(
      "min-h-screen mobile-safe",
      backgroundClasses[background],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

// Container Premium centralizado
interface PremiumContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const PremiumContainer = ({ 
  children, 
  className, 
  size = 'lg' 
}: PremiumContainerProps) => {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full"
  };

  return (
    <div className={cn(
      "mx-auto w-full container-padding",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
};

// Grid Premium responsivo
interface PremiumGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

const PremiumGrid = ({ 
  children, 
  className, 
  cols = 3,
  gap = 'md' 
}: PremiumGridProps) => {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8"
  };

  return (
    <div className={cn(
      "grid",
      colsClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Section Premium com título
interface PremiumSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  animated?: boolean;
}

const PremiumSection = ({ 
  children, 
  title, 
  subtitle, 
  className,
  animated = true 
}: PremiumSectionProps) => {
  return (
    <section className={cn(
      "space-y-8",
      animated && "animate-fade-in",
      className
    )}>
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-headline text-white">{title}</h2>
          )}
          {subtitle && (
            <p className="text-body-large text-slate-400">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

// Spacer Premium para controle de espaçamento
interface PremiumSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const PremiumSpacer = ({ size = 'md' }: PremiumSpacerProps) => {
  const sizeClasses = {
    xs: "h-2",
    sm: "h-4",
    md: "h-8",
    lg: "h-16", 
    xl: "h-24"
  };

  return <div className={sizeClasses[size]} />;
};

export { 
  PremiumLayout, 
  PremiumContainer, 
  PremiumGrid, 
  PremiumSection, 
  PremiumSpacer 
};