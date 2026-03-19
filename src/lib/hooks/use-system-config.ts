import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSystemConfig, saveSystemConfig } from '@/api/system';
import type { SaveSystemConfigBody, SystemConfigResponse } from '@/api/system/types';

const SYSTEM_CONFIG_QUERY_KEY = ['system-config'] as const;

export interface UseSystemConfigResult {
  readonly intervalMinutes: number | null;
  readonly raw: SystemConfigResponse | null;
}

export const useSystemConfig = () => {
  return useQuery({
    queryKey: SYSTEM_CONFIG_QUERY_KEY,
    queryFn: async (): Promise<UseSystemConfigResult> => {
      const raw = await getSystemConfig();
      const intervalMinutes =
        typeof raw.interval_minutes === 'number' ? raw.interval_minutes : null;
      return { intervalMinutes, raw };
    }
  });
};

export const useSaveSystemConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SaveSystemConfigBody) => {
      return await saveSystemConfig(body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SYSTEM_CONFIG_QUERY_KEY });
    }
  });
};

