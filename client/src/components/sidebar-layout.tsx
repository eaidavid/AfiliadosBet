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
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}

export default SidebarLayout;