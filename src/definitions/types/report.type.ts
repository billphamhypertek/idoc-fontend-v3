export interface DailyReportDataInit {
  reportType: string;
  type: string;
  year: number;
  week: number;
  confirmNumber: number;
  title: string;
  organization: number;
  positionTitleId: number;
  signerId: number;
  placeReceive: number;
  startDate: any;
  endDate: any;
  workDone: any;
  expected: any;
  requestAttach: any;
}

export interface SearchDailyReport {
  reportType: string;
  type: string;
  year?: number; // Optional - not used in all APIs
  organization: string | number;
  startDate?: string;
  endDate?: string;
  status?: number; // 1 = unconfirmed, 2 = confirmed
}

export interface ReportTab {
  id: string;
  title: string;
  disabled: boolean;
  data: any[];
}

export interface SearchField {
  typeReport: string;
  receivedDate: string;
  confirmationDate: string;
  page: number;
  unConfirm: number;
  confirm: number;
  pageSize: number;
  direction: string;
  sortBy: string;
  currentTab: string;
}

export interface Paging {
  itemsPerPage: number;
  currentPage: number;
  totalRecord: number;
}

export enum TabNames {
  BAO_CAO_CHUA_XAC_THUC = "reportNotConfirmTab",
  BAO_CAO_DA_XAC_THUC = "reportConfirmedTab",
  DANH_MUC_NHAN_DE = "categoryTitleTab",
  DANH_MUC_NGUOI_KY = "categorySignerTab",
}

export enum REPORT_TYPE {
  REPORT_GOV = "BAO_CAO_CHINH_QUYEN",
  REPORT_PAR = "BAO_CAO_DANG",
}
