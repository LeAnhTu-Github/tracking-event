export interface DashboardOverviewResponse {
  success: boolean;
  overview: {
    cards: Record<string, number>;
    chart_main: readonly unknown[];
    balance_chart?: readonly unknown[];
  };
  detailed?: {
    level_stats?: readonly unknown[];
    booster_stats?: readonly unknown[];
    raw_table?: readonly unknown[];
    event_dictionary?: readonly string[];
  };
}

export interface LevelDetailResponse {
  success: boolean;
  metrics: {
    total_plays: number;
    win_rate: number | string;
    arpu: number;
    top_item: string;
  };
  funnel: readonly { event_type: string; count: number; revenue?: number }[];
  cost_distribution: readonly { name: string; value: number; color?: string }[];
  booster_usage: readonly {
    item_name: string;
    usage_count: number;
    revenue?: number;
    price?: number;
  }[];
  logs: {
    data: readonly unknown[];
    pagination?: {
      current: number;
      total_pages: number;
      total_records: number;
    };
  };
}

