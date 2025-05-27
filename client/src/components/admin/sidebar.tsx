import { useLogout } from "@/hooks/use-auth";
import { Crown, BarChart3, Users, Building, PieChart, Settings, LogOut, Webhook, DollarSign, Link2 } from "lucide-react";

interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function AdminSidebar({ currentPage, onPageChange }: AdminSidebarProps) {
  const logout = useLogout();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "affiliates", label: "Afiliados", icon: Users },
    { id: "houses", label: "Casas de Apostas", icon: Building },
    { id: "links", label: "Links", icon: Link2 },
    { id: "postbacks", label: "Postbacks", icon: Webhook },
    { id: "commissions", label: "Comissões", icon: DollarSign },
    { id: "reports", label: "Relatórios", icon: PieChart },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-700 z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-red-400 bg-red-500/10 border border-red-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-700">
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
