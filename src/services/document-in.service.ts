import { sendGet, sendPost, sendPostRaw } from "@/api";
import {
  BookCategory,
  DocAttachment,
  DocCheckAction,
  DocSignRepsonse,
  DocumentInListResponse,
  Draft,
  DraftResponse,
  GetListAllResponse,
  OrgIssued,
  ReceiveToKnow,
  ReplyDocResponse,
  ReturnDocumentInUser,
  TaskAssignmentResponse,
} from "@/definitions/types/document.type";
import type {
  SetImportantRequest,
  SetImportantResponse,
} from "@/definitions/types/document-out.type";
import { Constant } from "@/definitions/constants/constant";

export class DocumentInService {
  static async getBasicListDocumentIn(
    action: string,
    params: Record<string, any>
  ): Promise<DocumentInListResponse> {
    const response = await sendGet(
      `/doc_out_process/handling/${action}/search`,
      params
    );
    return response.data as DocumentInListResponse;
  }

  static async getAdvanceListDocumentIn(
    action: string,
    params: Record<string, any>
  ): Promise<DocumentInListResponse> {
    const response = await sendGet(
      `/doc_out_process/handling/${action}/search-advance`,
      params
    );
    return response.data as DocumentInListResponse;
  }

  static async checkActionDocumentIn(
    params: Record<string, any>
  ): Promise<DocCheckAction> {
    const response = await sendGet(`/document_out/checkAction`, params);
    return response.data as DocCheckAction;
  }

  static async setImportant({
    docId,
    important,
  }: SetImportantRequest): Promise<SetImportantResponse> {
    const qs = new URLSearchParams({
      docId: String(docId),
      important: (important ? 1 : 0).toString(),
    }).toString();

    const res = await sendPost(`/doc_out_process/setImportant?${qs}`);
    return res.data;
  }

  static async consultHandleList(consultData: FormData): Promise<any> {
    const response = await sendPost(
      "/document_out/request_comment",
      consultData
    );
    return response.data;
  }

  static async getRejectDocumentIn(
    documentId: string | undefined
  ): Promise<ReturnDocumentInUser[]> {
    const response = await sendGet(
      `/document_out/node-reject/list/${documentId}`
    );
    return response.data as ReturnDocumentInUser[];
  }

  static async rejectHandle(consultData: FormData): Promise<any> {
    const response = await sendPost(
      "/document_out/node-reject/do",
      consultData
    );
    return response.data;
  }

  static async getBookType(): Promise<BookCategory[]> {
    const bookType = "1";
    const response = await sendGet(
      `${Constant.GET_DOCUMENT_BOOK_BY_TYPE}${bookType}`
    );
    return response.data;
  }

  static async importDocBook(bookData: FormData): Promise<any[]> {
    const response = await sendPost(`/document_out/importDocBook`, bookData);
    return response.data;
  }

  static async retakeHandle(retakeData: FormData): Promise<any[]> {
    const response = await sendPost(`/document_out/retakeByStep`, retakeData);
    return response.data;
  }

  static async doneHandle(docId: string, fd: FormData): Promise<string> {
    const response = await sendPost(`/document_out/finish/${docId}`, fd);
    return response.data;
  }

  static async doneHandleMultiple(idsList: string[]): Promise<string> {
    const response = await sendPost(
      `/document_out/forward/finishMultiDoc`,
      idsList
    );
    return response.data;
  }

  static async retakeDoneHandle(docId: string, fd: FormData): Promise<string> {
    const response = await sendPost(
      `${Constant.DOCUMENT_PROCESS.RETAKE_DONE}${docId}`,
      fd
    );
    return response.data;
  }

  static async retakeDoneHandleWithoutFile(
    docId: string,
    doneComment: string
  ): Promise<string> {
    const response = await sendPost(
      `document_out/forward/unread?docId=${docId}&comment=${doneComment}`
    );
    return response.data;
  }

  static async getListAttachment(docId: string): Promise<any[]> {
    const response = await sendGet(
      `/doc_out_attach/getListAttachmnet/${docId}`
    );
    return response.data;
  }

  static async saveCommentAttachment(
    commentId: string,
    params: FormData
  ): Promise<any[]> {
    const response = await sendPost(`/doc_out_attach/add/comment/${commentId}`);
    return response.data;
  }

  static async getListDocSign(
    params: Record<string, any>
  ): Promise<DocSignRepsonse> {
    const response = await sendGet(`/document_out/getListDocSign`, params);
    return response.data as DocSignRepsonse;
  }

  static async getListDocIssued(
    action: string,
    params: Record<string, any>
  ): Promise<DocSignRepsonse> {
    const response = await sendGet(
      `/document_out/getListIssued/${action}`,
      params
    );
    return response.data as DocSignRepsonse;
  }

  static async deleteDraft(draftId: string): Promise<any> {
    const response = await sendPost(`/document_out/delete/${draftId}`);
    return response.data;
  }

  static async getDraftInitData(): Promise<DraftResponse> {
    const response = await sendGet(`/document_out/getDataInit`);
    return response.data;
  }

  static async deleteAttachment(attachmentId: number): Promise<any> {
    const response = await sendPost(
      `/doc_internal/attachment/delete/${attachmentId}`
    );
    return response.data;
  }

  static async getQuickKnowableUnread(
    params: Record<string, any>
  ): Promise<DocumentInListResponse> {
    const response = await sendGet(`/document_out/quick-knowable`, {
      ...params,
      read: false,
    });
    return response.data as DocumentInListResponse;
  }

