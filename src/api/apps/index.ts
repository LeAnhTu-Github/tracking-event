import { deleteRequest, getRequest, postRequest, putRequest } from '@/lib/api';

import type { AnalyticsConfig, AppConfig } from './types';

export const listApps = async (): Promise<readonly AppConfig[]> => {
  return await getRequest<readonly AppConfig[]>('/apps');
};

export const createApp = async (
  body: Omit<AppConfig, 'id'>
): Promise<AppConfig> => {
  return await postRequest<AppConfig, Omit<AppConfig, 'id'>>('/apps', body);
};

export const updateApp = async (params: {
  appId: number;
  body: Omit<AppConfig, 'id'>;
}): Promise<AppConfig> => {
  return await putRequest<AppConfig, Omit<AppConfig, 'id'>>(
    `/apps/${params.appId}`,
    params.body
  );
};

export const deleteApp = async (appId: number): Promise<unknown> => {
  return await deleteRequest<unknown>(`/apps/${appId}`);
};

export const getAnalyticsConfig = async (
  appId: number
): Promise<AnalyticsConfig | null> => {
  try {
    return await getRequest<AnalyticsConfig>(`/apps/${appId}/analytics-config`);
  } catch {
    return null;
  }
};

export const saveAnalyticsConfig = async (params: {
  appId: number;
  body: AnalyticsConfig;
}): Promise<unknown> => {
  return await postRequest<unknown, AnalyticsConfig>(
    `/apps/${params.appId}/analytics-config`,
    params.body
  );
};

