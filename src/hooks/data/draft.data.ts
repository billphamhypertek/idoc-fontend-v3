import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import DraftService from "@/services/draft.service";
import type {
  DocAttachment,
  DocSignRepsonse,
  Draft,
} from "@/definitions/types/document.type";
import { handleError } from "@/utils/common.utils";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

// Queries
export const useInitDraftDataOut = (params: Record<string, any> = {}) =>
  useQuery({
    queryKey: [queryKeys.documentOut.init_draft_data, params],
    queryFn: () => DraftService.getDataInit(params),
    ...COMMON_QUERY_OPTS,
  });

export const useGetDraftById = (draftId?: number | string | null) =>
  useQuery<Draft>({
    queryKey: [queryKeys.documentOut.detail, draftId, { mode: "byId" }],
    queryFn: () => DraftService.getById(draftId!),
    enabled: !!draftId,
    ...COMMON_QUERY_OPTS,
  });

export const useGetDraftDetailToShow = (draftId?: number | string | null) =>
  useQuery<Draft>({
    queryKey: [queryKeys.documentOut.detail, draftId, { mode: "toShow" }],
    queryFn: () => DraftService.getDetailToShow(draftId!),
    enabled: !!draftId,
    ...COMMON_QUERY_OPTS,
  });

export const useGetDocSignList = (params: Record<string, any> = {}) =>
  useQuery<DocSignRepsonse>({
    queryKey: [queryKeys.documentOut.draft_list, params],
    queryFn: () => DraftService.getListDocSign(params),
    ...COMMON_QUERY_OPTS,
  });

export const useGetIssuedList = (
  action: 1 | 2,
  params: Record<string, any> = {}
) =>
  useQuery<DocSignRepsonse>({
    queryKey: [queryKeys.documentOut.draft_list_issued, action, params],
    queryFn: () => DraftService.getListIssued(action, params),
    enabled: !!action,
    ...COMMON_QUERY_OPTS,
  });

export const useGetDocOutTracking = (
  docId?: number | string | null,
  page: number = 0,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: [queryKeys.documentOut.tracking, docId, page],
    queryFn: () => DraftService.getTracking(docId!, page),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });

export const useGetAllTracking = (
  documentId?: number | string | null,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: [queryKeys.documentOut.tracking, documentId, { mode: "all" }],
    queryFn: () => DraftService.getAllTracking(documentId!),
    enabled: !!documentId && enabled,
    ...COMMON_QUERY_OPTS,
  });

export const useGetListAttachmentOut = (
  docId?: number | string | null,
  enabled: boolean = true
) =>
  useQuery<DocAttachment[]>({
    queryKey: [queryKeys.documentOut.list_attachment, docId],
    queryFn: () => DraftService.getListAttachment(docId!),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });

export const useLoadOutSideReceive = () =>
  useQuery<string[]>({
    queryKey: [queryKeys.documentOut.root, "outside-receive"],
    queryFn: () => DraftService.loadOutSideReceive(),
    ...COMMON_QUERY_OPTS,
  });

export const useGetLGSPList = (page: number, name: string = "") =>
  useQuery({
    queryKey: [queryKeys.users.getByOutsideAgency, name, page],
    queryFn: () => DraftService.getListLGSP(page, name),
    ...COMMON_QUERY_OPTS,
  });

export const useSearchLGSP = (
  name: string,
  page: number,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: [
      queryKeys.users.getByOutsideAgency,
      name,
      page,
      { mode: "search" },
    ],
    queryFn: () => DraftService.searchListLGSP(name, page),
    enabled: enabled,
    ...COMMON_QUERY_OPTS,
  });

// Mutations
export const useAddDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { dto: any; issued?: boolean }) =>
      DraftService.add(params.dto, !!params.issued),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
    },
    onError: handleError,
  });
};

export const useUpdateDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any & { id: number | string }) =>
      DraftService.update(dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.id],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
    },
    onError: handleError,
  });
};

export const useDeleteDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: number | string) => DraftService.delete(draftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
    },
    onError: handleError,
  });
};

export const useAddAttachmentsOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      type: "DRAFT" | "DOCUMENT";
      draftId: number | string;
      files: File[];
    }) =>
      DraftService.addAttachments(params.type, params.draftId, params.files),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.list_attachment, variables.draftId],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.draftId],
      });
    },
    onError: handleError,
  });
};

