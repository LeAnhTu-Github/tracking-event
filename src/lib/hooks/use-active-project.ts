import { useEffect, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { AppConfig } from '@/api/apps/types';
import { ACTIVE_APP_STORAGE_KEY } from '@/lib/constants';
import { useApps, type ActiveAppsResult } from '@/lib/hooks/use-apps';

interface ActiveProjectState extends ActiveAppsResult {
  readonly setActiveApp: (appId: number) => void;
}

const findActiveAppFromStorage = ({
  apps,
  storedAppId
}: {
  readonly apps: readonly AppConfig[];
  readonly storedAppId: number | null;
}): AppConfig | null => {
  if (!storedAppId) {
    return null;
  }
  return apps.find((app) => app.id === storedAppId) ?? null;
};

const safelyGetStoredAppId = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const rawValue = window.localStorage.getItem(ACTIVE_APP_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }
  const parsedValue = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsedValue)) {
    window.localStorage.removeItem(ACTIVE_APP_STORAGE_KEY);
    return null;
  }
  return parsedValue;
};

/**
 * Hook to manage active project (app) selection on the client side.
 * - Hydrates activeApp from localStorage when possible.
 * - Persists user selection to localStorage.
 * - Keeps React Query cache in sync so all consumers of `useApps` see the same activeApp.
 */
export const useActiveProject = (): ActiveProjectState => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useApps();

  const storedAppId = useMemo(() => safelyGetStoredAppId(), []);

  useEffect(() => {
    if (!data?.apps?.length) {
      return;
    }
    const apps = data.apps;
    const activeFromStorage = findActiveAppFromStorage({
      apps,
      storedAppId
    });
    if (!activeFromStorage) {
      return;
    }
    queryClient.setQueryData<ActiveAppsResult | undefined>(['apps'], (prev) => {
      if (!prev) {
        return {
          apps,
          activeApp: activeFromStorage
        };
      }
      return {
        apps: prev.apps,
        activeApp: activeFromStorage
      };
    });
  }, [data?.apps, queryClient, storedAppId]);

  const executeSetActiveApp = (appId: number): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_APP_STORAGE_KEY, String(appId));
    }
    const apps = data?.apps ?? [];
    const nextActiveApp =
      apps.find((app) => app.id === appId) ?? data?.activeApp ?? null;
    queryClient.setQueryData<ActiveAppsResult | undefined>(['apps'], (prev) => {
      if (!prev) {
        return {
          apps,
          activeApp: nextActiveApp
        };
      }
      return {
        apps: prev.apps,
        activeApp: nextActiveApp
      };
    });
  };

  return {
    apps: data?.apps ?? [],
    activeApp: data?.activeApp ?? null,
    setActiveApp: executeSetActiveApp
  };
};

