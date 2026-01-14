export interface Delegate {
  id?: number;
  numberOrSign: string;
  fromUserId: number;
  toUserId: number;
  fromUserName?: string;
  toUserName?: string;
  startDate: string | Date | null;
  endDate: string | Date | null;
  attachments?: DelegateAttachment[];
  active?: boolean;
}

export interface DelegateAttachment {
  id?: number;
  name: string;
  displayName?: string;
  size?: number;
  url?: string;
}

export interface DelegateUser {
  id: number;
  fullName: string;
}

export interface DelegateListResponse {
  content: Delegate[];
  totalElements: number;
  totalPages?: number;
  page?: number;
  size?: number;
}

export interface DelegateSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  q?: string;
  numberOrSign?: string;
  fromUser?: string | number;
  toUser?: string | number;
  startDate?: string;
  endDate?: string;
  isShowAll?: boolean | string; // API accepts both 'false' string and boolean
}
