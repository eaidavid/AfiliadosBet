import { ReactNode } from 'react';
import { SmartNavigationSystem } from '@/components/navigation/smart-navigation-system';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <SmartNavigationSystem className={className}>
      {children}
    </SmartNavigationSystem>
  );
}