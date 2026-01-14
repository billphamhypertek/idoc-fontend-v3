import { sendGet, sendPost } from "@/api";
import type {
  DocumentOutListResponse,
  FindDocByTypeHandleParams,
  SetImportantRequest,
  SetImportantResponse,
} from "@/definitions/types/document-out.type";
import type { User } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { getDateLeftUtils } from "@/utils/common.utils";

/** Kiểu query dùng chung cho các sAPI tìm kiếm (tránh any) */
type QueryParams = Record<string, string | number | boolean | undefined>;

/** Cảnh báo deadline hiển thị ở bảng */
export interface DeadlineWarning {
  id: number;
  name: string;
  numberOfDays: number;
  color: string;
  dayLeft: number;
}

/** Org + vị trí (nếu có) */
export interface OrgPos {
  org: number;
  pos?: number;
}

/** Payload chuyển đơn vị */
export interface OrgTransferPayload {
  node: number;
  comment: string;
  deadline?: string;
  special?: boolean;
  files?: File[];
  // Accept either legacy object format or Angular tuple format: [orgId, typeOrg(1|2|3), isUser(0|1)]
  listOrg: Array<OrgPos | number[]>;
}

/** Payload đổi/thêm người xử lý */
export interface SwitchOrAddPayload {
  comment: string;
  cmtContent?: string;
  node: number;
  main?: number[];
  support?: number[];
  show?: number[];
  org_main?: OrgPos[];
  org_support?: OrgPos[];
  org_show?: OrgPos[];
  deadline?: string;
  isSwitch?: boolean;
  files?: File[];
}

/** Shape nhỏ dùng cho cảnh báo trạng thái/deadline */
type DocLike = {
  pstatusName?: string | null;
  docStatusName?: string | null;
  deadline?: string | null;
  [k: string]: unknown;
};

/** Kiểu tham số cho util tính ngày còn lại (tránh as any) */
type GetDateLeftParam = Parameters<typeof getDateLeftUtils>[0];

/** Helper lấy Blob từ response không cần as any */
function hasDataBlob(x: any): x is { data: Blob } {
  return typeof x === "object" && x !== null && "data" in x;
}

export class DocumentOutService {
  private static STATUS = {
    waitHandleTab: 1,
    handlingTab: 0,
    doneTab: 2,
  } as const;

  /** ========== Danh sách theo luồng xử lý ========== */
  static async getListCombine(
    status: keyof typeof DocumentOutService.STATUS,
    params: FindDocByTypeHandleParams
  ): Promise<DocumentOutListResponse> {
    const code = DocumentOutService.STATUS[status];
    const res = await sendGet(
      `/document/findDocByTypeHandle/1/${code}`,
      params
    );
    return res.data as DocumentOutListResponse;
  }

  static async getListMain(
    status: keyof typeof DocumentOutService.STATUS,
    params: FindDocByTypeHandleParams
  ): Promise<DocumentOutListResponse> {
    const code = DocumentOutService.STATUS[status];
    const res = await sendGet(
      `/document/findDocByTypeHandle/0/${code}`,
      params
    );
    return res.data as DocumentOutListResponse;
  }

  static async getListKnow(
    status: keyof typeof DocumentOutService.STATUS,
    params: FindDocByTypeHandleParams
  ): Promise<DocumentOutListResponse> {
    const code = DocumentOutService.STATUS[status];
    const res = await sendGet(
      `/document/findDocByTypeHandle/2/${code}`,
      params
    );
    return res.data as DocumentOutListResponse;
  }

  /** ========== Tìm kiếm cơ bản/tổng quát ========== */
  static async findAllDoc(
    params?: QueryParams
  ): Promise<DocumentOutListResponse> {
    const res = await sendGet("/document/findAllDoc", params);
    return res.data as DocumentOutListResponse;
  }

  static async findBasicAllDoc(
    params: FindDocByTypeHandleParams
  ): Promise<DocumentOutListResponse> {
    const res = await sendGet("/document/findBasicAllDoc", params);
    return res.data as DocumentOutListResponse;
  }

