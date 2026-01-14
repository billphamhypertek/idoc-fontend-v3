import { sendGet, sendPost } from "@/api";

export interface DocInternalListResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
}

export interface DocInternalParams {
  tab: string;
  text?: string;
  numberOrSign?: string;
  preview?: string;
  createFrom?: string;
  createTo?: string;
  approveFrom?: string;
  approveTo?: string;
  status?: string;
  page: number;
  sortBy?: string;
  direction?: string;
  size: number;
}

export class DocInternalService {
  static async getListDocInternal(
    params: DocInternalParams
  ): Promise<DocInternalListResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
    const res = await sendGet(
      `/doc_internal/getListDocInternal?${queryParams.toString()}`
    );
    return res.data as DocInternalListResponse;
  }

  static async getAllDocInternal(
    params: DocInternalParams
  ): Promise<DocInternalListResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
    const res = await sendGet(
      `/doc_internal/getAllDocInternal?${queryParams.toString()}`
    );
    return res.data as DocInternalListResponse;
  }

  static async getDetailById(docId: number): Promise<any> {
    const res = await sendGet(`/doc_internal/getDetailById/${docId}`);
    return res.data;
  }

  static async addDocInternal(body: any): Promise<any> {
    const res = await sendPost("/doc_internal/add", body);
    return res.data;
  }

  static async updateDocInternal(docId: number, body: any): Promise<any> {
    const res = await sendPost(`/doc_internal/update/${docId}`, body);
    return res.data;
  }

  static async deleteDocInternal(docId: number): Promise<any> {
    const res = await sendPost(`/doc_internal/delete/${docId}`, null);
    return res.data;
  }

  static async approveDocInternal(
    docId: number,
    comment: string,
    files: File[],
    accept: boolean
  ): Promise<any> {
    const formData = new FormData();
    if (files && files.length > 0) {
      for (const file of files) formData.append("files", file);
    }
    formData.append("comment", comment);
    formData.append("accept", String(accept));
    const res = await sendPost(`/doc_internal/approve/${docId}`, formData);
    return res.data;
  }

  static async retakeDocInternal(docId: number): Promise<any> {
    const res = await sendGet(`/doc_internal/retake/${docId}`);
    return res.data;
  }

  static async completeDocInternal(
    docId: number,
    files: File[] = [],
    comment: string = ""
  ): Promise<any> {
    const formData = new FormData();
    formData.append("comment", comment);
    if (files && files.length > 0) {
      for (const file of files) formData.append("file", file);
    }
    const res = await sendPost(
      `/doc_internal/completeNotApprove/${docId}`,
      formData
    );
    return res.data;
  }

  static async getDocInternalComments(docId: number): Promise<any[]> {
    const res = await sendGet(`/doc_internal/comment/load/${docId}`);
    return res.data;
  }

  static async addFiles(
    docId: number,
    docFiles: File[],
    addendumFiles: File[]
  ): Promise<any> {
    const formData = new FormData();
    if (docFiles && docFiles.length > 0) {
      for (const file of docFiles) formData.append("fileND", file);
    }
    if (addendumFiles && addendumFiles.length > 0) {
      for (const file of addendumFiles) formData.append("filePL", file);
    }
    const res = await sendPost(`/doc_internal/addFile/${docId}`, formData);
    return res.data;
  }

  static async updateFiles(
    docId: number,
    deleteIds: string,
    docFiles: File[],
    addendumFiles: File[]
  ): Promise<any> {
    const formData = new FormData();
    if (docFiles && docFiles.length > 0) {
      for (const file of docFiles) formData.append("fileND", file);
    }
    if (addendumFiles && addendumFiles.length > 0) {
      for (const file of addendumFiles) formData.append("filePL", file);
    }
    formData.append("deleteIds", deleteIds);
    const res = await sendPost(`/doc_internal/updateFile/${docId}`, formData);
    return res.data;
  }

  static async deleteAttachment(id: number): Promise<any> {
    const res = await sendPost(`/doc_internal/attachment/delete/${id}`, null);
    return res.data;
  }

  static async downloadFile(id: number): Promise<Blob> {
    const res = await sendGet(`/doc_internal/download/${id}`, undefined, {
      responseType: "blob",
    });
    return res;
  }

  static async getNumberOrSign(): Promise<string> {
    const res = await sendGet("/doc_internal/getNumberOrSign");
    // API trả về {data: {message: "số"}}
    return res.data?.message || res.data || "";
  }

  static async getAttachsByDocId(docId: number): Promise<any[]> {
    const res = await sendGet(`/doc_internal/getAttachs/${docId}`);
    return res.data;
  }

  static async getAllOrgByParentId(parentId: string = ""): Promise<any[]> {
    const res = await sendGet(`/org/findAllByParentId?parentId=${parentId}`);
    return res.data;
  }

  static async getUserApprove(orgId: string = ""): Promise<any[]> {
    const res = await sendGet(`/users/findLeadership?orgId=${orgId}`);
    return res.data;
  }

  static async getUserSign(): Promise<any[]> {
    const res = await sendGet("/users/findLanhDaoKy");
    return res.data;
  }

  static async getUsersLDCuc(): Promise<any[]> {
    const res = await sendGet("/users/getListLDCuc");
    return res.data;
  }

  static async findByExecuteDocinternal(docId: number): Promise<any> {
    const res = await sendGet(
      `/doc_internal/findByExecuteDocinternal/${docId}`
    );
    return res.data;
  }

  static async doSaveNewDraftComment(
    approveId: number,
    comment: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("comment", comment);
    const res = await sendPost(`/doc_internal/comment/${approveId}`, formData);
    return res.data;
  }

  static async doSaveNewCommentAttachment(
    commentId: number,
    files: File[]
  ): Promise<any> {
    const formData = new FormData();
    formData.append("commentId", String(commentId));
    if (files && files.length > 0) {
      for (const file of files) formData.append("files", file);
    }
    const res = await sendPost("/doc_internal/comment/attachment", formData);
    return res.data;
  }
}
