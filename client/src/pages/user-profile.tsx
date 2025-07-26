import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Calendar,
  Shield,
  CreditCard,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  Check,
  Lock,
  Monitor,
  LogOut,
  Camera,
  AlertTriangle
} from 'lucide-react';
import SidebarLayout from '@/components/sidebar-layout';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  cpf: string;
  phone: string | null;
  createdAt: string;
  isActive: boolean;
  lastLoginAt: string | null;
  affiliateCode: string;
  pixKeyType: string | null;
  pixKeyValue: string | null;
  avatarUrl: string | null;
}

interface ActiveSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastAccess: string;
  location: string | null;
  isCurrent: boolean;
}

const PIX_KEY_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' }
];

export default function UserProfile() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user profile data
  const { data: userProfile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile'],
  });

  // Fetch active sessions
  const { data: activeSessions } = useQuery<ActiveSession[]>({
    queryKey: ['/api/user/sessions'],
  });

  // Initialize profile data when user profile is loaded
  useEffect(() => {
    if (userProfile && Object.keys(profileData).length === 0) {
      setProfileData({
        fullName: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.phone,
        cpf: userProfile.cpf,
        pixKeyType: userProfile.pixKeyType,
        pixKeyValue: userProfile.pixKeyValue
      });
    }
  }, [userProfile, profileData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Alterações salvas com sucesso!",
        description: "Suas informações foram atualizadas.",
      });
      setEditingSection(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive"
      });
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update password');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Senha alterada com sucesso!",
        description: "Sua senha foi atualizada com segurança.",
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setEditingSection(null);
    },
    onError: () => {
      toast({
        title: "Erro ao alterar senha",
        description: "Verifique sua senha atual e tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Update PIX data mutation
  const updatePixMutation = useMutation({
    mutationFn: async (data: { pixKeyType: string; pixKeyValue: string }) => {
      const response = await fetch('/api/user/pix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update PIX data');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Dados de pagamento atualizados!",
        description: "Sua chave PIX foi salva com sucesso.",
      });
      setEditingSection(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar PIX",
        description: "Verifique os dados da chave PIX e tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Terminate sessions mutation
  const terminateSessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/sessions/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to terminate sessions');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sessões encerradas",
        description: "Todas as outras sessões foram terminadas.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/sessions'] });
    }
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData(userProfile);
    }
  }, [userProfile]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro de confirmação",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    updatePasswordMutation.mutate(passwordData);
  };

  const handleSavePix = () => {
    if (!profileData.pixKeyType || !profileData.pixKeyValue) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o tipo e valor da chave PIX.",
        variant: "destructive"
      });
      return;
    }
    updatePixMutation.mutate({
      pixKeyType: profileData.pixKeyType,
      pixKeyValue: profileData.pixKeyValue
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const generateInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-800 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 max-w-4xl mx-auto pt-[32px] pb-[32px]">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-blue-400 flex items-center gap-3">
                  <User className="h-10 w-10" />
                  Meu Perfil
                </h1>
                <p className="text-slate-400 mt-2">
                  Gerencie suas informações pessoais e de conta
                </p>
              </div>
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  {userProfile?.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {userProfile?.fullName ? generateInitials(userProfile.fullName) : 'U'}
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400">Alterar Foto</p>
              </div>
            </div>

            {/* Account Status Alert */}
            {!userProfile?.isActive && (
              <Alert className="border-red-600 bg-red-950/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  Sua conta está inativa. Entre em contato com o suporte.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Information */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <User className="h-5 w-5" />
                  Informações da Conta
                </CardTitle>
                {editingSection !== 'profile' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSection('profile')}
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSection(null);
                        setProfileData(userProfile || {});
                      }}
                      className="border-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-slate-300">Nome Completo</Label>
                    {editingSection === 'profile' ? (
                      <Input
                        value={profileData.fullName || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="mt-1 bg-slate-800 border-slate-700"
                      />
                    ) : (
                      <p className="mt-1 text-slate-200">{userProfile?.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300">E-mail de Login</Label>
                    {editingSection === 'profile' ? (
                      <Input
                        type="email"
                        value={profileData.email || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 bg-slate-800 border-slate-700"
                      />
                    ) : (
                      <p className="mt-1 text-slate-200 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {userProfile?.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300">Telefone</Label>
                    {editingSection === 'profile' ? (
                      <Input
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 bg-slate-800 border-slate-700"
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <p className="mt-1 text-slate-200 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {userProfile?.phone || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300">Documento (CPF)</Label>
                    {editingSection === 'profile' ? (
                      <Input
                        value={profileData.cpf || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, cpf: e.target.value }))}
                        className="mt-1 bg-slate-800 border-slate-700"
                        placeholder="000.000.000-00"
                      />
                    ) : (
                      <p className="mt-1 text-slate-200 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {userProfile?.cpf}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300">Código do Afiliado</Label>
                    <div className="mt-1 flex items-center gap-2 text-slate-200">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <span>{userProfile?.username}</span>
                      <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                        Somente Leitura
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Data de Cadastro</Label>
                      <p className="mt-1 text-slate-200 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-slate-300">Status da Conta</Label>
                      <div className="mt-1">
                        <Badge 
                          className={userProfile?.isActive 
                            ? "bg-green-900 text-green-200 border-green-700" 
                            : "bg-red-900 text-red-200 border-red-700"
                          }
                        >
                          {userProfile?.isActive ? '✅ Ativo' : '❌ Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Último Login</Label>
                    <p className="mt-1 text-slate-400 text-sm">
                      {formatDate(userProfile?.lastLoginAt || null)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PIX Payment Data */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <CreditCard className="h-5 w-5" />
                  Dados de Pagamento (PIX)
                </CardTitle>
                {editingSection !== 'pix' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSection('pix')}
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSavePix}
                      disabled={updatePixMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSection(null)}
                      className="border-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {!userProfile?.pixKeyType && editingSection !== 'pix' ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">Você ainda não cadastrou sua chave PIX</p>
                    <Button
                      onClick={() => setEditingSection('pix')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Cadastrar Chave PIX
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Tipo de Chave PIX</Label>
                      {editingSection === 'pix' ? (
                        <Select
                          value={profileData.pixKeyType || ''}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, pixKeyType: value }))}
                        >
                          <SelectTrigger className="mt-1 bg-slate-800 border-slate-700">
                            <SelectValue placeholder="Selecione o tipo de chave" />
                          </SelectTrigger>
                          <SelectContent>
                            {PIX_KEY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-slate-200">
                          {PIX_KEY_TYPES.find(t => t.value === userProfile?.pixKeyType)?.label || 'Não informado'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-slate-300">Valor da Chave PIX</Label>
                      {editingSection === 'pix' ? (
                        <Input
                          value={profileData.pixKeyValue || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, pixKeyValue: e.target.value }))}
                          className="mt-1 bg-slate-800 border-slate-700"
                          placeholder="Digite sua chave PIX"
                        />
                      ) : (
                        <p className="mt-1 text-slate-200 font-mono">
                          {userProfile?.pixKeyValue || 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Shield className="h-5 w-5" />
                  Alterar Senha
                </CardTitle>
                {editingSection !== 'password' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSection('password')}
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Alterar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSavePassword}
                      disabled={updatePasswordMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSection(null);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="border-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {editingSection === 'password' ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Senha Atual</Label>
                      <div className="relative mt-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-slate-800 border-slate-700 pr-10"
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300">Nova Senha</Label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="mt-1 bg-slate-800 border-slate-700"
                        placeholder="Digite a nova senha (mín. 6 caracteres)"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Confirmar Nova Senha</Label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="mt-1 bg-slate-800 border-slate-700"
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">Mantenha sua conta segura alterando a senha regularmente</p>
                    <p className="text-slate-500 text-sm">Última alteração: Não disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Monitor className="h-5 w-5" />
                  Sessões Ativas
                </CardTitle>
                {activeSessions && activeSessions.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => terminateSessionsMutation.mutate()}
                    disabled={terminateSessionsMutation.isPending}
                    className="border-red-600 text-red-400 hover:bg-red-950"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Encerrar Outras Sessões
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {activeSessions && activeSessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">IP</TableHead>
                        <TableHead className="text-slate-300">Navegador</TableHead>
                        <TableHead className="text-slate-300">Último Acesso</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSessions.map((session) => (
                        <TableRow key={session.id} className="border-slate-700">
                          <TableCell className="text-slate-200 font-mono text-sm">
                            {session.ipAddress}
                          </TableCell>
                          <TableCell className="text-slate-200 text-sm">
                            {session.userAgent.substring(0, 50)}...
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {formatDate(session.lastAccess)}
                          </TableCell>
                          <TableCell>
                            {session.isCurrent ? (
                              <Badge className="bg-green-900 text-green-200">
                                Atual
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-600">
                                Ativa
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Monitor className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhuma sessão ativa encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center py-8 space-y-4">
            <p className="text-slate-400 italic">
              "Mantenha seus dados atualizados para receber suas comissões sem atrasos."
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline" className="border-slate-600 hover:bg-slate-800">
                <a href="/home">
                  Voltar ao Dashboard
                </a>
              </Button>
              <Button asChild variant="outline" className="border-emerald-600 hover:bg-emerald-950">
                <a href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}