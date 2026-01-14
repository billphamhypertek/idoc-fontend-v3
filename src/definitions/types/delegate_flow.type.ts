export interface DelegateFlowListResponse {
  content: DelegateFlow[];
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

export interface DelegateFlow {
  id: number;
  fromPosition: string;
  toPosition: string;
}

export interface AddDelegateFlow {
  from: string;
  to: string;
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
