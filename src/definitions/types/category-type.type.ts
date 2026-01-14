export interface CategoryType {
  id: number;
  name: string;
  code: string;
  active: boolean;
  superAdmin: boolean;
}

export interface CategoryTypeSearchResponse {
  objList: CategoryType[];
  totalRecord: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CategoryTypeCreateUpdateRequest {
  name: string;
  code: string;
  active: boolean;
  superAdmin?: boolean;
}
