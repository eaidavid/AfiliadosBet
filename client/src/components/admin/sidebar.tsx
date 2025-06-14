import { useState } from "react";
import { useLogout } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3, Building2, Users, CreditCard, Activity, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import logoPath from "@assets/Afiliados Bet positivo.png";

interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function AdminSidebar({ currentPage, onPageChange }: AdminSidebarProps) {
  const logout = useLogout();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "houses", label: "Casas de Apostas", icon: Building2 },
    { id: "manage", label: "Gerenciar Afiliados", icon: Users },
    { id: "payments", label: "Pagamentos", icon: CreditCard },
    { id: "logs-postbacks", label: "Logs de Postbacks", icon: Activity },
    { id: "admin-settings", label: "Configurações", icon: Settings },
  ];

  const handlePageChange = (page: string) => {
    onPageChange(page);
    
    // Navigate to the correct routes
    if (page === "dashboard") {
      window.location.href = "/admin";
    } else if (page === "houses") {
      window.location.href = "/admin/houses";
    } else if (page === "manage") {
      window.location.href = "/admin/manage";
    } else if (page === "payments") {
      window.location.href = "/admin/payments";
    } else if (page === "gerador-de-postbacks") {
      window.location.href = "/admin/postback-generator";
    } else if (page === "logs-postbacks") {
      window.location.href = "/admin/postback-logs";
    } else if (page === "admin-settings") {
      window.location.href = "/admin/settings";
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Mobile: não renderizar nada (usamos navegação inferior)
  if (isMobile) {
    return null;
  }

  // Desktop Sidebar
  return (
    <>
      {/* Blur Overlay when expanded */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={toggleCollapse}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-40 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-80"
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <img src={logoPath} alt="AfiliadosBet" className="h-8 w-auto" />
                <span className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </div>
            )}
            <button
              onClick={toggleCollapse}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
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
                        ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-red-400" : ""}`} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-l-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => logout.mutate()}
              className="w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">Sair</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Spacer */}
      <div className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-80"}`} />
    </>
  );
}

export { AdminSidebar };