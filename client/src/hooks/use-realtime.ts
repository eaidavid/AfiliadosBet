import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtime() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      // Verificar se estamos no browser
      if (typeof window === 'undefined') return;
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado - Atualização em tempo real ativa');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'user_stats_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
              break;
              
            case 'conversions_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/user/conversions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
              break;
              
            case 'houses_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/betting-houses'] });
              queryClient.invalidateQueries({ queryKey: ['/api/active-houses'] });
              break;
              
            case 'links_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/my-links'] });
              queryClient.invalidateQueries({ queryKey: ['/api/affiliate-links'] });
              break;
              
            case 'payments_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/user/payments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/user/payment-config'] });
              break;
              
            case 'admin_stats_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/commissions'] });
              break;

            case 'global_update':
              // Atualização geral de todos os dados
              queryClient.invalidateQueries();
              break;
          }
        } catch (error) {
          console.log('Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('🔄 WebSocket desconectado - Tentando reconectar...');
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.log('WebSocket error:', error);
      };
    } catch (error) {
      console.log('Erro ao conectar WebSocket:', error);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Função para forçar atualização manual se necessário
  const forceUpdate = () => {
    queryClient.invalidateQueries();
  };

  return { forceUpdate };
}