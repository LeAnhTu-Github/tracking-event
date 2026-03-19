import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAnalyticsConfig, saveAnalyticsConfig } from '@/api/apps';
import type { AnalyticsConfig } from '@/api/apps/types';

const getAnalyticsQueryKey = (appId: number | null) => {
  return ['analytics-config', appId] as const;
};

export const useAnalyticsConfig = (appId: number | null) => {
  return useQuery({
    queryKey: getAnalyticsQueryKey(appId),
    queryFn: async (): Promise<AnalyticsConfig | null> => {
      if (!appId) {
        return null;
      }
      return await getAnalyticsConfig(appId);
    },
    enabled: Boolean(appId)
  });
};

export const useSaveAnalyticsConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { appId: number; body: AnalyticsConfig }) => {
      return await saveAnalyticsConfig(params);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getAnalyticsQueryKey(variables.appId)
      });
    }
  });
};

