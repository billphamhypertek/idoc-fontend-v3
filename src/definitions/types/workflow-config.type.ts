export interface WorkflowConfigListResponse {
  content: WorkflowConfig[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

export interface WorkflowConfig {
  id: number;
  name: string;
  orgId: number;
  orgName: string;
  categoryId: number;
  active: boolean;
  typeWorkflow?: string | null;
}

export interface WorkflowConfigRequest {
  id?: number;
  name: string;
  orgId: number;
  orgName: string;
  categoryId: number;
  active: boolean;
  content: string;
  nodes: NodeWorkflowConfig[];
  org: OrganizationWorkflowConfig | null;
  clientId?: number;
  createBy?: number;
  createDate?: number;
  startNodeIds?: number[];
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort;
}

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface UserInformationWorkflowConfig {
  id: number;
  fullName: string;
  userName: string | null;
  positionId: number | null;
  positionName: string | null;
  orgId: number | null;
  lead: boolean;
  directionAuthority: boolean | null;
  positionOrder: number | null;
}

export interface OrgTypeModel {
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
}

export interface OrganizationWorkflowConfig {
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
  orgTypeModel: OrgTypeModel;
  expiryDate: string | number | null;
  idCat: number | null;
  rootId: number | null;
  order: number;
  isLdap: boolean | null;
  code: string | number | null;
  orgIdSync: number | string | null;
  orgConfigSign: any | null;
  identifier: string;
  organld: number | null;
  isDefault: boolean | null;
  global: boolean;
  logo: string;
  linkLogo: string;
  children: OrganizationWorkflowConfig[] | null;
  adminOffice: boolean;
  isPermissionViewAll: boolean;
}

export interface PositionWorkflowConfig {
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
  isLdap: boolean | null;
  code: string | null;
  authoritys: any | null;
}

export interface PositionWorkflowConfigResponse {
  objList: PositionResponse[];
  totalRecord: number;
  totalPage: number;
}

export interface PositionResponse {
  no: number;
  orgId: number;
  orgName: string;
  positionId: number;
  positionName: string;
  positionOrder: number;
}

export interface ConditionWorkflowConfig {
  active: boolean;
  orgId: number | null;
  org?: OrganizationWorkflowConfig;
  orgName?: string | null;
  nodeId?: number;
  positionId: number | null;
  position?: PositionWorkflowConfig;
  positionName?: string | null;
  userId: number | null;
  allowConfig: boolean;
  forceSameOrg: boolean;
  subHandle?: boolean;
  orgType?: number | null;
  security: boolean;
  name?: string | null;
}

export interface NodeWorkflowConfig {
  id: number;
  ident: string;
  allowMultiple: boolean;
  reviewRequired: boolean;
  importDocBook: boolean;
  forceCloseBranch: boolean | null;
  name: string;
  conditions: ConditionWorkflowConfig[];
  lastNode: boolean;
  calendarReview: boolean;
  signAppendix: boolean;
}
