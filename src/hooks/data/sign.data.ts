import { useMutation, useQueryClient } from "@tanstack/react-query";
import useVgcaSign from "@/hooks/useVgcaSign";
import { queryKeys } from "@/definitions";

const INVALIDATE_KEYS: Array<string[] | string> = [
  ["vehicle", "list"],
  [queryKeys.docInternal.detail],
  [queryKeys.documentOut.detail],
  [queryKeys.document_in.detail],
  [queryKeys.valueDynamic.detail],
];

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    for (const key of INVALIDATE_KEYS) {
      qc.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
    }
  };
}

export const useSignCA = () => {
  const { signApproved } = useVgcaSign();
  return useMutation({
    mutationFn: async (params: {
      fileNameOrId: string | number;
      attachId: number | string;
      attachType: string;
    }) => {
      const { fileNameOrId, attachId, attachType } = params;
      await signApproved(fileNameOrId, attachId, attachType);
    },
    onSuccess: useInvalidateAll(),
    onError: (error) => {
      console.error("Lỗi ký CA:", error);
    },
  });
};

export const useSignComment = () => {
  const { signComment } = useVgcaSign();
  return useMutation({
    mutationFn: async (params: {
      fileNameOrId: string | number;
      attachId: number | string;
      attachType: string;
    }) => {
      const { fileNameOrId, attachId, attachType } = params;
      await signComment(fileNameOrId, attachId, attachType);
    },
    onSuccess: useInvalidateAll(),
    onError: (error) => {
      console.error("Lỗi ký comment:", error);
    },
  });
};

export const useSignCopy = () => {
  const { signCopy } = useVgcaSign();
  return useMutation({
    mutationFn: async (params: {
      fileNameOrId: string | number;
      attachId: number | string;
      attachType: string;
    }) => {
      const { fileNameOrId, attachId, attachType } = params;
      await signCopy(fileNameOrId, attachId, attachType);
    },
    onSuccess: useInvalidateAll(),
    onError: (error) => {
      console.error("Lỗi ký bản sao:", error);
    },
  });
};

export const useSignIssued = () => {
  const { signIssued } = useVgcaSign();
  return useMutation({
    mutationFn: async (params: {
      fileNameOrId: string | number;
      attachId: number | string;
      attachType: string;
      docNumber?: string;
    }) => {
      const { fileNameOrId, attachId, attachType, docNumber } = params;
      await signIssued(fileNameOrId, attachId, attachType, docNumber);
    },
    onSuccess: useInvalidateAll(),
    onError: (error) => {
      console.error("Lỗi ký ban hành:", error);
    },
  });
};
export const useSignAppendix = () => {
  const { signAppendix } = useVgcaSign();
  return useMutation({
    mutationFn: async (params: {
      fileNameOrId: string | number;
      attachId: number | string;
      attachType: string;
      docNumber?: string;
    }) => {
      const { fileNameOrId, attachId, attachType, docNumber } = params;
      await signAppendix(fileNameOrId, attachId, attachType, docNumber);
    },
    onSuccess: useInvalidateAll(),
    onError: (error) => {
      console.error("Lỗi ký phụ lục:", error);
    },
  });
};
