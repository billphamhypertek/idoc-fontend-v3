import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import type {
  DocAttachment,
  Draft,
  DraftResponse,
  DocSignRepsonse,
} from "@/definitions/types/document.type";

export class DraftService {
  /** Get init data for creating/editing a draft (document_out) */
  static async getDataInit(
    params: Record<string, any> = {}
  ): Promise<DraftResponse> {
    const res = await sendGet(
      `${Constant.DOCUMENT_IN_DRAFT.GET_DATA_INIT}`,
      params
    );
    return res.data as DraftResponse;
  }

  /** Create new draft (document_out/add). If isDraftIssued=true, mark issued */
  static async add(
    draftDto: any,
    isDraftIssued: boolean = false
  ): Promise<any> {
    const payload = isDraftIssued ? { ...draftDto, issued: true } : draftDto;
    const res = await sendPost(`/document_out/add`, payload);
    return res.data as any;
  }

  /** Update an existing draft */
  static async update(draftDto: any & { id: number | string }): Promise<any> {
    const res = await sendPost(`/document_out/update/${draftDto.id}`, draftDto);
    return res.data as any;
  }

  /** Get draft detail by id */
  static async getById(draftId: number | string): Promise<Draft> {
    const res = await sendGet(`/document_out/getDetailById/${draftId}`);
    return res.data as Draft;
  }

  /** Get draft detail to show (readonly) */
  static async getDetailToShow(draftId: number | string): Promise<Draft> {
    const res = await sendGet(`/document_out/getDetailToShow/${draftId}`);
    return res.data as Draft;
  }

  /** Delete a draft */
  static async delete(draftId: number | string): Promise<any> {
    const res = await sendPost(`/document_out/delete/${draftId}`);
    return res.data as any;
  }

  /** Add attachments to draft or document */
  static async addAttachments(
    type: "DRAFT" | "DOCUMENT",
    draftId: number | string,
    files: File[] = []
  ): Promise<any> {
    const fd = new FormData();
    (files ?? []).forEach((f) => fd.append("files", f));
    const url =
      type === Constant.DOCUMENT_IN_FILE_TYPE.DOCUMENT
        ? `/doc_out_attach/add/relate/${draftId}`
        : `/doc_out_attach/add/draft/${draftId}`;
    const res = await sendPost(url, fd);
    return (res.data ?? res) as any;
  }

