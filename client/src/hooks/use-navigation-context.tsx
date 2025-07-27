import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getRouteConfig, getBreadcrumbs, getUserNavigationRoutes, getAdminNavigationRoutes } from "@/config/routes.config";

export function useNavigationContext() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  
  const currentRoute = getRouteConfig(location);
  const breadcrumbs = getBreadcrumbs(location);
  
  const navigationRoutes = isAdmin ? getAdminNavigationRoutes() : getUserNavigationRoutes();
  
  const isActiveRoute = (path: string): boolean => {
    if (path === location) return true;
    
    // Handle dynamic routes and sub-routes
    if (location.startsWith(path) && path !== '/') {
      return true;
    }
    
    return false;
  };
  
  const getPageTitle = (): string => {
    return currentRoute?.title || 'AfiliadosBet';
  };
  
  const getUserType = (): 'user' | 'admin' | 'guest' => {
    if (!user) return 'guest';
    return isAdmin ? 'admin' : 'user';
  };
  
  const canAccessRoute = (routePath: string): boolean => {
    const route = getRouteConfig(routePath);
    if (!route) return false;
    
    if (!route.requiresAuth) return true;
    if (!user) return false;
    if (route.requiresAdmin && !isAdmin) return false;
    
    return true;
  };
  
  return {
    location,
    currentRoute,
    breadcrumbs,
    navigationRoutes,
    isActiveRoute,
    getPageTitle,
    getUserType,
    canAccessRoute,
    isAdmin,
    user
  };
}