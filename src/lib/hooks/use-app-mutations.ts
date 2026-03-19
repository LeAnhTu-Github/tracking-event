import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createApp, deleteApp, updateApp } from '@/api/apps';
import type { AppConfig } from '@/api/apps/types';

const APPS_QUERY_KEY = ['apps'] as const;

export const useCreateApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Omit<AppConfig, 'id'>) => {
      return await createApp(body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY });
    }
  });
};

export const useUpdateApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { appId: number; body: Omit<AppConfig, 'id'> }) => {
      return await updateApp(params);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY });
    }
  });
};

export const useDeleteApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appId: number) => {
      return await deleteApp(appId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY });
    }
  });
};

