import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createManualJob,
  deleteMonitorHistory,
  getMonitorHistory,
  purgeMonitorHistory,
  runEtlJob,
  stopEtlJob
} from '@/api/monitor';
import type {
  ManualJobBody,
  MonitorHistoryResponse,
  MonitorJob
} from '@/api/monitor/types';
import type { SuccessResponse } from '@/api/types';
import { MONITOR_DEFAULTS } from '@/lib/constants';

interface UseMonitorPageParams {
  readonly appId: number | null;
  readonly page: number;
  readonly limit: number;
  readonly startDate: string;
  readonly endDate: string;
}

interface MonitorHistoryResult {
  readonly jobs: readonly MonitorJob[];
  readonly totalPages: number;
  readonly totalRecords: number;
}

function isMonitorHistoryResponse<TJob>(
  value: MonitorHistoryResponse<TJob> | readonly TJob[]
): value is MonitorHistoryResponse<TJob> {
  return !Array.isArray(value);
}

function normalizeMonitorHistory(
  response: MonitorHistoryResponse<MonitorJob> | readonly MonitorJob[]
): MonitorHistoryResult {
  if (!isMonitorHistoryResponse(response)) {
    return {
      jobs: response,
      totalPages: 1,
      totalRecords: response.length
    };
  }
  const data = response.data ?? [];
  return {
    jobs: data,
    totalPages: response.pagination?.total_pages ?? 1,
    totalRecords: response.pagination?.total_records ?? data.length
  };
}

/** Unwrap SuccessResponse wrapper if backend returns { Data: { data, pagination } } */
function unwrapMonitorResponse<TJob>(
  raw: MonitorHistoryResponse<TJob> | readonly TJob[] | SuccessResponse<MonitorHistoryResponse<TJob> | readonly TJob[]>
): MonitorHistoryResponse<TJob> | readonly TJob[] {
  const wrapped = raw as SuccessResponse<MonitorHistoryResponse<TJob> | readonly TJob[]>;
  if (wrapped?.Data != null) {
    return wrapped.Data;
  }
  return raw as MonitorHistoryResponse<TJob> | readonly TJob[];
}

/**
 * Centralized hook for monitor screen query + mutations.
 */
export default function useMonitorPage(params: UseMonitorPageParams) {
  const { appId, page, limit, startDate, endDate } = params;
  const queryClient = useQueryClient();

  const monitorHistoryQuery = useQuery({
    queryKey: [
      'monitor-history',
      appId,
      page,
      limit,
      startDate || null,
      endDate || null
    ],
    queryFn: async (): Promise<MonitorHistoryResult> => {
      if (!appId) {
        return { jobs: [], totalPages: 1, totalRecords: 0 };
      }
      const raw = await getMonitorHistory<MonitorJob>({
        appId,
        page,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      const response = unwrapMonitorResponse(raw);
      return normalizeMonitorHistory(response);
    },
    enabled: Boolean(appId),
    refetchInterval: appId ? MONITOR_DEFAULTS.AUTO_REFRESH_MS : false
  });

  const runJobMutation = useMutation({
    mutationFn: async (mutationParams: { appId: number; runType: string; retryJobId?: number }) => {
      return await runEtlJob(mutationParams);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitor-history'] });
    }
  });

  const stopJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await stopEtlJob(jobId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitor-history'] });
    }
  });

  const purgeMutation = useMutation({
    mutationFn: async (targetAppId: number) => {
      return await purgeMonitorHistory(targetAppId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitor-history'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await deleteMonitorHistory(jobId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitor-history'] });
    }
  });

  const createManualJobMutation = useMutation({
    mutationFn: async (body: ManualJobBody) => {
      return await createManualJob(body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitor-history'] });
    }
  });

  return {
    monitorHistoryQuery,
    jobs: monitorHistoryQuery.data?.jobs ?? [],
    totalPages: monitorHistoryQuery.data?.totalPages ?? 1,
    totalRecords: monitorHistoryQuery.data?.totalRecords ?? 0,
    runJobMutation,
    stopJobMutation,
    purgeMutation,
    deleteMutation,
    createManualJobMutation
  };
}

