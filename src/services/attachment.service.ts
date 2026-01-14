import { sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";

export const AttachmentService = {
  doDeleteAttachmentByDocId: async (docId: number) => {
    const res = await sendPost(`${Constant.ATTACHMENT.DELETE_BY_DOC}${docId}`);
    return res.data;
  },
  doDeleteAttachment: async (attachmentId: number, force = false) => {
    const formData: FormData = new FormData();
    formData.append("force", force.toString());
    const res = await sendPost(
      `/doc_out_attach/deleteById/${attachmentId}`,
      formData
    );
    return res.data;
  },
  isNotFile(file: any) {
    if (file.id) {
      return true;
    }

    return false;
  },

  doSaveNewAttachment: (
    type: string,
    documentId: number,
    files: File[]
  ): Promise<any> => {
    const formData: FormData = new FormData();
    files = files || [];
    for (const file of files) {
      if (!AttachmentService.isNotFile(file)) {
        formData.append("files", file);
      }
    }

    return sendPost(`/attachment/addAttachment/${documentId}`, formData);
  },
};
