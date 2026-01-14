export interface OutSysListResponse {
  content: OutSys[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

export interface OutSysHistoryListResponse {
  content: OutSysHistory[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

export interface OutSys {
  id: number;
  name: string;
  key: string;
  domain: string;
  frDomain: string | null;
  timeExpired: number | null;
  clientId: number;
  active: boolean;
}

export interface OutSysHistory {
  id: number;
  name: string;
  key: string;
  domain: string;
  frDomain: string | null;
  timeExpired: number | null;
  clientId: number;
  active: boolean;
  action: string | null;
  summary: string | null;
  result: string | null;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort;
}

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}
