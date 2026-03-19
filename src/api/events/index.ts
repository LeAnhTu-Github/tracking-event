import { getRequest } from '@/lib/api';

import type {
  DroppedUsersResponse,
  EventDictionaryResponse,
  FilterOptionsResponse,
  SearchEventsParams,
  SearchEventsResponse
} from './types';

export const searchEvents = async <TItem = unknown>(
  params: SearchEventsParams
): Promise<SearchEventsResponse<TItem>> => {
  const searchParams: URLSearchParams = new URLSearchParams({
    app_id: params.appId.toString(),
    page: params.page.toString(),
    limit: params.limit.toString()
  });
  if (params.keyword) {
    searchParams.set('keyword', params.keyword);
  }
  if (params.eventName) {
    searchParams.set('event_name', params.eventName);
  }
  if (params.level) {
    searchParams.set('level', params.level);
  }
  if (params.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('end_date', params.endDate);
  }
  return await getRequest<SearchEventsResponse<TItem>>(
    `/events/search?${searchParams.toString()}`
  );
};

export const listLevels = async (appId: number): Promise<readonly string[]> => {
  return await getRequest<readonly string[]>(`/api/levels/${appId}`);
};

export const getFilterOptions = async (
  appId: number
): Promise<FilterOptionsResponse> => {
  return await getRequest<FilterOptionsResponse>(`/api/filters/options/${appId}`);
};

export const getDroppedUsers = async (params: {
  appId: number;
  level: string;
  startDate: string;
  endDate: string;
}): Promise<DroppedUsersResponse> => {
  const searchParams: URLSearchParams = new URLSearchParams({
    level: params.level,
    start_date: params.startDate,
    end_date: params.endDate
  });
  return await getRequest<DroppedUsersResponse>(
    `/api/dropped-users/${params.appId}?${searchParams.toString()}`
  );
};

export const getEventDictionary = async (
  appId: number
): Promise<EventDictionaryResponse> => {
  return await getRequest<EventDictionaryResponse>(`/api/events/dictionary/${appId}`);
};

