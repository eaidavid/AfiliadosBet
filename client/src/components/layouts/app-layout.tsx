import { ReactNode } from 'react';
import { SmartNavigationFixed } from '@/components/navigation/smart-navigation-fixed';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <SmartNavigationFixed className={className}>
      {children}
    </SmartNavigationFixed>
  );
}