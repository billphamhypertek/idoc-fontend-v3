export interface LogBusinessListResponse {
  objList: LogBusiness[];
  totalRecord: number;
  totalPage: number;
}

export interface LogBusiness {
  action: string;
  category: string;
  content: string;
  createDate: string;
  ipDevice: string;
  nameDevice: string;
  no: number;
  userName: string;
}
