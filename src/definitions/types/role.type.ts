export interface RoleManagement {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  isDefault: boolean | null;
  modules: RoleFunction[];
  cabinet: string | null;
}

export interface RoleFunction {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  faIcon: string | null;
  code: string | null;
  description: string | null;
  isDefault: boolean;
  orderNumber: number;
  routerPath: string | null;
  parentId: number | null;
  componentName: string | null;
  isParent: boolean | null;
  subModule: RoleFunction[] | null;
  isChecked: boolean | null;
  expanded: boolean | null;
  hide: boolean | null;
  site: string | null;
}

export interface NewRole {
  name: string;
  active: boolean;
}
