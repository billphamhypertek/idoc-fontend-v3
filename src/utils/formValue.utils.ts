import { WatchItemFormData } from "@/schemas/watch-item.schema";
import { getCurrentWeekNumber } from "./datetime.utils";
import { DailyReportFormData } from "@/schemas/daily-report.schema";
import { Constant } from "@/definitions/constants/constant";

export const getDefaultFormValues = (now: Date) => ({
  content: "",
  participants: "",
  location: "",
  notes: "",
  startDate: now,
  startHour: now.getHours().toString().padStart(2, "0"),
  startMinute: now.getMinutes().toString().padStart(2, "0"),
  endDate: new Date(now.getTime() + 60 * 60 * 1000),
  endHour: (now.getHours() + 1).toString().padStart(2, "0"),
  endMinute: now.getMinutes().toString().padStart(2, "0"),
  participantsGuest: "",
  participantsOrg: [] as any[],
  participantsGroup: [] as any[],
  registerBan: false,
});

export const getDefaultFormValuesWatchList = (): WatchItemFormData => ({
  role: "",
  org: "",
  fullName: "",
  department: "",
  position: "",
  phone: "",
});

export const getFormDefaultValues = (data?: any) => ({
  // Basic task information
  id: data?.id || 0,
  active: data?.active ?? true,
  taskName: data?.taskName || "",
  startDate: data?.startDate ? new Date(data.startDate) : new Date(),
  endDate: data?.endDate ? new Date(data.endDate) : new Date(),
  progress: data?.progress || 0,
  description: data?.description || "",
  taskFieldId: data?.taskFieldId || 0,
  complexityId: data?.complexityId || 0,
  priorityId: data?.priorityId || 0,
  status: data?.status || 0,
  orgId: data?.orgId || 0,
  userAssignId: data?.userAssignId || 0,
  important: data?.important || 0,
  userExcutePrimaryId: data?.userExcutePrimaryId || 0,
  approveStatus: data?.approveStatus || 0,
  parentId: data?.parentId || 0,
  codeTask: data?.codeTask || "",
  taskCombinationStatus: data?.taskCombinationStatus || 0,
  nodeId: data?.nodeId || "",

  // User and organization objects
  userAssign: data?.userAssign || {},
  userExcute: data?.userExcute || {},
  priority: data?.priority || {},
  field: data?.field || {},
  parent: data?.parent || {},

  // Date objects for ngb-datepicker
  startDateNgb: data?.startDateNgb || {},
  endDateNgb: data?.endDateNgb || {},

  // Arrays and collections
  taskDocument: data?.taskDocument || [],
  taskExecute: data?.taskExecute || [],
  docAtt: data?.docAtt || [],
  taskRelateds:
    data?.taskRelateds?.map((item: any) => ({
      ...item,
      id: item?.taskRelatedId,
    })) || [],
  attachments: data?.attachments || [],
  listDocOutReply: data?.listDocOutReply || [],
  weListId: data?.weListId || [],
  jobAssignerId: data?.jobAssignerId || [],
  subTasks: data?.subTasks || [],
  userFollows: data?.userFollows || [],

  // Warning and deadline
  deadlineWarning: data?.deadlineWarning || null,

  // Display names
  parentName: data?.parentName || "",
  userAssignName: data?.userAssignName || "",

  // Form specific fields for UI
  priorityName: data?.priorityName || "",
  complexityName: data?.complexityName || "",
  fieldName: data?.fieldName || "",
  assigneeName: data?.userAssignName || "",
  leaderName: data?.userAssignName || "",
  actualStartTime: data?.actualStartTime || "",
  actualEndTime: data?.actualEndTime || "",
  executorName: data?.userAssignName || "",
  tags: data?.tags || [],
  parentTask: data?.parent || null,
  relatedTasks: data?.taskRelateds || [],
  selectedDocs: data?.taskDocument || [],
});

