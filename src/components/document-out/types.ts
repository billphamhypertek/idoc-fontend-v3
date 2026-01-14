import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";

export interface Attachment {
  id?: number;
  name: string;
  displayName?: string;
  encrypt: boolean;
  createBy?: string;
  type?: string;
}

export interface Document {
  id?: number;
  numberArrival?: string;
  numberArrivalStr?: string;
  parentPlaceSend?: string;
  placeSend?: string;
  deadline?: string;
  dateArrival?: string;
  receivedDate?: string;
  dateIssued?: string;
  preview?: string;
  orgReceiveDocument?: string;
  attachments?: Attachment[];
  status?: string;
}

export interface DocumentDetail {
  document: Document;
  bookName?: string;
  urgentName?: string;
  securityName?: string;
  methodReceiptName?: string;
  docTypeName?: string;
  docStatusName?: string;
  canFinish?: boolean;
  parentDoc?: any;
  listChildrenDoc?: any[];
  listResponseDoc?: any[];
  listTask?: any[];
  id?: number;
  node?: number;
}

export interface TreeNode {
  frUser?: string;
  toUser?: string;
  frInfo?: string;
  toInfo?: string;
  delegateInfo?: string;
  handleStatus?: string;
  deadline?: string;
  action?: string;
  progress?: number;
  comment?: string;
  children?: TreeNode[];
  pid?: string;
}

export type ProcessRow = {
  level: number;
  path: string;
  hasChildren: boolean;
  data: TreeNode;
  children?: { data: TreeNode }[];
};

export interface TagItem {
  id: string;
  name: string;
}

export interface HstlItem {
  id?: number;
  name: string;
}

export interface BpmnNode {
  id: number;
  name: string;
  allowMultiple?: boolean;
  lastNode?: boolean;
}

export const CERT_TYPES = CERT_OBJ_TYPE;
