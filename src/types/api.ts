export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number | null;
  message: string;
  fieldErrors: FieldError[];
}