  static async findDocInManipulation(
    params: Omit<FindDocByTypeHandleParams, "typeHandle"> & {
      type: "CHO_Y_KIEN" | "XIN_Y_KIEN";
    }
  ): Promise<DocumentOutListResponse> {
    const res = await sendGet("/doc_in_manipulation/get", params);
    return res.data as DocumentOutListResponse;
  }

  /** ========== Quan trọng (star) ========== */
  static async setImportant({
    docId,
    important,
  }: SetImportantRequest): Promise<SetImportantResponse> {
    const qs = new URLSearchParams({
      docId: String(docId),
      important: (important ? 1 : 0).toString(),
    }).toString();

    const res = await sendPost(`/doc_in_process/setImportant?${qs}`);
    return res.data as SetImportantResponse;
  }

  /** ========== Chi tiết văn bản ========== */
  static async getDetail(
    documentId: number,
    params?: { notId?: string | null; tab?: string | null }
  ): Promise<any> {
    const query = new URLSearchParams();
    if (params?.notId) query.append("notId", params.notId);
    if (params?.tab) query.append("tab", String(params.tab));

    const url =
      `/document/getDetailById/${documentId}` +
      (query.toString() ? `?${query.toString()}` : "");
    const res = await sendGet(url);
    return res.data as any;
  }

  static async getReceiveAndSend(docId: number): Promise<any[]> {
    const res = await sendGet(`/doc_in_process/tracking/list/${docId}`);
    return (res.data as any[]) ?? [];
  }

  static async getHandleType(
    documentId: number,
    tab?: string | null
  ): Promise<any> {
    const query = new URLSearchParams();
    if (tab) query.append("tab", String(tab));
    const url =
      `/doc_in_process/getTypeHandleByUsername/${documentId}` +
      (query.toString() ? `?${query.toString()}` : "");
    const res = await sendGet(url);
    return res.data as any;
  }

  /** ========== Đánh giá ========== */
  static async requestEvaluate(
    docId: number,
    comment: string,
    isDelegate: boolean = false
  ): Promise<any> {
    const fd = new FormData();
    const params = new URLSearchParams();
    params.append("comment", comment);
    params.append("isDelegate", String(isDelegate));
    const res = await sendPost(
      `/document/requestReview/${docId}?${params.toString()}`,
      fd
    );
    return (res.data ?? res) as any;
  }

  static async evaluate(
    docId: number,
    comment: string,
    agree: boolean,
    pId?: number | null
  ): Promise<any> {
    const fd = new FormData();
    const params = new URLSearchParams();
    params.append("comment", comment);
    params.append("agree", String(agree));
    if (pId != null) params.append("pId", String(pId));
    const res = await sendPost(
      `/document/review/${docId}?${params.toString()}`,
      fd
    );
    return (res.data ?? res) as any;
  }

  /** ========== Thu hồi theo bước ========== */
  static async stepRetake(
    docId: number,
    comment: string,
    node: number
  ): Promise<any> {
    const fd = new FormData();
    fd.append("comment", comment);
    fd.append("node", String(node));
    const res = await sendPost(`/document/step-retake/${docId}`, fd);
    return (res.data ?? res) as any;
  }

  /** ========== Người dùng theo node ========== */
  static async getNodeUsers(nodeId: number): Promise<User[]> {
    const res = await sendGet(`/bpmn2/node/${nodeId}/users`);
    return (res.data as User[]) ?? [];
  }

