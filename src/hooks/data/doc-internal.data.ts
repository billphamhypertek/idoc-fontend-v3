import { queryKeys } from "@/definitions";
import {
  DocInternalListResponse,
  DocInternalParams,
  DocInternalService,
} from "@/services/doc-internal.service";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

export const useGetListDocInternal = (params: DocInternalParams) => {
  return useQuery<DocInternalListResponse>({
    queryKey: [queryKeys.docInternal.list, params],
    queryFn: () => DocInternalService.getListDocInternal(params),
  });
};

export const useGetAllDocInternal = (
  params: DocInternalParams,
  enabled: boolean = true
) => {
  return useQuery<DocInternalListResponse>({
    queryKey: [queryKeys.docInternal.search, params],
    queryFn: () => DocInternalService.getAllDocInternal(params),
    enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetDocInternalDetail = (
  docId?: number | null,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: [queryKeys.docInternal.detail, docId],
    queryFn: () => DocInternalService.getDetailById(docId!),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useAddDocInternal = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => DocInternalService.addDocInternal(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.list],
      });
    },
  });
};

export const useUpdateDocInternal = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { docId: number; body: any }>({
    mutationFn: ({ docId, body }) =>
      DocInternalService.updateDocInternal(docId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.list],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.detail, variables.docId],
      });
    },
  });
};

export const useDeleteDocInternal = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, number>({
    mutationFn: (docId) => DocInternalService.deleteDocInternal(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.list],
      });
    },
  });
};

export const useApproveDocInternal = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { docId: number; comment: string; files: File[]; accept: boolean }
  >({
    mutationFn: ({ docId, comment, files, accept }) =>
      DocInternalService.approveDocInternal(docId, comment, files, accept),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.list],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.detail, variables.docId],
      });
    },
  });
};

export const useRetakeDocInternal = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, number>({
    mutationFn: (docId) => DocInternalService.retakeDocInternal(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.list],
      });
    },
  });
};

export const useCompleteDocInternal = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { docId: number; files?: File[]; comment?: string }
  >({
    mutationFn: ({ docId, files = [], comment = "" }) =>
      DocInternalService.completeDocInternal(docId, files, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.list],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.detail, variables.docId],
      });
    },
  });
};

export const useGetDocInternalComments = (
  docId?: number | null,
  enabled: boolean = true
) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.docInternal.comments, docId],
    queryFn: () => DocInternalService.getDocInternalComments(docId!),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetNumberOrSign = () => {
  return useQuery<string>({
    queryKey: [queryKeys.docInternal.numberOrSign],
    queryFn: () => DocInternalService.getNumberOrSign(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetAttachsByDocId = (
  docId?: number | null,
  enabled: boolean = true
) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.docInternal.attachments, docId],
    queryFn: () => DocInternalService.getAttachsByDocId(docId!),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useAddFiles = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { docId: number; docFiles: File[]; addendumFiles: File[] }
  >({
    mutationFn: ({ docId, docFiles, addendumFiles }) =>
      DocInternalService.addFiles(docId, docFiles, addendumFiles),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.attachments, variables.docId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.detail, variables.docId],
      });
    },
  });
};

export const useUpdateFiles = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    {
      docId: number;
      deleteIds: string;
      docFiles: File[];
      addendumFiles: File[];
    }
  >({
    mutationFn: ({ docId, deleteIds, docFiles, addendumFiles }) =>
      DocInternalService.updateFiles(docId, deleteIds, docFiles, addendumFiles),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.attachments, variables.docId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.detail, variables.docId],
      });
    },
  });
};

export const useGetAllOrgByParentId = (parentId: string = "") => {
  return useQuery<any[]>({
    queryKey: [queryKeys.docInternal.orgByParent, parentId],
    queryFn: () => DocInternalService.getAllOrgByParentId(parentId),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetUserApprove = (orgId: string = "") => {
  return useQuery<any[]>({
    queryKey: [queryKeys.docInternal.userApprove, orgId],
    queryFn: () => DocInternalService.getUserApprove(orgId),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetUserSign = () => {
  return useQuery<any[]>({
    queryKey: [queryKeys.docInternal.userSign],
    queryFn: () => DocInternalService.getUserSign(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetUsersLDCuc = () => {
  return useQuery<any[]>({
    queryKey: [queryKeys.docInternal.usersLDCuc],
    queryFn: () => DocInternalService.getUsersLDCuc(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, number>({
    mutationFn: (id) => DocInternalService.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.attachments],
      });
    },
  });
};

export const useDownloadFile = () => {
  return useMutation<Blob, Error, number>({
    mutationFn: (id) => DocInternalService.downloadFile(id),
  });
};

export const useFindByExecuteDocinternal = (
  docId?: number | null,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: [queryKeys.docInternal.detail, "execution", docId],
    queryFn: () => DocInternalService.findByExecuteDocinternal(docId!),
    enabled: !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useSaveNewDraftComment = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { approveId: number; comment: string }>({
    mutationFn: ({ approveId, comment }) =>
      DocInternalService.doSaveNewDraftComment(approveId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.comments],
      });
    },
  });
};

export const useSaveNewCommentAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { commentId: number; files: File[] }>({
    mutationFn: ({ commentId, files }) =>
      DocInternalService.doSaveNewCommentAttachment(commentId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.docInternal.comments],
      });
    },
  });
};
