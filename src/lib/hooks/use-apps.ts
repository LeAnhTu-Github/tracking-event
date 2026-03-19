import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { listApps } from '@/api/apps';
import type { AppConfig } from '@/api/apps/types';

export interface ActiveAppsResult {
  readonly apps: readonly AppConfig[];
  readonly activeApp: AppConfig | null;
}

export const useApps = (): UseQueryResult<ActiveAppsResult, Error> => {
  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const apps = await listApps();
      const activeApp = apps.find((app) => app.is_active) ?? null;
      return {
        apps,
        activeApp
      };
    }
  });
};

