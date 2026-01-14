import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentOutService } from "@/services/document-out.service";
import { queryKeys } from "@/definitions";
import { ToastUtils } from "@/utils/toast.utils";
import { RetakeService } from "@/services/retake.service";

export const useTransferHandleListMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      docId: number;
      nodeId: number;
      main: (string | number)[];
      comment: string;
      cmtContent: string;
      requestReview?: boolean;
      files?: File[];
      support?: (string | number)[];
      show?: (string | number)[];
      orgMain?: number[];
      orgSupport?: number[];
      orgShow?: number[];
      direction?: number[];
      deadline?: string;
    }) =>
      DocumentOutService.transferHandleList(
        vars.docId,
        vars.nodeId,
        vars.main,
        vars.comment,
        vars.cmtContent,
        vars.requestReview,
        vars.files,
        vars.support,
        vars.show,
        vars.orgMain,
        vars.orgSupport,
        vars.orgShow,
        vars.direction,
        vars.deadline
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, vars.docId],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.tracking, vars.docId],
      });
    },
  });
};

export const useRequestEvaluateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      docId: number;
      comment: string;
      isDelegate?: boolean;
    }) =>
      DocumentOutService.requestEvaluate(
        vars.docId,
        vars.comment,
        !!vars.isDelegate
      ),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, vars.docId],
      });
    },
  });
};

export const useEvaluateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      docId: number;
      comment: string;
      agree: boolean;
      pId?: number | null;
    }) =>
      DocumentOutService.evaluate(
        vars.docId,
        vars.comment,
        vars.agree,
        vars.pId ?? undefined
      ),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, vars.docId],
      });
    },
  });
};

export const useStepRetakeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { docId: number; comment: string; node: number }) =>
      DocumentOutService.stepRetake(vars.docId, vars.comment, vars.node),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, vars.docId],
      });
    },
  });
};

export const useOrgTransferMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { docId: number; orgId: number }) =>
      DocumentOutService.orgTransfer([vars.docId], {
        node: 0,
        comment: "",
        listOrg: [{ org: vars.orgId }],
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, vars.docId],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.tracking, vars.docId],
      });
    },
  });
};

// Advanced org transfer to support full payload from Transfer dialog (multiple orgs, node, comment, deadline, files)
export const useOrgTransferAdvancedMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      docIds: number[];
      payload: Parameters<typeof DocumentOutService.orgTransfer>[1];
    }) => DocumentOutService.orgTransfer(vars.docIds, vars.payload),
    onSuccess: (_d, vars) => {
      // Invalidate for the first document id (current selection)
      const docId = vars.docIds[0];
      if (docId) {
        qc.invalidateQueries({
          queryKey: [queryKeys.documentOut.detail, docId],
        });
        qc.invalidateQueries({
          queryKey: [queryKeys.documentOut.tracking, docId],
        });
      }
    },
  });
};

export const useRetakeDocument = (
  goBack?: () => void,
  documentId?: string,
  isDelegate?: string
) => {
  const mutation = useMutation({
    mutationFn: ({ docId, comment }: { docId: string; comment: string }) =>
      RetakeService.doRetakeDocOut(docId, comment, isDelegate === "true"),
    onSuccess: () => {
      ToastUtils.documentRetakeSuccess();
      goBack?.();
    },
    onError: (err: any) => {
      ToastUtils.documentRetakeError();
      console.error("Error retaking document:", err);
    },
  });
  return mutation;
};

export const useFinishDocument = () => {
  const mutation = useMutation({
    mutationFn: (documentIds: number[]) =>
      DocumentOutService.doFinishDocument(documentIds),
  });
  return mutation;
};

export const useRejectDocument = () => {
  const mutation = useMutation({
    mutationFn: (docDocumentIds: number[]) =>
      DocumentOutService.doReject(docDocumentIds),
  });
  return mutation;
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (docId: number) => DocumentOutService.doDeleteDocument(docId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.basicSearchIncoming],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.advanceSearchIncoming],
      });
    },
  });
  return mutation;
};

export const useSaveNewDocumentOut = () => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (documentDto: any) =>
      DocumentOutService.doSaveNewDocumentOut(documentDto),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.root],
      });
    },
  });
  return mutation;
};

export const useSaveDocumentOut = () => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (documentDto: any) =>
      DocumentOutService.doSaveDocumentOut(documentDto, documentDto.id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.root],
      });
    },
  });
  return mutation;
};

export const useUpdateReceiveDoc = () => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (documentDto: any) =>
      DocumentOutService.doUpdateReceiveDoc(documentDto),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail],
      });
    },
  });
  return mutation;
};
