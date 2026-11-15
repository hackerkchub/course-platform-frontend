export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages?: number;
  totalPages?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
