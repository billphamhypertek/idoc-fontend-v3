export interface VehicleRequest {
  id: number;
  active?: boolean;
  createDate?: number;
  createBy?: number;

  userCreateInfo?: {
    id: number;
    fullName: string;
    userName: string;
    positionId: number;
    positionName: string;
  };

  reason?: string;
  startLocation?: string;
  pickUpLocation?: string;
  destination?: string;

  startDate?: number | null;
  endDate: number | null;
  expectedStartDate: number | null;
  expectedEndDate: number | null;

  orgId?: number | null;
  orgName?: string;

  lead?: boolean;
  orderPosition?: number;
  isPermissionViewAll?: boolean | null;

  status: string; // ví dụ: "TAO_MOI"
  statusName: string; // ví dụ: "Tạo mới"

  read: boolean;
  currentNode: number;
  type: string | null;

  handleStatus: string; // ví dụ: "DU_THAO"
  handleStatusName: string; // ví dụ: "Dự thảo"
  handleType: string; // ví dụ: "ORG"
  handleTypeName: string; // ví dụ: "Đơn vị"

  passengerQuantity: number;

  action: {
    canFinish: boolean;
    canReject: boolean;
    canRetake: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAccept: boolean;
    canTransfer: boolean;
    canRead: boolean;
    canEditCommand: boolean;
  };

  driverName: string | null;
  driverPhone: string | null;
  licensePlate?: string | null;
  departureDate?: string | null;
  departureTime?: string | null;
  departurePoint?: string | null;
  returnDate?: string | null;
  returnTime?: string | null;
  vehicleType?: string | null;
  organization?: string | null;
}

export interface VehicleListResponse {
  content: VehicleRequest[];
  totalElements: number;
  totalPages: number;
}
export interface User {
  id: number;
  userName: string;
  fullName: string;
  positionName: string;
  parentId?: number | null;
  positionOrder: number;
  lead: boolean;
  breadth: boolean;
  siblings: boolean;
  org: number;
  position: number;
  delegateUsers: {
    id: number;
    userName: string;
    fullName: string;
  };
  orgName: string;
  directionAuthority: boolean;
}

export interface Organization {
  id: number;
  active: boolean;
  clientId: number;
  name: string;
  phone: string;
  address: string;
  level: number;
  parentId: number | null;
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
  idCat: string | null;
  rootId: string | null;
  order: number;
  isLdap: boolean | null;
  code: string | null;
  orgIdSync: string | null;
  orgConfigSign: string | null;
  identifier: string;
  organld: string | null;
  isDefault: boolean | null;
  global: boolean;
  logo: string;
  linkLogo: string;
  children: Organization[] | null;
  adminOffice: any | null;
  isPermissionViewAll: boolean;
}
export interface StartNode {
  id: number;
  orgId: number;
  name: string;
  orgName: string;
  lastNode: boolean;
  allowMultiple: boolean;
  typeDocument: string | null;
}
export interface VehicleDetail {
  id: number;
  active: boolean;
  userCreateName: string;
  orgId: number;
  orgName: string;
  reason: string;
  type: string | null;
  startDate: number | null;
  endDate: number | null;
  expectedStartDate: number;
  expectedEndDate: number;
  startLocation: string;
  pickUpLocation: string;
  destination: string;
  passengerQuantity: number;
  note: string;
  leaderOrgSign: boolean;
  financeDepartmentSign: boolean;
  creatorSign: boolean;
  nodeId: number;
  status: string;
  statusName: string;
  personEnter: string;
  comments: any[]; // Có thể định nghĩa chi tiết hơn nếu cần
  attachments: {
    id: number;
    active: boolean;
    createDate: number;
    createBy: number;
    clientId: number;
    name: string;
    type: string;
    size: number;
    encrypt: boolean;
    usagePlanId: number;
    attachmentType: string | null;
    cmtId: number | null;
    isChanged: boolean | null;
    userId: number | null;
    displayName: string;
  }[];
  action: {
    canFinish: boolean;
    canReject: boolean;
    canRetake: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAccept: boolean;
    canTransfer: boolean;
    canRead: boolean;
    canEditCommand: boolean;
  };
  handleType: string;
  driverName: string | null;
  driverPhone: string | null;
  licensePlate: string | null;
  ticketNumber: string;
  expectedType: string;
  commandDate: number | null;
  distance: number;
  participant: string;
  leadOrg: string;
  signer2: string | null;
  creator: string;
  commandSigner: string | null;
  commandNumber: string | null;
  phone: string;
  ticketDate: number;
  circular: string | null;
  genPlan: boolean;
  numberOrSign?: string | null;
  numberInBook?: string | null;
}
export interface TrackingItem {
  no: number;
  org: string;
  position: string;
  fullName: string;
  action: string;
  category?: string | null;
  createDate: string;
  transferer: string;
}

