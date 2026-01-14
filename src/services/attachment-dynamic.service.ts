import { sendGet } from "@/api/base-axios-protected-request";

class AttachmentDynamicService {
  /**
   * Download attachment file by name
   */
  async downloadAttachment(fileName: string): Promise<Blob> {
    const response = await sendGet(
      "/attachment-dynamic/download/" + encodeURIComponent(fileName),
      {
        responseType: "blob",
      }
    );

    if (!response.ok) {
      throw new Error(`Không thể tải file: ${fileName}`);
    }

    return await response.blob();
  }
}

const attachmentDynamicService = new AttachmentDynamicService();
export default attachmentDynamicService;
