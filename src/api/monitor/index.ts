import { deleteRequest, getRequest, postRequest } from '@/lib/api';

import type {
  ManualJobBody,
  ManualJobResponse,
  MonitorHistoryParams,
  MonitorHistoryResponse
} from './types';

export const getMonitorHistory = async <TJob = unknown>(
  params: MonitorHistoryParams
): Promise<MonitorHistoryResponse<TJob> | readonly TJob[]> => {
  const searchParams: URLSearchParams = new URLSearchParams({
    app_id: params.appId.toString(),
    page: params.page.toString(),
    limit: params.limit.toString()
  });
  if (params.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('end_date', params.endDate);
  }
  return await getRequest<MonitorHistoryResponse<TJob> | readonly TJob[]>(
    `/monitor/history?${searchParams.toString()}`
  );
};

export const runEtlJob = async (params: {
  appId: number;
  runType: string;
  retryJobId?: number;
}): Promise<unknown> => {
  const body: Record<string, unknown> = { run_type: params.runType };
  if (params.retryJobId) {
    body.retry_job_id = params.retryJobId;
  }
  return await postRequest<unknown, Record<string, unknown>>(
    `/etl/run/${params.appId}`,
    body
  );
};

export const stopEtlJob = async (jobId: number): Promise<unknown> => {
  return await postRequest<unknown, Record<string, never>>(
    `/etl/stop/${jobId}`,
    {}
  );
};

export const purgeMonitorHistory = async (appId: number): Promise<unknown> => {
  return await deleteRequest<unknown>(`/monitor/purge?app_id=${appId}`);
};

export const deleteMonitorHistory = async (jobId: number): Promise<unknown> => {
  return await deleteRequest<unknown>(`/monitor/history/${jobId}`);
};

export const getExportUrl = (jobId: number): string => {
  return `/monitor/export/${jobId}`;
};

export const createManualJob = async (
  body: ManualJobBody
): Promise<ManualJobResponse> => {
  return await postRequest<ManualJobResponse, ManualJobBody>(
    '/api/create_manual_job',
    body
  );
};

