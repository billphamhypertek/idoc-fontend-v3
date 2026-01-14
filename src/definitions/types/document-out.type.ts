import type {
  ApiResponse,
  EpochMillis,
  SortDirection,
} from "@/definitions/types/api.type";
import { DocAttachment } from "@/definitions/types/document.type";
import { NgbDate } from "./user.type";

export type DocProcessStatus =
  | "CHO_XU_LY"
  | "DANG_XU_LY"
  | "DA_XU_LY"
  | "HOAN_THANH"
  | (string & {});

export type TypeHandle = 0 | 1 | 2;

export const TYPE_HANDLE_LABEL: Record<
  TypeHandle,
  "Chưa xử lý" | "Đã xử lý" | "Hoàn Thành"
> = {
  1: "Chưa xử lý",
  0: "Đã xử lý",
  2: "Hoàn Thành",
};

export interface DocAction {
  canFinish: boolean;
  canRetake: boolean;
  canReview: boolean;
  canRequestReview: boolean;
  canAsk: boolean;
  [k: string]: boolean | undefined;
}

export interface DocumentOutItem {
  attachments?: DocAttachment[];
  confidential?: boolean | null;
  orgTransfer?: string | null;
  orgReceiveDocument?: string | null;
  bpmnId: number;
  bpmnName: string;

  button?: DocAction;

  allowConfig: boolean;
  bpmnError: boolean;

  canAsk: boolean;
  canDone: boolean;
  canFinish: boolean;
  canOrgTransfer: boolean;
  canRead: boolean;
  canReply: boolean;
  canRequestReview: boolean;
  canRetake: boolean;
  canRetakeDone: boolean;
  canReturn: boolean;
  canReview: boolean;
  canSwitchOrAdd: boolean;
  canTransfer: boolean;
  canDoneInternal: boolean;

  delegatedDoc: boolean;
  delegater: string | null;
  delegatingdDoc: boolean;
  nextHandle: string | null;
  docId: number;
  docStatusName: string;
  pstatus: DocProcessStatus | null;
  pstatusName: string;
  handleTypeStr: string;

  preview: string | null;
  orgExe: string | null;
  important: boolean | null;
  securityName: string | null;
  urgentName: string | null;

  numberArrival: number | null;
  numberArrivalStr: string | null;
  numberSign: string | null;

  dateIssued: EpochMillis | null;
  dateArrival: EpochMillis | null;
  receivedDate: EpochMillis | null;
  deadline: EpochMillis | null;

  progress: string | null;

  node: number | null;
  processId: number | null;
  processNode: number | null;
  processNextNode: number | null;
  processStep: number;

  comment: string | null;
  reason: string | null;
  typeProcess: string | null;
  parentPlaceSend: string | null;
  placeSend: string | null;
  handleStatus?: string;
  read: boolean;
}

export interface DocumentOutListResponse {
  totalPage: number;
  totalRecord: number;
  objList: DocumentOutItem[];
}

export type DocumentOutListApiResponse = ApiResponse<DocumentOutListResponse>;

export interface FindDocByTypeHandleParams {
  text?: string;
  dayLeft?: "" | number | string;
  page: number;
  sortBy?: string;
  direction?: SortDirection;
  size: number;
  typeHandle?: TypeHandle;
  posId?: "" | string | number;
  dateSearch?: number | null;
}

//Interface đánh dấu sao
export type SetImportantResponse = ApiResponse<boolean>;
export interface SetImportantRequest {
  docId: number;
  important: boolean;
}
export interface SearchTaskDocument {
  numberOrSign: string;

  docStatusId: any;

  docFieldsId: number;

  urgentId: number;

  securityId: number;

  status: string;

  preview: string;

  docType: number;

  orgIssuedId: string;

  createFromNgb: NgbDate;

  createFrom: string;

  createToNgb: NgbDate;

  createTo: string;

  dateIssuedFromNgb: NgbDate;

  dateIssuedFrom: string;

  dateIssuedToNgb: NgbDate;

  dateIssuedTo: string;

  placeSendId: string;

  dateArrivalFromNgb: NgbDate;