  /** ========== Chuyển xử lý (nội bộ) ========== */
  static async transferHandleList(
    docId: number,
    nodeId: number,
    main: (string | number)[],
    comment: string,
    cmtContent: string,
    requestReview: boolean = false,
    files?: File[],
    support?: (string | number)[],
    show?: (string | number)[],
    orgMain?: number[],
    orgSupport?: number[],
    orgShow?: number[],
    direction?: number[],
    deadline?: string
  ): Promise<any> {
    const fd = new FormData();
    fd.append("docIds", String(docId));
    fd.append("node", String(nodeId));
    fd.append("comment", comment ?? "");
    fd.append("cmtContent", cmtContent ?? "-");
    fd.append("requestReview", String(requestReview));
    (files ?? []).forEach((f) => fd.append("files", f));

    // Use arrayToFormData behavior: append as indexed arrays
    (main ?? []).forEach((item) => {
      fd.append(`main`, String(item));
    });
    (support ?? []).forEach((item) => {
      fd.append(`support`, String(item));
    });
    (show ?? []).forEach((item) => {
      fd.append(`show`, String(item));
    });
    (orgMain ?? []).forEach((item, index) => {
      fd.append(`org_main[${index}]`, String(item));
    });
    (orgSupport ?? []).forEach((item, index) => {
      fd.append(`org_support[${index}]`, String(item));
    });
    (orgShow ?? []).forEach((item, index) => {
      fd.append(`org_show[${index}]`, String(item));
    });
    (direction ?? []).forEach((item, index) => {
      fd.append(`direction[${index}]`, String(item));
    });
    if (deadline) fd.append("deadline", deadline);
    const res = await sendPost(`/document/transferHandleList/`, fd);
    return (res.data ?? res) as any;
  }

  static async done(
    docId: number,
    comment: string,
    isFinishReceive: boolean = false,
    files?: File[]
  ): Promise<any> {
    const fd = new FormData();
    (files ?? []).forEach((f) => fd.append("files", f));
    fd.append("comment", comment ?? "");
    fd.append("special", String(isFinishReceive));
    const res = await sendPost(`/doc_in_process/done/${docId}`, fd);
    return (res.data ?? res) as any;
  }

  static async updateDeadline(
    docId: number,
    deadline: string,
    type: string = "THREADS"
  ): Promise<any> {
    const fd = new FormData();
    fd.append("deadline", deadline);
    fd.append("type", type);
    const res = await sendPost(`/document/updateDeadline/${docId}`, fd);
    return (res.data ?? res) as any;
  }

  static async retakeDone(
    docId: number,
    comment: string,
    files?: File[]
  ): Promise<any> {
    const fd = new FormData();
    (files ?? []).forEach((f) => fd.append("files", f));
    fd.append("comment", comment ?? "");
    const res = await sendPost(`/document/retake_done/${docId}`, fd);
    return (res.data ?? res) as any;
  }

  /** ========== Download đính kèm ========== */
  static async downloadAttachmentById(attId: number): Promise<Blob> {
    const res = await sendGet(`/attachment/download/${attId}`, undefined, {
      responseType: "blob",
    });
    return hasDataBlob(res) ? res.data : (res as Blob);
  }

  static async switchOrAddUser(
    docId: number,
    payload: SwitchOrAddPayload
  ): Promise<any> {
    const fd = new FormData();
    (payload.files ?? []).forEach((f) => fd.append("files", f));
    fd.append("comment", payload.comment ?? "");
    fd.append("cmtContent", payload.cmtContent ?? "-");
    fd.append("node", String(payload.node));
    (payload.org_main ?? []).forEach((v) =>
      fd.append("org_main", JSON.stringify(v))
    );
    (payload.org_support ?? []).forEach((v) =>
      fd.append("org_support", JSON.stringify(v))
    );
    (payload.org_show ?? []).forEach((v) =>
      fd.append("org_show", JSON.stringify(v))
    );
    (payload.main ?? []).forEach((v) => fd.append("main", String(v)));
    (payload.support ?? []).forEach((v) => fd.append("support", String(v)));
    (payload.show ?? []).forEach((v) => fd.append("show", String(v)));
    if (payload.deadline) fd.append("deadline", payload.deadline);
    fd.append("isSwitch", String(!!payload.isSwitch));
    const res = await sendPost(`/document/switchOrAddUser/${docId}`, fd);
    return (res.data ?? res) as any;
  }

