import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHousesManagement from "@/components/admin/houses-management";
import LinksManagement from "@/components/admin/links-management";
import PostbackLogs from "@/components/admin/postback-logs";
import SimplePostbackForm from "@/components/admin/simple-postback-form";
import PostbackGenerator from "@/components/admin/postback-generator";
import SettingsManagement from "@/components/admin/settings-management";
import AdminProfile from "@/components/admin/admin-profile";
import AdminRouteGuard from "@/components/auth/admin-route-guard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, TrendingUp, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const isMobile = useIsMobile();
  
  // Atualização em tempo real temporariamente desabilitada para estabilidade
  // useRealtime();

  const { data: adminStats = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const renderContent = () => {
    switch (currentPage) {
      case "houses":
        return <AdminHousesManagement onPageChange={setCurrentPage} />;
      case "links":
        return <LinksManagement onPageChange={setCurrentPage} />;
      case "postback-generator":
        return <PostbackGenerator onPageChange={setCurrentPage} />;
      case "postbacks":
        return <PostbackLogs onPageChange={setCurrentPage} />;
      case "registered-postbacks":
        return <SimplePostbackForm />;
      case "settings":
        return <SettingsManagement onPageChange={setCurrentPage} />;
      case "profile":
        return <AdminProfile onPageChange={setCurrentPage} />;
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
                <p className="text-slate-400">
                  Visão geral da plataforma e estatísticas principais.
                </p>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs md:text-sm font-medium truncate">Casas Ativas</p>
                      <p className="text-xl md:text-2xl font-bold text-white mt-1">
                        {adminStats?.activeHouses || "0"}
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center ml-3">
                      <Building className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 md:mt-4">
                    <span className="text-emerald-500 text-xs md:text-sm font-medium">Sistema</span>
                    <span className="text-slate-400 text-xs md:text-sm ml-2">operacional</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs md:text-sm font-medium truncate">Links Ativos</p>
                      <p className="text-xl md:text-2xl font-bold text-white mt-1">
                        {adminStats?.totalLinks || "0"}
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center ml-3">
                      <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 md:mt-4">
                    <span className="text-emerald-500 text-xs md:text-sm font-medium">Funcionando</span>
                    <span className="text-slate-400 text-xs md:text-sm ml-2">corretamente</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Mobile sidebar */}
        {isMobile && (
          <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        )}
        
        {/* Desktop sidebar */}
        {!isMobile && (
          <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        )}
        
        <div className={`${!isMobile ? "ml-72" : ""}`}>
          <header className={`bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 ${isMobile ? "px-4 py-3" : "px-6 py-4"}`}>
            <div className="flex items-center justify-between">
              <h1 className={`font-bold text-white ${isMobile ? "text-xl ml-16" : "text-2xl"}`}>Painel Administrativo</h1>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">A</span>
                </div>
                <span className={`text-white ${isMobile ? "hidden" : "block"}`}>Admin</span>
              </div>
            </div>
          </header>
          
          <main className={isMobile ? "p-4" : "p-6"}>
            {renderContent()}
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
