import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Link, 
  Award,
  Clock,
  CheckCircle,
  MousePointer,
  Target,
  Sparkles,
  ArrowUp,
  Crown,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityItem {
  id: number;
  type: 'conversion' | 'new_link' | 'milestone' | 'payment' | 'click' | 'registration';
  title: string;
  description: string;
  value?: string;
  timestamp: Date;
  houseName?: string;
  status?: 'success' | 'pending' | 'warning';
}

interface ActivityFeedProps {
  recentConversions?: any[];
  recentPostbacks?: any[];
  affiliateLinks?: any[];
}

export function ActivityFeed({ recentConversions = [], recentPostbacks = [], affiliateLinks = [] }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    generateActivities();
  }, [recentConversions, recentPostbacks, affiliateLinks]);

  const generateActivities = () => {
    const newActivities: ActivityItem[] = [];

    // Add conversions
    recentConversions.forEach((conversion, index) => {
      newActivities.push({
        id: conversion.id,
        type: 'conversion',
        title: 'Nova Conversão! 🎉',
        description: `Conversão de ${conversion.type} na ${conversion.houseName}`,
        value: conversion.commission,
        timestamp: new Date(conversion.convertedAt),
        houseName: conversion.houseName,
        status: 'success'
      });
    });

    // Add postback activities
    recentPostbacks.forEach((postback, index) => {
      if (postback.status === 'success') {
        newActivities.push({
          id: postback.id,
          type: postback.eventType === 'deposit' ? 'conversion' : 'click',
          title: postback.eventType === 'deposit' ? 'Depósito Confirmado!' : 'Novo Click',
          description: `${postback.eventType} na ${postback.houseName}`,
          value: postback.value,
          timestamp: new Date(postback.createdAt),
          houseName: postback.houseName,
          status: 'success'
        });
      }
    });

    // Add recent affiliate links
    affiliateLinks.slice(0, 3).forEach((link, index) => {
      newActivities.push({
        id: link.id,
        type: 'new_link',
        title: 'Link Gerado',
        description: `Novo link de afiliado para ${link.houseName}`,
        timestamp: new Date(link.createdAt),
        houseName: link.houseName,
        status: 'success'
      });
    });

    // Add some mock milestone and achievement activities for better UX
    const mockActivities: ActivityItem[] = [
      {
        id: 1001,
        type: 'milestone',
        title: 'Meta Alcançada! 🏆',
        description: 'Você atingiu 50 conversões este mês',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success'
      },
      {
        id: 1002,
        type: 'payment',
        title: 'Pagamento Processado',
        description: 'PIX de R$ 1.247,50 enviado com sucesso',
        value: 'R$ 1.247,50',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'success'
      },
      {
        id: 1003,
        type: 'milestone',
        title: 'Nível Premium Desbloqueado!',
        description: 'Parabéns! Agora você tem acesso a comissões VIP',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'success'
      }
    ];

    // Combine and sort by timestamp
    const allActivities = [...newActivities, ...mockActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    setActivities(allActivities);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversion':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'new_link':
        return <Link className="w-5 h-5 text-blue-400" />;
      case 'milestone':
        return <Award className="w-5 h-5 text-yellow-400" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'click':
        return <MousePointer className="w-5 h-5 text-slate-400" />;
      case 'registration':
        return <Users className="w-5 h-5 text-blue-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getActivityBadge = (type: string, status?: string) => {
    switch (type) {
      case 'conversion':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">💰 Conversão</Badge>;
      case 'milestone':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">🏆 Conquista</Badge>;
      case 'payment':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">💳 Pagamento</Badge>;
      case 'new_link':
        return <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">🔗 Novo Link</Badge>;
      case 'click':
        return <Badge className="bg-slate-500/20 text-slate-400 border-0 text-xs">👆 Click</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-0 text-xs">📱 Atividade</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}min atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return `${days}d atrás`;
    }
  };

  return (
    <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Feed de Atividades</CardTitle>
              <p className="text-slate-400 text-sm">Suas conquistas e atividades recentes</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-0 animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            {activities.length} atividades
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Nenhuma Atividade</h3>
            <p className="text-slate-400 text-sm mb-4">
              Suas atividades e conquistas aparecerão aqui
            </p>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold px-6"
            >
              Começar Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`
                  p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]
                  ${activity.type === 'conversion' || activity.type === 'payment' 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/25' 
                    : activity.type === 'milestone'
                    ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-500/25'
                    : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                  }
                  ${index === 0 ? 'ring-2 ring-emerald-400/30' : ''}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${activity.type === 'conversion' || activity.type === 'payment'
                      ? 'bg-emerald-500/20 border border-emerald-400/50'
                      : activity.type === 'milestone'
                      ? 'bg-yellow-500/20 border border-yellow-400/50'
                      : 'bg-slate-600/50 border border-slate-500/50'
                    }
                  `}>
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold text-sm truncate">
                        {activity.title}
                      </h4>
                      {getActivityBadge(activity.type, activity.status)}
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-2">
                      {activity.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-500 text-xs">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        {activity.houseName && (
                          <>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-xs">
                              {activity.houseName}
                            </span>
                          </>
                        )}
                      </div>

                      {activity.value && (
                        <div className={`
                          font-bold text-sm
                          ${activity.type === 'conversion' || activity.type === 'payment'
                            ? 'text-emerald-400'
                            : 'text-white'
                          }
                        `}>
                          {activity.value}
                        </div>
                      )}
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="flex-shrink-0">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Novo
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > 0 && (
          <div className="pt-4 border-t border-slate-700/50">
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white font-medium"
            >
              Ver Todas as Atividades
              <ArrowUp className="w-4 h-4 ml-2 rotate-45" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}