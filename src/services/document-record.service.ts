import { sendPost, sendGet } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import {
  AttachedDocumentResponse,
  AttachedDocumentSearch,
  SearchTaskDocument,
} from "@/definitions/types/document-out.type";

export class DocumentRecordService {
  static async doSearchDocumentOut(
    searchDocumentFilter: SearchTaskDocument,
    page: number
  ) {
    const res = await sendPost(
      Constant.TASK_NEW.SEARCH_DOC_OUT + page,
      searchDocumentFilter
    );
    return res.data;
  }

  static async doSearchDocumentIn(
    searchDocumentFilter: SearchTaskDocument,
    page: number
  ) {
    const res = await sendPost(
      Constant.TASK_NEW.SEARCH_DOC_IN + page,
      searchDocumentFilter
    );
    return res.data as AttachedDocumentResponse;
  }

  static async doSearchAttachedDocument(
    searchDocumentFilter: AttachedDocumentSearch,
    page: number
  ) {
    const res = await sendPost(
      Constant.TASK_NEW.SEARCH_DOC_IN + page,
      searchDocumentFilter
    );
    return res.data as AttachedDocumentResponse;
  }

  static async doCreateFolder(folder: any, userId: string) {
    const res = await sendPost(`/hstl/addFolder?userApprove=${userId}`, folder);
    return res.data;
  }

  static async doUpdateFolder(folder: any, userId: string) {
    const res = await sendPost(
      `/hstl/updateFolder/${folder.id}?userApprove=${userId}`,
      folder
    );
    return res.data;
  }

  static async getFolderById(folderId: string) {
    const res = await sendGet(`/hstl/getFolderById?folderId=${folderId}`);
    return res.data;
  }

  static async doDelete(folderId: string, id: string, iconType: string) {
    const res = await sendPost(
      `/hstl/delete?folderId=${folderId}&id=${id}&iconType=${iconType}`,
      null
    );
    return res.data;
  }

  static async doAddFile(fileInfo: any) {
    const formData = new FormData();
    if (fileInfo.files.length > 0) {
      formData.append("file", fileInfo.files[0]);
    }

    const queryParams = new URLSearchParams({
      folderId: fileInfo.folderId.toString(),
      comment: fileInfo.comment || "",
    });

    const res = await sendPost(
      `/hstl/addFile?${queryParams.toString()}`,
      formData
    );
    return res.data;
  }

  static async AddFilesToField(fileInfo: any, id: string) {
    const formData = new FormData();
    if (fileInfo.files.length > 0) {
      formData.append("file", fileInfo.files[0]);
    }
    const res = await sendPost(`/hstl/file/add/${id}`, formData);
    return res.data;
  }

  static async AddSizeFILE(fileInfo: any) {
    const formData = new FormData();
    if (fileInfo.length > 0) {
      formData.append("file", fileInfo[0]);
    }
    const res = await sendPost("/files/page-size", formData);
    return res.data;
  }

  static async AddFieldFile(fileInfo: any) {
    const res = await sendPost("/hstl/file/add", fileInfo);
    return res.data;
  }

  static async doAddDocument(folderId: string, document: any) {
    const res = await sendPost(
      `/hstl/addDocument?folderId=${folderId}`,
      document
    );
    return res.data;
  }

  static async doAddDocuments(folderId: string, documents: any[]) {
    const res = await sendPost(
      `/hstl/addDocument?folderId=${folderId}`,
      documents
    );
    return res.data;
  }

  static async doAddExistingDocument(folderId: string, documentId: string) {
    const res = await sendPost(
      `/hstl/addExistingDocument?folderId=${folderId}&documentId=${documentId}`,
      {}
    );
    return res.data;
  }

  static async getListByFolderId(folderId: string): Promise<any> {
    const res = await sendGet(
      `/hstl/getListAllByFolderId?folderId=${folderId}`
    );
    return res.data;
  }

