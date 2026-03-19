export const API_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL;

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000
} as const;

export const ACTIVE_APP_STORAGE_KEY = 'tracking_cms_active_app_id' as const;

export const HTTP_DEFAULTS = {
  TIMEOUT_MS: 30 * TIME.SECOND
} as const;

export const REACT_QUERY_DEFAULTS = {
  STALE_TIME_MS: 5 * TIME.MINUTE,
  GC_TIME_MS: 30 * TIME.MINUTE
} as const;

export const MONITOR_DEFAULTS = {
  HISTORY_PAGE_SIZE: 30,
  AUTO_REFRESH_MS: 5 * TIME.SECOND
} as const;
