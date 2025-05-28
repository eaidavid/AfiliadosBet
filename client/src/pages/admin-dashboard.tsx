import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AffiliatesManagement from "@/components/admin/affiliates-management";
import AdminProfile from "@/components/admin/admin-profile";
import { Users, Settings } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("overview");

  if (!user || user.role !== "admin") {
    return <div>Access denied</div>;
  }

  const renderContent = () => {
    switch (currentPage) {
      case "affiliates":
        return <AffiliatesManagement onPageChange={setCurrentPage} />;
      case "profile":
        return <AdminProfile onPageChange={setCurrentPage} />;
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back, {user.fullName}! Manage your system here.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Clean system status</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage system users and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setCurrentPage("affiliates")}
                    className="w-full"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>
                    Configure your admin profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setCurrentPage("profile")}
                    variant="outline"
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {currentPage !== "overview" && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage("overview")}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}