  static async getDetailByFolderId(
    folderId: string,
    type?: string
  ): Promise<any> {
    let params = {};
    params =
      type && type !== ""
        ? {
            folderId,
            type,
          }
        : {
            folderId,
          };
    const res = await sendGet("/hstl/getDetailByFolderId", { params });
    return res.data;
  }

  static async getListByFolderIdNew(
    folderId: string,
    type?: string
  ): Promise<any> {
    let params = {};
    params =
      type && type !== ""
        ? {
            folderId,
            type,
          }
        : {
            folderId,
          };
    const res = await sendGet("/hstl/getDataDetailByFolderId", { params });
    return res.data;
  }

  static async getListFolder(type?: string): Promise<any> {
    let params = {};
    if (type && type !== "") {
      params = {
        folderType: type,
      };
    }
    const res = await sendGet("/hstl/getListRootFolder", params);
    return res.data;
  }

  static async changeFolderName(folder: any): Promise<any> {
    const params = {
      folderId: folder.id,
      name: folder.name,
    };
    const res = await sendPost("/hstl/changeFolderName", null, { params });
    return res.data;
  }

  static async addShare(
    shareData: {
      folderId: string;
      userId: string;
      permission: string;
    }[]
  ): Promise<any> {
    const res = await sendPost("/hstl/addShare", shareData);
    return res.data;
  }

  static async stopShare(folderId: string): Promise<any> {
    const res = await sendGet(`/hstl/stopShare/${folderId}`);
    return res.data;
  }

  static async sendToHSCV(
    folderId: string,
    userId: string,
    maintenance: string
  ): Promise<any> {
    const res = await sendGet(
      `/hstl/transferToHSCV?folderId=${folderId}&userApprove=${userId}&maintenance=${maintenance}`
    );
    return res.data;
  }

  static async doLoadHSCV(
    tab: number,
    page: number,
    size: number
  ): Promise<any> {
    const res = await sendGet(
      `/hstl/getListHSCV?tab=${tab}&page=${page}&size=${size}`
    );
    return res.data;
  }

  static async doLoadHSCQ(
    tab: number,
    searchParams: Record<string, any>
  ): Promise<any> {
    const res = await sendGet(`/hstl/getListHSCQ?tab=${tab}`, {
      ...searchParams,
    });
    return res.data;
  }

  static async doLoadHSPB(tab: number, searchParams: any): Promise<any> {
    const res = await sendGet(`/hstl/getListHSPB?tab=${tab}`, {
      params: DocumentRecordService.getValidParams(searchParams),
    });
    return res.data;
  }

  static async doLoadFormHSNL(register = false, page: number): Promise<any> {
    const res = await sendGet("/hstl-form/list", {
      params: { register, page },
    });
    return res.data;
  }

  static async doLoadHSNL(register = false, page: number): Promise<any> {
    const res = await sendGet("/hstl-form/folders/list", {
      params: { register, page },
    });
    return res.data;
  }

  static async doLoadFormById(formId: string): Promise<any> {
    const res = await sendGet(`/hstl-form/${formId}`);
    return res.data;
  }

  static async doLoadFormRegistered(): Promise<any> {
    const res = await sendGet("/hstl-form/all");
    return res.data;
  }

  static async doLoadEnum(type = ""): Promise<any> {
    const res = await sendGet(`/hstl-form/enum/${type}`);
    return res.data;
  }

  static async doRegisterFolder(formId: string, data: any): Promise<any> {
    const formData = new FormData();
    if (data && data.length > 0) {
      for (const d of data) {
        formData.append("ids", d);
      }
    }
    const res = await sendPost(
      `/hstl-form/folders/register/${formId}`,
      formData
    );
    return res.data;
  }

  static async doRegisterForm(formId: string): Promise<any> {
    const res = await sendGet(`/hstl-form/register/${formId}`);
    return res.data;
  }

  static async doDeleteForm(formId: string): Promise<any> {
    const res = await sendGet(`/hstl-form/delete/${formId}`);
    return res.data;
  }

