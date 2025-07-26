import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Copy, 
  Link, 
  MessageCircle, 
  BarChart3, 
  Settings,
  X,
  Zap,
  Phone,
  HeadphonesIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsFabProps {
  onCopyBestLink?: () => void;
  onNewAffiliate?: () => void;
  onSupport?: () => void;
  onAnalytics?: () => void;
}

export function QuickActionsFab({ 
  onCopyBestLink, 
  onNewAffiliate, 
  onSupport, 
  onAnalytics 
}: QuickActionsFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const actions = [
    {
      icon: Copy,
      label: 'Copiar Melhor Link',
      description: 'Link com maior conversão',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => {
        onCopyBestLink?.();
        setIsOpen(false);
        toast({
          title: "Link copiado!",
          description: "Melhor link de conversão copiado para a área de transferência"
        });
      }
    },
    {
      icon: Link,
      label: 'Nova Afiliação',
      description: 'Escolher casa premium',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        onNewAffiliate?.();
        setIsOpen(false);
      }
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'Ver relatórios',
      color: 'bg-violet-500 hover:bg-violet-600',
      onClick: () => {
        onAnalytics?.();
        setIsOpen(false);
      }
    },
    {
      icon: HeadphonesIcon,
      label: 'Suporte VIP',
      description: 'Chat prioritário',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => {
        onSupport?.();
        setIsOpen(false);
        toast({
          title: "Suporte VIP",
          description: "Conectando com especialista..."
        });
      }
    }
  ];

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Action buttons - shown when expanded */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom duration-300">
          {actions.map((action, index) => (
            <Card 
              key={action.label} 
              className="bg-slate-800/95 border-slate-700/50 backdrop-blur-sm shadow-2xl w-64 group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} shadow-lg transition-all duration-300 group-hover:shadow-xl`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{action.label}</h4>
                    <p className="text-slate-400 text-xs">{action.description}</p>
                  </div>
                  <Button
                    onClick={action.onClick}
                    size="sm"
                    className="bg-transparent hover:bg-slate-700 text-slate-300 hover:text-white border-0 p-2"
                  >
                    <Zap className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-2xl shadow-2xl transition-all duration-300 border-0
          ${isOpen 
            ? 'bg-slate-700 hover:bg-slate-600 rotate-45' 
            : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 hover:scale-110'
          }
        `}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <div className="relative">
            <Plus className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">4</span>
            </div>
          </div>
        )}
      </Button>

      {/* Pulsing indicator when closed */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 animate-ping opacity-20" />
      )}
    </div>
  );
}