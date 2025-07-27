import { cn } from "@/lib/utils";
import { PremiumCard, PremiumStatsCard } from "./premium-card";
import { PremiumGrid, PremiumSection, PremiumContainer } from "./premium-layout";
import { PremiumBadge } from "./premium-badge";
import { PremiumAnimatedContainer, PremiumStaggerContainer, PremiumStaggerItem } from "./premium-animations";

// Premium Dashboard Types
export interface PremiumStatConfig {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'glow';
}

export interface PremiumWidgetConfig {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface PremiumDashboardProps {
  title?: string;
  subtitle?: string;
  stats?: PremiumStatConfig[];
  widgets?: PremiumWidgetConfig[];
  children?: React.ReactNode;
  className?: string;
}

const PremiumDashboard = ({
  title,
  subtitle,
  stats = [],
  widgets = [],
  children,
  className
}: PremiumDashboardProps) => {
  return (
    <PremiumContainer className={cn("space-y-8", className)}>
      {/* Dashboard Header */}
      {(title || subtitle) && (
        <PremiumAnimatedContainer animation="fadeIn">
          <div className="space-y-2">
            {title && (
              <h1 className="text-display text-premium-gradient font-black">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-body-large text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </PremiumAnimatedContainer>
      )}

      {/* Stats Grid */}
      {stats.length > 0 && (
        <PremiumSection>
          <PremiumStaggerContainer staggerDelay={0.1}>
            <PremiumGrid cols={stats.length > 4 ? 4 : stats.length} gap="lg">
              {stats.map((stat, index) => (
                <PremiumStaggerItem key={index} animation="slideUp">
                  <PremiumStatsCard
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                    changeType={stat.changeType}
                    icon={stat.icon}
                    variant={stat.variant || 'glass'}
                    animated
                  />
                </PremiumStaggerItem>
              ))}
            </PremiumGrid>
          </PremiumStaggerContainer>
        </PremiumSection>
      )}

      {/* Widgets Grid */}
      {widgets.length > 0 && (
        <PremiumSection>
          <PremiumStaggerContainer staggerDelay={0.15}>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {widgets.map((widget, index) => (
                <PremiumStaggerItem key={index} animation="scaleIn">
                  <PremiumDashboardWidget {...widget} />
                </PremiumStaggerItem>
              ))}
            </div>
          </PremiumStaggerContainer>
        </PremiumSection>
      )}

      {/* Custom Content */}
      {children && (
        <PremiumAnimatedContainer animation="fadeIn" delay={0.3}>
          {children}
        </PremiumAnimatedContainer>
      )}
    </PremiumContainer>
  );
};

// Premium Dashboard Widget
const PremiumDashboardWidget = ({
  title,
  subtitle,
  content,
  actions,
  variant = 'glass',
  size = 'md'
}: PremiumWidgetConfig) => {
  const sizeClasses = {
    sm: 'col-span-1',
    md: 'col-span-1',
    lg: 'col-span-2',
    xl: 'col-span-3'
  };

  return (
    <PremiumCard 
      variant={variant} 
      animated 
      interactive
      className={cn("h-fit", sizeClasses[size])}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="space-y-1">
          <h3 className="text-title text-white font-bold">
            {title}
          </h3>
          {subtitle && (
            <p className="text-caption text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className="px-6 pb-6">
        {content}
      </div>
    </PremiumCard>
  );
};

// Premium Quick Actions Widget
interface PremiumQuickActionsProps {
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    badge?: string;
  }>;
  title?: string;
  className?: string;
}

const PremiumQuickActions = ({
  actions,
  title = "Ações Rápidas",
  className
}: PremiumQuickActionsProps) => {
  return (
    <PremiumCard variant="glass" animated className={className}>
      <div className="p-6 space-y-4">
        <h3 className="text-subtitle text-white font-bold">
          {title}
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200",
                "glass-card hover:scale-105 active:scale-95",
                "text-slate-300 hover:text-white",
                "min-h-[80px] group"
              )}
            >
              {action.icon && (
                <span className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
              )}
              <span className="text-sm font-medium text-center">
                {action.label}
              </span>
              
              {action.badge && (
                <PremiumBadge 
                  variant="primary" 
                  size="sm"
                  className="absolute -top-1 -right-1"
                >
                  {action.badge}
                </PremiumBadge>
              )}
            </button>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
};

// Premium Activity Feed Widget
interface PremiumActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

interface PremiumActivityFeedProps {
  activities: PremiumActivityItem[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const PremiumActivityFeed = ({
  activities,
  title = "Atividades Recentes",
  maxItems = 5,
  className
}: PremiumActivityFeedProps) => {
  const visibleActivities = activities.slice(0, maxItems);

  const typeConfig = {
    success: { color: 'text-green-400', bg: 'bg-green-500/20' },
    warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    error: { color: 'text-red-400', bg: 'bg-red-500/20' },
    info: { color: 'text-blue-400', bg: 'bg-blue-500/20' }
  };

  return (
    <PremiumCard variant="glass" animated className={className}>
      <div className="p-6 space-y-4">
        <h3 className="text-subtitle text-white font-bold">
          {title}
        </h3>
        
        <div className="space-y-3">
          {visibleActivities.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              Nenhuma atividade recente
            </div>
          ) : (
            visibleActivities.map((activity, index) => {
              const config = typeConfig[activity.type];
              
              return (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl glass-card hover:bg-slate-700/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    config.bg
                  )}>
                    {activity.icon ? (
                      <span className={cn("w-4 h-4", config.color)}>
                        {activity.icon}
                      </span>
                    ) : (
                      <div className={cn("w-2 h-2 rounded-full", config.color.replace('text-', 'bg-'))} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-slate-400 text-xs mt-1">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PremiumCard>
  );
};

export { 
  PremiumDashboard, 
  PremiumDashboardWidget, 
  PremiumQuickActions, 
  PremiumActivityFeed,
  type PremiumStatConfig,
  type PremiumWidgetConfig,
  type PremiumActivityItem
};