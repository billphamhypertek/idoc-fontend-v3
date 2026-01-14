import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DocumentInService } from "@/services/document-in.service";
import { queryKeys } from "@/definitions";
import type {
  SetImportantRequest,
  SetImportantResponse,
} from "@/definitions/types/document-out.type";
import {
  Draft,
  GetListAllResponse,
  OrgIssued,
  ReceiveToKnow,
  ReplyDocResponse,
  TaskAssignmentResponse,
} from "@/definitions/types/document.type";
import { handleError } from "@/utils/common.utils";
import { attachmentTypeInit } from "@/components/document-in/DraftForm";
import { useEncryptStore } from "@/stores/encrypt.store";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

export const useDocumentInQuery = (
  action: string,
  params: Record<string, any>,
  isBasicSearch: boolean
) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery({
    queryKey: [
      queryKeys.document_in.list_root,
      queryKeys.document_in.draft_handle,
      action,
      params,
      isBasicSearch,
      isEncrypt,
    ],
    queryFn: () => {
      return isBasicSearch
        ? DocumentInService.getBasicListDocumentIn(action, params)
        : DocumentInService.getAdvanceListDocumentIn(action, params);
    },
  });
};
export const useCheckActionRetakeDocument = (
  params: Record<string, any>,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.document_in.check_action_retake, params],
    queryFn: () => DocumentInService.checkActionDocumentIn(params),
    enabled,
  });
};
export const useToggleImportant = () => {
  const qc = useQueryClient();

  return useMutation<SetImportantResponse, Error, SetImportantRequest>({
    mutationFn: (payload) => DocumentInService.setImportant(payload),
    onSuccess: () => {
      return qc.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};
export const useConsultHandleList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consultData: FormData) =>
      DocumentInService.consultHandleList(consultData),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useRejectDocumentIn = (documentId: string | undefined) => {
  return useQuery({
    queryKey: [queryKeys.document_in.reject, documentId],
    queryFn: () => DocumentInService.getRejectDocumentIn(documentId),
    enabled: !!documentId,
  });
};
export const useReturnHandleList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consultData: FormData) =>
      DocumentInService.rejectHandle(consultData),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useInBookType = () => {
  return useQuery({
    queryKey: [queryKeys.document_in.book_type],
    queryFn: () => DocumentInService.getBookType(),
  });
};
export const useImportDocBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (importBookData: FormData) =>
      DocumentInService.importDocBook(importBookData),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useRetakeDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (retakeData: FormData) =>
      DocumentInService.retakeHandle(retakeData),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useDoneDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, fd }: { docId: string; fd: FormData }) =>
      DocumentInService.doneHandle(docId, fd),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useDoneMultiple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId }: { listId: string[] }) =>
      DocumentInService.doneHandleMultiple(listId),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useRetakeDoneDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      doneComment,
      files,
      type,
    }: {
      docId: string;
      doneComment: string;
      files: File[];
      type: boolean;
    }) => {
      if (type) {
        const fd = new FormData();
        if (files && files.length > 0) {
          for (const file of files) {
            fd.append("files", file);
          }
        }
        fd.append("comment", doneComment);
        return DocumentInService.retakeDoneHandle(docId, fd);
      }
      return DocumentInService.retakeDoneHandleWithoutFile(docId, doneComment);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useListAttachmentDone = (docId: string) => {
  return useQuery({
    queryKey: [queryKeys.document_in.book_type, docId],
    queryFn: () => DocumentInService.getListAttachment(docId),
    enabled: false,
  });
};
export const useAddAttachmentToDoneDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      formData,
    }: {
      commentId: string;
      formData: FormData;
    }) => DocumentInService.saveCommentAttachment(commentId, formData),
    onError: (error) => {
      handleError(error);
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};

