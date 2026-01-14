import { AttachedDocument } from "./document-out.type";

export interface TaskAssignListResponse {
  objList: TaskAssign[];
  totalRecord: number;
  totalPage: number;
}

export interface TaskAssign {
  id: number;
  taskName: string | null;
  codeTask: string | null;
  userAssignName: string | null;
  statusName: string | null;
  startDate: number;
  endDate: number;
  progress: number;
  important: boolean;
  nodeId: number;
  button: TaskAssignButton;
  userExcutePrimaryName: string | null;
  priorityName: string | null;
  close: boolean;
  orgName: string | null;
  read: boolean;
  nextNode: number | null;
  description: string | null;
  parentId: number | null;
  comments: any[];
  assigners: any[];
  results: any[];
  subTasks: SubTask[];
  result: any;
  tracking: TaskTracking[];
  type: string;
  userFollows?: any[];
  level: number | null;
}

export interface TaskAssignButton {
  canTransfer: string;
  canDone: string;
  canClose: string;
  canDelete: string;
  canEdit: string;
  canRevoke: string;
  canTodo: string;
  canReject: string;
  canRejectApprove: string;
  canRevokeFinish: string;
  canRestore: string;
  canAddTransfer: string;
  assigner: boolean;
  isExecute: boolean;
}

export interface TaskTracking {
  key: number;
  parent: number;
  name: string;
  position: string;
  org: string;
  execute: boolean;
  result: string;
}

export interface SubTask {
  id: number;
  taskName: string;
  codeTask: string;
  userAssignName: string;
  statusName: string;
  startDate: number;
  endDate: number;
  progress: number;
  important: boolean;
  nodeId: number;
  button: TaskAssignButton;
  userExcutePrimaryName: string | null;
  priorityName: string;
  close: boolean;
  orgName: string | null;
  read: boolean;
  nextNode: number | null;
  description: string;
  parentId: number | null;
  comments: any[];
  assigners: any[];
  results: any[];
  subTasks: SubTask[];
  result: any;
  tracking: TaskTracking[];
  type: string;
  userFollows?: any[];
  level: number | null;
}

export interface OrgNode {
  id: string;
  name: string;
  parentId?: string | null;
  type: "ORG" | "USER";
  positionName?: string;
  description?: string | null;
  orgName?: string;
  lead?: boolean;
  directionAuthority?: boolean;
  userName?: string | null;
  isChecked?: boolean;
  isExcute?: boolean;
  isCombination?: boolean;
  disabled?: boolean;
  children?: OrgNode[];
}

export interface UserFollower {
  user: {
    id?: string | number;
    description?: string | null;
    isExcute?: boolean;
    isCombination?: boolean;
    fullName?: string | null;
    orgName?: string | null;
    parentId?: number | null;
    positionName?: string | null;
  };
  taskId?: string | number | null;
  userId?: string | number;
  fullName?: string | null;
  positionName?: string | null;
  orgName?: string | null;
  description?: string | null;
  isExcute?: boolean;
  isCombination?: boolean;
  parentId?: number | null;
  type?: string | number;
  status?: number;
  id?: string | number;
}

export interface FollowerTask {
  id: number;
  fullName: string;
  positionName?: string;
  orgName?: string;
}

export interface Node {
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullName: string;
  positionName: string;
  orgName: string;
  orgId?: number;
  disabled?: boolean;
}

export interface Organization {
  id: number | string;
  name: string;
  parentId?: number | null;
  type: "ORG" | "USER";
  isChecked?: boolean;
  isExcute?: boolean;
  isCombination?: boolean;
  disabled?: boolean;
  childNum?: number;
  children?: Organization[];
  positionName?: string;
  description?: string;
  lead?: boolean;
  orgName?: string;
}

export interface TaskExecute {
  id?: number;
  userId?: number;
  orgId?: number;
  user?: User;
  org?: Organization;
  group?: any;
  groupId?: number;
  type: number; // 0: user, 1: group, 2: org
  isExcute: boolean;
  isCombination: boolean;
  status: number;
  description?: string;
  isEdit?: boolean;
}

export interface TaskExecuteListResponse {
  objList: TaskExecuteResponse[];
  totalRecord: number;
  totalPage: number;
}

export interface TaskExecuteResponse {
  approveStatus: number;
  attachments: any[] | null;
  codeTask: string;
  complexityId: number;
  complexityName: string;
  createDate: number;
  description: string | null;
  endDate: number;
  fieldName: string;
  id: number;
  important: boolean;
  jobAssignerId: number[];
  listDocOutReply: any[] | null;
  nextNode: number | null;
  nodeId: number | null;
  orgId: number;
  parentId: number | null;
  parentName: string;
  priorityId: number;
  priorityName: string;
  progress: number;
  startDate: number;
  status: number;
  subTask: any | null;
  subTasks: any[];
  taskCombination: any | null;
  taskCombinationStatus: number;
  taskDocument: any | null;
  taskExecute: any | null;
  taskFieldId: number;
  taskHistorys: any[];
  taskName: string;
  taskRelateds: any[];
  userAssignId: number;
  userAssignName: string;
  userExcutePrimaryId: number;
  userFollows: any[] | null;
  weList: any | null;
  weListId: number[];
  taskRelatedId: number | null;
}

export interface TaskAssignCreate {
  userAssign: any;
  startDateNgb: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDateNgb: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  userExcute: {
    birthdayTmp: {
      year: number | null;
      month: number | null;
      day: number | null;
    };
    positionModel: any;
  };
  taskDocument: TaskDocument[];
  priority: any;
  field: any;
  taskExecute: any[];
  docAtt: any[];
  attachments: any[];
  listDocOutReply: any[];
  weListId: any[];
  subTasks: TaskExecuteResponse[];
  userFollows: UserFollower[];
  approveStatus: number;
  status: number;
  taskFieldId: number;
  priorityId: number;
  progress: number;
  taskName: string;
  description: string;
  parent: any[];
  parentId: number | null;
  taskRelateds: TaskExecuteResponse[];
  complexityId: number | null;
  startDate: string | null;
  endDate: string | null;
  jobAssignerId: number[];
  userAssignId: number;
  orgId: number | null;
}

export interface TaskDocument {
  docId: number | null;
  typeDocument: boolean;
  documentIn: AttachedDocument;
}

export interface FileLike {
  id?: string | number;
  name: string;
  displayName?: string;
  type?: string;
  size?: number;
  lastModified?: number;
  lastModifiedDate?: object;
  encrypt?: boolean;
  oEncrypt?: boolean;
  docId?: string | number;
  template?: boolean;
  file?: File;
}
