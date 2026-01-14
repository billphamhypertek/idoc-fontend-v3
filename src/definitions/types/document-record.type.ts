export type Org = { id: string | number; name: string; child?: Org[] };

export interface HosoItem {
  id: string | number;
  orgQLName: string;
  title: string;
  fileCode: string;
  createDate: string;
  maintenanceObj: string;
  createBy: string;
  selected?: boolean;
  receiveBy?: string;
}
