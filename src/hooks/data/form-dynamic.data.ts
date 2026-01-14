import { FormDynamicService } from "@/services/form-dynamic.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/definitions/constants/queryKey.constants";

export const useGetDynamicFormQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.formDynamic.getDynamicForm, id],
    queryFn: () => FormDynamicService.getDynamicForm(id),
    enabled: enabled && !!id,
  });
};
export const useGetDynamicFormMainQuery = (
  id: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.formDynamic.getDynamicFormMain, id],
    queryFn: () => FormDynamicService.getDynamicFormMain(id),
    enabled: enabled && !!id,
  });
};

export const useCreateDynamicFormQuery = (formId: string, payload: any) => {
  return useMutation({
    mutationFn: () => FormDynamicService.createDynamicForm(formId, payload),
  });
};

export const useUpdateDynamicFormQuery = (id: string, payload: any) => {
  return useMutation({
    mutationFn: () => FormDynamicService.updateDynamicForm(id, payload),
  });
};

export const useAddAttachmentQuery = (valueId: string, fieldId: string) => {
  return useMutation({
    mutationFn: (payload: any) =>
      FormDynamicService.addAttachment(valueId, fieldId, payload),
  });
};

export const useDeleteAttachmentQuery = () => {
  return useMutation({
    mutationFn: (attachmentId: string) =>
      FormDynamicService.deleteAttachment(attachmentId),
  });
};

export const useDownloadAttachmentQuery = (fileNameOrId: string) => {
  return useMutation({
    mutationFn: () => FormDynamicService.downloadAttachment(fileNameOrId),
  });
};
export const useUploadFileAfterSignAppendix = (detailId: string) => {
  return useMutation({
    mutationFn: () => FormDynamicService.uploadAfterSigning(detailId),
  });
};
