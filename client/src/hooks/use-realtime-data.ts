import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseRealtimeDataOptions {
  interval?: number;
  queryKeys?: string[];
  enabled?: boolean;
}

export const useRealtimeData = ({
  interval = 2000, // 2 segundos por padrão
  queryKeys = [],
  enabled = true,
}: UseRealtimeDataOptions = {}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const defaultKeys = [
      '/api/stats/user',
      '/api/user/stats',
      '/api/user/conversions',
      '/api/user/payment-config',
      '/api/user/payments',
      '/api/betting-houses',
      '/api/my-links',
      '/api/user/account-status',
      '/api/admin/stats',
      '/api/admin/affiliates',
      '/api/admin/commissions',
      '/api/admin/commission-stats',
      '/api/admin/recent-activity',
    ];

    const keysToUpdate = queryKeys.length > 0 ? queryKeys : defaultKeys;

    const updateData = () => {
      try {
        keysToUpdate.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      } catch (error) {
        console.log('Cache invalidation error:', error);
      }
    };

    // Atualização inicial
    updateData();

    // Configurar intervalo de atualização
    const intervalId = setInterval(updateData, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [queryClient, interval, enabled, queryKeys]);

  return {
    refreshData: () => {
      const keysToRefresh = queryKeys.length > 0 ? queryKeys : [
        '/api/stats/user',
        '/api/user/stats',
        '/api/user/conversions',
        '/api/betting-houses',
        '/api/my-links',
      ];
      
      keysToRefresh.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
  };
};