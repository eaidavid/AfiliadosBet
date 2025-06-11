import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu, X, Home, BarChart3, Link2, CreditCard, User, Building2, Building, Users, Webhook, Activity, Settings } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const logout = useLogout();

  const isAdmin = user?.role === 'admin';
  const isOnAdminRoute = location.startsWith('/admin');

  // Menu items based on current route context (not just user role)
  const menuItems: MenuItem[] = isOnAdminRoute ? [
    { icon: BarChart3, label: "Dashboard", path: "/admin" },
    { icon: Building, label: "Gerenciar Casas", path: "/admin/houses" },
    { icon: Users, label: "Gerenciar Afiliados", path: "/admin/manage" },
    { icon: CreditCard, label: "Gerenciar Pagamentos", path: "/admin/payments" },
    { icon: Webhook, label: "Gerador de Postbacks", path: "/admin/postback-generator" },
    { icon: Activity, label: "Logs de Postbacks", path: "/admin/postback-logs" },
    { icon: Settings, label: "Configurações", path: "/admin/settings" }
  ] : [
    { icon: Home, label: "Dashboard", path: "/home" },
    { icon: Building2, label: "Casas de Apostas", path: "/betting-houses" },
    { icon: Link2, label: "Meus Links", path: "/my-links" },
    { icon: BarChart3, label: "Relatórios", path: "/reports" },
    { icon: CreditCard, label: "Pagamentos", path: "/payments", badge: 2 },
    { icon: User, label: "Perfil", path: "/profile" }
  ];

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="flex h-screen bg-[#101D33] overflow-hidden">
      {/* Mobile Menu Button - Only show when menu is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[60] sm:hidden bg-[#0E1B2B]/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 text-white hover:bg-[#0E1B2B] transition-all duration-200 shadow-lg touch-manipulation min-h-[48px] min-w-[48px]"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed sm:relative z-50 h-full w-64 bg-[#0E1B2B] border-r border-slate-800/50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          sm:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AB</span>
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">AfiliadosBet</h2>
                  <p className="text-slate-400 text-xs">
                    {isOnAdminRoute ? 'Painel Admin' : 'Painel Afiliado'}
                  </p>
                </div>
              </div>
              {/* Close button for mobile - Only show when menu is open */}
              {isOpen && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-2 text-slate-300 hover:text-white transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.fullName || user?.username || 'Usuário'}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {user?.email || 'email@exemplo.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-xl
                      transition-all duration-200 group relative touch-manipulation min-h-[48px]
                      ${isActive
                        ? 'bg-green-500/10 text-green-400 border-l-4 border-green-400'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-green-400' : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="bg-red-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator className="bg-slate-800/50" />

          {/* Quick Actions */}
          {isOnAdminRoute && (
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Ações Rápidas
              </h3>
              <Button
                onClick={() => handleNavigation('/admin/payments')}
                className="w-full justify-start gap-3 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 touch-manipulation min-h-[48px]"
              >
                <CreditCard className="h-5 w-5" />
                Gerenciar Pagamentos
              </Button>
            </div>
          )}

          <Separator className="bg-slate-800/50" />

          {/* Footer with Logout */}
          <div className="p-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 touch-manipulation min-h-[48px] active:bg-red-500/20"
            >
              <X className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-0 w-full min-h-screen overflow-y-auto bg-[#101D33] relative">
        <div className="sm:ml-0 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export default SidebarLayout;