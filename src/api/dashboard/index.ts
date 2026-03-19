import { getRequest } from '@/lib/api';

import type { DashboardOverviewResponse, LevelDetailResponse } from './types';

export const getDashboardOverview = async (params: {
  appId: number;
  startDate?: string;
  endDate?: string;
}): Promise<DashboardOverviewResponse> => {
  const searchParams: URLSearchParams = new URLSearchParams();
  if (params.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('end_date', params.endDate);
  }
  const suffix: string = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';
  return await getRequest<DashboardOverviewResponse>(
    `/dashboard/${params.appId}${suffix}`
  );
};

export const getLevelDetail = async (params: {
  appId: number;
  levelId: string;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}): Promise<LevelDetailResponse> => {
  const searchParams: URLSearchParams = new URLSearchParams({
    level_id: params.levelId,
    page: params.page.toString(),
    limit: params.limit.toString()
  });
  if (params.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('end_date', params.endDate);
  }
  return await getRequest<LevelDetailResponse>(
    `/dashboard/${params.appId}/level-detail?${searchParams.toString()}`
  );
};