export const useCheckActionImportDocDocument = (
  params: Record<string, any>,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.document_in.check_action_import_doc, params],
    queryFn: () => DocumentInService.checkActionDocumentIn(params),
    enabled,
  });
};
export const useDocumentInListDocSign = (params: Record<string, any>) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery({
    queryKey: [
      queryKeys.document_in.list_root,
      queryKeys.document_in.draft_list,
      params,
      isEncrypt,
    ],
    queryFn: () => {
      return DocumentInService.getListDocSign(params);
    },
  });
};
export const useDocumentInListIssued = (
  action: string,
  params: Record<string, any>
) => {
  const { isEncrypt } = useEncryptStore();
  return useQuery({
    queryKey: [
      queryKeys.document_in.list_root,
      queryKeys.document_in.draft_list,
      action,
      params,
      isEncrypt,
    ],
    queryFn: () => {
      return DocumentInService.getListDocIssued(action, params);
    },
    enabled: !!action,
  });
};
export const useDeleteDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => DocumentInService.deleteDraft(draftId),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};
export const useInitDraftData = () => {
  return useQuery({
    queryKey: [queryKeys.document_in.init_draft_data],
    queryFn: () => {
      return DocumentInService.getDraftInitData();
    },
  });
};

export function useQuickKnowableUnread(params: Record<string, any>) {
  const { isEncrypt } = useEncryptStore();

  return useQuery({
    queryKey: [
      queryKeys.document_in.list_root,
      queryKeys.document_in.quick_knowable_unread,
      params,
      isEncrypt,
    ],
    queryFn: () => DocumentInService.getQuickKnowableUnread(params),
  });
}

export function useQuickKnowableRead(params: Record<string, any>) {
  const { isEncrypt } = useEncryptStore();

  return useQuery({
    queryKey: [
      queryKeys.document_in.list_root,
      queryKeys.document_in.quick_knowable_read,
      params,
      isEncrypt,
    ],
    queryFn: () => DocumentInService.getQuickKnowableRead(params),
  });
}

export const useImportantDocuments = (params: Record<string, any>) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<GetListAllResponse>({
    queryKey: [queryKeys.document_in.important_documents, params, isEncrypt],
    queryFn: () => DocumentInService.getImportantDocuments(params),
  });
};
export const useAllDocuments = (params: Record<string, any>) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery<GetListAllResponse>({
    queryKey: [queryKeys.document_in.all_documents, params, isEncrypt],
    queryFn: () => DocumentInService.getAllDocuments(params),
  });
};
export const useReplyDoc = (params: Record<string, any>) => {
  return useQuery<ReplyDocResponse>({
    queryKey: [queryKeys.document_in.replyDoc, params],
    queryFn: () => DocumentInService.getReplyDoc(params),
    enabled: false,
  });
};
export const useOrgIssued = () => {
  return useQuery<OrgIssued[]>({
    queryKey: [queryKeys.document_in.orgIssued],
    queryFn: () => DocumentInService.getOrgIssued(),
  });
};
export const useTaskAssignment = (params: Record<string, any>) => {
  return useQuery<TaskAssignmentResponse>({
    queryKey: [queryKeys.document_in.taskAssignment, params],
    queryFn: () => DocumentInService.getTaskAssignment(params),
  });
};
export const useAddDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, any>) =>
      DocumentInService.addDocument(params),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};
export const useUpdateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: Record<string, any> }) =>
      DocumentInService.updateDocument(id, params),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};
export const useAddDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      action,
      draftId,
      params,
    }: {
      action: "DRAFT" | "DOCUMENT";
      draftId: string;
      params: Record<string, any>;
    }) => {
      return action === "DOCUMENT"
        ? DocumentInService.addNewDocumentAttachment(draftId, params)
        : DocumentInService.addNewDraftAttachment(draftId, params);
    },
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      templateId,
      docId,
    }: {
      type: string;
      templateId: string;
      docId: string;
    }) => DocumentInService.updateTemplateToDoc(type, templateId, docId),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};
