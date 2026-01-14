export interface ButtonStatus {
  canAsk: boolean;
  canDone: boolean;
  canReply: boolean;
  canReview: boolean;
  canRequestReview: boolean;
  canReturn: boolean;
  canTransfer: boolean;
  canRetake: boolean;
  canRetakeDone: boolean;
  canSwitchOrAdd: boolean;
  canOrgTransfer: boolean;
  createTaskButton: boolean;
  canFinish: boolean;
  canRead: boolean;
  canMoreTime: boolean;
}

export interface CollapseState {
  docInfo: boolean;
  docProcess: boolean;
  listTask: boolean;
  attachments: boolean;
}

export interface NextNode {
  id: number;
  name: string;
  allowMultiple: boolean;
  lastNode?: boolean;
}

export interface UserTransfer {
  id: number;
  name: string;
}

export interface ParentRow {
  stt: number;
  preview: string;
  orgReceive: string;
  statusName: string;
}

export interface ChildrenRow {
  id: number;
  stt: number;
  preview: string;
  orgReceive: string;
  statusName?: string;
  typeOrg: number;
  status: string;
}

export interface ResponseRow {
  id: number;
  stt: number;
  preview: string;
  statusName: string;
}

export interface TaskRow {
  id: number;
  stt: number;
  taskName: string;
  userAssignName: string;
}

export interface ProcessItemData {
  pid?: string;
  frUser?: string | number;
  toUser?: string | number;
  frInfo?: string;
  toInfo?: string;
  delegateInfo?: string;
  handleStatus?: string;
  deadline?: string | number | Date | null;
  action?: string;
  progress?: number;
}

export interface ProcessFlatRow {
  data: ProcessItemData;
  children?: { data: ProcessItemData }[];
  level: number;
  path: string;
  hasChildren: boolean;
}

export type TableColumn<T> = {
  accessorKey?: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  type?: "action";
  renderActions?: (row: T) => React.ReactNode;
};
