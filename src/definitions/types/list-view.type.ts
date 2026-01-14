export type DashboardFilter = 0 | 1 | 2;
export type EmployeeFilter = "all" | "overdue" | "progress";

export interface ListViewTask {
  taskId: number;
  taskName: string;
  assignerId?: number | string;
  assignerName?: string;
  startDate?: number | string | Date;
  endDate?: number | string | Date;
  status: number;
  progress?: number | string;
  important?: boolean;
  overdue?: boolean;
  execute?: string;
  executeId?: number;
  combination?: string;
  isEditingProcessor?: boolean;
  selectedProcessor?: number;
  listUser?: Array<{ id: number; fullName: string }>;
}

export interface ColumnGroup {
  status: number;
  tasks: ListViewTask[];
}

export interface ListViewOrg {
  handlerId: number;
  handlerName: string;
  count?: number;
  progress?: number;
  level?: number;
  columns: ColumnGroup[];
}

export interface ListViewEmployee {
  handlerId: number | string;
  handlerName: string;
  orgName?: string;
  count?: number;
  overdueCount?: number;
  completedCount?: number;
  inProgressCount?: number;
  tasks?: ListViewTask[];
  expanded?: boolean;
  filter?: EmployeeFilter;
}

export interface ListViewProps {
  isDashboard?: boolean;
  selectedUsers?: any;
  textSearch?: any;
  idDonvi?: number | number[] | null;
  orgsList?: any[];
  callBackClickList?: (type: number, list: any, org?: any) => void;
  setIsDashboard?: (isDashboard: boolean) => void;
}

export const STATUS_CLASSNAME_MAP: Record<number, string> = {
  0: "status-new",
  1: "status-progress",
  2: "status-reject",
  3: "status-waiting",
  4: "status-done",
  5: "status-cancel",
};
