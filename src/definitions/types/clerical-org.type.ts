export interface ClericalOrgListResponse {
  content: ClericalOrg[];
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

export interface ClericalOrg {
  userInfo: UserInformation;
  orgIds: number[];
}

export interface UserInformation {
  id: number;
  fullName: string;
  userName: string | null;
  positionId: number | null;
  positionName: string | null;
  orgId: number | null;
  orgName: string | null;
  lead: boolean;
  orderPosition: number | null;
  isPermissionViewAll: boolean | null;
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
