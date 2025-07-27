// Central registry for all routes in the system
// This eliminates duplications and provides a single source of truth

export interface RouteConfig {
  path: string;
  component: string;
  title: string;
  description?: string;
  requiresAuth: boolean;
  requiresAdmin?: boolean;
  icon?: string;
  category?: 'public' | 'user' | 'admin';
}

export const ROUTES: Record<string, RouteConfig> = {
  // Public Routes
  home: {
    path: "/",
    component: "SimpleLanding",
    title: "AfiliadosBet - Home",
    requiresAuth: false,
    category: 'public'
  },
  
  register: {
    path: "/register",
    component: "Register", 
    title: "Cadastro - AfiliadosBet",
    requiresAuth: false,
    category: 'public'
  },
  
  auth: {
    path: "/auth",
    component: "Auth",
    title: "Login - AfiliadosBet", 
    requiresAuth: false,
    category: 'public'
  },

  // User Routes
  userHome: {
    path: "/home",
    component: "AffiliateHome",
    title: "Dashboard - Afiliado",
    requiresAuth: true,
    category: 'user',
    icon: "Home"
  },
  
  dashboard: {
    path: "/dashboard",
    component: "UserDashboardComplete",
    title: "Dashboard Completo",
    requiresAuth: true,
    category: 'user',
    icon: "BarChart3"
  },
  
  bettingHouses: {
    path: "/betting-houses",
    component: "BettingHouses",
    title: "Casas de Apostas",
    requiresAuth: true,
    category: 'user',
    icon: "Building"
  },
  
  myLinks: {
    path: "/my-links",
    component: "MyLinks",
    title: "Meus Links",
    requiresAuth: true,
    category: 'user',
    icon: "Link"
  },
  
  analytics: {
    path: "/analytics",
    component: "ClickAnalytics",
    title: "Analytics",
    requiresAuth: true,
    category: 'user',
    icon: "TrendingUp"
  },
  
  statistics: {
    path: "/stats",
    component: "Statistics",
    title: "Estatísticas",
    requiresAuth: true,
    category: 'user',
    icon: "PieChart"
  },
  
  reports: {
    path: "/reports",
    component: "AffiliateReports",
    title: "Relatórios",
    requiresAuth: true,
    category: 'user',
    icon: "FileText"
  },
  
  profile: {
    path: "/profile",
    component: "UserProfile",
    title: "Perfil",
    requiresAuth: true,
    category: 'user',
    icon: "User"
  },
  
  payments: {
    path: "/payments",
    component: "AffiliatePayments",
    title: "Pagamentos",
    requiresAuth: true,
    category: 'user',
    icon: "CreditCard"
  },
  
  settings: {
    path: "/settings",
    component: "AppSettings",
    title: "Configurações",
    requiresAuth: true,
    category: 'user',
    icon: "Settings"
  },

  // Admin Routes
  admin: {
    path: "/admin",
    component: "AdminDashboard",
    title: "Admin - Dashboard",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "Shield"
  },
  
  adminCasas: {
    path: "/admin/casas",
    component: "AdminCasas",
    title: "Admin - Casas",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "Building"
  },
  
  adminHouses: {
    path: "/admin/houses",
    component: "AdminHouses",
    title: "Admin - Houses",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "Building2"
  },
  
  adminManage: {
    path: "/admin/manage",
    component: "AdminManage",
    title: "Admin - Gerenciar",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "Users"
  },
  
  adminEditAffiliate: {
    path: "/admin/manage/:id/edit",
    component: "AdminEditAffiliate",
    title: "Admin - Editar Afiliado",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "UserCog"
  },
  
  adminPostbackGenerator: {
    path: "/admin/postback-generator",
    component: "PostbackGeneratorProfessional",
    title: "Admin - Gerador Postback",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "Webhook"
  },
  
  adminPostbackLogs: {
    path: "/admin/postback-logs",
    component: "PostbackLogs",
    title: "Admin - Logs Postback",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "ScrollText"
  },
  
  adminApiManagement: {
    path: "/admin/api-management",
    component: "AdminApiManagement",
    title: "Admin - API Management",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "Code"
  },
  
  adminPayments: {
    path: "/admin/payments",
    component: "AdminPayments",
    title: "Admin - Pagamentos",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "DollarSign"
  },
  
  adminSettings: {
    path: "/admin/settings",
    component: "AdminSettingsEnhanced",
    title: "Admin - Configurações",
    requiresAuth: true,
    requiresAdmin: true,
    category: 'admin',
    icon: "Cog"
  }
};

// Helper functions
export const getRoutesByCategory = (category: 'public' | 'user' | 'admin') => {
  return Object.values(ROUTES).filter(route => route.category === category);
};

export const getUserRoutes = () => getRoutesByCategory('user');
export const getAdminRoutes = () => getRoutesByCategory('admin');
export const getPublicRoutes = () => getRoutesByCategory('public');

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return Object.values(ROUTES).find(route => route.path === path);
};

export const isAdminRoute = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.requiresAdmin === true;
};

export const requiresAuth = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.requiresAuth === true;
};