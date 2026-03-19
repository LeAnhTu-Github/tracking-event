'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { REACT_QUERY_DEFAULTS } from '@/lib/constants';

const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: REACT_QUERY_DEFAULTS.STALE_TIME_MS,
        gcTime: REACT_QUERY_DEFAULTS.GC_TIME_MS,
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  });
};

/**
 * Provides a single QueryClient instance per browser session.
 */
export default function ReactQueryProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = React.useState<QueryClient>(() => createQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
