import { useState } from "react";
import { useLogout } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChartLine, Home, BarChart3, Building, Link, Wallet, PieChart, Headphones, User, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import logoPath from "@assets/Afiliados Bet positivo.png";

interface UserSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function UserSidebar({ currentPage, onPageChange }: UserSidebarProps) {
  const logout = useLogout();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "home", label: "Início", icon: Home },
    { id: "houses", label: "Casas de Apostas", icon: Building },
    { id: "links", label: "Meus Links", icon: Link },
    { id: "payments", label: "Pagamentos", icon: Wallet },
    { id: "support", label: "Suporte", icon: Headphones },
    { id: "profile", label: "Meu Perfil", icon: User },
  ];

  const handlePageChange = (page: string) => {
    onPageChange(page);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Mobile: não mostrar botão de menu (usamos navegação inferior)
  if (isMobile) {
    return (
      <>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 z-50 lg:hidden transform transition-transform duration-300 ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <img src={logoPath} alt="AfiliadosBet" className="h-8 w-auto" />
                <span className="text-lg font-bold text-white">AfiliadosBet</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex-1 py-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-500"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Logout */}
            <div className="p-6 border-t border-slate-700/50">
              <button
                onClick={() => logout.mutate()}
                className="w-full flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-8 z-10 bg-slate-800 border border-slate-700/50 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <img src={logoPath} alt="AB" className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">AfiliadosBet</h1>
                <p className="text-xs text-slate-400 truncate">Sistema de Afiliados</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-6 overflow-y-auto">
          <div className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group relative ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`} />
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-slate-700/50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700/50" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={() => logout.mutate()}
            className={`w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Sair</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-slate-700/50">
                Sair
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700/50" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}