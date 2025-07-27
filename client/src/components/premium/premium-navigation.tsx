import { cn } from "@/lib/utils";
import { useState } from "react";
import { PremiumButton, PremiumIconButton } from "./premium-button";
import { PremiumBadge } from "./premium-badge";
import { Menu, X, ChevronDown } from "lucide-react";

// Premium Navigation Types
export interface PremiumNavItem {
  key: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  };
  active?: boolean;
  disabled?: boolean;
  children?: PremiumNavItem[];
}

interface PremiumNavigationProps {
  items: PremiumNavItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  onItemClick?: (item: PremiumNavItem) => void;
  className?: string;
  variant?: 'default' | 'glass' | 'floating';
}

const PremiumNavigation = ({
  items,
  logo,
  actions,
  onItemClick,
  className,
  variant = 'default'
}: PremiumNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleItemClick = (item: PremiumNavItem) => {
    if (item.disabled) return;
    
    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.key);
    } else {
      onItemClick?.(item);
      setIsMobileMenuOpen(false);
    }
  };

  const variantClasses = {
    default: "bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50",
    glass: "glass-premium border-b border-white/10",
    floating: "glass-premium rounded-2xl mx-4 mt-4 border border-white/10 shadow-2xl"
  };

  const renderNavItem = (item: PremiumNavItem, isChild = false) => {
    const isSubmenuOpen = openSubmenus.includes(item.key);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.key} className="relative">
        <button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left rounded-xl transition-all duration-200",
            isChild ? "pl-8 text-sm" : "text-base",
            item.active
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : item.disabled
              ? "text-slate-500 cursor-not-allowed opacity-50"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon && (
              <span className="flex-shrink-0 w-5 h-5">
                {item.icon}
              </span>
            )}
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <PremiumBadge
                variant={item.badge.variant || 'primary'}
                size="sm"
                animated
              >
                {item.badge.text}
              </PremiumBadge>
            )}
          </div>
          
          {hasChildren && (
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isSubmenuOpen && "rotate-180"
              )}
            />
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isSubmenuOpen && (
          <div className="mt-2 space-y-1 animate-fade-in">
            {item.children!.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn(
      "sticky top-0 z-40 w-full",
      variantClasses[variant],
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map(item => (
              <div key={item.key} className="relative group">
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    item.active
                      ? "text-emerald-400 bg-emerald-500/10"
                      : item.disabled
                      ? "text-slate-500 cursor-not-allowed opacity-50"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  )}
                >
                  {item.icon && (
                    <span className="w-4 h-4">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                  {item.badge && (
                    <PremiumBadge
                      variant={item.badge.variant || 'primary'}
                      size="sm"
                      animated
                    >
                      {item.badge.text}
                    </PremiumBadge>
                  )}
                  {item.children && item.children.length > 0 && (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {/* Desktop Dropdown */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-48 glass-premium border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 animate-scale-in">
                    <div className="p-2 space-y-1">
                      {item.children.map(child => (
                        <button
                          key={child.key}
                          onClick={() => handleItemClick(child)}
                          disabled={child.disabled}
                          className={cn(
                            "flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors duration-150",
                            child.active
                              ? "text-emerald-400 bg-emerald-500/10"
                              : child.disabled
                              ? "text-slate-500 cursor-not-allowed opacity-50"
                              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                          )}
                        >
                          {child.icon && (
                            <span className="w-4 h-4">
                              {child.icon}
                            </span>
                          )}
                          {child.label}
                          {child.badge && (
                            <PremiumBadge
                              variant={child.badge.variant || 'primary'}
                              size="sm"
                            >
                              {child.badge.text}
                            </PremiumBadge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {actions}
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <PremiumIconButton
                variant="glass"
                size="md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                icon={isMobileMenuOpen ? <X /> : <Menu />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-premium border-t border-white/10 animate-fade-in">
          <div className="px-4 py-6 space-y-2">
            {items.map(item => renderNavItem(item))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Premium Sidebar Navigation
interface PremiumSidebarProps {
  items: PremiumNavItem[];
  title?: string;
  footer?: React.ReactNode;
  onItemClick?: (item: PremiumNavItem) => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const PremiumSidebar = ({
  items,
  title,
  footer,
  onItemClick,
  className,
  collapsed = false,
  onToggleCollapse
}: PremiumSidebarProps) => {
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleItemClick = (item: PremiumNavItem) => {
    if (item.disabled) return;
    
    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.key);
    } else {
      onItemClick?.(item);
    }
  };

  const renderSidebarItem = (item: PremiumNavItem, isChild = false) => {
    const isSubmenuOpen = openSubmenus.includes(item.key);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.key}>
        <button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            "flex items-center justify-between w-full p-3 text-left rounded-xl transition-all duration-200 group",
            isChild ? "ml-4 text-sm" : "text-base",
            item.active
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : item.disabled
              ? "text-slate-500 cursor-not-allowed opacity-50"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {item.icon && (
              <span className="flex-shrink-0 w-5 h-5">
                {item.icon}
              </span>
            )}
            {!collapsed && (
              <>
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <PremiumBadge
                    variant={item.badge.variant || 'primary'}
                    size="sm"
                    animated
                  >
                    {item.badge.text}
                  </PremiumBadge>
                )}
              </>
            )}
          </div>
          
          {hasChildren && !collapsed && (
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200 flex-shrink-0",
                isSubmenuOpen && "rotate-180"
              )}
            />
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isSubmenuOpen && !collapsed && (
          <div className="mt-2 space-y-1 animate-fade-in">
            {item.children!.map(child => renderSidebarItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      "glass-premium border-r border-white/10 h-full flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      {title && !collapsed && (
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
      )}

      {/* Toggle Button */}
      {onToggleCollapse && (
        <div className="p-3 border-b border-white/10">
          <PremiumIconButton
            variant="glass"
            size="sm"
            onClick={onToggleCollapse}
            icon={<Menu />}
            className="w-full"
          />
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map(item => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="p-4 border-t border-white/10">
          {footer}
        </div>
      )}
    </aside>
  );
};

export { PremiumNavigation, PremiumSidebar };