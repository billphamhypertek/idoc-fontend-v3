import { useMutation, useQuery } from "@tanstack/react-query";
import { DocumentService } from "@/services/document.service";
import { RejectDocument } from "@/definitions/types/document.type";
import { queryKeys } from "@/definitions";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
};

export const useCheckTypeHandleByDoc = (documentId?: number | null) => {
  return useQuery<any>({
    queryKey: [queryKeys.document.checkTypeHandleByDoc, documentId],
    queryFn: () => DocumentService.checkTypeHandleByDoc(documentId!),
    enabled: !!documentId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetUsersEvaluate = (
  docId: number | undefined,
  enabled = true
) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.document.usersEvaluate, docId],
    queryFn: () => DocumentService.loadUsersEvaluate(docId!),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetListSend = (
  documentId: number | undefined,
  enabled = true
) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.document.listSend, documentId],
    queryFn: () => DocumentService.getListSend(documentId!),
    enabled: !!documentId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useReturnDocument = () => {
  const mutation = useMutation({
    mutationFn: (payload: RejectDocument) =>
      DocumentService.doRejectDocument(payload),
  });
  return mutation;
};
