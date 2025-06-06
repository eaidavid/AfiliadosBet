import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User, Mail, UserCheck } from 'lucide-react';
import AdminSidebar from '@/components/admin/sidebar';
import { motion } from 'framer-motion';

const SIDEBAR_PROPS = {
  currentPage: 'manage',
  onPageChange: () => {}
};

const editAffiliateSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  isActive: z.boolean(),
});

type EditAffiliateForm = z.infer<typeof editAffiliateSchema>;

interface AffiliateDetails {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  totalClicks: number;
  totalRegistrations: number;
  totalDeposits: number;
  totalCommissions: string;
}

export default function AdminEditAffiliate() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const affiliateId = parseInt(params.id as string);

  const form = useForm<EditAffiliateForm>({
    resolver: zodResolver(editAffiliateSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      isActive: true,
    },
  });

  // Fetch affiliate data
  const { data: affiliate, isLoading, error } = useQuery<AffiliateDetails>({
    queryKey: ['/api/admin/affiliates', affiliateId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`);
      if (!response.ok) throw new Error('Failed to fetch affiliate details');
      return response.json();
    },
    enabled: !!affiliateId && !isNaN(affiliateId),
  });

  // Update form when data loads
  useEffect(() => {
    if (affiliate) {
      form.reset({
        fullName: affiliate.fullName,
        email: affiliate.email,
        username: affiliate.username,
        isActive: affiliate.isActive,
      });
    }
  }, [affiliate, form]);

  // Update mutation
  const updateAffiliateMutation = useMutation({
    mutationFn: async (data: EditAffiliateForm) => {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update affiliate');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Afiliado atualizado com sucesso!",
      });
      setLocation('/admin/manage');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar afiliado: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: EditAffiliateForm) => {
    updateAffiliateMutation.mutate(data);
  };

  if (isNaN(affiliateId)) {
    return (
      <div className="flex h-screen bg-slate-950">
        <AdminSidebar {...SIDEBAR_PROPS} />
        <div className="flex-1 ml-64 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400">ID de afiliado inválido</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-950">
        <AdminSidebar {...SIDEBAR_PROPS} />
        <div className="flex-1 ml-64 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Carregando dados do afiliado...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !affiliate) {
    return (
      <div className="flex h-screen bg-slate-950">
        <AdminSidebar {...SIDEBAR_PROPS} />
        <div className="flex-1 ml-64 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400">Erro ao carregar dados do afiliado</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar {...SIDEBAR_PROPS} />
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto space-y-4 lg:space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/admin/manage')}
              className="border-slate-600 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Editar Afiliado</h1>
              <p className="text-slate-400">Modifique as informações do afiliado</p>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Informações do Afiliado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            placeholder="Digite o nome completo"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Nome de Usuário</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            placeholder="Digite o username"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">E-mail</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            placeholder="Digite o e-mail"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-slate-300">Status do Afiliado</FormLabel>
                          <div className="text-sm text-slate-400">
                            Ativar ou desativar o acesso do afiliado ao sistema
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation('/admin/manage')}
                      className="flex-1 border-slate-600 hover:bg-slate-700"
                      disabled={updateAffiliateMutation.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateAffiliateMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {updateAffiliateMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Salvando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Salvar Alterações
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Estatísticas (Somente Leitura)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xl font-bold text-white">{affiliate.totalClicks}</p>
                  <p className="text-sm text-slate-400">Cliques</p>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xl font-bold text-white">{affiliate.totalRegistrations}</p>
                  <p className="text-sm text-slate-400">Registros</p>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xl font-bold text-white">{affiliate.totalDeposits}</p>
                  <p className="text-sm text-slate-400">Depósitos</p>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xl font-bold text-white">R$ {affiliate.totalCommissions}</p>
                  <p className="text-sm text-slate-400">Comissões</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}