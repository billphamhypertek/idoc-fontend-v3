import { queryKeys } from "@/definitions";
import type {
  DocumentOutListResponse,
  FindDocByTypeHandleParams,
  SetImportantRequest,
  SetImportantResponse,
} from "@/definitions/types/document-out.type";
import { DocumentOutService } from "@/services/document-out.service";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEncryptStore } from "@/stores/encrypt.store";

export enum DocumentOutStatus {
  TODO = "waitHandleTab",
  PROCESSED = "handlingTab",
  DONE = "doneTab",
}

export enum DocumentOutMode {
  MAIN = "MAIN",
  COORDINATE = "COORDINATE",
  KNOW = "KNOW",
}

export enum OpinionEnum {
  CHO_Y_KIEN = "CHO_Y_KIEN",
  XIN_Y_KIEN = "XIN_Y_KIEN",
}

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

const fetchByMode = (
  mode: DocumentOutMode,
  status: DocumentOutStatus,
  params: FindDocByTypeHandleParams
) => {
  if (mode === DocumentOutMode.COORDINATE) {
    return DocumentOutService.getListCombine(status, params);
  }
  if (mode === DocumentOutMode.KNOW) {
    return DocumentOutService.getListKnow(status, params);
  }
  return DocumentOutService.getListMain(status, params);
};

export const useGetDocumentOutListByStatus = (
  status: DocumentOutStatus,
  params: FindDocByTypeHandleParams,
  mode: DocumentOutMode = DocumentOutMode.MAIN
) => {
  const { isEncrypt } = useEncryptStore();
  const keyPart = { mode, status, params };

  return useQuery<DocumentOutListResponse>({
    queryKey: [queryKeys.documentOut.list, keyPart, isEncrypt],
    queryFn: () => fetchByMode(mode, status, params),
    ...COMMON_QUERY_OPTS,
    refetchOnMount: "always",
    staleTime: 0,
  });
};

export const useGetImportantDocs = (
  params?: Record<string, any>,
  enabled: boolean = true
) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<DocumentOutListResponse>({
    queryKey: [
      queryKeys.documentOut.findAllDocImportant,
      params,
      isEncrypt,
      enabled,
    ],
    queryFn: () => DocumentOutService.findAllDoc(params),
    ...COMMON_QUERY_OPTS,
    enabled,
  });
};
export const useFindBasicAllDoc = (
  params: FindDocByTypeHandleParams,
  enabled: boolean = true
) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<DocumentOutListResponse>({
    queryKey: [
      queryKeys.documentOut.findBasicAllDoc,
      params,
      isEncrypt,
      enabled,
    ],
    queryFn: () => DocumentOutService.findBasicAllDoc(params),
    ...COMMON_QUERY_OPTS,
    enabled,
  });
};
export const useGetDocInManipulation = (
  params: FindDocByTypeHandleParams & { type: "CHO_Y_KIEN" | "XIN_Y_KIEN" }
) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<DocumentOutListResponse>({
    queryKey: [queryKeys.documentOut.docInManipulation, params, isEncrypt],
    queryFn: () => DocumentOutService.findDocInManipulation(params),
    ...COMMON_QUERY_OPTS,
  });
};

export const useToggleImportant = () => {
  const qc = useQueryClient();

  return useMutation<
    SetImportantResponse,
    Error,
    SetImportantRequest,
    { previousQueries: [any, any][] }
  >({
    mutationFn: (payload) => DocumentOutService.setImportant(payload),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: [queryKeys.documentOut.list] });

      const previousQueries = qc.getQueriesData({
        queryKey: [queryKeys.documentOut.list],
      });

      qc.setQueriesData(
        { queryKey: [queryKeys.documentOut.list] },
        (oldData: any) => {
          if (!oldData || !oldData.objList) return oldData;

          return {
            ...oldData,
            objList: oldData.objList.map((doc: any) =>
              doc.docId === variables.docId
                ? { ...doc, important: variables.important }
                : doc
            ),
          };
        }
      );

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, queryData]: [any, any]) => {
          qc.setQueryData(queryKey, queryData);
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.list] });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.findAllDocImportant],
      });
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.basicSearchIncoming,
        ],
      });
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.waitingSearch,
        ],
      });
    },
  });
};

