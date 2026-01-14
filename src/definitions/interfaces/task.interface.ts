export interface DeadlineWarning {
  id: number;
  name: string;
  numberOfDays: number;
  color: string;
  dayLeft: number;
}

export interface TrackingItem {
  key: number;
  parent: number;
  name: string;
  position: string;
  org: string;
  execute: boolean;
  result: string;
}

export interface TaskButton {
  canTransfer?: string;
  canDone?: string;
  canClose?: string;
  canDelete?: string;
  canEdit?: string;
  canRevoke?: string;
  canTodo?: string;
  canReject?: string;
  canRejectApprove?: string;
  canRevokeFinish?: string;
  canRestore?: string;
  canAddTransfer?: string;
  assigner?: boolean;
  isExecute?: boolean;
}

export interface Task {
  id: number;
  taskName: string;
  codeTask: string;
  userAssignName: string;
  statusName: string;
  startDate: number | string;
  endDate: number | string;
  deadline: number | string;
  progress: number | string;
  important: boolean;
  nodeId: number;
  button: TaskButton;
  userExcutePrimaryName: string | null;
  priorityName: string;
  close: string | null;
  orgName: string | null;
  read: boolean;
  nextNode: string | null;
  description: string;
  parentId: number | null;
  comments: any[];
  assigners: any[];
  results: any[];
  subTasks: any[];
  result: any | null;
  tracking: TrackingItem[];
  type: number | string | null;
  taskCombinationStatus: number;
  deadlineWarning?: DeadlineWarning | undefined;
  userFollows?: any[];
}

export interface RegularDay {
  label: string;
  date: Date;
  dateStr: string;
}
