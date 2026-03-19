import type { SuccessResponse } from '@/api/types';

import { getRequest } from '@/lib/api';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
}

/**
 * Example endpoint to verify Axios + React Query wiring.
 */
export const getHealth = async (): Promise<HealthResponse | null> => {
  const response = await getRequest<SuccessResponse<HealthResponse>>('/health');
  return response.Data ?? null;
};
