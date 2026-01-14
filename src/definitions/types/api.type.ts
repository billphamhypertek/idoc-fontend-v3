export type EpochMillis = number;
export type SortDirection = "ASC" | "DESC";

export type ApiResponse<T> = {
  resultCode: number;
  message: string;
  responseTime: EpochMillis;
  data: T;
};
export interface ApiRecord {
  id: number;
  name: string;
  api: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  active: boolean;
  createDate?: number;
  createBy?: number;
  clientId?: number;
}

export interface ApiListResponse {
  content: ApiRecord[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiBackendResponse {
  totalPage: number;
  totalRecord: number;
  objList: ApiRecord[];
}

export interface ApiSearchParams {
  searchKey?: string;
  active?: boolean;
  size?: number;
}

export interface ApiAddRequest {
  name: string;
  api: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
}
