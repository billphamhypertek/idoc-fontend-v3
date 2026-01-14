export interface DocumentInListResponse {
  content: DocumentIn[];
  totalElements: number;
  totalPages: number;
}

export interface DocumentIn {
  docId: number;
  important: boolean;
  processId: number;
  numberOrSign: string | null;
  docType: CategoryRef; // { id, name, categoryTypeId }
  docFieldId: number | null;
  preview: string;
  userEnter: UserRef;
  createDate: number; // epoch ms
  handleUser: UserRef;
  handleDate: number; // epoch ms
  security: CategoryRef;
  urgent: CategoryRef | null;
  status: string; // e.g. "Chờ cho ý kiến"
  nodeId: number;
  attachments: DocAttachment[];
  signerIds: number[];
  delegateUser: NullableUserRef;
  delegatedUser: NullableUserRef;
  docStatus: string; // e.g. "DANG_XU_LY"
  numberInBook: number | null;
  read: boolean;
  docStatusName: string; // e.g. "Đang xử lý"
  orgExe: unknown | null;
}

export interface CategoryRef {
  id: number;
  name: string;
  categoryTypeId: number;
}

export interface UserRef {
  id: number;
  userName: string;
  fullName: string;
  directionAuthority: boolean;
}

export interface NullableUserRef {
  id: number | null;
  userName: string | null;
  fullName: string;
  directionAuthority: boolean;
}

export interface DocAttachment {
  id: number;
  active: boolean;
  createDate: string;
  createBy: string;
  clientId: number;
  name: string;
  type?: string;
  size?: number;
  displayName?: string;
  encrypt?: boolean;
  attachmentType?: string | null;
  cmtId?: number | null;
  isChanged?: boolean | null;
  userId?: number | null;
  oEncrypt: boolean;
  template: boolean;
  download: boolean;
  isIssued: boolean;
  docId: number;
}
export interface DocCheckAction {
  docId: number;
  canRetake: boolean;
  canFinish: boolean;
  canConsult: boolean;
  importDocBook: boolean;
  canReject: boolean;
}
export interface ReturnDocumentInUser {
  docId: number;
  userId: number;
  nodeId: number;
  fullName: string;
  positionName: string;
  orgName: string;
  step: number;
  pId: number | null;
}
export interface BookCategory {
  id: number;
  name: string;
  numberOrSign: string;
  year: number;
  securityIds: number[];
  value: number;
  currentNumber: number;
  totalDocs: number | null;
}
export interface DocSign {
  no: number;
  docOutId: number;
  processId: number | null;
  important: boolean;
  nodeId: number | null;
  numberInBook: string;
  numberOrSign: string | null;
  preview: string;
  docTypeName: string;
  personEnter: string;
  createDate: number;
  status: string;
  signerName: string | null;
  orgCreateName: string | null;
  orgIssuedName: string | null;
  attachments: DocAttachment[];
  // present only in first object
  hasSigner?: boolean;
  signerIds?: number[];

  // present only in second object
  dateIssued?: number;
  securityName?: string;
  showToKnow?: string | null;
  personHandle?: string;
  statusHandleEnum?: string | null;
  docStatusEnum?: string;
  read?: boolean;
  outsideReceives?: OutsideReceive[];
  listReceive?: any; // not enough detail from sample
  note?: string;
}
export interface DocSignRepsonse {
  objList: DocSign[];
  totalPage: number;
  totalRecord: number;
}
export interface OutsideReceive {
  id: number;
  address: string;
  docId: number;
}
export interface DraftResponse {
  orgCreateName: null;
  orgIssuedName: string;
  orgIssuedId: number;
  userCreateName: string;
  node: unknown | null;

  docTypeCategories: CategoryItem[];
  docFieldCategories: CategoryItem[];
  securityCategories: CategoryItem[];
  urgentCategories: CategoryItem[];
  bookCategories: BookCategory[];

  bookId: number;
  checkRoleLibrarian: boolean;
  orgIdOfUser: number;
  orgNameOfUser: string;
}
export interface CategoryItem {
  name: string;
  id: number;
  value: number;
  numberOrSign: string;
  year: number;
  isDefault: boolean;
}
export interface Draft {
  listReplyTask: any;
  dateIssued: Date | null;
  nodeId: number | null;
  editable: boolean;
  canAddUser: boolean;
  canForward: boolean;
  docStatusName: string;
  listSignersName: string;
  id: number | null;
  attachmentType: {
    document: string; // e.g. "RELATE"
    draft: string; // e.g. "DRAFT"
    comment: string; // e.g. "COMMENT"
  };
  attachments: DocAttachment[];
  orgCreateName: string;
  userCreateName: string;
  docTypeId: number;
  docFieldId: number;
  securityId: number;
  urgentId: number;
  bookId: number | null;
  preview: string;
  listReceive: ReceiveToKnow[];
  autoIssued: boolean;
  replyDoc: boolean;
  replyTask: boolean;
  bookName: string;
  replyDocIds: string;
  listReplyDoc: ReplyDoc[];
  listRelateTask: TaskAssignment[];
  draftFiles: any[];
  documentFiles: any[];
  encrypt: boolean;
  numberOrSign: string;
  docFieldsName: string;
  listSignerIds: string;
  signCA: boolean;
  relateTaskIds: string;
  outsideReceives: OutsideReceive[];
  outsideReceiveLgsps: any[];
  paperHandle: boolean;
  personEnterName: string;
  status?: string;
  numberInBook: string;
  docSecurityName: string;
  docUrgentName: string;
  docTypeName: string;
  note: string;
  listAttachVersion: DocAttachment[];
  docId: number | null;
}