export const useUpdateAlreadyFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, listId }: { docId: string; listId: number[] }) =>
      DocumentInService.updateAlreadyFile(docId, listId),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
  });
};
export const useDetailEditDocument = (documentId: string | null) => {
  return useQuery<Draft>({
    queryKey: [queryKeys.document_in.detail, documentId],
    queryFn: () => DocumentInService.getDetailDoc(documentId),
    enabled: !!documentId,
    select: (d) => {
      const attachments = d?.attachments ?? [];
      return {
        ...d,
        draftFiles: attachments.filter(
          (a) => a.attachmentType === attachmentTypeInit.draft
        ),
        documentFiles: attachments.filter(
          (a) => a.attachmentType === attachmentTypeInit.document
        ),
      };
    },
  });
};
export const useReceivedDocument = (documentId: string | null) => {
  return useQuery<
    {
      id: string;
      type: "ORG" | "USER";
    }[]
  >({
    queryKey: [queryKeys.document_in.receivedDoc, documentId],
    queryFn: () => DocumentInService.getListDocumentReceive(documentId),
    enabled: !!documentId,
  });
};
export const useForwardDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, any>) =>
      DocumentInService.forwardDocument(params),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useGetDocumentInComments = (documentId: number) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.document_in.comment, documentId],
    queryFn: () => DocumentInService.getDocumentComments(documentId),
    ...COMMON_QUERY_OPTS,
    enabled: !!documentId,
  });
};
export const useDetailDocument = (documentId: string | null) => {
  return useQuery<Draft>({
    queryKey: [queryKeys.document_in.detail, documentId],
    queryFn: () => DocumentInService.getDetailDocToShow(documentId),
    ...COMMON_QUERY_OPTS,
    enabled: !!documentId,
  });
};

// Search active users by text (for signer selection)
export const useSearchUserActive = (textSearch: string, enabled = true) => {
  return useQuery<ReceiveToKnow[]>({
    queryKey: ["document_in", "user_search_active", textSearch],
    queryFn: () => DocumentInService.searchUserActive(textSearch),
    enabled: !!textSearch && enabled,
    ...COMMON_QUERY_OPTS,
  });
};
export const useIssuedDraftNew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, any>) =>
      DocumentInService.doIssuedDraftNew(params),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useIssuedDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: number) => DocumentInService.doIssuedDraft(params),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useTransferDocumentIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      params,
      comment,
    }: {
      docId: number | null;
      params: Record<string, any>;
      comment: string;
    }) => DocumentInService.doTransfer(docId, params, comment),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useRequestSignDocumentIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      params,
      comment,
    }: {
      docId: number | null;
      params: Record<string, any>;
      comment: string;
    }) => DocumentInService.doRequestSign(docId, params, comment),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.document_in.list_root],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
export const useQuickSearch = (params: Record<string, any>) => {
  const { isEncrypt } = useEncryptStore();

  return useQuery({
    queryKey: [queryKeys.search.quickSearch, params, isEncrypt],
    queryFn: () => DocumentInService.doQuickSearch(params),
  });
};
export const processDraftInsert = (draftData: Draft) => {
  return {
    draftFiles: draftData.draftFiles,
    documentFiles: draftData.documentFiles,
    docTypeId: draftData.docTypeId,
    docFieldId: draftData.docFieldId,
    securityId: draftData.securityId,
    urgentId: draftData.urgentId,
    bookId: draftData.bookId,
    numberInBook: draftData.numberInBook,
    note: draftData.note,
    listRelateTask: draftData.listRelateTask,
    listReceive: draftData.listReceive,
    attachmentType: draftData.attachmentType,
    encrypt: draftData.encrypt,
    outsideReceiveLgsps: draftData.outsideReceiveLgsps,
    outsideReceives: draftData.outsideReceives,
    numberOrSign: draftData.numberOrSign,
    docFieldsName: draftData.docFieldsName,
    listSignerIds: draftData.listSignerIds,
    signCA: draftData.signCA,
    relateTaskIds: draftData.relateTaskIds,
    replyDocIds: draftData.replyDocIds,
    listReplyDoc: draftData.listReplyDoc,
    listReplyTask: draftData.listReplyTask,
    listAttachVersion: draftData.listAttachVersion,
    autoIssued: draftData.autoIssued,
    listSignersIds: draftData.listSignerIds,
    replyTask: draftData.replyTask,
    replyDoc: draftData.replyDoc,
    relateTaskId: draftData.relateTaskIds,
    userCreateName: draftData.userCreateName,
    preview: draftData.preview,
    dateIssued: draftData.dateIssued,
    paperHandle: draftData.paperHandle,
    orgCreateName: draftData.orgCreateName,
  };
};
export const useLoadTaskReport = (attId: string) => {
  return useQuery({
    queryKey: [queryKeys.document_in.taskReport, attId],
    queryFn: async () => {
      const data = await DocumentInService.doLoadTaskReport(attId);
      return data || null;
    },
    enabled: !!attId,
  });
};
