import { AttachmentService } from "@/services/attachment.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteAttachmentByDocIdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AttachmentService.doDeleteAttachmentByDocId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", "byDocId"] });
    },
  });
};

export const useDeleteAttachmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AttachmentService.doDeleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", "byDocId"] });
    },
  });
};

export const useSaveNewAttachmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      AttachmentService.doSaveNewAttachment(
        payload.type,
        payload.documentId,
        payload.files
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", "byDocId"] });
    },
  });
};