  static async doExportFolderForm(form: any): Promise<any> {
    const exportFile = await sendPost("/hstl-form/export", form, {
      responseType: "blob",
    });
    return exportFile;
  }

  static async doUpdateFolderForm(form: any): Promise<any> {
    const res = await sendPost(`/hstl-form/form/update/${form.id}`, form);
    return res.data;
  }

  static async doSaveFolderForm(form: any): Promise<any> {
    const res = await sendPost("/hstl-form/add", form);
    return res.data;
  }

  static async doSaveRecordFormFile(formId: string, files: any): Promise<any> {
    const formData = new FormData();
    formData.append("type", "5");
    for (const file of files) {
      formData.append("files", file);
    }
    const res = await sendPost(`/taskAtt/add/${formId}`, formData);
    return res.data;
  }

  static async doDeleteRecordFormFile(fileId: string): Promise<any> {
    const res = await sendPost(`/taskAtt/deleteById/${fileId}`, null);
    return res.data;
  }

  static getValidParams(searchParams: any) {
    const params = {
      createBy: searchParams.createBy != -1 ? searchParams.createBy : "",
      folderName: searchParams.folderName,
      orgQLId: searchParams.orgQLId != -1 ? searchParams.orgQLId : "",
      monthCreate: searchParams.monthCreate,
      yearCreate: searchParams.yearCreate,
    };
    return params;
  }

  static async doFinishHSCV(folderId: string): Promise<any> {
    const res = await sendGet(`/hstl/finishHSCV?folderId=${folderId}`);
    return res.data;
  }

  static async doLoadFullDetailFolder(
    folderId: string,
    size: number,
    page: number
  ): Promise<any> {
    const res = await sendGet(
      `/hstl/getListVBByFolderId?folderId=${folderId}&size=${size}&page=${page}`
    );
    return res.data;
  }

  static async doLoadBasicDetailFolder(folderId: string): Promise<any> {
    const res = await sendGet(`/hstl/getFolderDetailById?folderId=${folderId}`);
    return res.data;
  }

  static async doApproveOrReject(params: any): Promise<any> {
    const res = await sendGet("/hstl/review", { params });
    return res.data;
  }

  static async sendToHSCQ(folderId: string, userId: string): Promise<any> {
    const res = await sendGet(
      `/hstl/transferToHSCQ?folderId=${folderId}&userApprove=${userId}`
    );
    return res.data;
  }

  static async getParentOrgById(orgId: string): Promise<any> {
    const res = await sendGet(`/org/findParentByOrgId/${orgId}`);
    return res.data;
  }

  static async getAllOrgAndSub(orgId: string | number): Promise<any> {
    const res = await sendGet(`/org/findAllOrgAndSub/${orgId}`);
    return res.data;
  }

  static async getHstlContainDocId(
    docId: string,
    docType: string
  ): Promise<any> {
    const res = await sendGet(
      `/hstl/getHosoByDocIdAndDocType?docId=${docId}&docType=${docType}`
    );
    return res.data;
  }

  static async getListShare(folderId: string): Promise<any> {
    const res = await sendGet(`/hstl/getListShare?folderId=${folderId}`);
    return res.data;
  }

  static async shareFolder(shareData: {
    folderId: string;
    userIds: string[];
    permissions: string[];
  }): Promise<any> {
    const res = await sendPost("/hstl/addShare", shareData);
    return res.data;
  }

  static async transferFolder(
    folderId: string,
    parentId: string
  ): Promise<any> {
    const res = await sendGet(
      `/hstl/transferFolder?folderId=${folderId}&parentId=${parentId}`
    );
    return res.data;
  }

  static async transferFileToOtherFolder(
    fileId: string,
    folderIdFrom: string,
    folderIdTo: string,
    docId: string
  ): Promise<any> {
    const res =
      await sendGet(`/hstl/transferFileToOtherFolder?fileId=${fileId}&folderIdFrom=${folderIdFrom}
    &folderIdTo=${folderIdTo}&docId=${docId}`);
    return res.data;
  }

