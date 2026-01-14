import { queryKeys } from "@/definitions";
import templateFormService from "@/services/template-form.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to add attachment to template form
 */
export const useAddAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formId,
      formData,
    }: {
      formId: number;
      formData: FormData;
    }) => templateFormService.addAttachment(formId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.templateForm?.getTemplate],
      });
    },
  });
};

/**
 * Hook to update attachment
 */
export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attachmentId,
      formData,
    }: {
      attachmentId: number;
      formData: FormData;
    }) => templateFormService.updateAttachment(attachmentId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.templateForm?.getTemplate],
      });
    },
  });
};

/**
 * Hook to get template by form ID
 */
export const useGetTemplate = (formId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.templateForm?.getTemplate, formId],
    queryFn: () => templateFormService.getTemplate(formId),
    enabled: enabled && !!formId,
  });
};

/**
 * Hook to download template file
 */
export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: (fileName: string) =>
      templateFormService.downloadTemplate(fileName),
  });
};
