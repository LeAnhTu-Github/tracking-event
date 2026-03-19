export interface SuccessResponse<TData> {
  Data: TData | null;
  Message?: string;
  Status?: number;
}

export interface PaginationResponse<TItem> {
  results: readonly TItem[];
  count: number;
  page: number;
  page_size: number;
}
