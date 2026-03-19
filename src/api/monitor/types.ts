export interface MonitorHistoryParams {
  appId: number;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}

export interface MonitorPagination {
  current_page: number;
  total_pages: number;
  total_records: number;
}

export interface MonitorHistoryResponse<TJob = unknown> {
  data: readonly TJob[];
  pagination?: MonitorPagination;
}

export type MonitorJobStatus =
  | 'Pending'
  | 'Running'
  | 'Processing'
  | 'Success'
  | 'Failed'
  | 'Cancelled'
  | 'Skipped'
  | string;

export type MonitorRunType = 'manual' | 'schedule' | 'retry' | 'demo' | string;

export interface MonitorJob {
  readonly id: number;
  readonly run_type?: MonitorRunType;
  readonly status?: MonitorJobStatus;
  readonly total_events?: number;
  readonly start_time?: string | null;
  readonly end_time?: string | null;
  readonly scheduled_at?: string | null;
  readonly date_since?: string | null;
  readonly date_until?: string | null;
  readonly logs?: string | null;
}

export interface ManualJobBody {
  app_id: string;
  start_time: string;
  end_time: string;
  execution_time: string | null;
}

export interface ManualJobResponse {
  message?: string;
  error?: string;
}

