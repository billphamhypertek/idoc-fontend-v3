import { sendGet, sendPost } from "@/api";
import { UserInfo } from "@/definitions";
import { OutsideAgencyResponse } from "@/definitions/types/common.type";
import {
  DocumentTemplateResponse,
  UserFromOrg,
} from "@/definitions/types/document.type";
import { Constant } from "@/definitions/constants/constant";

export class CommonService {
  static async getUserLeadOrgBanTransfer() {
    const response = await sendGet(`/common/user/lead`);
    return response.data;
  }
  static async getUserFromOrg(orgId: string, params: any): Promise<UserInfo[]> {
    const response = await sendGet(
      `/users/findListUserByOrgs/${orgId}`,
      params
    );
    return response.data;
  }

  static async getUserSharedFile(fileNames: string) {
    let param = "";
    param +=
      param == ""
        ? `fileNames=${encodeURIComponent(fileNames)}`
        : `&fileNames=${encodeURIComponent(fileNames)}`;
    return sendGet(`/common/user/shared-file?${param}`).then(
      (data) => data.data
    );
  }

  static async shareEncryptedFilesOutside(outsideId: any, encryptions: any) {
    const dto: any = { data: encryptions };
    return sendPost(`/integrate/encrypt/rq-add/${outsideId}`, dto)
      .then((data) => data)
      .catch((error) => {
        console.log(error);
      });
  }

  static async doEncrypt(key: any, encrypted: any, objId: any, type: any) {
    const formData = new FormData();
    formData.append("encrypted", encrypted);
    formData.append("key", key);
    formData.append("objId", objId);
    formData.append("type", type);
    return sendPost("/common/encrypt", formData).then((res) => res);
  }

  static async shareEncryptedFiles(encryptions: any) {
    const dto: any = { data: encryptions };
    dto.data = encryptions;
    return sendPost("/common/encrypt/add", dto)
      .then((data) => data)
      .catch((error) => {
        console.log(error);
      });
  }
  static async getEncryptedFile(
    name: string,
    url: string,
    attachId: string | null = null
  ) {
    if (attachId != null) {
      return sendGet(`${url}${attachId}`, undefined, {
        responseType: "blob",
      }).then((data) => data);
    }
    return sendGet(`${url}${encodeURIComponent(name)}`, undefined, {
      responseType: "blob",
    }).then((data) => data);
  }

  static async doUpdateEncrypt(
    key: any,
    encrypted: any,
    objId: any,
    type: any,
    fileId: any
  ) {
    const formData = new FormData();
    formData.append("encrypted", encrypted);
    formData.append("key", key);
    formData.append("objId", objId);
    formData.append("type", type);
    return sendPost(`/common/encrypt/${fileId}`, formData).then((res) => res);
  }
  static async getAttachsByTypeAndObjId(type: string, objId: number) {
    return sendGet(`/common/attach/list/${type}/${objId}`).then(
      (res) => res["data"]
    );
  }
  static async getCertByUserId(
    userIds: number[],
    orgIds: number[],
    type: string,
    isCheckLead = false
  ) {
    let param = "";
    for (const u of userIds) {
      param += u && param == "" ? `userIds=${u}` : `&userIds=${u}`;
    }
    for (const o of orgIds) {
      param += o && param == "" ? `orgIds=${o}` : `&orgIds=${o}`;
    }
    if (type) {
      param += param == "" ? `type=${type}` : `&type=${type}`;
    }
    param += param == "" ? "skipError=true" : "&skipError=true";
    return sendGet(
      isCheckLead
        ? `/common/user/cert-manager?${param}`
        : `/common/user/cert?${param}`
    ).then((res) => res.data);
  }

