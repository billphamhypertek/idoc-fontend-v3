export interface SearchTask {
  taskName?: string;
  taskFieldId?: number;
  priorityId?: number[];
  taskType?: any;
  taskStatus?: boolean;
  codeTask?: string;
  startDate?: string;
  endDate?: string;
  startDateNgb?: Date;
  endDateNgb?: Date;
  dayLeft?: string;
  userExcutePrimaryName?: string;
  orgId?: string;
  userStatus?: boolean;
  orgAssignOfTask?: number;
  startReportDate?: string;
  endReportDate?: string;
  startReportDateNgb?: Date;
  endReportDateNgb?: Date;
  nameLeadSign?: string;
  userAssignId?: string;
}

export interface SearchTaskDocument {
  numberOrSign: string;
  docStatusId: any;
  docFieldsId: number | null;
  urgentId: number | null;
  securityId: number | null;
  status: string | null;
  preview: string;
  docType: string;
  orgIssuedId: string;
  createFrom: string;
  createTo: string;
  dateIssuedFrom: string;
  dateIssuedTo: string;
  placeSendId: string;
  dateArrivalFrom: string;
  dateArrivalTo: string;
  dateReceivedFrom: string;
  dateReceivedTo: string;
}

export interface AddAttachmentParams {
  id: number;
  type: number;
  files: File[];
  week: number;
  year: number;
}

export interface MeetingCalendarDto {
  id: number;
  title: string;
  description: string;
  isScheduleAFile?: boolean;
  note?: string;
  startTime: string;
  endTime: string;
  dInList?: any[];
  dOutList?: any[];
  isCabinet?: boolean;
  participants?: string;
  participantsOrg?: any[];
  participantsGroup?: any[];
  attachments?: any[];
}