  static async orgTransfer(
    docIds: number[],
    payload: OrgTransferPayload
  ): Promise<any> {
    const fd = new FormData();
    fd.append("docIds", docIds.join(","));
    (payload.files ?? []).forEach((f) => fd.append("files", f));
    fd.append("comment", payload.comment ?? "");
    fd.append("node", String(payload.node));
    // Match Angular's arrayToFormData behavior: when entry is an array, append as CSV "id,type,isUser"
    (payload.listOrg ?? []).forEach((v) => {
      if (Array.isArray(v)) {
        fd.append("listOrg", v.join(","));
      } else {
        fd.append("listOrg", JSON.stringify(v));
      }
    });
    if (payload.deadline) fd.append("deadline", payload.deadline);
    fd.append("special", String(!!payload.special));
    const res = await sendPost(`/document/org/transfer`, fd);
    return (res.data ?? res) as any;
  }

  static async rejectChild(
    docId: number,
    comment: string,
    files?: File[]
  ): Promise<any> {
    const fd = new FormData();
    (files ?? []).forEach((f) => fd.append("files", f));
    fd.append("comment", comment ?? "");
    const res = await sendPost(`/document/reject/${docId}`, fd);
    return (res.data ?? res) as any;
  }

  static async retakeChild(
    docId: number,
    comment: string,
    files?: File[]
  ): Promise<any> {
    const fd = new FormData();
    (files ?? []).forEach((f) => fd.append("files", f));
    fd.append("comment", comment ?? "");
    const res = await sendPost(`/document/org/retake/${docId}`, fd);
    return (res.data ?? res) as any;
  }

  static async readDocumentToKnow(
    docIds: number[],
    comment: string
  ): Promise<any> {
    const qs = new URLSearchParams();
    docIds.forEach((id) => qs.append("docIds", String(id)));
    qs.append("comment", comment ?? "");
    const res = await sendGet(
      `/doc_in_process/finishReceiveToKnow?${qs.toString()}`
    );
    return (res.data ?? res) as any;
  }

  static async readDocumentOut(docIds: number[]): Promise<any> {
    const qs = new URLSearchParams();
    docIds.forEach((id) => qs.append("docIds", String(id)));
    const res = await sendPost(`/document_out/read?${qs.toString()}`);
    return (res.data ?? res) as any;
  }

  /** ========== Handle type ========== */
  static async doGetHandleType(documentId: string, tabName = ""): Promise<any> {
    const params = tabName ? { tab: tabName } : {};
    return sendGet(Constant.DOCUMENT_PROCESS.HANDLE_TYPE + documentId, {
      params,
    });
  }

  /** ========== Search (incoming) ========== */
  static async getBasicSearchIncoming(params: QueryParams): Promise<any> {
    const res = await sendGet(
      Constant.DOCUMENT_OUT.INCOMMING_BASIC_SEARCH,
      params
    );
    return res.data as any;
  }

  static async getAdvanceSearchIncoming(params: QueryParams): Promise<any> {
    const res = await sendGet(
      Constant.DOCUMENT_OUT.INCOMMING_ADVANCE_SEARCH,
      params
    );
    return res.data as any;
  }

  static async getWaitingSearch(params: QueryParams): Promise<any> {
    const res = await sendGet(Constant.DOCUMENT_OUT.WAITING_SEARCH, params);
    return res.data as any;
  }

  static async getCategoryWithCode(code: string): Promise<any> {
    const res = await sendGet(
      `${Constant.CATEGORY.GET_BY_CATEGORY_TYPE_CODE}/${code}`
    );
    return res.data as any;
  }

  /** ========== Các thao tác hàng loạt ========== */
  static async doFinishDocument(documentIds: number[]): Promise<any> {
    const formData = new FormData();
    formData.append("docIds", documentIds.join(","));
    const res = await sendPost("/document/finishDocument", formData);
    return (res.data ?? res) as any;
  }

  static async doReject(documentIds: number[]): Promise<any> {
    const formData = new FormData();
    formData.append("docIds", documentIds.join(","));
    const res = await sendPost("/document/org/reject", formData);
    return (res.data ?? res) as any;
  }

  static async doDeleteDocument(docId: number): Promise<any> {
    const res = await sendPost(`${Constant.DOCUMENT_OUT.DELETE}${docId}`);
    return res.data as any;
  }

