export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export interface Pagination<T = any> {
  pages: number;
  total: number;
  contents: T;
}