export const useUpdateAttachmentOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { attachmentId: number | string; file: File }) =>
      DraftService.updateAttachment(params.attachmentId, params.file),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.list_attachment],
      });
    },
    onError: handleError,
  });
};

export const useDeleteAttachmentOutById = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { attachmentId: number | string; force?: boolean }) =>
      DraftService.deleteAttachmentById(
        params.attachmentId,
        params.force ?? false
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.list_attachment],
      });
    },
    onError: handleError,
  });
};

export const useRejectDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { docId: number | string; comment: string }) =>
      DraftService.reject(params.docId, params.comment),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.docId],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
    },
    onError: handleError,
  });
};

export const useRetakeDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { docId: number | string; comment: string }) =>
      DraftService.retake(params.docId, params.comment),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.docId],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
    },
    onError: handleError,
  });
};

export const useFinishDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      docId: number | string;
      comment: string;
      type?: boolean;
    }) =>
      DraftService.finish(params.docId, params.comment, params.type ?? true),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.docId],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.draft_list_issued],
      });
    },
    onError: handleError,
  });
};

export const useFinishMultipleDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docIds: Array<number | string>) =>
      DraftService.finishMultiple(docIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.draft_list_issued],
      });
    },
    onError: handleError,
  });
};

export const useUpdateListSignersOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { docOutId: number | string; listSignIds: string }) =>
      DraftService.updateListSigners(params.docOutId, params.listSignIds),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.docOutId],
      });
    },
    onError: handleError,
  });
};

export const useToggleImportantDraftOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { docId: number | string; important: boolean }) =>
      DraftService.setImportant(params.docId, params.important),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.detail] });
    },
    onError: handleError,
  });
};

export const useGetTasksOut = (page: number) =>
  useQuery({
    queryKey: [queryKeys.documentOut.root, "tasks", page],
    queryFn: () => DraftService.getTasks(page),
    ...COMMON_QUERY_OPTS,
  });

export const useImportDocBookOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (qs: string) => DraftService.importDocBook(qs),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
    },
    onError: handleError,
  });
};

export const useCheckNumberOrSignOut = (
  numberOrSign: string | null,
  bookId?: number
) =>
  useQuery({
    queryKey: [
      queryKeys.documentOut.root,
      "check-number-or-sign",
      numberOrSign,
      bookId,
    ],
    queryFn: () =>
      DraftService.checkNumberOrSign(numberOrSign ?? "", bookId ?? 0),
    enabled: !!numberOrSign && !!bookId,
    ...COMMON_QUERY_OPTS,
  });

export const useAddSignUserOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { docId: number | string; userId: number | string }) =>
      DraftService.addSignUser(params.docId, params.userId),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.docId],
      });
    },
    onError: handleError,
  });
};

export const useGetUsersRejectOut = (draftId?: number | string | null) =>
  useQuery({
    queryKey: [queryKeys.documentOut.root, "users-reject", draftId],
    queryFn: () => DraftService.getUsersReject(draftId!),
    enabled: !!draftId,
    ...COMMON_QUERY_OPTS,
  });

export const useRejectToUserOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      docId: number | string;
      comment: string;
      userId: number | string;
      nodeId?: number | string;
      delegate?: boolean;
      files?: File[];
    }) => DraftService.rejectToUser(params),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, variables.docId],
      });
      qc.invalidateQueries({ queryKey: [queryKeys.documentOut.draft_list] });
    },
    onError: handleError,
  });
};

export const useReloadLGSP = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => DraftService.reloadLGSP(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKeys.users.getByOutsideAgency] });
    },
    onError: handleError,
  });
};

export const useSignPdfOut = () => {
  return useMutation({
    mutationFn: (params: { fileName: string; signPosition: string }) =>
      DraftService.signPdf(params.fileName, params.signPosition),
    onError: handleError,
  });
};

export const useAddWaterMarkOut = () => {
  return useMutation({
    mutationFn: (params: { fileName: string; waterMark: string }) =>
      DraftService.addWaterMark(params.fileName, params.waterMark),
    onError: handleError,
  });
};
