import { sendGet, sendPost } from "@/api";

export const FormDynamicService = {
  getDynamicForm: (id: number) => sendGet(`/workflow/getFormNodeStart/${id}`),
  getDynamicFormMain: (id: number) => sendGet(`/workflow/getFormNode/${id}`),
  createDynamicForm: (formId: string, payload: any) =>
    sendPost(`/value-dynamic/create/${formId}`, payload),
  updateDynamicForm: (id: string, payload: any) =>
    sendPost(`/value-dynamic/update/${id}`, payload),
  addAttachment: (valueId: string, fieldId: string, payload: any) =>
    sendPost(
      `/attachment-dynamic/addAttachment/${valueId}/${fieldId}`,
      payload
    ),
  deleteAttachment: (fileId: string) =>
    sendGet(`/attachment-dynamic/deleteById/${fileId}`),
  downloadAttachment: (fileNameOrId: string): Promise<Blob> =>
    sendGet(`/attachment-dynamic/download/${fileNameOrId}`, null, {
      responseType: "blob",
    }),
  deleteDynamicForm: (id: string) => sendPost(`/value-dynamic/delete/${id}`),
  uploadAfterSigning: (id: string) =>
    sendPost(`/attachment-dynamic/updateAppendix/${id}`),
};
