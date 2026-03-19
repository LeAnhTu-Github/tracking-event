export interface SearchEventsParams {
  appId: number;
  page: number;
  limit: number;
  keyword?: string;
  eventName?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
}

export interface SearchEventsPagination {
  current_page: number;
  total_pages: number;
  total_records: number;
}

export interface SearchEventsResponse<TItem = unknown> {
  success: boolean;
  data: readonly TItem[];
  pagination: SearchEventsPagination;
}

export interface FilterOptionsResponse {
  versions: readonly string[];
  geos: readonly string[];
}

export interface DroppedUsersResponse {
  success: boolean;
  total_start: number;
  total_win: number;
  dropped_count: number;
  dropped_uuids: readonly string[];
  error?: string;
}

export interface EventDictionaryResponse {
  success: boolean;
  total_count: number;
  groups: Record<string, readonly string[]>;
}

