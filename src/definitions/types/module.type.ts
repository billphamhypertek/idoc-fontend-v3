export interface Module {
  id: number;
  name: string;
  code: string;
  hide: boolean;
  orderNumber: number;
  parentId: number | null;
  subModule: Module[];
  isChecked?: boolean;
  isParent?: boolean;
  moduleId?: number;
}

export interface ModuleDetail {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number | null;
  clientId: number | null;
  name: string | null;
  faIcon: string | null;
  code: string;
  description: string | null;
  isDefault: boolean;
  orderNumber: number | null;
  routerPath: string | null;
  parentId: number | null;
  componentName: string;
  isParent: boolean;
  subModule: ModuleDetail[];
  isChecked: boolean | null;
  expanded: boolean | null;
  hide: boolean | null;
  site: string | null;
}

export interface ModuleTree {
  id: number;
  name: string;
  hide: boolean;
  orderNumber: number;
  subModule: ModuleTree[];
}

export interface FlatModule extends Module {
  level: number;
  parentId: number | null;
  isExpanded: boolean;
  isParent: boolean;
  isChecked: boolean;
}
