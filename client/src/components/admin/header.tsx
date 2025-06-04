import { useState, useEffect, useRef } from "react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Bell, 
  Search,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

export default function AdminHeader({ title, subtitle, onMobileMenuToggle }: AdminHeaderProps) {
  const { user } = useAuth();
  const logout = useLogout();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleProfileAccess = () => {
    window.location.href = "/admin/profile";
  };

  const handleSettingsAccess = () => {
    window.location.href = "/admin/settings";
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side: Mobile menu button + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title and subtitle */}
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side: Search + Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  onBlur={() => {
                    if (!searchQuery) {
                      setIsSearchOpen(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Bell className="h-4 w-4" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.fullName || "Admin"} />
                  <AvatarFallback className="bg-slate-600 text-white text-sm">
                    {user?.fullName ? getUserInitials(user.fullName) : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.fullName || "Administrador"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {user?.role === "admin" ? "Admin" : "Usuário"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-slate-800 border-slate-700 text-white"
            >
              <DropdownMenuLabel className="text-slate-300">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              
              <DropdownMenuItem 
                onClick={handleProfileAccess}
                className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleSettingsAccess}
                className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-700" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-600 hover:text-white cursor-pointer"
                disabled={logout.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logout.isPending ? "Saindo..." : "Sair"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}