import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getHealth, type HealthResponse } from '@/api/health';

/**
 * React Query hook for the example `/health` endpoint.
 */
export const useHealth = (): UseQueryResult<HealthResponse | null, Error> => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => getHealth()
  });
};
