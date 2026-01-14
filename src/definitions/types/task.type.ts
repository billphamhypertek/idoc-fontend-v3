export interface searchTaskParams {
  taskFieldId: number | null;
  priorityId: number[];
  taskType: any | null;
  taskStatus: boolean | null;
  codeTask: string | null;
  startDate: string;
  endDate: string;
  dayLeft: string;
  orgId: string;
  userStatus: boolean | null;
  orgAssignOfTask: number | null;
  startReportDate: string | null;
  endReportDate: string | null;
  nameLeadSign: string;
  userAssignId: string | null;
}
