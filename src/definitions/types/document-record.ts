export interface Heading {
  id?: string | number;
  name: string;
  parentId?: string | number | null;
  maintenanceId?: string | number;
  creator?: string;
}

export interface HeadingSearchParams {
  text?: string;
  yearFolders?: string; // Năm hồ sơ
  typeFolders?: string; // Số/ký hiệu
  maintenance?: string | number; // "-1" | id
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

export interface MaintenanceOption {
  id: string | number;
  label: string;
}

export interface SearchInitData {
  yearFolders: (string | number)[];
  typeFolders: string[];
  maintenances: MaintenanceOption[];
}

export interface RawTreeNode {
  id: string | number;
  name: string;
  maintenance?: string;
  creator?: string;
  iconType?: "folder" | "doc";
  type?: string; // đôi khi API trả "FOLDER"/"DOC"
  children?: RawTreeNode[];
}

export interface UiTreeNode {
  id: string | number;
  label: string;
  maintenance?: string;
  creator?: string;
  icon: "folder" | "doc";
  children?: UiTreeNode[];
}

export interface UiRowNode extends UiTreeNode {
  depth: number; // để padding-left cho cột tên
}

export interface WorkProfile {
  id: string | number;
  title: string;
  createDate: string;
  maintenanceObj: string;
  userApprove: string;
}
