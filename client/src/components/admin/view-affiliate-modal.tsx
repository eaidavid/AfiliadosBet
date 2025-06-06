import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, DollarSign, MousePointer, UserPlus, CreditCard, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ViewAffiliateModalProps {
  affiliateId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

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
  houses: string[];
}

export function ViewAffiliateModal({ affiliateId, isOpen, onClose }: ViewAffiliateModalProps) {
  const { data: affiliate, isLoading, error } = useQuery<AffiliateDetails>({
    queryKey: ['/api/admin/affiliates', affiliateId],
    queryFn: async () => {
      if (!affiliateId) throw new Error('No affiliate ID provided');
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`);
      if (!response.ok) throw new Error('Failed to fetch affiliate details');
      return response.json();
    },
    enabled: isOpen && !!affiliateId,
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Detalhes do Afiliado
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Informações completas do afiliado selecionado
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full"
            />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">Erro ao carregar dados do afiliado</p>
          </div>
        )}

        {affiliate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Informações Básicas */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
                  <Badge variant={affiliate.isActive ? "default" : "secondary"} className={`${
                    affiliate.isActive 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}>
                    <Activity className="h-3 w-3 mr-1" />
                    {affiliate.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <Separator className="bg-slate-600" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">Nome Completo</p>
                      <p className="text-white font-medium">{affiliate.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">Usuário</p>
                      <p className="text-white font-medium">@{affiliate.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">E-mail</p>
                      <p className="text-white font-medium">{affiliate.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">Data de Cadastro</p>
                      <p className="text-white font-medium">{formatDate(affiliate.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas de Performance */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Estatísticas de Performance</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <MousePointer className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{affiliate.totalClicks}</p>
                    <p className="text-sm text-slate-400">Cliques</p>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <UserPlus className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{affiliate.totalRegistrations}</p>
                    <p className="text-sm text-slate-400">Registros</p>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{affiliate.totalDeposits}</p>
                    <p className="text-sm text-slate-400">Depósitos</p>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">R$ {affiliate.totalCommissions}</p>
                    <p className="text-sm text-slate-400">Comissões</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Conversão */}
            {affiliate.totalClicks > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Taxa de Conversão</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cliques para Registros</span>
                    <span className="text-white font-bold">
                      {((affiliate.totalRegistrations / affiliate.totalClicks) * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}