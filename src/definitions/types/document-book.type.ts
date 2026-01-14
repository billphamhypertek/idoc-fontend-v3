export interface DocumentBook {
  id?: number;
  name: string;
  numberOrSign?: string;
  currentNumber: number;
  startNumber: number;
  bookType: number; // 0: Văn bản đến, 1: Văn bản đi
  year: number;
  active: boolean;
  orgId?: number;
  orgName?: string;
  categoryIds?: number[];
  orgIds?: number[];
  code?: string | number;
  canEdit?: boolean;
  createDate?: number;
  updateDate?: number;
}

export interface DocumentBookSearch {
  name?: string;
  type?: number;
  status?: boolean;
  year?: number;
  page?: number;
  sortBy?: string;
  direction?: string;
  size?: number;
}

export interface DocumentBookSearchResponse {
  content: DocumentBook[];
  totalElements: number;
  totalPages: number;
}

export interface DocumentBookCreateUpdateRequest {
  db: DocumentBook;
  orgIds: number[];
  categoryIds: number[];
}

export interface DocumentBookType {
  name: string;
  code: number;
  documentStatus: Array<{
    key: string;
    value: string;
  }>;
}

export interface SecurityCategory {
  id: number;
  name: string;
  categoryTypeId: number;
}
