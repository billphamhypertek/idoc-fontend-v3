// Types for API responses

// Calendar/Schedule types
export interface CalendarEvent {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  title: string;
  address: string;
  orgId: number;
  orgModel: {
    id: number;
    active: boolean;
    clientId: number;
    name: string;
    phone: string;
    address: string;
    level: number;
    parentId: number;
    email: string;
    shortcut: string | null;
    note: string | null;
    orgType: number;
    orgTypeModel: {
      id: number;
      active: boolean;
      clientId: number;
      name: string;
      sign: string | null;
      order: number;
      categoryTypeId: number;
      isDefault: boolean;
      isBreadth: boolean;
      isSiblings: boolean;
      isLeadership: boolean;
      syncCode: string | null;
      isLdap: boolean;
      code: string;
      authoritys: any | null;
    };
    expiryDate: string | null;
    idCat: number | null;
    rootId: number | null;
    order: number;
    isLdap: boolean | null;
    code: number | string | null;
    orgIdSync: number | string | null;
    orgConfigSign: any | null;
    identifier: string;
    organld: number | null;
    isDefault: boolean | null;
    global: boolean;
    logo: string;
    linkLogo: string;
    children: any | null;
    adminOffice: boolean;
    isPermissionViewAll: boolean;
  };
  description: string;
  startTime: string;
  endTime: string;
  publishBy: number;
  status: string;
  registerBan: boolean;
  comment: string;
  ingredient: any | null;
  note: string | null;
  participants: string;
  participantsGuest: string;
  participantsOrg: any | null;
  participantsGroup: any | null;
  roomId: number | null;
  attachments: any | null;
  attCalWeek: any | null;
  isShowAttachments: boolean | null;
  taskList: any[];
  showApproveBt: boolean;
  showRejectBt: boolean;
  showEditBt: boolean;
  showCancelBt: boolean;
  showDelBt: boolean;
  parentOrgName: string | null;
  createUserName: string | null;
  isCabinet: boolean | null;
  isScheduleAFile: boolean | null;
  scheduleFileName: string | null;
  meetingCalendar: boolean;
  unitCalendar: boolean;
  startTimeStr: string;
  endTimeStr: string;
  statusName: string;
  dInList: any[];
  dOutList: any[];
  // Add computed properties for compatibility
  time?: string;
  location?: string;
}

// Document types
export interface DocumentAttachment {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  type: string;
  size: number;
  encrypt: boolean;
  documentId?: number;
  atmType?: string;
  displayName: string;
}

export interface IncomingDocument {
  dateArrival: number;
  dateIssued: number;
  numberArrival: number;
  receivedDate: number;
  numberArrivalStr: string | null;
  docStatusName: string;
  preview: string;
  attachments: DocumentAttachment[];
  securityName: string;
  urgentName: string;
  reason: string | null;
  deadline: string | null;
  numberSign: string;
  placeSend: string | null;
  orgExe: string;
  docId: number;
  nextHandle: string | null;
  delegater: string | null;
  progress: string | null;
  comment: string | null;
  processId: number;
  important: string | null;
  processNode: number;
  processStep: number;
  bpmnId: string | null;
  bpmnName: string | null;
  node: number;
  read: boolean;
  button: any | null;
  processNextNode: string | null;
  typeProcess: string;
  parentPlaceSend: string | null;
  pstatus: string;
  pstatusName: string;
  delegatedDoc: boolean;
  delegatingdDoc: boolean;
  handleTypeStr: string;
  canDoneInternal: boolean;
}

export interface OutgoingDocument {
  docId: number;
  important: string | null;
  processId: number;
  numberOrSign: string | null;
  docType: {
    id: number;
    name: string;
    categoryTypeId: number;
  };
  docFieldId: number | null;
  preview: string;
  userEnter: {
    id: number;
    userName: string;
    fullName: string;
    directionAuthority: boolean;
  };
  createDate: number;
  handleUser: {
    id: number;
    userName: string;
    fullName: string;
    directionAuthority: boolean;
  };
  handleDate: number;
  security: {
    id: number;
    name: string;
    categoryTypeId: number;
  };
  urgent: {
    id: number;
    name: string;
    categoryTypeId: number;
  };
  status: string;
  nodeId: number;
  attachments: DocumentAttachment[] | null;
  signerIds: number[];
  delegateUser: {
    id: number | null;
    userName: string | null;
    fullName: string;
    directionAuthority: boolean;
  };
  delegatedUser: {
    id: number | null;
    userName: string | null;
    fullName: string;
    directionAuthority: boolean;
  };
  docStatus: string;
  numberInBook: string | null;
  read: boolean;
  docStatusName: string;
  orgExe: string;
}

export interface DocumentDashboardResponse {
  documentIn: IncomingDocument[];
  documentOut: OutgoingDocument[];
}

// Task types
export interface TaskButton {
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
  button: TaskButton;
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
  subTasks: any[];
  result: any;
  tracking: TaskTracking[];
  type: string;
}

export interface AssignedTask {
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
  button: TaskButton;
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
}

export interface AssignedTasksResponse {
  totalPage: number;
  totalRecord: number;
  objList: AssignedTask[];
}

export interface TaskToProcess {
  // Define based on /api/task/list/main/notyet response
  // From the response, it's a paginated response similar to vehicle
  content: any[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  number: number;
  sort: any;
  size: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Statistics types
export interface DocumentStats {
  DOC_IN_MAIN: number;
  DOC_IN_INTERNAL: number;
  DOC_IN_SUPPORT: number;
  DOC_IN_KNOW: number;
  DOC_IN_DIRECTION: number;
  DOC_IN_OPINION: number;
  DOC_IN_WAIT_RECEIVE: number;
  DRAFT_LIST: number;
  DRAFT_HANDLE: number;
  DRAFT_ISSUED: number;
  DOCUMENT_IN_LIST: number;
  TASK_MAIN: number;
  TASK_SUPPORT: number;
  TASK_ASSIGN: number;
  DOC_INTERNAL_WAITING: number;
  DOC_INTERNAL_DOING: number;
  DOC_INTERNAL_RETURN: number;
  DOC_INTERNAL_PUBLISH: number;
  DOC_INTERNAL_REGISTER: number;
  DOC_INTERNAL_APPROVE: number;
  DOC_INTERNAL_PENDING: number;
  WORD_EDITOR: number;
  DOC_IN_DELEGATE: number;
  DOC_OUT_DELEGATE: number;
  VEHICLE_USAGE_PLAN_TICKET: number;
  VEHICLE_USAGE_PLAN_HANDLE: number;
}

export interface Stats {
  incomingDocuments: {
    total: number;
    mainProcess: number;
  };
  outgoingDocuments: {
    total: number;
    waitingProcess: number;
  };
  tasks: {
    total: number;
    assigned: number;
  };
}

export interface ApiResponse<T> {
  resultCode: number;
  message: string;
  responseTime: number;
  data: T;
}

// Module types for menu
export interface ModuleItem {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  code?: string;
  componentName?: string;
  faIcon?: string;
  hide: boolean;
  isChecked?: boolean;
  isDefault: boolean;
  isParent: boolean;
  orderNumber: number;
  parentId?: number;
  routerPath?: string;
  site?: string;
  subModule?: ModuleItem[];
}
