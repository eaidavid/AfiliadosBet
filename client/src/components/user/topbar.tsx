import { useAuth, useLogout } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, Moon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserTopBarProps {
  onPageChange?: (page: string) => void;
}

export default function UserTopBar({ onPageChange }: UserTopBarProps) {
  const { user } = useAuth();
  const logout = useLogout();
  const isMobile = useIsMobile();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n.charAt(0)).join("").substring(0, 2).toUpperCase();
  };

  return (
    <header className={`bg-slate-900 border-b border-slate-700 safe-area ${isMobile ? "px-4 py-3" : "px-6 py-4"}`}>
      <div className={`flex items-center ${isMobile ? "justify-end" : "justify-between"}`}>
        {/* Barra de busca - apenas no desktop */}
        {!isMobile && (
          <div className="flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar..."
                className="w-80 pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 mobile-input"
              />
            </div>
          </div>
        )}

        <div className={`flex items-center ${isMobile ? "space-x-2" : "space-x-4"}`}>
          {/* Notifications */}
          <Button variant="ghost" size="icon" className={`text-slate-400 hover:text-white touch-target ${isMobile ? "h-10 w-10" : ""}`}>
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></span>
          </Button>

          {/* Theme Toggle - apenas no desktop */}
          {!isMobile && (
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white touch-target">
              <Moon className="h-5 w-5" />
            </Button>
          )}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`flex items-center p-2 hover:bg-slate-800 rounded-lg transition-colors touch-target ${isMobile ? "space-x-2" : "space-x-3"}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.fullName ? getInitials(user.fullName) : "U"}
                </span>
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{user?.fullName}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-10">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      onPageChange?.('profile');
                      setShowProfileDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Ver Perfil
                  </button>
                  <button 
                    onClick={() => {
                      onPageChange?.('profile');
                      setShowProfileDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Configurações
                  </button>
                  <hr className="border-slate-700 my-1" />
                  <button
                    onClick={() => {
                      logout.mutate();
                      setShowProfileDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
