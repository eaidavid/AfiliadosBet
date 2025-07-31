// Central configuration for all routes with navigation metadata
// Single source of truth for the entire navigation system

import { 
  Home, BarChart3, Building, Link, TrendingUp, PieChart, 
  FileText, User, CreditCard, Settings, Shield, Building2, 
  Users, UserCog, Webhook, ScrollText, Code, DollarSign, Cog 
} from "lucide-react";

export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  icon: any;
  label: string;
  category: 'public' | 'user' | 'admin';
  requiresAuth: boolean;
  requiresAdmin?: boolean;
  showInNavigation: boolean;
  gradient?: string;
  premium?: boolean;
  order: number;
}

export const ROUTES_CONFIG: Record<string, RouteConfig> = {
  // Public Routes
  home: {
    path: "/",
    title: "AfiliadosBet - Home",
    icon: Home,
    label: "Home",
    category: 'public',
    requiresAuth: false,
    showInNavigation: false,
    order: 0
  },
  
  register: {
    path: "/register",
    title: "Cadastro",
    icon: User,
    label: "Cadastro",
    category: 'public',
    requiresAuth: false,
    showInNavigation: false,
    order: 1
  },
  
  auth: {
    path: "/auth",
    title: "Login",
    icon: User,
    label: "Login",
    category: 'public',
    requiresAuth: false,
    showInNavigation: false,
    order: 2
  },

  // User Routes
  userHome: {
    path: "/home",
    title: "Dashboard",
    description: "Visão geral das suas métricas",
    icon: Home,
    label: "Dashboard",
    category: 'user',
    requiresAuth: true,
    showInNavigation: true,
    gradient: 'from-emerald-500 to-teal-600',
    premium: true,
    order: 10
  },
  
  dashboard: {
    path: "/dashboard",
    title: "Dashboard Completo",
    description: "Análise detalhada de performance",
    icon: BarChart3,
    label: "Analytics",
    category: 'user',
    requiresAuth: true,
    showInNavigation: true,
    gradient: 'from-blue-500 to-cyan-600',
    order: 11
  },
  
  bettingHouses: {
    path: "/betting-houses",
    title: "Casas de Apostas",
    description: "Explore casas disponíveis",
    icon: Building,
    label: "Casas",
    category: 'user',
    requiresAuth: true,
    showInNavigation: true,
    gradient: 'from-purple-500 to-violet-600',
    order: 12
  },
  
  myLinks: {
    path: "/my-links",
    title: "Meus Links",
    description: "Gerencie seus links de afiliado",
    icon: Link,
    label: "Links",
    category: 'user',
    requiresAuth: true,
    showInNavigation: true,
    gradient: 'from-orange-500 to-amber-600',
    order: 13
  },
  
  payments: {
    path: "/payments",
    title: "Pagamentos",
    description: "Histórico e solicitações",
    icon: CreditCard,
    label: "Pagamentos",
    category: 'user',
    requiresAuth: true,
    showInNavigation: true,
    gradient: 'from-green-500 to-emerald-600',
    order: 14
  },

  // Admin Routes
  admin: {
    path: "/admin",
    title: "Admin Central",
    description: "Painel administrativo",
    icon: Shield,
    label: "Admin",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: true,
    gradient: 'from-red-500 to-rose-600',
    premium: true,
    order: 20
  },
  
  adminHouses: {
    path: "/admin/houses",
    title: "Casas de Apostas",
    description: "Gerenciar casas disponíveis",
    icon: Building2,
    label: "Casas",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: true,
    gradient: 'from-blue-500 to-cyan-600',
    order: 21
  },
  
  adminManage: {
    path: "/admin/manage",
    title: "Afiliados",
    description: "Gerenciar afiliados",
    icon: Users,
    label: "Afiliados",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: true,
    gradient: 'from-purple-500 to-violet-600',
    order: 22
  },
  
  adminPayments: {
    path: "/admin/payments",
    title: "Pagamentos",
    description: "Gerenciar pagamentos",
    icon: DollarSign,
    label: "Pagamentos",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: true,
    gradient: 'from-green-500 to-emerald-600',
    order: 23
  },
  
  adminPostback: {
    path: "/admin/postback",
    title: "Gerador de Postbacks",
    description: "Gerar e configurar postbacks",
    icon: Webhook,
    label: "Postbacks",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: true,
    gradient: 'from-cyan-500 to-blue-600',
    premium: true,
    order: 25
  },
  
  adminPostbackGenerator: {
    path: "/admin/postback-generator",
    title: "Gerador de Postbacks",
    description: "Gerar e configurar postbacks",
    icon: Webhook,
    label: "Postbacks",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: false, // Redirect route
    gradient: 'from-cyan-500 to-blue-600',
    premium: true,
    order: 25
  },

  adminLogs: {
    path: "/admin/logs",
    title: "Logs de Postbacks",
    description: "Monitorar logs do sistema",
    icon: ScrollText,
    label: "Logs",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: true,
    gradient: 'from-orange-500 to-red-600',
    order: 26
  },
  
  adminPostbackLogs: {
    path: "/admin/postback-logs",
    title: "Logs de Postbacks",
    description: "Monitorar logs do sistema",
    icon: ScrollText,
    label: "Logs",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: false, // Redirect route
    gradient: 'from-orange-500 to-red-600',
    order: 26
  },

  adminSettings: {
    path: "/admin/settings",
    title: "Configurações",
    description: "Configurações do sistema",
    icon: Cog,
    label: "Config",
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInNavigation: true,
    gradient: 'from-slate-500 to-gray-600',
    order: 27
  },

  // Secondary routes (not shown in main navigation)
  analytics: {
    path: "/analytics",
    title: "Analytics",
    icon: TrendingUp,
    label: "Analytics",
    category: 'user',
    requiresAuth: true,
    showInNavigation: false,
    order: 50
  },
  
  statistics: {
    path: "/stats",
    title: "Estatísticas",
    icon: PieChart,
    label: "Stats",
    category: 'user',
    requiresAuth: true,
    showInNavigation: false,
    order: 51
  },
  
  reports: {
    path: "/reports",
    title: "Relatórios",
    icon: FileText,
    label: "Relatórios",
    category: 'user',
    requiresAuth: true,
    showInNavigation: false,
    order: 52
  },
  
  profile: {
    path: "/profile",
    title: "Perfil",
    icon: User,
    label: "Perfil",
    category: 'user',
    requiresAuth: true,
    showInNavigation: false,
    order: 53
  },
  
  settings: {
    path: "/settings",
    title: "Configurações",
    icon: Settings,
    label: "Config",
    category: 'user',
    requiresAuth: true,
    showInNavigation: false,
    order: 54
  }
};

