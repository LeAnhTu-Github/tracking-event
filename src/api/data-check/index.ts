import { getRequest } from '@/lib/api';
import { apiClient } from '@/lib/api';

import type { DataCheckParams, DataCheckResponse } from './types';

export const getDataCheck = async <TItem = unknown>(
  params: DataCheckParams
): Promise<DataCheckResponse<TItem>> => {
  const searchParams: URLSearchParams = new URLSearchParams();
  if (params.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('end_date', params.endDate);
  }
  if (params.version && params.version.toLowerCase() !== 'all') {
    searchParams.set('version', params.version);
  }
  if (params.geo && params.geo.toLowerCase() !== 'all') {
    searchParams.set('geo', params.geo);
  }
  const suffix: string = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';
  return await getRequest<DataCheckResponse<TItem>>(
    `/api/data-check/${params.appId}${suffix}`
  );
};

export const downloadDataCheckExport = async (params: DataCheckParams): Promise<Blob> => {
  const searchParams: URLSearchParams = new URLSearchParams();
  if (params.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('end_date', params.endDate);
  }
  if (params.version && params.version.toLowerCase() !== 'all') {
    searchParams.set('version', params.version);
  }
  if (params.geo && params.geo.toLowerCase() !== 'all') {
    searchParams.set('geo', params.geo);
  }
  const suffix: string = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';
  const response = await apiClient.get<Blob>(`/api/datacheck/export/${params.appId}${suffix}`, {
    responseType: 'blob'
  });
  return response.data;
};

