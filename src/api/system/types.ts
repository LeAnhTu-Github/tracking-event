export interface SystemConfigResponse {
  interval_minutes?: number;
}

export interface SaveSystemConfigBody {
  interval_minutes: number;
}

export interface SaveSystemConfigResponse {
  status: 'success' | 'error';
  message?: string;
}