  static async getQuickKnowableRead(
    params: Record<string, any>
  ): Promise<DocumentInListResponse> {
    const response = await sendGet(`/document_out/quick-knowable`, {
      ...params,
      read: true,
    });
    return response.data as DocumentInListResponse;
  }

  static async getImportantDocuments(
    params?: Record<string, any>
  ): Promise<GetListAllResponse> {
    const response = await sendGet(`/document_out/getListAll`, {
      ...params,
      important: true,
    });
    return response.data as GetListAllResponse;
  }

  static async getAllDocuments(
    params?: Record<string, any>
  ): Promise<GetListAllResponse> {
    const response = await sendGet(`/document_out/getListAll`, {
      ...params,
    });
    return response.data as GetListAllResponse;
  }

  static async getReplyDoc(
    params?: Record<string, any>
  ): Promise<ReplyDocResponse> {
    const response = await sendGet(`/document/findDocReply`, {
      ...params,
    });
    return response.data as ReplyDocResponse;
  }

  static async getOrgIssued(): Promise<OrgIssued[]> {
    const response = await sendGet(
      `/document_out/document_in_search_form_data`
    );
    return response.data.orgIssuedCategories as OrgIssued[];
  }

  static async getTaskAssignment(
    params?: Record<string, any>
  ): Promise<TaskAssignmentResponse> {
    const response = await sendGet(`/task/findTaskByUserExecute`, params);
    return response.data as TaskAssignmentResponse;
  }

  static async addDocument(params?: Record<string, any>): Promise<Draft> {
    const response = await sendPost(`/document_out/add`, params);
    return response.data as Draft;
  }

  static async updateDocument(
    id: number,
    params: Record<string, any>
  ): Promise<Draft> {
    const response = await sendPost(`/document_out/update/${id}`, params);
    return response.data as Draft;
  }

  static async addNewDocumentAttachment(
    draftId: string,
    params?: Record<string, any>
  ): Promise<DocAttachment> {
    const response = await sendPost(
      `/doc_out_attach/add/relate/${draftId}`,
      params
    );
    return response.data as DocAttachment;
  }

  static async addNewDraftAttachment(
    draftId: string,
    params?: Record<string, any>
  ): Promise<DocAttachment> {
    const response = await sendPost(
      `/doc_out_attach/add/draft/${draftId}`,
      params
    );
    return response.data as DocAttachment;
  }

  static async updateTemplateToDoc(
    type: string,
    templateId: string,
    docId: string
  ): Promise<any> {
    const response = await sendGet(
      `/template/update/${type}/${templateId}/${docId}`
    );
    return response.data;
  }

  static async updateAlreadyFile(
    docId: string,
    listId: number[]
  ): Promise<any> {
    const response = await sendPost(
      `/taskAtt/updateAttachment?docId=${docId}`,
      listId
    );
    return response.data;
  }

  static async getDetailDoc(docId: string | null): Promise<Draft> {
    const response = await sendGet(`/document_out/getDetailById/${docId}`);
    return response.data as Draft;
  }

  static async getDocumentComments(documentId: number): Promise<any[]> {
    const res = await sendGet(`/doc_out_comment/getListByDocId/${documentId}`);
    return res.data as any;
  }

  static async getDetailDocToShow(docId: string | null): Promise<Draft> {
    const response = await sendGet(`/document_out/getDetailToShow/${docId}`);
    return response.data as Draft;
  }

  static async getListDocumentReceive(docId: string | null): Promise<
    {
      id: string;
      type: "ORG" | "USER";
    }[]
  > {
    const response = await sendGet(`/document_out/getListDocumentReceive`, {
      docId,
    });
    return response.data as {
      id: string;
      type: "ORG" | "USER";
    }[];
  }

  static async forwardDocument(params: Record<string, any>): Promise<string> {
    const response = await sendPost(`/document_out/forward`, params);
    return response.data;
  }

  // User search for signer selection (used by hooks in document-in.data)
  static async searchUserActive(textSearch: string): Promise<ReceiveToKnow[]> {
    const params = new URLSearchParams();
    params.append("textSearch", textSearch ?? "");
    const response = await sendPost("/users/search-sign-org", params);
    return response.data as ReceiveToKnow[];
  }

  static async doIssuedDraftNew(issuedObj: Record<string, any>): Promise<any> {
    const response = await sendPost("/document_out/issuednew", issuedObj);
    return response.data;
  }

  static async doIssuedDraft(draftId: number): Promise<any> {
    const response = await sendPost(`/document_out/issued/${draftId}`);
    return response.data;
  }
  static async doTransfer(
    docId: number | null,
    params: any,
    comment: string
  ): Promise<any> {
    const response = await sendPost(
      `/document_out/transfer/${docId}`,
      comment,
      params
    );
    return response.data;
  }
  static async doRequestSign(
    docId: number | null,
    params: any,
    comment: string
  ): Promise<any> {
    const response = await sendPostRaw(
      `/document_out/request_sign/${docId}`,
      comment,
      params
    );
    return response.data;
  }

  static async doQuickSearch(searchParams: any): Promise<any> {
    const response = await sendGet("/common/quick-search/1", searchParams);
    const pageData = response.data;
    return {
      objList: pageData?.objList || [],
      totalRecord: pageData?.totalRecord || 0,
      totalPage: pageData?.totalPage || 0,
    };
  }
  static async doLoadTaskReport(attId: string): Promise<any> {
    const response = await sendGet(
      `/doc_out_attach/getReportAttachment/${attId}`
    );
    return response.data;
  }
}
