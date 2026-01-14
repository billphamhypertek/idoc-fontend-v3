export enum DocumentType {
  VAN_BAN_DI = "VAN_BAN_DI",
  VAN_BAN_DEN = "VAN_BAN_DEN",
  // Thêm các loại khác nếu cần
}

export type SearchResult = {
  id: number;
  code: string;
  name: string;
  description: string;
  createDate: string;
  type: DocumentType | string;
};
export interface LoginRequest {
  userName: string;
  password: string;
  rememberPassword: string;
  serialToken: string;
}

export interface LoginResponse {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  moduleList: ModuleNode[];
}

export interface TokenInfo {
  accessToken: string;
  timeExprise: number;
  serialToken?: string;
  SerialNumber?: string;
}

export interface UserInfo {
  id?: number;
  active: boolean;
  clientId: number;
  fullName: string;
  userName: string;
  birthday: number;
  email: string;
  phone: string;
  gender: number;
  indentity: string;
  title: string;
  photo: string;
  signature: string;
  phoneCA: string | null;
  phoneCAProvider: string | null;
  serialToken: string | null;
  startTimeToken: string;
  expiredTimeToken: string;
  nameToken: string;
  orgToken: string;
  employeeId: number | null;
  employeeCode: string | null;
  expiryPass: number | null;
  roles: Role[];
  authorize: ModuleNode[];
  org: number;
  position: number;
  additionalPositions: number[];
  orgModel: OrgModel;
  positionModel: PositionModel;
  lead: boolean;
  defaultRole: number;
  currentRole: number;
  address: string | null;
  authoritys: UserAuthority[];
  cecretarys: unknown[];
  orgParent: unknown | null;
  cert: string;
  rememberPassword: boolean;
  forgetPassword: boolean;
  global: boolean | null;
  ldap: boolean;
}

export interface ModuleNode {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  faIcon: string;
  code: string;
  description: string | null;
  isDefault: boolean;
  orderNumber: number;
  routerPath: string;
  parentId: number | null;
  componentName: string | null;
  isParent: boolean;
  subModule: ModuleNode[];
  isChecked: boolean | null;
  expanded: boolean;
  hide: boolean;
  site: string | null;
}

export interface Role {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  isDefault: boolean;
  modules: ModuleNode[];
}

export interface PositionModel {
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
  isLeadership: boolean | null;
  syncCode: string | null;
  isLdap: boolean | null;
  code: string | null;
  authoritys: UserAuthority[] | null;
}

export interface OrgModel {
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
  orgTypeModel: OrgTypeModel;
  expiryDate: string | number | null;
  idCat: number | null;
  rootId: number | null;
  order: number;
  isLdap: boolean;
  code: number | string;
  orgIdSync: number | string | null;
  orgConfigSign: OrgConfigSign;
  identifier: string;
  organld: number;
  isDefault: boolean | null;
  global: boolean;
  logo: string;
  linkLogo: string;
  children: unknown[] | null;
  adminOffice: unknown | null;
  isPermissionViewAll: boolean;
}

export interface OrgConfigSign {
  id: number;
  orgId: number;
  place: string;
  tl: string;
  userId: number;
}

export interface OrgTypeModel {
  id: number;
  active: boolean;
  clientId: number;
  name: string;
  sign: string | null;
  order: number;
  categoryTypeId: number;
  isDefault: boolean | null;
  isBreadth: boolean | null;
  isSiblings: boolean | null;
  isLeadership: boolean | null;
  syncCode: string | null;
  isLdap: boolean | null;
  code: string | number | null;
  authoritys: UserAuthority[];
}

export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
export interface UserAuthority {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  userId: number;
  authority: string;
  positionId: number | null;
}
