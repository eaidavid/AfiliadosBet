import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIsMobile } from './use-mobile';

interface SidebarLayoutContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  sidebarWidth: number;
  contentMargin: string;
}

const SidebarLayoutContext = createContext<SidebarLayoutContextType | undefined>(undefined);

interface SidebarLayoutProviderProps {
  children: ReactNode;
}

export function SidebarLayoutProvider({ children }: SidebarLayoutProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Calculate sidebar width based on state
  const sidebarWidth = isMobile ? 0 : (isCollapsed ? 64 : 288); // 16 * 4 = 64px, 72 * 4 = 288px

  // Calculate content margin
  const contentMargin = isMobile ? 'ml-0' : (isCollapsed ? 'ml-16' : 'ml-72');

  // Reset collapse state on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const value = {
    isCollapsed,
    setIsCollapsed,
    isMobile,
    sidebarWidth,
    contentMargin
  };

  return (
    <SidebarLayoutContext.Provider value={value}>
      {children}
    </SidebarLayoutContext.Provider>
  );
}

export function useSidebarLayout() {
  const context = useContext(SidebarLayoutContext);
  if (context === undefined) {
    throw new Error('useSidebarLayout must be used within a SidebarLayoutProvider');
  }
  return context;
}

export default useSidebarLayout;