export interface ReceiveToKnow {
  id: number;
  receiveId: number;
  type: string;
  userId: number;
  orgId: number;
  orgName: string;
  fullName: string;
  positionName: string;
}
export interface DocumentOut {
  id: number;
  bookId: number;
  numberOrSign: string;

  dateIssued: string; // if you want, change to NgbDate
  dateArrival: string;
  numberArrival: number;
  numberSupport: number;

  docTypeId: string;
  docFieldsId: number;
  urgentId: number;
  securityId: number;
  methodReceiptId: number;
  statusReceiptId: number;
  docStatusId: number;

  legalDoc: boolean;
  rqRely: boolean;
  feedback: boolean;
  sendEnvelope: boolean;

  orgIssuedId: number;
  orgIssuedName: string;

  personSign: string;
  personEnter: string;
  placeSend: string;
  deadline: string;
  dayLeft: number;

  preview: string;
  attachments: DocAttachment[];
  active: boolean;

  node: number;
  files: File;
}
export interface ReceiveToKnowDto {
  id?: number;

  type: string;

  name: string;

  fullName: string;

  orgName: string;

  userId?: number;

  orgId: number;

  receiveId: number;

  positionName?: string;
}
export interface UserFromOrg {
  id: number;
  orgId: number;
  lead: boolean;
  positionId: number;
  positionName: string;
  positionOrder: number;
  fullName: string;
  userName: string;
  directionAuthority: boolean;
}
export type GetListAllResponse = {
  objList: DocumentIn[];
  totalRecord: number;
  totalPage: number;
};
export interface ReplyDoc {
  no: number;
  id: number;
  numberArrival: number;
  numberOrSign: string | null;
  dateArrival: number;
  dateIssued: number;
  preview: string;
  orgIssuedName: string;
  deadline: string | null;
}
export interface ReplyDocResponse {
  objList: ReplyDoc[];
  totalPage: number;
  totalRecord: number;
}
export interface OrgIssued {
  name: string;
  id: number;
  value: string | null;
  numberOrSign: string | null;
  year: number | null;
  isDefault: boolean | null;
}
export interface TaskAssignment {
  id: number;
  taskName: string;
  userAssignName: string;
}
export interface TaskAssignmentResponse {
  content: TaskAssignment[];
  totalElements: number;
  totalPage: number;
}
export type FileLike = {
  id?: number | string;
  docId?: number | string;
  name: string;
  displayName?: string;
  type?: string;
  lastModified?: number;
  encrypt?: boolean;
  oEncrypt?: boolean;
  template?: boolean;
  /** any extra fields carried by your BE */
};
export interface DocumentTemplate {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  type: string;
  size: number;
  encrypt: boolean;
  approveId: number | null;
  status: string;
  docType: string;
  tname: string | null;
  statusName: string;
  displayName: string;
}
export interface DocumentTemplateResponse {
  content: DocumentTemplate[];
  totalPages: number;
  totalElements: number;
}
export interface ButtonStatus {
  hideAll: boolean;
  rejectButton: boolean;
  doneButton: boolean;
  transferButton: boolean;
  consultButton: boolean;
  toKnowButton: boolean;
  issuedButton: boolean;
  retakeButton: boolean;
  editButton: boolean;
  bookButton: boolean;
  retakeByStepButton: boolean;
  createTaskButton: boolean;
  canRETAKE: boolean;
}

export interface RejectDocument {
  selectedFiles?: File[];
  pid: string;
  documentId: number;
  rejectComment: string;
}
export interface DraftDto {
  id: number;

  numberInBook: number;

  orgCreateName: string;

  userCreateName: string;

  nodeId: number;

  docTypeId: number;

  docType: CategoryItem;

  docFieldId: number;

  docField: CategoryItem;

  securityId: number;

  security: CategoryItem;

  urgentId: number;

  bookId: number;

  book: CategoryItem;

  preview: string;

  listReceive: ReceiveToKnow[];

  autoIssued: boolean;

  replyDoc: boolean;

  bookName: string;

  // listReplyDocId: number[];
  replyDocIds: string;

  listReplyDoc: DocumentOut[];

  draftFiles: any[];

  documentFiles: any[];

  encrypt: boolean;

  numberOrSign: string;

  status: string;

  dateIssued: string;

  issued: boolean;

  dateArrival: string;

  numberArrival: number;

  numberSupport: number;

  docFieldsId: number;

  methodReceiptId: number;

  statusReceiptId: number;

  docStatusId: number;

  legalDoc: boolean;

  rqRely: boolean;

  feedback: boolean;

  sendEnvelope: boolean;

  orgIssuedId: number;

  orgIssuedName: string;

  personEnterId: number;

  personSign: string;

  personEnter: string;

  placeSend: string;

  deadline: string;

  dayLeft: number;

  attachments: DocAttachment[];

  active: boolean;

  files: File;

  issuedOnPortal: boolean;

  directiveDoc: boolean;

  personEnterName: string;

  docUrgentName: string;

  docFieldsName: string;

  docTypeName: string;

  docStatusName: string;

  docSecurityName: string;

  listSignerIds: string;

  listSigners: any[];

  listSignersName: string;

  receiveToKnowDtos: ReceiveToKnowDto[];

  hasSigner: boolean;

  hasIssued: boolean;
}
