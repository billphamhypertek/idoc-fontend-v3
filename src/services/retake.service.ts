import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";

export const RetakeService = {
  getDocumentOut: (params: any = {}) => {
    return sendGet(`/document/list-retake`, params);
  },

  doAdvancedSearchDocumentOut: (params: any) => {
    return sendGet(`/document/search-retake`, params);
  },

  doBasicSearchDocumentOut: (params: any) => {
    return sendGet(`/document/quick-retake`, params);
  },

  doRetakeDocumentOut: (
    documentId: string,
    retakeComment: any,
    files: File[] = []
  ) => {
    const formData = new FormData();
    files = retakeComment.attachments || [];

    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("comment", retakeComment.comment);

    return sendPost(`/document/force-retake/${documentId}`, formData);
  },

  doUnretakeDocumentOut: (
    documentId: string,
    retakeComment: any,
    files: File[] = []
  ) => {
    const formData = new FormData();
    files = retakeComment.attachments || [];

    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("comment", retakeComment.comment);

    return sendPost(`/document/restore/${documentId}`, formData);
  },

  getRetookDocumentOut: (params: any) => {
    return sendGet(`/document/list-retaken`, params);
  },

  doBasicSearchRetookDocumentOut: (params: any) => {
    return sendGet(`/document/quick-retaken`, params);
  },

  doAdvancedSearchRetookDocumentOut: (params: any) => {
    return sendGet(`/document/search-retaken`, params);
  },

  getRetookDocumentIn: (params: any) => {
    return sendGet(`/document_out/searchListIssued`, {
      retaked: true,
      ...params,
    });
  },

  doBasicSearchRetookDocumentIn: (params: any) => {
    return sendGet(`/document_out/searchBasicIssued`, {
      retaked: true,
      ...params,
    });
  },

  doAdvancedSearchReTookDocumentIn: (params: any) => {
    return sendGet(`/document_out/searchListIssued`, {
      retaked: true,
      ...params,
    });
  },

  getDocumentIn: (params: any) => {
    return sendGet(`${Constant.RETAKE.GET_DOCUMENT_IN}`, params);
  },

  doAdvancedSearchDocumentIn: (params: any) => {
    return sendGet(`/document_out/searchListIssued`, params);
  },

  doBasicSearchDocumentIn: (params: any) => {
    return sendGet(`/document_out/searchBasicIssued`, params);
  },

  doUnretakeDraft: (docId: string, comment: string) => {
    return sendPost("/document_out/restore", null, {
      docId,
      comment,
    });
  },

  doRetakeDocIn: (docId: string, comment: any) => {
    const formData = new FormData();
    if (comment?.attachments?.length > 0) {
      for (const file of comment.attachments) {
        formData.append("files", file);
      }
    }
    return sendPost("/document_out/retakeByStep", formData, {
      params: { docId, comment: comment.comment },
    });
  },

  doRetakeDocOut: (docId: string, comment: any, isDelegate: boolean) => {
    const formData = new FormData();
    if (comment?.attachments?.length > 0) {
      for (const file of comment.attachments) {
        formData.append("files", file);
      }
    }
    formData.append("files", comment.comment); // giữ nguyên theo code cũ
    return sendPost(`/document/force-retake/${docId}`, formData);
  },

  doStepRetakeDocOut: (
    docId: string,
    comment: any,
    isDelegate: boolean,
    node: string
  ) => {
    const formData = new FormData();
    if (comment?.attachments?.length > 0) {
      for (const file of comment.attachments) {
        formData.append("files", file);
      }
    }
    formData.append("comment", comment.comment);
    formData.append("node", node);
    return sendPost(`/document/step-retake/${docId}`, formData);
  },

  checkButtonRetakeByStep: (docId: string, isDelegate: boolean) => {
    return sendGet("/document_out/checkAction", {
      params: { docId, isDelegate },
    });
  },

  checkImportBookButton: (
    docId: string,
    isDelegate: boolean,
    tabname: string
  ) => {
    return sendGet("/document_out/checkAction", {
      params: { docId, tab: tabname, isDelegate },
    });
  },

  getListRetake: () => {
    return sendGet("/document_out/checkAction", { params: {} });
  },
};
