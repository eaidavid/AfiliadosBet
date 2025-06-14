import { ReactNode } from 'react';

interface CenteredLayoutProps {
  children: ReactNode;
  className?: string;
}

export function CenteredLayout({ children, className = '' }: CenteredLayoutProps) {
  return (
    <div className={`min-h-screen bg-slate-950 pb-40 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pl-[57px] pr-[57px] pt-[32px] pb-[60px]">
        {children}
      </div>
    </div>
  );
}

export default CenteredLayout;