  static async getById(folderId: string): Promise<any> {
    const res = await sendGet(`/hstl/getById?folderId=${folderId}`);
    return res.data;
  }

  static async getFiles(id: string): Promise<any> {
    const res = await sendGet(`/hstl/file/detail/${id}`);
    return res.data;
  }

  static async getDocs(id: string): Promise<any> {
    const res = await sendGet(`/hstl/doc/detail/${id}`);
    return res.data;
  }

  static async addHeading(heading: any): Promise<any> {
    const res = await sendPost("/headings/add", heading);
    return res.data;
  }

  static async editHeading(heading: any): Promise<any> {
    const res = await sendPost(`/headings/edit/${heading.id}`, heading);
    return res.data;
  }

  static async deleteHeading(headingId: string): Promise<any> {
    const res = await sendPost(`/headings/del/${headingId}`, null);
    return res.data;
  }

  static async exportDocument(folderId: number): Promise<any> {
    const res = await sendGet(
      `/headings/record/doc/export?folderId=${folderId}`,
      { responseType: "blob" }
    );
    return res;
  }

  static async exportFolder(params: any): Promise<any> {
    const res = await sendGet("/headings/record/folder/export", params, {
      responseType: "blob",
    });
    return res;
  }

  static async getHeadingTree(): Promise<any> {
    const res = await sendGet("/headings/tree");
    return res.data;
  }

  static async getHeadingFolderTree(params: any): Promise<any> {
    const res = await sendGet("/headings/folder/tree", { params });
    return res.data;
  }

  static async exportHeading(params: any): Promise<any> {
    const res = await sendGet("/headings/record/export", params, {
      responseType: "blob",
    });
    return res;
  }

  static async getSearchInit(): Promise<any> {
    const res = await sendGet("/hstl/search/criteria");
    return res.data;
  }

  static async getOrganList(): Promise<any> {
    const res = await sendGet("/font/list");
    return res.data;
  }

  static async AddFont(params: any): Promise<any> {
    console.log(params);
    const res = await sendPost("/font/add", params);
    return res.data;
  }

  static async DeleteFont(id: string): Promise<any> {
    const res = await sendPost(`/font/del/${id}`, id);
    return res.data;
  }

  static async getDetailFont(id: string): Promise<any> {
    const res = await sendGet(`/font/detail/${id}`);
    return res.data;
  }

  static async getListFont(page: number): Promise<any> {
    const res = await sendGet(`/font/page/${page}`);
    return res.data;
  }

  static async updateFont(value: any): Promise<any> {
    console.log(value);
    const res = await sendPost(`/font/update/${value.id}`, value);
    return res.data;
  }
  static async getUsersByOrgWithAuthority(
    orgId: string,
    authority: string
  ): Promise<any> {
    const res = await sendGet(
      `/users/findUserByOrgWithAuthority?orgId=${orgId}&authority=${authority}`
    );
    return res.data;
  }

  static async getListVBByFolderId(
    folderId: string,
    size: number,
    page: number
  ): Promise<any> {
    const res = await sendGet(
      `/hstl/getListVBByFolderId?folderId=${folderId}&size=${size}&page=${page}`
    );
    return res.data;
  }

  static async getAllDocuments(page: number): Promise<any> {
    const res = await sendPost(`/document/find_all/${page + 1}`, {});
    return res.data;
  }

  static async getListRootFolder(): Promise<any> {
    const res = await sendGet("hstl/getListRootFolder");
    return res.data?.data || res.data;
  }

  static async getDataDetailByFolderId(
    folderId: string,
    type?: string
  ): Promise<any> {
    const params: any = { folderId };
    if (type && type !== "") {
      params.type = type;
    }
    const res = await sendGet("/hstl/getDataDetailByFolderId", params);
    return res.data;
  }

  static async getFolderDetailById(folderId: string): Promise<any> {
    const res = await sendGet(`/hstl/getFolderDetailById?folderId=${folderId}`);
    return res.data;
  }
}
