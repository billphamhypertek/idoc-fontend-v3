import { UserAuthority } from "./auth.type";

export interface CategoryCode {
  id: number;
  active: boolean;
  clientId: number;
  name: string;
  sign: string | null;
  order: number;
  categoryTypeId: number;
  isDefault: boolean | null;
  isBreadth: boolean | null;
  isSiblings: boolean | null;
  isLeadership: boolean | null;
  syncCode: string | null;
  isLdap: boolean | null;
  code: string | null;
  authoritys: UserAuthority[] | null;
}

export interface MapCategory {
  catId: number;
  active: boolean;
  clientId: number;
  createBy: number;
  createDate: number;
  id: number;
  name: string;
}
export interface Category {
  id: number;
  name: string;
  code: string;
  active: boolean;
  order: number;
  categoryTypeId: number;
  categoryTypeCode?: string;
  categoryTypeName?: string;
}

export interface CategorySearchResponse {
  objList: Category[];
  totalRecord: number;
  totalPages: number;
  size: number;
  number: number;
  nextOrder: number;
}

export interface CategoryCreateUpdateRequest {
  name: string;
  active: boolean;
  order: number | null;
  categoryTypeId: number;
}

export interface CategorySearchParams {
  name?: string;
  id?: string;
  active?: boolean;
  categoryTypeId?: number;
  page?: number;
  sortBy?: string;
  direction?: string;
  size?: number;
}