  static async getDocumentComments(documentId: number): Promise<any[]> {
    const res = await sendGet(
      `${Constant.DOCUMENT_OUT_COMMENT.GET_ALL_BY_DOC_ID}${documentId}`
    );
    return res.data as any;
  }

  /** ========== Comment actions ========== */
  static async replyComment(docId: number, formData: FormData): Promise<any> {
    const res = await sendPost(`/document/reply_comment/${docId}`, formData);
    return (res.data ?? res) as any;
  }

  static async editComment(
    commentId: number,
    comment: string,
    hash: string = ""
  ): Promise<any> {
    const res = await sendPost(
      `/comment_doc/edit/${commentId}?comment=${comment}`,
      { hash }
    );
    return (res.data ?? res) as any;
  }

  static async deleteComment(commentId: number): Promise<any> {
    const res = await sendPost(`/comment_doc/delete/${commentId}`, null);
    return (res.data ?? res) as any;
  }

  /** ========== Tracking ========== */
  static async getTrackingList(
    docId: number,
    page?: number
  ): Promise<{ objList: any[]; totalRecord: number }> {
    const params = page !== undefined ? { page } : undefined;
    const res = await sendGet(
      `${Constant.DOCUMENT_OUT.LOG_TRACKING}${docId}`,
      params
    );
    const objList = res?.data?.objList ?? res?.objList ?? [];
    const totalRecord =
      res?.data?.totalRecord ?? res?.totalRecord ?? objList.length;
    return {
      objList: objList || [],
      totalRecord: Number(totalRecord) || 0,
    };
  }

  static async getAllTrackingList(docId: number): Promise<any[]> {
    const res = await sendGet(
      `${Constant.DOCUMENT_OUT.ALL_LOG_TRACKING}${docId}`
    );
    return (res?.data ?? res) as any[];
  }

  /** ========== Một số API GET khác ========== */
  static async getDocumentOutArrival(): Promise<any[]> {
    const res = await sendGet(`${Constant.DOCUMENT_OUT.GET_ARRIVAL}`);
    return (res?.data as any[]) ?? [];
  }

  static async getDocumentOutById(docId: string): Promise<any[]> {
    const res = await sendGet(`${Constant.DOCUMENT_OUT.GET_BY_ID}${docId}`);
    return (res?.data as any[]) ?? [];
  }

  static async getDocumentOutDetailById(
    documentId: number,
    notId?: string | null,
    tab?: string
  ): Promise<any> {
    const qs = new URLSearchParams();
    if (notId) qs.append("notId", notId);
    if (tab) qs.append("tab", String(tab));
    const url =
      `/document/getDetailById/${documentId}` +
      (qs.toString() ? `?${qs.toString()}` : "");
    return sendGet(url);
  }

  static async doSaveNewDocumentOut(documentDto: any): Promise<any> {
    const res = await sendPost(Constant.DOCUMENT_OUT.ADD, documentDto);
    return res.data as any;
  }

  static async doSaveDocumentOut(
    document: any,
    documentId: number
  ): Promise<any> {
    const res = await sendPost(
      Constant.DOCUMENT_OUT.UPDATE + documentId,
      document
    );
    return res.data as any;
  }

  static async doUpdateReceiveDoc(document: any): Promise<any> {
    const res = await sendPost(
      `${Constant.DOCUMENT_OUT.ADD}?receive=true`,
      document
    );
    return res.data as any;
  }

  static async getListUserEnter(): Promise<any> {
    const res = await sendGet("/users/get_all_user");
    return res.data as any;
  }

  static getDocumentOutStatuses(): any[] {
    return (
      Constant.DOCUMENT_TYPE.find((documentType) => documentType.code === 0)
        ?.documentStatus || []
    );
  }

  static async getListOrgEnter(): Promise<any> {
    const res = await sendGet("/org/find_all_org");
    return res.data as any;
  }