  static async certByUserId(
    userIds = [],
    orgIds = [],
    type = "doc_in_transfer",
    isCheckLead = false
  ) {
    if (!type) {
      type = "doc_in_transfer";
    }
    return CommonService.getCertByUserId(userIds, orgIds, type, isCheckLead);
  }
  static async getCertClerialByObjId(objId: number, type: string) {
    return sendGet(`/common/user/cert/edit/${objId}?type=${type}`).then(
      (res) => res.data
    );
  }
  static async getCertByObjId(objId: number, type: string) {
    return sendGet(`/common/user/cert/${objId}?type=${type}`).then(
      (res) => res.data
    );
  }
  static async checkCert(userCerts: any[]) {
    if (!userCerts || userCerts.length == 0) {
      return null;
    }
    let error = "";
    userCerts.forEach((element) => {
      if (!element || !element.id || !element.value) {
        error +=
          error == ""
            ? `${element.label} thuộc ${element.tmp}`
            : `,${element.label} thuộc ${element.tmp}`;
      }
    });
    return error;
  }

  static async saveCommentByType(
    objId: number,
    hash: string,
    comment: string,
    endDate: string,
    nonEncfiles: any[],
    encFiles: any[],
    type: string,
    keys: any[],
    cmtContent: string
  ) {
    const formData = new FormData();
    formData.append("cmtContent", cmtContent);
    formData.append("hash", hash);
    formData.append("comment", comment);
    formData.append("endDate", endDate);
    formData.append("type", type);
    if (nonEncfiles && nonEncfiles.length > 0) {
      for (const f of nonEncfiles) {
        formData.append("nonEncfiles", f);
      }
    }

    if (encFiles && encFiles.length > 0) {
      for (const c of encFiles) {
        formData.append("encFiles", c);
      }
    }

    if (keys && keys.length > 0) {
      for (const e of keys) {
        formData.append("keys", e);
      }
    }
    return sendPost(`/common/comment/add/${objId}`, formData).then(
      (res) => res
    );
  }
  static async getUserByAuthority(): Promise<UserFromOrg[]> {
    const response = await sendGet(`/users/getByAuthority`);
    return response.data;
  }
  static async getOutsideAgency(
    name: string | null,
    page: number
  ): Promise<OutsideAgencyResponse> {
    const params = {
      name: name,
      page: page,
    };
    const response = await sendGet(`/outside-agency/search`, params);
    return response.data;
  }
  static async getDocumentTemplate(
    params: Record<string, any>
  ): Promise<DocumentTemplateResponse> {
    const response = await sendGet(`/template/all`, params);
    return response.data;
  }
  static async getDraftDocumentTemplate(
    params: Record<string, any>
  ): Promise<DocumentTemplateResponse> {
    const response = await sendGet(`/template/draft/${params.type}`, params);
    return response.data;
  }

  static async deleteTemplate(type: string, templateId: string): Promise<any> {
    const response = await sendGet(`/template/del/${type}/${templateId}`);
    return response.data;
  }

  static async uploadFileWithNewName(fileName: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", new Blob(), fileName);

    const response = await sendPost("/files/tmp", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  static async applyTemplate(
    type: string,
    templateId: string,
    fileName: string
  ): Promise<any> {
    const response = await sendGet(
      `/template/use/${type}/${templateId}?nName=${encodeURIComponent(fileName)}`
    );
    return response.data;
  }

  static async uploadAndApplyTemplate(
    type: string,
    templateId: string,
    fileName: string
  ): Promise<any> {
    // Call both APIs and return the result with the new filename
    const [uploadResult, applyResult] = await Promise.all([
      this.uploadFileWithNewName(fileName),
      this.applyTemplate(type, templateId, fileName),
    ]);

    // Return the apply result with the new filename
    return {
      ...applyResult,
      name: fileName,
      displayName: fileName,
    };
  }
  static async getFileNameById(typeFile: string | null, idFile: string) {
    const url = this.getUrlFileById(typeFile);
    const response = await sendGet(`${url}${idFile}`);
    return response.data;
  }
  static getUrlFileById(typeFile: string | null = null) {
    switch (typeFile) {
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN:
        return "/doc_out_attach/getAttachment/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT:
        return "/attachment/getAttachment/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL:
        return "/doc_internal/getAttachment/";
      default:
        console.log("Loại url không hợp lệ");
        return "";
    }
  }
}
