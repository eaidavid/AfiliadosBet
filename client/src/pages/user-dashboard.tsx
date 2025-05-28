import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access your dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.fullName}!</h2>
          <p className="text-muted-foreground">
            Your clean dashboard is ready for future features.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                {user.isActive ? "Your account is active" : "Account inactive"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Complete</div>
              <p className="text-xs text-muted-foreground">
                Profile information up to date
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              The affiliate and betting house modules have been completely removed as requested.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">✅ Database cleaned</p>
              <p className="text-sm">✅ All affiliate functionality removed</p>
              <p className="text-sm">✅ No betting house references</p>
              <p className="text-sm">✅ System ready for new features</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}