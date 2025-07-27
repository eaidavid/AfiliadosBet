import { createContext, useContext, useEffect, useState } from "react";

// Premium Theme Types
export type PremiumTheme = 'dark' | 'light';

interface PremiumThemeContextType {
  theme: PremiumTheme;
  setTheme: (theme: PremiumTheme) => void;
  toggleTheme: () => void;
}

const PremiumThemeContext = createContext<PremiumThemeContextType | undefined>(undefined);

// Premium Theme Provider
interface PremiumThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: PremiumTheme;
  storageKey?: string;
}

export const PremiumThemeProvider = ({
  children,
  defaultTheme = 'dark',
  storageKey = 'premium-theme'
}: PremiumThemeProviderProps) => {
  const [theme, setThemeState] = useState<PremiumTheme>(defaultTheme);

  useEffect(() => {
    // Carregar tema do localStorage na inicialização
    const savedTheme = localStorage.getItem(storageKey) as PremiumTheme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    // Aplicar tema no DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Salvar no localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = (newTheme: PremiumTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <PremiumThemeContext.Provider value={value}>
      {children}
    </PremiumThemeContext.Provider>
  );
};

// Premium Theme Hook
export const usePremiumTheme = () => {
  const context = useContext(PremiumThemeContext);
  
  if (!context) {
    throw new Error('usePremiumTheme must be used within a PremiumThemeProvider');
  }
  
  return context;
};

// Premium Theme Toggle Component
interface PremiumThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumThemeToggle = ({ 
  className,
  size = 'md' 
}: PremiumThemeToggleProps) => {
  const { theme, toggleTheme } = usePremiumTheme();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        glass-premium rounded-xl border border-white/10
        flex items-center justify-center
        text-slate-300 hover:text-white
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${className || ''}
      `}
      title={`Alterar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};