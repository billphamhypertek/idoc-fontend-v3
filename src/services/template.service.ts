import { sendGet, sendPost } from "@/api";

export interface TemplateParams {
  type?: string;
  page: number;
  sortBy?: string;
  totalRecord: number;
  size: number;
}

export interface Template {
  id: string | number;
  name: string;
  displayName?: string;
  type?: string;
  size?: number;
  lastModified?: number;
  encrypt?: boolean;
  oEncrypt?: boolean;
  docId?: string | number;
  template?: boolean;
  description?: string;
  category?: string;
  docType?: string;
  checked?: boolean;
}

export interface TemplateResponse {
  content: Template[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class TemplateService {
  /**
   * Lấy danh sách template
   */
  static async getAll(params: TemplateParams): Promise<TemplateResponse> {
    const response = await sendGet("/template/all", params);
    return response.data;
  }

  /**
   * Lấy danh sách template nháp
   */
  static async getDraftTemplate(
    params: TemplateParams
  ): Promise<TemplateResponse> {
    const response = await sendGet(`/template/draft/${params.type}`, params);
    return response.data;
  }

  /**
   * Clone template với tên mới
   */
  static async cloneTemplate(
    type: string,
    id: string | number,
    fileName: string
  ): Promise<Template> {
    const response = await sendGet(
      `/template/use/${type}/${id}?nName=${fileName}`
    );
    return response.data;
  }

  /**
   * Xóa template
   */
  static async deleteTemplate(
    type: string,
    templateId: string | number
  ): Promise<any> {
    const response = await sendGet(`/template/del/${type}/${templateId}`);
    return response.data;
  }

  /**
   * Thêm template mới
   */
  static async addTemplate(files: File[], type: string): Promise<any> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("type", type);

    const response = await sendPost("/template/add", formData);
    return response.data;
  }

  /**
   * Tải xuống template
   */
  static async downloadFile(fileName: string): Promise<Blob> {
    const response = await sendGet(`/template/download/${fileName}`, null, {
      responseType: "blob",
    });
    return response as Blob;
  }

  /**
   * Cập nhật template
   */
  static async updateTemplate(
    type: string,
    id: string | number,
    file: File
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await sendPost(`/template/update/${type}/${id}`, formData);
    return response.data;
  }

  /**
   * Cập nhật template vào document
   */
  static async updateTemplateToDoc(
    type: string,
    templateId: string | number,
    docId: string | number
  ): Promise<any> {
    const response = await sendGet(
      `/template/update/${type}/${templateId}/${docId}`
    );
    return response.data;
  }
}
