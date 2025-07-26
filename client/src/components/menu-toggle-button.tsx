import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useAppSettings } from '@/contexts/app-settings-context';
import { cn } from '@/lib/utils';

export function MenuToggleButton() {
  const { settings, updateSetting } = useAppSettings();
  const [isHovered, setIsHovered] = useState(false);
  const [showButton, setShowButton] = useState(true);

  // Auto-hide the button after a few seconds of no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isHovered) {
        setShowButton(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isHovered, settings.hideBottomMenu]);

  // Show button when user moves mouse near bottom of screen
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const bottomThreshold = windowHeight - 100; // 100px from bottom
      
      if (e.clientY > bottomThreshold) {
        setShowButton(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleMenu = () => {
    updateSetting('hideBottomMenu', !settings.hideBottomMenu);
  };

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 z-[10000] transition-all duration-300",
        showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        onClick={toggleMenu}
        size="sm"
        className={cn(
          "rounded-full w-10 h-10 p-0 shadow-lg border-2 transition-all duration-200",
          settings.hideBottomMenu
            ? "bg-slate-800 border-slate-600 hover:bg-slate-700"
            : "bg-emerald-600 border-emerald-500 hover:bg-emerald-700"
        )}
        title={settings.hideBottomMenu ? "Mostrar menu" : "Esconder menu"}
      >
        {settings.hideBottomMenu ? (
          <ChevronUp className="h-4 w-4 text-white" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white" />
        )}
      </Button>
      
      {/* Tooltip */}
      <div
        className={cn(
          "absolute bottom-12 right-0 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {settings.hideBottomMenu ? "Mostrar menu" : "Esconder menu"}
      </div>
    </div>
  );
}