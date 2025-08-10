import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Shield, User, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ViewSwitcherProps {
  className?: string;
}

export function ViewSwitcher({ className }: ViewSwitcherProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Determinar se estamos na área admin ou user
  const isAdminView = location.startsWith('/admin');
  const isUserView = !location.startsWith('/admin') && !location.startsWith('/auth');
  
  // Só mostrar para admins
  if (!user || user.role !== 'admin') {
    return null;
  }

  const switchToUserView = () => {
    // Redirecionar para a página inicial do usuário
    setLocation('/');
  };

  const switchToAdminView = () => {
    // Redirecionar para o painel admin
    setLocation('/admin');
  };

  if (isAdminView) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
          <Shield className="h-3 w-3 mr-1" />
          Visão Admin
        </Badge>
        
        <Button
          onClick={switchToUserView}
          variant="outline"
          size="sm"
          className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver como Usuário
        </Button>
      </div>
    );
  }

  if (isUserView) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
          <User className="h-3 w-3 mr-1" />
          Visão Usuário
        </Badge>
        
        <Button
          onClick={switchToAdminView}
          variant="outline"
          size="sm"
          className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Admin
        </Button>
      </div>
    );
  }

  return null;
}