// Helper functions
export const getNavigationRoutes = (userType: 'user' | 'admin'): RouteConfig[] => {
  return Object.values(ROUTES_CONFIG)
    .filter(route => 
      route.showInNavigation && 
      route.category === userType
    )
    .sort((a, b) => a.order - b.order);
};

export const getUserNavigationRoutes = () => getNavigationRoutes('user');
export const getAdminNavigationRoutes = () => getNavigationRoutes('admin');

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return Object.values(ROUTES_CONFIG).find(route => route.path === path);
};

export const isAdminRoute = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.requiresAdmin === true;
};

export const requiresAuth = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.requiresAuth === true;
};

export const getBreadcrumbs = (path: string): Array<{label: string, path: string}> => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: Array<{label: string, path: string}> = [];
  
  // Home breadcrumb
  if (path !== '/') {
    breadcrumbs.push({ label: 'Home', path: '/' });
  }
  
  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach(segment => {
    currentPath += `/${segment}`;
    const route = getRouteConfig(currentPath);
    
    if (route) {
      breadcrumbs.push({
        label: route.title,
        path: currentPath
      });
    } else {
      // Fallback for dynamic routes
      const formattedLabel = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({
        label: formattedLabel,
        path: currentPath
      });
    }
  });
  
  return breadcrumbs;
};