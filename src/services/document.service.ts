import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import { RejectDocument } from "@/definitions/types/document.type";

// Utility to mimic arrayToFormData
function arrayToFormData(
  formData: FormData,
  key: string,
  array: any[]
): FormData {
  if (Array.isArray(array)) {
    array.forEach((item, index) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((subKey) => {
          formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
        });
      } else {
        formData.append(`${key}[${index}]`, item);
      }
    });
  }
  return formData;
}

// Date utility functions (simplified)
function getDateCalendar(date: any): string {
  if (!date) return "";
  if (typeof date === "string") return date;
  return new Date(date).toISOString().split("T")[0];
}

function convertStringDateToNgbDate(
  dateStr: string | null
): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
}

// Mock toastr for notifications
const toastr = {
  error: (message: string) => console.error(`Error: ${message}`),
  success: (message: string) => console.log(`Success: ${message}`),
};

// Mock dateTimeService
const dateTimeService = {
  convertStringDateToNgbDate,
};

// Mock location (simplified)
const location = {
  go: (path: string, query?: string) => {
    console.log(`Navigating to ${path}${query ? `?${query}` : ""}`);
  },
};

export interface Comments {
  comment: string;
  attachments?: File[];
}

export class DocumentService {
  static async getReceiveAndSend(docId: number): Promise<any> {
    const response = await sendGet(
      `/doc_in_process/tracking/list/${docId}`,
      {}
    );
    return response.data;
  }

  static async getAllDocumentOut(): Promise<any[]> {
    const response = await sendGet(Constant.DOCUMENT_OUT.GET_ALL, {});
    return response.data;
  }

  static async getWaitingDocumentOut(page: number): Promise<any> {
    const response = await sendGet(Constant.DOCUMENT_OUT.GET_ALL_WAITING, {
      page,
    });
    return response.data;
  }

  static async getDoneDocumentOut(page: number): Promise<any> {
    const response = await sendGet(Constant.DOCUMENT_OUT.GET_ALL_DONE, {
      page,
    });
    return response.data;
  }

