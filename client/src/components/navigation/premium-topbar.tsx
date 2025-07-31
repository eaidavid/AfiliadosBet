import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User, 
  Crown,
  Zap,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export function PremiumTopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();
  
  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_timestamp');
    localStorage.setItem('is_logged_out', 'true');
    window.location.href = '/auth';
  };

  const notifications = [
    {
      id: 1,
      title: 'Nova conversão registrada',
      description: 'Bet365 - R$ 125,00 em comissão',
      time: '2 min',
      type: 'success'
    },
    {
      id: 2,
      title: 'Meta mensal atingida',
      description: 'Parabéns! Você bateu sua meta',
      time: '1h',
      type: 'achievement'
    },
    {
      id: 3,
      title: 'Pagamento processado',
      description: 'PIX de R$ 2.450,00 enviado',
      time: '3h',
      type: 'payment'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'achievement':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className={cn(
      "h-16 border-b border-emerald-500/20 px-6",
      "bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80",
      "backdrop-blur-xl shadow-lg shadow-black/20"
    )}>
      <div className="flex items-center justify-between h-full">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar casas, relatórios, afiliados..."
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-xl",
                "bg-slate-800/50 border border-slate-700/50",
                "text-white placeholder-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50",
                "transition-all duration-200"
              )}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Stats Quick View */}
          {user?.role === 'affiliate' && (
            <div className="hidden lg:flex items-center space-x-6 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <div className="text-center">
                <p className="text-xs text-slate-400">Hoje</p>
                <p className="text-sm font-bold text-emerald-400">R$ 245</p>
              </div>
              <div className="w-px h-8 bg-slate-600" />
              <div className="text-center">
                <p className="text-xs text-slate-400">Mês</p>
                <p className="text-sm font-bold text-blue-400">R$ 3.2k</p>
              </div>
              <div className="w-px h-8 bg-slate-600" />
              <div className="text-center">
                <p className="text-xs text-slate-400">Cliques</p>
                <p className="text-sm font-bold text-yellow-400">1.2k</p>
              </div>
            </div>
          )}

          {/* Performance Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Online</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative p-2 rounded-xl transition-all duration-200",
                "hover:bg-slate-700/50 hover:shadow-lg hover:shadow-emerald-500/10",
                "text-slate-400 hover:text-emerald-400"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full animate-pulse" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={cn(
                    "absolute right-0 top-full mt-2 w-80 z-50",
                    "bg-gradient-to-br from-slate-900/95 to-slate-800/95",
                    "backdrop-blur-xl border border-emerald-500/20",
                    "rounded-xl shadow-2xl shadow-black/50"
                  )}
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Notificações
                    </h3>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {notification.description}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {notification.time}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <button className="w-full mt-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
                      Ver todas as notificações
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={cn(
                "flex items-center space-x-3 p-2 rounded-xl transition-all duration-200",
                "hover:bg-slate-700/50 hover:shadow-lg hover:shadow-emerald-500/10"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.role === 'admin' ? 'Administrador' : 'Afiliado'}
                </p>
              </div>
              {user?.role === 'admin' && (
                <Crown className="w-4 h-4 text-yellow-400" />
              )}
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={cn(
                    "absolute right-0 top-full mt-2 w-64 z-50",
                    "bg-gradient-to-br from-slate-900/95 to-slate-800/95",
                    "backdrop-blur-xl border border-emerald-500/20",
                    "rounded-xl shadow-2xl shadow-black/50"
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 text-left">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">Meu Perfil</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 text-left">
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">Configurações</span>
                      </button>
                      <hr className="border-emerald-500/20 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 text-left text-slate-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sair</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}