  dateArrivalFrom: string;

  dateArrivalToNgb: NgbDate;

  dateArrivalTo: string;

  dateReceivedFromNgb: NgbDate;

  dateReceivedFrom: string;

  dateReceivedToNgb: NgbDate;

  dateReceivedTo: string;

  issuedDateToNgb: NgbDate;

  issuedDateFromNgb: NgbDate;
}
export interface SharedFileData {
  cmtContent?: string;
  endDate?: Date | string;
  comment: string;
  hash?: string;
  files: File[];
  objId: number;
  userIds?: number[];
  orgIds?: number[];
  userIdShared: string[];
  allFileNames: string[];
  attType?: string;
  cmtType?: string;
  objType?: string;
  userOrobj?: string;
  checkObjEnc?: boolean; // Flag to mark that check enc of the object to sharing permission when transfer to specific personal
  cmtIdSaved?: number | null; // cmt after saving for rollback
  onlyShareFileObjec?: boolean; // Flag to mark for ONLY check and sharing that encryption enc file (current file you push) of the object (NOT apply for doc encryption file)
}

export type TreeNode = {
  data: any;
  expanded?: boolean;
  children: TreeNode[];
  level?: number;
  parent?: TreeNode;
};

export interface DocAction {
  canAsk: boolean;
  canDone: boolean;
  canReply: boolean;
  canReview: boolean;
  canRequestReview: boolean;
  canReturn: boolean;
  canTransfer: boolean;
  canRetake: boolean;
  canRetakeDone: boolean;
  canSwitchOrAdd: boolean;
  canOrgTransfer: boolean;
  canFinish: boolean;
}

export interface AttachedDocumentSearch {
  preview?: string | null;
  numberOrSign?: string | null;
  docStatusId?: string | null;
  docFieldsId?: string | null;
  urgentId?: string | null;
  securityId?: string | null;
  status?: string | null;
  docType?: string | null;
  orgIssuedId?: string | null;
  createFromNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  createFrom?: string | null;
  createToNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  createTo?: string | null;
  dateIssuedFromNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  dateIssuedFrom?: string | null;
  dateIssuedToNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  dateIssuedTo?: string | null;
  dateReceivedFrom?: string | null;
  dateReceivedTo?: string | null;
  dateReceivedFromNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  dateReceivedToNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  issuedDateFromNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  issuedDateToNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  placeSendId?: string | null;
  dateArrivalFromNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  dateArrivalFrom?: string | null;
  dateArrivalToNgb: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  dateArrivalTo?: string | null;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort;
}

export interface AttachedDocument {
  bookId?: number | null;
  createFrom: number | null;
  createTo: number | null;
  dateIssuedFrom: number | null;
  dateIssuedTo: number | null;
  placeSendId: string | null;
  dateArrivalFrom: number | null;
  dateArrivalTo: number | null;
  dateReceivedFrom: number | null;
  dateReceivedTo: number | null;
  currentDeadline: number | null;
  direction: string | null;
  docFieldsId: number | null;
  docFieldsName: string | null;
  docStatusId: string | null;
  docStatusName: string | null;
  docTypeId: number | null;
  docTypeName: string | null;
  expired: boolean | null;
  id: number | null;
  listReceive: any[] | null;
  mainList: string | null;
  no: number | null;
  numberArrival: number | null;
  numberArrivalStr: string | null;
  numberOrSign: string | null;
  orgIssuedId: string | null;
  orgName: string | null;
  pageSize: number | null;
  parentId: number | null;
  placeReceive: string | null;
  placeSend: string | null;
  preview: string | null;
  securityId: number | null;
  securityName: string | null;
  signerName: string | null;
  sortBy: string | null;
  status: string | null;
  supportList: string | null;
  urgentId: number | null;
  urgentName: string | null;
}

export interface AttachedDocumentResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  sort: Sort;
  pageable: Pageable;
  objList: DocumentOutItem[];
  last: boolean;
  first: boolean;
  numberOfElements: number;
  number: number;
  empty: boolean;
  content: AttachedDocument[];
}
