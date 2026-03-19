export interface AppConfig {
  id: number;
  name: string;
  app_id: string;
  api_token: string;
  is_active: boolean;
  schedule_time?: string;
  interval_minutes?: number;
  icon_url?: string;
}

export interface AnalyticsConfig {
  events: {
    level_start: string;
    level_win: string;
    level_fail: string;
  };
  boosters: readonly {
    event_name: string;
    display_name: string;
    coin_cost: number;
  }[];
}