export const defaultSearchTaskParams = {
  taskFieldId: null,
  priorityId: [],
  taskType: null,
  taskStatus: false,
  codeTask: null,
  startDate: "",
  endDate: "",
  dayLeft: "",
  orgId: "",
  userStatus: null,
  orgAssignOfTask: null,
  startReportDate: null,
  endReportDate: null,
  nameLeadSign: "",
  userAssignId: null,
};

export const getDefaultFormValuesDailyReport = (): DailyReportFormData => ({
  title: "",
  type: "WEEK",
  year: new Date().getFullYear().toString(),
  week: getCurrentWeekNumber().toString(),
  startDate: "",
  endDate: "",
  organization: "",
  position: "",
  signer: "",
  recipients: "",
  confirmNumber: "",
  workDone: "",
  expected: "",
  requestAttach: "",
});

export const getDefaultRetakeInSearchField = () => ({
  quickSearchText: "",
  preview: "",
  numberArrival: "",
  numberOrSign: "",
  startIssued: null as Date | null,
  endIssued: null as Date | null,
  orgIssuedName: "",
  docTypeId: "",
  userEnter: "",
  currentTab: "",
  page: 1,
  pageSize: 10,
  sortBy: "",
  direction: "DESC",
  isAdvanceSearch: false,
});

export const getDefaultRetakeOutSearchField = () => ({
  quickSearchText: "",
  preview: "",
  numberArrival: "",
  numberOrSign: "",
  startIssued: null as Date | null,
  endIssued: null as Date | null,
  orgIssuedName: "",
  currentTab: "",
  page: 1,
  pageSize: 10,
  sortBy: "",
  direction: "DESC",
  isAdvanceSearch: false,
});

export const getDefaultOrganizationFormValues = (
  data?: any,
  isAddRootOrg: boolean = false
) => ({
  id: data?.id || "",
  identifier: data?.identifier || "",
  name: data?.name || "",
  parentId: isAddRootOrg ? "" : data?.parentId || "",
  orgType: data?.orgType ? String(data.orgType) : "",
  phone: data?.phone || "",
  email: data?.email || "",
  address: data?.address || "",
  active:
    data?.active !== undefined ? (data.active ? "true" : "false") : "true",
  order: data?.order || "",
  adminOffice: data?.adminOffice || false,
  global: data?.global || false,
  isPermissionViewAll: data?.isPermissionViewAll || false,
  logo: data?.logo || "",
  linkLogo: data?.linkLogo || "",
  level: data?.level || 0,
});

export const getDefaultOrganizationSearchValues = () => ({
  name: "",
  orgType: "",
  email: "",
  address: "",
  phone: "",
  active: "0",
  parentId: undefined as string | undefined,
});

export const getDefaultDelegateInSearchField = () => ({
  quickSearchText: "",
  docTypeId: "",
  docFieldsId: "",
  docStatusId: "",
  preview: "",
  dayLeft: "",
  isAdvanceSearch: false,
  currentTab: "",
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  pageSize: Constant.PAGING.SIZE,
});

export const getDefaultDelegateOutSearchField = () => ({
  startDate: null as Date | null,
  endDate: null as Date | null,
  docTypeId: "",
  docFieldsId: "",
  numberOrSign: "",
  preview: "",
  orgName: "",
  userEnter: "",
  currentTab: "",
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  pageSize: Constant.PAGING.SIZE,
  isAdvanceSearch: false,
  quickSearchText: "",
});

export const defaultKPISearchField = () => ({
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  pageSize: Constant.PAGING.SIZE,
  taskName: "",
  priorityId: "",
  userId: "all",
  orgId: "all",
  startDateNgb: null as Date | null,
  endDateNgb: null as Date | null,
});

export const getDefaultRoomSearchField = () => ({
  name: "",
  address: "",
  quantity: null as number | null,
  acreage: null as number | null,
  description: "",
});

export const getDefaultOrgSearchField = () => ({
  address: "",
});