  static async getDocumentOutById(documentId: number): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.GET_BY_ID + documentId,
      {}
    );
    return response.data;
  }

  static async getDocumentOutDetailById(
    documentId: number,
    notId?: string,
    tab?: string
  ): Promise<any> {
    const params: Record<string, string> = {};
    if (tab) params.tab = tab;
    if (notId && notId !== null) params.notId = "notId";
    const response = await sendGet(
      Constant.DOCUMENT_OUT.GET_DETAIL_BY_ID + documentId,
      params
    );
    return response.data;
  }

  static async getDocumentOutArrival(): Promise<any> {
    const response = await sendGet(Constant.DOCUMENT_OUT.GET_ARRIVAL, {});
    return response.data;
  }

  static async doSaveDocumentOut(
    document: any,
    documentId: number
  ): Promise<any> {
    const response = await sendPost(
      Constant.DOCUMENT_OUT.UPDATE + documentId,
      document
    );
    return response.data;
  }

  static async doUpdateReceiveDoc(
    document: any,
    documentId: number
  ): Promise<any> {
    document.orgTransfer = null;
    const response = await sendPost(
      `${Constant.DOCUMENT_OUT.ADD}?receive=true`,
      document
    );
    return response.data;
  }

  static async doSaveNewDocumentOut(document: any): Promise<any> {
    const response = await sendPost(Constant.DOCUMENT_OUT.ADD, document);
    return response.data;
  }

  static async doActiveDocumentOut(documentId: number): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.ACTIVE + documentId,
      {}
    );
    return response.data;
  }

  static async doDeactiveDocumentOut(documentId: number): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.DEACTIVE + documentId,
      {}
    );
    return response.data;
  }

  static async doDeleteDocument(documentId: number): Promise<any> {
    const response = await sendPost(
      Constant.DOCUMENT_OUT.DELETE + documentId,
      null
    );
    return response.data;
  }

  static async doDeleteDocumentWaitIssued(documentId: number): Promise<any> {
    const response = await sendPost(`/document_out/delete/${documentId}`, null);
    return response.data;
  }

  static async getListSend(documentId: number): Promise<any> {
    const response = await sendGet(
      `/document/node-reject/list/${documentId}`,
      {}
    );
    return response.data;
  }

  static async doRejectDocument(item: RejectDocument): Promise<any> {
    const formData = new FormData();
    if (item.selectedFiles && item.selectedFiles.length > 0) {
      for (const file of item.selectedFiles) {
        formData.append("files", file);
      }
    }
    formData.append("pId", item.pid);
    formData.append("docId", item.documentId.toString());
    formData.append("comment", item.rejectComment);
    const response = await sendPost("/document/node-reject/do", formData);
    return response.data;
  }

  static async doRetakeDocument(item: {
    selectedFiles?: File[][];
    pid: string;
    documentId: number;
    rejectComment: string;
  }): Promise<any> {
    const formData = new FormData();
    if (item.selectedFiles && item.selectedFiles[0]?.length > 0) {
      for (const file of item.selectedFiles[0]) {
        formData.append("files", file);
      }
    }
    formData.append("pId", item.pid);
    formData.append("docId", item.documentId.toString());
    formData.append("comment", item.rejectComment);
    const response = await sendPost(
      Constant.DOCUMENT_OUT.RETAKE + item.documentId,
      formData
    );
    return response.data;
  }

  static async doDoneDocumentTask(
    documentId: number,
    doneComment: string,
    files: File[],
    isFinishReceive: boolean = false
  ): Promise<any> {
    const formData = new FormData();
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }
    formData.append("comment", doneComment);
    formData.append("special", isFinishReceive.toString());
    const response = await sendPost(
      Constant.DOCUMENT_PROCESS.DONE + documentId,
      formData
    );
    return response.data;
  }

  static async doDoneMultiDocumentTask(
    documentIds: string,
    isFinishReceive: boolean = false
  ): Promise<any> {
    const formData = new FormData();
    formData.append("docIds", documentIds);
    const response = await sendPost(Constant.DOCUMENT_PROCESS.DONE, formData);
    return response.data;
  }

  static async doGetHandleType(
    documentId: string | number | null,
    tabName: string = ""
  ): Promise<any> {
    const params = tabName ? { tab: tabName } : {};
    const response = await sendGet(
      Constant.DOCUMENT_PROCESS.HANDLE_TYPE + documentId,
      params
    );
    return response.data;
  }

  static async checkTypeHandleByDoc(docId: number): Promise<any> {
    const response = await sendGet(
      `/doc_in_process/checkTypeHandleByDoc/${docId}`,
      {}
    );
    return response.data;
  }

  static async doTransferHandleDocument(
    documentId: number,
    transferComment: string,
    main: string,
    supports: string,
    shows: string,
    node: string,
    files: File[]
  ): Promise<any> {
    const formData = new FormData();
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }
    formData.append("comment", transferComment);
    formData.append("main", main);
    formData.append("supports", supports);
    formData.append("shows", shows);
    formData.append("node", node);
    const response = await sendPost(
      Constant.DOCUMENT_OUT.TRANSFER + documentId,
      formData
    );
    return response.data;
  }

  static async doTransferHandleDocumentList(
    docList: string,
    transferComment: string,
    main: any[],
    supports: any[],
    shows: any[],
    orgMain: any[],
    orgSupport: any[],
    orgShow: any[],
    direction: any[],
    node: string,
    files: File[],
    deadline: string,
    requestReview: string,
    cmtContent: string
  ): Promise<any> {
    let formData = new FormData();
    formData.append("docIds", docList);
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }
    formData.append("cmtContent", cmtContent);
    formData.append("comment", transferComment);
    formData.append("node", node);
    formData = arrayToFormData(formData, "org_main", orgMain);
    formData = arrayToFormData(formData, "org_support", orgSupport);
    formData = arrayToFormData(formData, "org_show", orgShow);
    formData = arrayToFormData(formData, "main", main);
    formData = arrayToFormData(formData, "support", supports);
    formData = arrayToFormData(formData, "show", shows);
    formData = arrayToFormData(formData, "direction", direction);
    formData.append("deadline", deadline);
    formData.append("requestReview", requestReview);
    const response = await sendPost(
      Constant.DOCUMENT_OUT.TRANSFER_LIST,
      formData
    );
    return response.data;
  }

  static async doGetTransferTracking(documentId: number): Promise<any> {
    const response = await sendGet(
      `/doc_in_process/tracking/list/${documentId}`,
      {}
    );
    return response.data;
  }

  static async doGetLogTracking(
    documentId: number,
    page: number
  ): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.LOG_TRACKING + documentId,
      { page }
    );
    return response.data;
  }

  static async doGetAllLogTracking(documentId: number): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.ALL_LOG_TRACKING + documentId,
      {}
    );
    return response.data;
  }

  static async doBasicSearchIncomming(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.INCOMMING_BASIC_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doAdvanceSearchIncomming(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.INCOMMING_ADVANCE_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doSearchWaiting(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.WAITING_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doSearch(params: Record<string, any> = {}): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.FIND_DOC_REPLY,
      params
    );
    return response.data;
  }

  static async doBasicSearchWaitingDoc(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.WAIT_DOC_BASIC_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doAdvanceSearchWaitingDoc(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.WAIT_DOC_ADVANCE_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doSearchHandlingDoc(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.HANDLING_DOC_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doBasicSearchDoneDoc(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.DONE_DOC_BASIC_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doAdvanceSearchDoneDoc(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.DONE_DOC_ADVANCE_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async doBasicSearchAll(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.BASIC_ALL_SEARCH + param,
      {}
    );
    return response.data;
  }

  static async exportExcelDocumentIn(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.EXPORT_EXCEL + param,
      {}
    );
    return response.data;
  }

  static async exportExcelDocumentFlowingIn(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.EXPORT_EXCEL_FlOWING + param,
      {}
    );
    return response.data;
  }

  static async doAdvanceSearchAll(param: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.ADVANCE_ALL_SEARCH + param,
      {}
    );
    return response.data;
  }

  static getQueryParams(
    searchField: Record<string, any>,
    listDateName: string[]
  ): Record<string, any> {
    const searchFieldQueryParams = { ...searchField };
    for (const dateName of listDateName) {
      searchFieldQueryParams[dateName] = DocumentService.convertDateToParam(
        searchField,
        dateName
      );
    }
    return searchFieldQueryParams;
  }

  static convertDateToParam(
    searchField: Record<string, any>,
    fieldName: string
  ): string {
    return searchField[fieldName]
      ? getDateCalendar(searchField[fieldName])
      : "";
  }

  static convertSearchFieldToParams(
    searchField: Record<string, any>,
    params: Record<string, any>,
    listDateName: string[]
  ): Record<string, any> {
    Object.assign(params, searchField);
    for (const dateName of listDateName) {
      params[dateName] = getDateCalendar(searchField[dateName]);
    }
    return params;
  }

  static transferValueFromParamstoSearchField(
    searchField: Record<string, any>,
    params: Record<string, any>,
    listDateName: string[] = []
  ): Record<string, any> {
    Object.assign(searchField, params);
    for (const dateName of listDateName) {
      searchField[dateName] = dateTimeService.convertStringDateToNgbDate(
        params[dateName]
      );
    }
    if ("isAdvanceSearch" in params) {
      searchField.isAdvanceSearch = params.isAdvanceSearch === "true";
    }
    if ("currentTab" in params) {
      console.log("currentTab", searchField.currentTab, params.currentTab);
    }
    return searchField;
  }

  static addDateToHttpParams(
    params: Record<string, any>,
    listDateName: string[] = [],
    searchField: Record<string, any>
  ): Record<string, any> {
    for (const dateName of listDateName) {
      params[dateName] = DocumentService.convertDateToParam(
        searchField,
        dateName
      );
    }
    return params;
  }

  static addQueryParamsToUrl(
    routePath: string,
    searchField: Record<string, any>,
    listDateName: string[]
  ): void {
    const searchFieldDateConverted = DocumentService.getQueryParams(
      searchField,
      listDateName
    );
    const queryString = Object.keys(searchFieldDateConverted)
      .map((key) => `${key}=${searchFieldDateConverted[key]}`)
      .join("&");
    location.go(routePath, queryString);
  }

  static async doUpdateDeadline(
    docId: number,
    deadline: string,
    type: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("deadline", deadline);
    formData.append("type", type);
    const response = await sendPost(
      `${Constant.DOCUMENT_OUT.UPDATE_DEADLINE + docId}`,
      formData
    );
    return response.data;
  }

  static async finDocByType(
    type: number,
    status: number,
    param: string
  ): Promise<any> {
    const response = await sendGet(
      `${Constant.DOCUMENT_OUT.FIND_DOC_BY_TYPE + type}/${status}?${param}`,
      {}
    );
    return response.data;
  }

  static async doUpdateProgress(
    docId: number,
    progress: string,
    comment: string,
    tab: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("tab", tab);
    formData.append("progress", progress);
    formData.append("comment", comment);
    const response = await sendPost(
      Constant.DOCUMENT_OUT.UPDATE_PROGRESS + docId,
      formData
    );
    return response.data;
  }

  static async setImportantDocument(
    docId: number,
    important: boolean
  ): Promise<any> {
    const formData = new FormData();
    formData.append("docId", docId.toString());
    formData.append("important", important.toString());
    const response = await sendPost("/doc_in_process/setImportant", formData);
    return response.data;
  }

  static async changeImportantStatus(
    param: { docId: number; important: boolean | null },
    draft: { important: boolean }
  ): Promise<void> {
    param.important = param.important == null ? true : !param.important;
    try {
      const response = await DocumentService.setImportantDocument(
        param.docId,
        param.important
      );
      if (typeof response !== "boolean") {
        toastr.error(response);
      } else {
        draft.important = param.important;
      }
    } catch (error: any) {
      toastr.error(error.message);
    }
  }

  static async doTransferMultiHandleDocumentList(
    docList: string,
    transferComment: string,
    main: any[],
    node: string,
    files: File[],
    deadline: string,
    special: boolean = false
  ): Promise<any> {
    let formData = new FormData();
    formData.append("docIds", docList);
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }
    formData.append("comment", transferComment);
    formData.append("node", node);
    formData = arrayToFormData(formData, "listOrg", main);
    formData.append("deadline", deadline);
    formData.append("special", special.toString());
    const response = await sendPost("/document/org/transfer", formData);
    return response.data;
  }

  static async doRejectChildrenDocument(
    documentId: number,
    rejectComment: Comments,
    files: File[] = [],
    isDelegate: boolean = false
  ): Promise<any> {
    const formData = new FormData();
    files = rejectComment.attachments || files;
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("comment", rejectComment.comment);
    const response = await sendPost(`/document/reject/${documentId}`, formData);
    return response.data;
  }

  static async doRetakeChildrenDocument(
    documentId: number,
    rejectComment: Comments,
    files: File[] = [],
    isDelegate: boolean = false
  ): Promise<any> {
    const formData = new FormData();
    files = rejectComment.attachments || files;
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("comment", rejectComment.comment);
    const response = await sendPost(
      `/document/org/retake/${documentId}`,
      formData
    );
    return response.data;
  }

  static async doRequestEvaluate(
    docId: number,
    comment: Comments,
    isDelegate: boolean
  ): Promise<any> {
    const formData = new FormData();
    if (comment?.attachments && comment.attachments.length > 0) {
      for (const file of comment.attachments) {
        formData.append("files", file);
      }
    }
    const response = await sendPost(
      `/document/requestReview/${docId}`,
      formData,
      {
        comment: comment.comment,
        isDelegate: isDelegate.toString(),
      }
    );
    return response.data;
  }

  static async doEvaluate(
    docId: number,
    comment: Comments,
    agree: boolean,
    pId: string
  ): Promise<any> {
    const formData = new FormData();
    if (comment?.attachments && comment.attachments.length > 0) {
      for (const file of comment.attachments) {
        formData.append("files", file);
      }
    }
    const response = await sendPost(`/document/review/${docId}`, formData, {
      comment: comment.comment,
      agree: agree.toString(),
      pId,
    });
    return response.data;
  }

  static async doRequestComment(docId: number, body: any): Promise<any> {
    const response = await sendPost(
      Constant.DOCUMENT_OUT.REQUEST_COMMENT + docId,
      body
    );
    return response.data;
  }

  static async doSendComment(
    documentId: number,
    comment: string,
    files: File[]
  ): Promise<any> {
    const formData = new FormData();
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }
    formData.append("comment", comment);
    const response = await sendPost(
      Constant.DOCUMENT_OUT.SEND_COMMENT + documentId,
      formData
    );
    return response.data;
  }

  static async getOpinionDocuments(params: string): Promise<any> {
    const response = await sendGet(
      Constant.DOCUMENT_OUT.GET_COMMENT_DOCUMENT_LIST + params,
      {}
    );
    return response.data;
  }

  static async doReadDocument(
    listDocId: number[],
    comment: string
  ): Promise<any> {
    let arr = "";
    if (listDocId.length > 0) {
      arr = listDocId.map((id, index) => `docIds=${id}`).join("&");
    }
    const response = await sendGet(
      `/doc_in_process/finishReceiveToKnow?${arr}&comment=${comment}`,
      {}
    );
    return response.data;
  }

  static async doReadDocumentIn(listDocId: number[]): Promise<any> {
    let arr = "";
    if (listDocId.length > 0) {
      arr = listDocId.map((id, index) => `docIds=${id}`).join("&");
    }
    const response = await sendPost(`/document_out/read?${arr}`, {});
    return response.data;
  }

  static async getUserExistByNode(
    nodeId: number,
    step: number,
    docId: number
  ): Promise<any[]> {
    if (!docId) return [];
    const response = await sendGet(
      `${Constant.DOCUMENT_PROCESS.USER_EXIST_NODE + nodeId}/${step}/${docId}`,
      {}
    );
    return response.data;
  }

  static async getUserExistByNode2(
    nodeId: string,
    docId: number
  ): Promise<any[]> {
    if (!docId) return [];
    const response = await sendGet(
      `${Constant.DOCUMENT_PROCESS.USER_EXIST_NODE + nodeId}/${docId}`,
      {}
    );
    return response.data;
  }

  static async doSwitchMainOrAddSupportUser(
    docId: number,
    transferComment: string,
    main: any[],
    supports: any[],
    shows: any[],
    orgMain: any[],
    orgSupport: any[],
    orgShow: any[],
    node: string,
    files: File[],
    deadline: string,
    isSwitch: boolean,
    cmtContent: string
  ): Promise<any> {
    let formData = new FormData();
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }
    formData.append("comment", transferComment);
    formData.append("cmtContent", cmtContent);
    formData.append("node", node);
    formData = arrayToFormData(formData, "org_main", orgMain);
    formData = arrayToFormData(formData, "org_support", orgSupport);
    formData = arrayToFormData(formData, "org_show", orgShow);
    formData = arrayToFormData(formData, "main", main);
    formData = arrayToFormData(formData, "support", supports);
    formData = arrayToFormData(formData, "show", shows);
    formData.append("deadline", deadline);
    formData.append("isSwitch", isSwitch.toString());
    const response = await sendPost(
      Constant.DOCUMENT_OUT.SWITCH_MAIN_ADD_SUPPORT + docId,
      formData
    );
    return response.data;
  }

  static async doRetakeDoneDocument(
    documentId: number,
    doneComment: string,
    files: File[],
    type: boolean = true
  ): Promise<any> {
    if (type) {
      const formData = new FormData();
      if (files && files.length > 0) {
        for (const file of files) {
          formData.append("files", file);
        }
      }
      formData.append("comment", doneComment);
      const response = await sendPost(
        Constant.DOCUMENT_PROCESS.RETAKE_DONE + documentId,
        formData
      );
      return response.data;
    }
    const response = await sendPost(
      `/document_out/forward/unread?docId=${documentId}&comment=${doneComment}`,
      {}
    );
    return response.data;
  }

  static async loadUsersEvaluate(docId: number): Promise<any> {
    const response = await sendGet(`/document/node-review/list/${docId}`, {});
    return response.data;
  }

  static async findOrgByDocId(docId: number): Promise<any[]> {
    const response = await sendGet(`/doc_in_process/org/${docId}`, {});
    return response.data;
  }

  static async getListUsers(): Promise<any> {
    const response = await sendGet("/document_out/forward/users", {});
    return response.data;
  }

  static async getListUsersTransition(docId: number): Promise<any> {
    const response = await sendGet(`/document_out/forward/list/${docId}`, {});
    return response.data;
  }

  static async doTransition(
    docId: number,
    listId: { type: string; id: string }[],
    comment: string,
    type: boolean
  ): Promise<any> {
    let arr = "";
    if (listId.length > 0) {
      arr = listId
        .map((element, index) => {
          const key =
            element.type === "MAIN"
              ? "main"
              : element.type === "SUPPORT"
                ? "support"
                : "show";
          return `${key}=${element.id}${index < listId.length - 1 ? "&" : ""}`;
        })
        .join("");
    }
    const formData = new FormData();
    formData.append("comment", comment);
    const url = type
      ? `/document_out/forward/${docId}?${arr}`
      : `/document_out/forward/additional/${docId}?${arr}`;
    const response = await sendPost(url, formData);
    return response.data;
  }

  static async doReject(docIds: string): Promise<any> {
    const formData = new FormData();
    formData.append("docIds", docIds);
    const response = await sendPost(`/document/org/reject`, formData);
    return response.data;
  }

  static async documentTrasferComment(
    docList: string,
    cmtContent: string,
    node: string,
    main: string,
    requestReview: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("docIds", docList);
    formData.append("cmtContent", "-");
    formData.append("comment", cmtContent);
    formData.append("node", node);
    formData.append("main", main);
    formData.append("requestReview", requestReview);
    const response = await sendPost(
      Constant.DOCUMENT_OUT.TRANSFER_LIST,
      formData
    );
    return response.data;
  }

  static async documentTrasferListComment(
    docList: string,
    cmtContent: string,
    hash: string,
    node: string,
    main: string,
    requestReview: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("docIds", docList);
    formData.append("cmtContent", "-");
    formData.append("hash", hash);
    formData.append("comment", cmtContent);
    formData.append("node", node);
    formData.append("main", main);
    formData.append("requestReview", requestReview);
    const response = await sendPost(
      Constant.DOCUMENT_OUT.TRANSFER_LIST,
      formData
    );
    return response.data;
  }

  static async updateAlreadyFile(docId: number, listAId: any): Promise<any> {
    const response = await sendPost(
      `/taskAtt/updateAttachment?docId=${docId}`,
      listAId
    );
    return response.data;
  }
}