export const useGetDocumentOutDetail = (
  documentId?: number | null,
  options?: { notId?: string | null; tab?: string | null }
) => {
  return useQuery<any>({
    queryKey: [queryKeys.documentOut.detail, documentId, options],
    queryFn: () => DocumentOutService.getDetail(documentId!, options),
    enabled: !!documentId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetReceiveAndSend = (
  docId?: number | null,
  enabled: boolean = true
) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.tracking, docId],
    queryFn: () => DocumentOutService.getReceiveAndSend(docId!),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetHandleType = (
  documentId?: number | null,
  tab?: string | null
) => {
  return useQuery<any>({
    queryKey: [queryKeys.documentOut.root, "handle-type", documentId, tab],
    queryFn: () =>
      DocumentOutService.getHandleType(documentId!, tab ?? undefined),
    enabled: !!documentId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetBasicSearchIncoming = (params: any) => {
  const { isEncrypt } = useEncryptStore();
  return useQuery<any>({
    queryKey: [
      queryKeys.documentOut.root,
      queryKeys.documentOut.basicSearchIncoming,
      params,
      isEncrypt,
    ],
    queryFn: () => DocumentOutService.getBasicSearchIncoming(params),
    ...COMMON_QUERY_OPTS,
    refetchOnMount: "always",
    staleTime: 0,
  });
};

export const useGetAdvanceSearchIncoming = (
  params: any,
  enabled: boolean = true
) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<any>({
    queryKey: [
      queryKeys.documentOut.root,
      queryKeys.documentOut.advanceSearchIncoming,
      params,
      isEncrypt,
    ],
    queryFn: () => DocumentOutService.getAdvanceSearchIncoming(params),
    enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetWaitingSearch = (params: any) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<any>({
    queryKey: [
      queryKeys.documentOut.root,
      queryKeys.documentOut.waitingSearch,
      params,
      isEncrypt,
    ],
    queryFn: () => DocumentOutService.getWaitingSearch(params),
    ...COMMON_QUERY_OPTS,
  });
};
export const useGetDocumentOutComments = (documentId: number) => {
  return useQuery<any[]>({
    queryKey: [
      queryKeys.documentOut.root,
      queryKeys.documentOut.comments,
      documentId,
    ],
    queryFn: () => DocumentOutService.getDocumentComments(documentId),
    ...COMMON_QUERY_OPTS,
    enabled: !!documentId,
  });
};

/** ========== Comment mutations ========== */
export const useReplyComment = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { docId: number; formData: FormData }>({
    mutationFn: ({ docId, formData }) =>
      DocumentOutService.replyComment(docId, formData),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.comments,
          variables.docId,
        ],
      });
    },
  });
};

export const useEditComment = () => {
  const qc = useQueryClient();
  return useMutation<
    any,
    Error,
    { commentId: number; comment: string; hash?: string; docId: number }
  >({
    mutationFn: ({ commentId, comment, hash = "" }) =>
      DocumentOutService.editComment(commentId, comment, hash),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.comments,
          variables.docId,
        ],
      });
    },
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { commentId: number; docId: number }>({
    mutationFn: ({ commentId }) => DocumentOutService.deleteComment(commentId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.comments,
          variables.docId,
        ],
      });
    },
  });
};

/** ========== Tracking queries ========== */
export const useGetTrackingList = (docId: number, page?: number) => {
  return useQuery<{ objList: any[]; totalRecord: number }>({
    queryKey: [queryKeys.documentOut.tracking, docId, page],
    queryFn: () => DocumentOutService.getTrackingList(docId, page),
    ...COMMON_QUERY_OPTS,
    enabled: !!docId,
  });
};

export const useGetAllTrackingList = (
  docId: number,
  enabled: boolean = true
) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.tracking, "all", docId],
    queryFn: () => DocumentOutService.getAllTrackingList(docId),
    ...COMMON_QUERY_OPTS,
    enabled: !!docId && enabled,
  });
};

export const useGetDocumentOutDetailLegacy = (
  documentId?: number | null,
  options?: { notId?: string | null; tab?: string | null }
) => {
  return useQuery<any>({
    queryKey: [queryKeys.documentOut.detail, documentId, options],
    queryFn: () =>
      DocumentOutService.getDocumentOutDetailById(
        documentId!,
        options?.notId ?? null,
        options?.tab ?? undefined
      ),
    enabled: !!documentId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetDocumentOutArrival = () =>
  useQuery<any[]>({
    queryKey: [queryKeys.documentOut.root, "arrival"],
    queryFn: () => DocumentOutService.getDocumentOutArrival(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

export const useGetDocumentOutById = (documentId?: number | null) =>
  useQuery<any>({
    queryKey: [queryKeys.documentOut.root, "byId", documentId],
    queryFn: () => DocumentOutService.getDocumentOutById(String(documentId!)),
    enabled: !!documentId,
    refetchOnWindowFocus: false,
  });

export const useGetListUserEnter = () => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.root, "listUserEnter"],
    queryFn: () => DocumentOutService.getListUserEnter(),
    ...COMMON_QUERY_OPTS,
  });
};
export const useGetListOrgEnter = () => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.root, "listOrgEnter"],
    queryFn: () => DocumentOutService.getListOrgEnter(),
    ...COMMON_QUERY_OPTS,
  });
};

// Returns the list of document-out statuses
export const useDocumentOutStatuses = () => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.root, "statuses"],
    // getDocumentOutStatuses returns sync array; wrap in Promise for consistency
    queryFn: async () => DocumentOutService.getDocumentOutStatuses(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

// Export list for Excel (returns JSON list to be rendered on client)
export const useExportDocumentOutExcel = () =>
  useMutation<any, Error, any>({
    mutationFn: (params) => DocumentOutService.exportExcelDocumentIn(params),
  });

export const useGetCategoryWithCode = (code: string) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.root, "category", code],
    queryFn: () => DocumentOutService.getCategoryWithCode(code),
    ...COMMON_QUERY_OPTS,
  });
};

export const useFinishDocument = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, number[]>({
    mutationFn: (documentIds) =>
      DocumentOutService.doFinishDocument(documentIds),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.basicSearchIncoming],
      });
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.waitingSearch,
        ],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.list] });
    },
  });
};

export const useRejectDocument = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, number[]>({
    mutationFn: (documentIds) => DocumentOutService.doReject(documentIds),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.basicSearchIncoming],
      });
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.waitingSearch,
        ],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.list] });
    },
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, number>({
    mutationFn: (docId) => DocumentOutService.doDeleteDocument(docId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.basicSearchIncoming],
      });
      qc.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.waitingSearch,
        ],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.list] });
    },
  });
};
