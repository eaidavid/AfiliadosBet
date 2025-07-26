import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Award, 
  Star, 
  Trophy, 
  Target,
  Zap,
  Shield,
  Gem,
  Flame,
  Medal,
  CheckCircle,
  Lock,
  TrendingUp,
  Gift,
  Sparkles
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  progress: number;
  total: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: string;
}

interface Level {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  perks: string[];
  color: string;
}

interface GamificationPanelProps {
  userStats?: {
    totalClicks: number;
    totalRegistrations: number;
    totalDeposits: number;
    totalCommission: string;
    conversionRate: number;
  };
}

export function GamificationPanel({ userStats }: GamificationPanelProps) {
  const [currentXp, setCurrentXp] = useState(2847);
  const [currentLevel, setCurrentLevel] = useState(8);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const levels: Level[] = [
    { level: 1, title: 'Iniciante', minXp: 0, maxXp: 100, perks: ['Dashboard básico'], color: 'text-slate-400' },
    { level: 2, title: 'Explorador', minXp: 100, maxXp: 300, perks: ['Analytics básico'], color: 'text-green-400' },
    { level: 3, title: 'Afiliado', minXp: 300, maxXp: 600, perks: ['Links personalizados'], color: 'text-green-400' },
    { level: 4, title: 'Veterano', minXp: 600, maxXp: 1000, perks: ['Relatórios avançados'], color: 'text-blue-400' },
    { level: 5, title: 'Expert', minXp: 1000, maxXp: 1500, perks: ['Priority support'], color: 'text-blue-400' },
    { level: 6, title: 'Mestre', minXp: 1500, maxXp: 2200, perks: ['Comissões VIP'], color: 'text-purple-400' },
    { level: 7, title: 'Elite', minXp: 2200, maxXp: 3000, perks: ['Early access'], color: 'text-purple-400' },
    { level: 8, title: 'Lenda', minXp: 3000, maxXp: 4000, perks: ['Comissões Premium'], color: 'text-yellow-400' },
    { level: 9, title: 'Campeão', minXp: 4000, maxXp: 5500, perks: ['Manager dedicado'], color: 'text-orange-400' },
    { level: 10, title: 'Imperador', minXp: 5500, maxXp: 10000, perks: ['Benefícios máximos'], color: 'text-red-400' }
  ];

  useEffect(() => {
    generateAchievements();
  }, [userStats]);

  const generateAchievements = () => {
    const achievementsList: Achievement[] = [
      {
        id: 'first-conversion',
        title: 'Primeira Conversão',
        description: 'Realize sua primeira conversão',
        icon: Target,
        completed: (userStats?.totalDeposits || 0) > 0,
        progress: Math.min(userStats?.totalDeposits || 0, 1),
        total: 1,
        rarity: 'common',
        reward: '+50 XP'
      },
      {
        id: 'affiliate-rookie',
        title: 'Afiliado Novato',
        description: 'Complete 10 conversões',
        icon: Shield,
        completed: (userStats?.totalDeposits || 0) >= 10,
        progress: Math.min(userStats?.totalDeposits || 0, 10),
        total: 10,
        rarity: 'common',
        reward: '+100 XP'
      },
      {
        id: 'conversion-machine',
        title: 'Máquina de Conversão',
        description: 'Alcance 50 conversões',
        icon: Zap,
        completed: (userStats?.totalDeposits || 0) >= 50,
        progress: Math.min(userStats?.totalDeposits || 0, 50),
        total: 50,
        rarity: 'rare',
        reward: '+250 XP + Badge especial'
      },
      {
        id: 'traffic-master',
        title: 'Mestre do Tráfego',
        description: 'Gere 1.000 cliques',
        icon: Flame,
        completed: (userStats?.totalClicks || 0) >= 1000,
        progress: Math.min(userStats?.totalClicks || 0, 1000),
        total: 1000,
        rarity: 'rare',
        reward: '+300 XP'
      },
      {
        id: 'high-roller',
        title: 'High Roller',
        description: 'Ganhe R$ 5.000 em comissões',
        icon: Crown,
        completed: parseFloat(userStats?.totalCommission?.replace(/[^\d,]/g, '').replace(',', '.') || '0') >= 5000,
        progress: Math.min(parseFloat(userStats?.totalCommission?.replace(/[^\d,]/g, '').replace(',', '.') || '0'), 5000),
        total: 5000,
        rarity: 'epic',
        reward: '+500 XP + Acesso VIP'
      },
      {
        id: 'conversion-legend',
        title: 'Lenda das Conversões',
        description: 'Mantenha taxa de conversão acima de 5%',
        icon: Trophy,
        completed: (userStats?.conversionRate || 0) >= 5,
        progress: Math.min(userStats?.conversionRate || 0, 5),
        total: 5,
        rarity: 'legendary',
        reward: '+1000 XP + Título especial'
      }
    ];

    setAchievements(achievementsList);
  };

  const getCurrentLevelInfo = () => {
    return levels.find(l => l.level === currentLevel) || levels[0];
  };

  const getNextLevelInfo = () => {
    return levels.find(l => l.level === currentLevel + 1);
  };

  const getLevelProgress = () => {
    const current = getCurrentLevelInfo();
    const progress = ((currentXp - current.minXp) / (current.maxXp - current.minXp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-slate-400 border-slate-400/30 bg-slate-500/10';
      case 'rare': return 'text-blue-400 border-blue-400/30 bg-blue-500/10';
      case 'epic': return 'text-purple-400 border-purple-400/30 bg-purple-500/10';
      case 'legendary': return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-500/10';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return { text: 'Comum', class: 'bg-slate-500/20 text-slate-400' };
      case 'rare': return { text: 'Raro', class: 'bg-blue-500/20 text-blue-400' };
      case 'epic': return { text: 'Épico', class: 'bg-purple-500/20 text-purple-400' };
      case 'legendary': return { text: 'Lendário', class: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' };
      default: return { text: 'Comum', class: 'bg-slate-500/20 text-slate-400' };
    }
  };

  const currentLevelInfo = getCurrentLevelInfo();
  const nextLevelInfo = getNextLevelInfo();
  const levelProgress = getLevelProgress();
  const completedAchievements = achievements.filter(a => a.completed).length;

  return (
    <div className="space-y-6">
      {/* Level Progress Card */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-400/30`}>
                <Crown className={`w-8 h-8 ${currentLevelInfo.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-lg">Nível {currentLevel}</h3>
                  <Badge className={`${currentLevelInfo.color} bg-transparent border-current`}>
                    {currentLevelInfo.title}
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm">
                  {currentXp.toLocaleString()} XP • {nextLevelInfo ? `${(nextLevelInfo.minXp - currentXp).toLocaleString()} XP para próximo nível` : 'Nível máximo!'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400">{completedAchievements}</p>
              <p className="text-slate-400 text-sm">Conquistas</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progresso do Nível</span>
              <span className="text-white font-semibold">{levelProgress.toFixed(1)}%</span>
            </div>
            <div className="relative">
              <Progress value={levelProgress} className="h-4" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full" />
            </div>
          </div>

          {/* Current level perks */}
          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <div className="flex items-center gap-2 mb-3">
              <Gem className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-semibold">Benefícios Ativos</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentLevelInfo.perks.map((perk, index) => (
                <Badge key={index} className="bg-emerald-500/20 text-emerald-400 border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {perk}
                </Badge>
              ))}
            </div>
          </div>

          {/* Next level preview */}
          {nextLevelInfo && (
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/30">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">Próximo Nível: {nextLevelInfo.title}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {nextLevelInfo.perks.map((perk, index) => (
                  <Badge key={index} className="bg-blue-500/20 text-blue-400 border-0">
                    <Lock className="w-3 h-3 mr-1" />
                    {perk}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Conquistas</CardTitle>
                <p className="text-slate-400 text-sm">
                  {completedAchievements} de {achievements.length} desbloqueadas
                </p>
              </div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-0 animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              {((completedAchievements / achievements.length) * 100).toFixed(0)}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const rarityBadge = getRarityBadge(achievement.rarity);
              return (
                <div
                  key={achievement.id}
                  className={`
                    p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]
                    ${achievement.completed 
                      ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/25' 
                      : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${achievement.completed 
                        ? 'bg-emerald-500/20 border border-emerald-400/50' 
                        : 'bg-slate-600/50 border border-slate-500/50'
                      }
                    `}>
                      <achievement.icon className={`w-6 h-6 ${achievement.completed ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${achievement.completed ? 'text-white' : 'text-slate-300'}`}>
                          {achievement.title}
                        </h4>
                        <Badge className={`${rarityBadge.class} border-0 text-xs`}>
                          {rarityBadge.text}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-400 text-xs mb-3">
                        {achievement.description}
                      </p>

                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-xs">
                            {achievement.progress} / {achievement.total}
                          </span>
                          <span className="text-emerald-400 text-xs font-semibold">
                            {achievement.reward}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              achievement.completed 
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                                : 'bg-gradient-to-r from-slate-500 to-slate-600'
                            }`}
                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                          />
                        </div>
                      </div>

                      {achievement.completed && (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-semibold">Concluída!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold">
                <Gift className="w-4 h-4 mr-2" />
                Resgatar Recompensas
              </Button>
              <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Ranking
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}