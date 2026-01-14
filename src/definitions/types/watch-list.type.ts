export interface UserAuthority {
  authority: string;
}

export interface UserLogin {
  org: number;
  orgModel: {
    parentId: number;
    name: string;
    orgTypeModel: {
      name: string;
    };
  };
  authoritys: UserAuthority[];
}

export interface UserAction {
  canDelete: boolean;
  canUpdate: boolean;
  canAdd: boolean;
  approveInUnit: boolean;
  approveInBan: boolean;
  createInBan: boolean;
}

export interface WatchListResponse {
  id: number;
  agency: string;
  day: string;
  date: string;
  fullName: string;
  unit: string;
  position: string;
  role: string;
  phone: string;
  note: string;
  status: string;
  workSchedules?: any[];
  orgId: string;
  departmentId?: string;
}

export interface WatchListParams {
  orgId: number | null;
  fromDate: string;
  toDate: string;
  statuses: string;
  leader: boolean;
}

export interface WatchListSearch {
  orgId: number | null;
  date: string | null;
  name: string | null;
  departmentId: number | null;
  position: string | null;
  role: string | null;
  phone: string | null;
  note: string | null;
}