  static addWarningColorToDocuments<
    T extends { doc?: DocLike; docId?: number },
  >(documents: T[]): Array<T & { deadlineWarning?: DeadlineWarning }> {
    const attachOnRoot = !!Constant.DEADLINE_CHECKBOX_TRANSFER_BCY;

    return (documents ?? []).map((item) => {
      const target: DocLike | undefined = attachOnRoot
        ? (item as unknown as DocLike)
        : item?.doc;

      const warning = target
        ? DocumentOutService.getDeadlineWarning(target)
        : undefined;

      if (attachOnRoot) {
        const merged = {
          ...(item as object),
          ...(warning !== undefined ? { deadlineWarning: warning } : {}),
        } as T & { deadlineWarning?: DeadlineWarning };
        return merged;
      }

      const merged = {
        ...item,
        doc: target
          ? {
              ...target,
              ...(warning !== undefined ? { deadlineWarning: warning } : {}),
            }
          : item?.doc,
      } as T & { deadlineWarning?: DeadlineWarning };
      return merged;
    });
  }
  /** ========== Bảng màu/nhãn cảnh báo ========== */
  static listDeadlineWarning: DeadlineWarning[] = [
    {
      id: 2,
      name: "Hạn xử lý không quá 3 ngày",
      numberOfDays: 3,
      color: "blue",
      dayLeft: 0,
    },
    {
      id: 4,
      name: "Hạn xử lý hơn 3 ngày",
      numberOfDays: 100000,
      color: "black",
      dayLeft: 3,
    },
    { id: 3, name: "Quá hạn", numberOfDays: 0, color: "red", dayLeft: -1 },
    {
      id: 5,
      name: "Đang xử lý",
      numberOfDays: -1,
      color: "#f9acac",
      dayLeft: -1,
    },
    { id: 6, name: "Trả lại", numberOfDays: -1, color: "#fbeb9a", dayLeft: -1 },
  ];

  static getDeadlineWarning(document: DocLike): DeadlineWarning | undefined {
    if (!document) return undefined;

    const findById = (id: number): DeadlineWarning | undefined =>
      DocumentOutService.listDeadlineWarning.find((w) => w.id === id);

    const tag = (
      document.pstatusName ??
      document.docStatusName ??
      ""
    ).toLowerCase();
    if (tag.includes("trả lại")) return findById(6); // vàng
    if (tag.includes("đang xử lý")) return findById(5); // hồng nhạt

    let daysLeft: number | null = null;
    try {
      const n = getDateLeftUtils(document as GetDateLeftParam);
      daysLeft = Number.isFinite(n) ? n : null;
    } catch {
      daysLeft = null;
    }
    if (daysLeft == null) return undefined;

    if (daysLeft < 0) return findById(3); // Quá hạn (đỏ)
    if (daysLeft <= 3) return findById(2); // ≤ 3 ngày (xanh dương)
    return findById(4); // > 3 ngày (đen)
  }

  static async exportExcelDocumentOut(params: any): Promise<any> {
    const res = await sendGet("/document_out/exportExcel", params);
    return res.data;
  }

  /** Export Excel for incoming documents (văn bản đến) */
  static async exportExcelDocumentIn(params: any): Promise<any> {
    const res = await sendGet("/document/exportExcel", params);
    return res.data;
  }

  /** Export Excel for flowing incoming documents (văn bản đến theo dõi) */
  static async exportExcelDocumentFlowingIn(queryString: string): Promise<any> {
    const res = await sendGet(
      `${Constant.DOCUMENT_OUT.EXPORT_EXCEL_FlOWING}${queryString}`,
      undefined
    );
    return res.data;
  }

  /** Export Excel for flowing out documents (văn bản đi theo dõi) */
  static async exportExcelOutDocumentFlowing(
    queryString: string
  ): Promise<any> {
    const res = await sendGet(
      `/document_out/exportExcelOut?${queryString}`,
      undefined
    );
    return res.data;
  }

  static async searchDocumentSyncLgsp(params: any): Promise<any> {
    const res = await sendPost("/document_out/lgsp", params);
    return res.data;
  }
}