export interface TrackingResponse {
  totalPage: number;
  totalRecord: number;
  objList: TrackingItem[];
}
export interface OrganizationItem {
  isMainChecked?: boolean;
  isCanChecked?: boolean;
  isSubChecked?: boolean;
  isKnowChecked?: boolean;
  isLeaderChecked?: boolean;
  haveLeader?: boolean;
  id: number;
  name: string;
  type: "organization" | "person";
  hasChildren: boolean;
  level: number;
  parentId?: number;
  children?: OrganizationItem[];
  leaderId?: number;
  leaderName?: string;
  lead?: boolean;
  positionName?: string;
}
export interface TransferDocumentOutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (data: {
    comment: string;
    cmtContent: string;
    main: number[];
    support: number[];
    show: number[];
    orgMain: number[];
    orgSupport: number[];
    orgShow: number[];
    direction: number[];
    deadlineDate: Date | null;
    requestReview: boolean;
    files: File[];
  }) => void;
  selectedRole: { id: number; name: string } | null;
  organizationData: OrganizationItem[];
  disableList: number[];
}
export interface TransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (data: {
    processingContent: string;
    mainProcessors: number[];
    selectedRoleId: number;
  }) => void;
  selectedRole: { id: number; name: string } | null;
  organizationData: OrganizationItem[];
  defaultExpanded?: boolean;
}

export interface ScheduleSlot {
  id?: number;
  destination?: string;
  status?: string;
  vehicle?: string;
  driver?: string;
  time?: string;
}
export interface WeekDaySchedule {
  day: string;
  date: string;
  isToday: boolean;
  morning: ScheduleSlot[];
  afternoon: ScheduleSlot[];
}
export interface PermissionData {
  isPermission: boolean;
}
export interface CalendarData {
  id?: number;
  startTime: string;
  endTime: string;
  title: string;
}

export interface WeekDay {
  dateStr: string;
  date: number;
  amList: ScheduleSlot[];
  pmList: ScheduleSlot[];
}

export interface WeekData {
  objList: WeekDay[];
  frDate: number;
  toDate: number;
  week: number;
  attCalWeek?: any;
}

export interface ScheduleSlot {
  id?: number;
  orgName: string;
  reason: string;
  pickUpLocation: string;
  dropOffLocation: string;
  startTime: string;
  startDate: string; // timestamp or string
  endTime: string;
  endDate: string;
  statusName: string;
  personEnter: string;
  driverName: string;
  driverPhone: string;
  licensePlate: string;
  note: string;
  attachments?: Attachment[];
  showAttachments?: boolean;
  cabinet?: boolean;
}

export interface Attachment {
  name: string;
  encrypt: boolean;
  id: number;
}
// vehicle slot interfaces
export interface CommentSlot {
  id: number;
  approveId: number | null;
  userFullName: string | null;
  userPosition: string | null;
  comment: string | null;
  handleStatus: string | null;
  isToken: boolean | null;
  createDate: number;
  hashComment: string | null;
  attachmentUsagePlans: unknown | null;
  editable: boolean;
  cmtContent: string | null;
  type: string;
  typeName: string | null;
  transfer: boolean;
  handleStatusName: string;
}

export interface AttachmentSlot {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  type: string;
  size: number;
  encrypt: boolean;
  usagePlanId: number;
  attachmentType: string | null;
  cmtId: number | null;
  isChanged: boolean | null;
  userId: number | null;
  displayName: string;
}

export interface VehicleDetailSlot {
  id: number;
  active: boolean;
  userCreateName: string;
  orgId: number;
  orgName: string;
  reason: string;
  type: string;
  startDate: number;
  endDate: number;
  expectedStartDate: number;
  expectedEndDate: number;
  startLocation: string;
  pickUpLocation: string;
  destination: string;
  passengerQuantity: number;
  note: string;
  leaderOrgSign: boolean;
  financeDepartmentSign: boolean;
  creatorSign: boolean;
  nodeId: number;
  status: string;
  statusName: string;
  personEnter: string;
  comments: CommentSlot[];
  attachments: AttachmentSlot[];
  action: string | null;
  handleType: string;
  driverName: string;
  driverPhone: string;
  licensePlate: string;
  ticketNumber: string;
  expectedType: string;
  commandDate: number;
  distance: number;
  participant: string;
  leadOrg: string;
  signer2: string;
  creator: string;
  commandSigner: string;
  commandNumber: string | null;
  phone: string;
  ticketDate: number;
  circular: string;
  genPlan: boolean;
}
export interface VehicleDriver {
  orgId: number;
  licensePlate: string;
  type: string;
  seat: string;
  driverName: string;
  driverPhone: string;
}
export interface LeadInformation {
  id: number;
  fullName: string;
  userName: string | null;
  positionId: number | null;
  positionName: string | null;
  orgId: number | null;
  orgName: string | null;
  lead: boolean;
  orderPosition: number;
  isPermissionViewAll: boolean | null;
}