  /** Update a single attachment file */
  static async updateAttachment(
    attachmentId: number | string,
    file: File
  ): Promise<DocAttachment> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await sendPost(
      `/doc_out_attach/updateFile/${attachmentId}`,
      fd
    );
    return res.data as DocAttachment;
  }

  /** Delete attachment by id; optional force flag */
  static async deleteAttachmentById(
    attachmentId: number | string,
    force = false
  ): Promise<any> {
    const fd = new FormData();
    fd.append("force", String(force));
    const res = await sendPost(
      `/doc_out_attach/deleteById/${attachmentId}`,
      fd
    );
    return res.data as any;
  }

  /** List drafts (sign queue) */
  static async getListDocSign(
    params?: Record<string, any>
  ): Promise<DocSignRepsonse> {
    const res = await sendGet(`/document_out/getListDocSign`, params);
    return res.data as DocSignRepsonse;
  }

  /** List issued drafts by action 1 (trình ký) or 2 (đã ban hành) */
  static async getListIssued(
    action: 1 | 2,
    params?: Record<string, any>
  ): Promise<DocSignRepsonse> {
    const res = await sendGet(`/document_out/getListIssued/${action}`, params);
    return res.data as DocSignRepsonse;
  }

  /** Sign PDF */
  static async signPdf(fileName: string, signPosition: string): Promise<any> {
    const fd = new FormData();
    fd.append("fileName", fileName);
    fd.append("signPosition", signPosition);
    const res = await sendPost(`/pdf/sign`, fd);
    return (res.data ?? res) as any;
  }

  /** Add watermark */
  static async addWaterMark(fileName: string, waterMark: string): Promise<any> {
    const fd = new FormData();
    fd.append("fileName", fileName);
    fd.append("waterMark", waterMark);
    const res = await sendPost(`/pdf/addWaterMark`, fd);
    return (res.data ?? res) as any;
  }

  /** Reject draft */
  static async reject(docId: number | string, comment: string): Promise<any> {
    const params = { docId, comment } as const;
    const res = await sendPost(`/document_out/reject`, null, { params });
    return (res.data ?? res) as any;
  }

  /** Retake draft */
  static async retake(docId: number | string, comment: string): Promise<any> {
    const params = { docId, comment };
    const res = await sendPost(`/document_out/retake`, null, params);
    return (res.data ?? res) as any;
  }

  /** Finish (done) draft; when type=false uses forward/finish */
  static async finish(
    docId: number | string,
    comment: string,
    type: boolean = true
  ): Promise<any> {
    if (type) {
      const fd = new FormData();
      // Angular passes 'comment' as body directly; BE expects FormData for some variants
      fd.append("comment", comment ?? "");
      const res = await sendPost(`/document_out/finish/${docId}`, fd);
      return (res.data ?? res) as any;
    }
    const res = await sendPost(
      `/document_out/forward/finish?docId=${docId}&comment=${encodeURIComponent(comment)}`,
      {}
    );
    return (res.data ?? res) as any;
  }

  /** Finish multiple drafts */
  static async finishMultiple(docIds: Array<number | string>): Promise<any> {
    const res = await sendPost(`/document_out/forward/finishMultiDoc`, docIds);
    return (res.data ?? res) as any;
  }

  /** Tracking list by docId */
  static async getTracking(docId: number | string, page: number): Promise<any> {
    const params = { page };
    const res = await sendGet(`/doc_out_tracking/getTracking/${docId}`, params);
    return res.data as any;
  }

  /** All tracking logs */
  static async getAllTracking(documentId: number | string): Promise<any> {
    const res = await sendGet(`/doc_out_tracking/all/${documentId}`);
    return res.data as any;
  }

  /** Update list signers for a draft */
  static async updateListSigners(
    docOutId: number | string,
    listSignIds: string
  ): Promise<any> {
    const fd = new FormData();
    fd.append("listSigners", listSignIds);
    const res = await sendPost(
      `/document_out/updateListSigners/${docOutId}`,
      fd
    );
    return res.data as any;
  }

  /** Get list of attachments for a draft */
  static async getListAttachment(
    docId: number | string
  ): Promise<DocAttachment[]> {
    const res = await sendGet(`/doc_out_attach/getListAttachmnet/${docId}`);
    return (res.data as DocAttachment[]) ?? [];
  }

  /** Toggle important on a draft (doc_out_process) */
  static async setImportant(
    docId: number | string,
    important: boolean
  ): Promise<any> {
    const fd = new FormData();
    fd.append("docId", String(docId));
    fd.append("important", String(important));
    const res = await sendPost(`/doc_out_process/setImportant`, fd);
    return (res.data ?? res) as any;
  }

  /** Load task list by page */
  static async getTasks(page: number): Promise<any> {
    const res = await sendGet(`/task/findTaskByUserExecute`, { page });
    return res.data as any;
  }

  /** Import document book in draft handle */
  static async importDocBook(qs: string): Promise<any> {
    const res = await sendPost(`/document_out/importDocBook?${qs}`, null);
    return (res.data ?? res) as any;
  }

  /** Check if numberOrSign is unique in a book */
  static async checkNumberOrSign(
    numberOrSign: string,
    bookId: number
  ): Promise<any> {
    const res = await sendGet(`/document_out/checkNumberOrSign`, {
      numberOrSign,
      bookId,
    });
    return res.data as any;
  }

  /** Add sign user */
  static async addSignUser(
    docId: number | string,
    userId: number | string
  ): Promise<any> {
    const res = await sendGet(`/document_out/addSignUser`, { docId, userId });
    return res.data as any;
  }

  /** Get users allowed to reject for a draft */
  static async getUsersReject(draftId: number | string): Promise<any> {
    const res = await sendGet(`/document_out/node-reject/list/${draftId}`);
    return res.data as any;
  }

  /** Reject to a specific user (optionally delegate and with files) */
  static async rejectToUser(params: {
    docId: number | string;
    comment: string;
    userId: number | string;
    nodeId?: number | string;
    delegate?: boolean;
    files?: File[];
  }): Promise<any> {
    const fd = new FormData();
    fd.append("docId", String(params.docId));
    fd.append("comment", params.comment ?? "");
    fd.append("userId", String(params.userId));
    if (params.nodeId != null) fd.append("nodeId", String(params.nodeId));
    if (params.delegate != null) fd.append("delegate", String(params.delegate));
    (params.files ?? []).forEach((f) => fd.append("files", f));
    const res = await sendPost(`/document_out/node-reject/do`, fd);
    return (res.data ?? res) as any;
  }

  /** Outside receive predefined list */
  static async loadOutSideReceive(): Promise<string[]> {
    const res = await sendGet(`/document_out/out-side-receive/list`);
    return (res.data as string[]) ?? [];
  }

  /** Outside agency list (LGSP) */
  static async getListLGSP(page: number, name: string = ""): Promise<any> {
    const res = await sendGet(`/outside-agency/search`, { name, page });
    return res.data as any;
  }

  /** Search outside agency LGSP */
  static async searchListLGSP(name: string, page: number): Promise<any> {
    const res = await sendGet(`/outside-agency/search`, { name, page });
    return res.data as any;
  }

  /** Reload LGSP cache */
  static async reloadLGSP(): Promise<any> {
    const res = await sendGet(`/outside-agency/update`);
    return res as any;
  }
}

export default DraftService;
