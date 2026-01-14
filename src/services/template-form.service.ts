import { sendGet, sendPost } from "@/api/base-axios-protected-request";

export interface AddAttachmentResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: any;
}

export interface UpdateAttachmentResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: any;
}

export interface GetTemplateResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: any;
}

class TemplateFormService {
  /**
   * Add attachment to template form
   * @param formId - ID of the form
   * @param formData - FormData with file field
   */
  addAttachment(formId: number, formData: FormData) {
    return sendPost(`/template-form/addAttachment/${formId}`, formData);
  }

  /**
   * Update attachment
   * @param attachmentId - ID of the attachment to update
   * @param formData - FormData with file field
   */
  updateAttachment(attachmentId: number, formData: FormData) {
    return sendPost(
      `/template-form/updateAttachment/${attachmentId}`,
      formData
    );
  }

  /**
   * Get template by form ID
   * @param formId - ID of the form
   */
  getTemplate(formId: number) {
    return sendGet(`/template-form/getTemplate/${formId}`);
  }

  /**
   * Download template file
   * @param fileName - Name of the file to download
   */
  async downloadTemplate(fileName: string): Promise<Blob> {
    const response = await sendGet(
      "/template-form/download/" + encodeURIComponent(fileName),
      null,
      {
        responseType: "blob",
      }
    );
    return await response;
  }
}

const templateFormService = new TemplateFormService();
export default templateFormService;
