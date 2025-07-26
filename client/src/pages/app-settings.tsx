import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Palette,
  Monitor,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Smartphone
} from 'lucide-react';

export default function AppSettings() {
  const { settings, updateSetting, resetSettings } = useAppSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/logout", {
        method: "POST"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      // Força o recarregamento completo da página
      window.location.reload();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsLogoutDialogOpen(false);
  };

  const handleResetSettings = () => {
    resetSettings();
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram restauradas aos valores padrão.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Usuário não autenticado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Settings className="h-8 w-8 text-emerald-500" />
            Configurações da Aplicação
          </h1>
          <p className="text-slate-400">
            Personalize sua experiência no AfiliadosBet
          </p>
        </div>

        {/* User Info */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{user.fullName || 'Nome não informado'}</p>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
              <Badge 
                variant={user.role === 'admin' ? 'default' : 'secondary'}
                className={user.role === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}
              >
                {user.role === 'admin' ? 'Administrador' : 'Afiliado'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Interface Settings */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-emerald-500" />
              Configurações de Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hide Bottom Menu */}
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="space-y-1">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Menu de Navegação Inferior
                </Label>
                <p className="text-slate-400 text-sm">
                  {settings.hideBottomMenu ? 'Menu está oculto' : 'Menu está visível'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {settings.hideBottomMenu ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-emerald-500" />
                )}
                <Switch
                  checked={!settings.hideBottomMenu}
                  onCheckedChange={(checked) => updateSetting('hideBottomMenu', !checked)}
                />
              </div>
            </div>

            {/* Theme Setting */}
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="space-y-1">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Tema da Aplicação
                </Label>
                <p className="text-slate-400 text-sm">
                  Tema atual: {settings.theme === 'dark' ? 'Escuro' : 'Claro'}
                </p>
              </div>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {settings.theme === 'dark' ? 'Escuro' : 'Claro'}
              </Badge>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="space-y-1">
                <Label className="text-white font-medium">
                  Modo Compacto
                </Label>
                <p className="text-slate-400 text-sm">
                  Reduz o espaçamento entre elementos da interface
                </p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.hideBottomMenu && (
            <Alert className="bg-amber-950 border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200">
                <strong>Menu oculto:</strong> Use o menu lateral ou navegação por URL para acessar outras páginas.
              </AlertDescription>
            </Alert>
          )}

          {!settings.hideBottomMenu && (
            <Alert className="bg-emerald-950 border-emerald-800">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <AlertDescription className="text-emerald-200">
                <strong>Menu visível:</strong> O menu de navegação inferior está ativo.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Ações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator className="bg-slate-700" />
            
            {/* Reset Settings */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Restaurar Configurações</p>
                <p className="text-slate-400 text-sm">
                  Restaura todas as configurações aos valores padrão
                </p>
              </div>
              <Button
                onClick={handleResetSettings}
                variant="outline"
                className="border-slate-600 hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
            </div>

            <Separator className="bg-slate-700" />

            {/* Logout */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sair da Conta</p>
                <p className="text-slate-400 text-sm">
                  Encerra sua sessão atual no sistema
                </p>
              </div>
              
              <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Confirmar Logout</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsLogoutDialogOpen(false)}
                      className="border-slate-600 hover:bg-slate-800"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saindo...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-2" />
                          Confirmar Logout
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 space-y-4">
          <p className="text-slate-400 italic">
            "Configure a aplicação da forma que mais lhe agrada para uma melhor experiência."
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline" className="border-slate-600 hover:bg-slate-800">
              <a href={user.role === 'admin' ? '/admin' : '/home'}>
                Voltar ao Dashboard
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}