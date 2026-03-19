export interface DataCheckParams {
  appId: number;
  startDate?: string;
  endDate?: string;
  version?: string;
  geo?: string;
}

export interface DataCheckResponse<TItem = unknown> {
  success: boolean;
  data: readonly TItem[];
}

