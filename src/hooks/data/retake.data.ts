import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { RetakeService } from "@/services/retake.service";
import { queryKeys } from "@/definitions";
import { handleError } from "@/utils/common.utils";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

// Document In Queries
export const useRetakeDocumentInQuery = (
  params: Record<string, any>,
  isBasicSearch: boolean
) => {
  return useQuery({
    queryKey: ["retake_document_in_list", params, isBasicSearch],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      return isBasicSearch
        ? RetakeService.doBasicSearchDocumentIn(searchParams.toString())
        : RetakeService.doAdvancedSearchDocumentIn(searchParams.toString());
    },
    enabled: Object.keys(params).length > 0,
    ...COMMON_QUERY_OPTS,
  });
};

export const useRetakeRetookDocumentInQuery = (
  params: Record<string, any>,
  isBasicSearch: boolean
) => {
  return useQuery({
    queryKey: ["retake_retook_document_in_list", params, isBasicSearch],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      return isBasicSearch
        ? RetakeService.doBasicSearchRetookDocumentIn(searchParams.toString())
        : RetakeService.doAdvancedSearchReTookDocumentIn(
            searchParams.toString()
          );
    },
    enabled: Object.keys(params).length > 0,
    ...COMMON_QUERY_OPTS,
  });
};

// Document Out Queries
export const useRetakeDocumentOutQuery = (
  params: Record<string, any>,
  isBasicSearch: boolean
) => {
  return useQuery({
    queryKey: ["retake_document_out_list", params, isBasicSearch],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      return isBasicSearch
        ? RetakeService.doBasicSearchDocumentOut(searchParams.toString())
        : RetakeService.doAdvancedSearchDocumentOut(searchParams.toString());
    },
    enabled: Object.keys(params).length > 0,
    ...COMMON_QUERY_OPTS,
  });
};

export const useRetakeRetookDocumentOutQuery = (
  params: Record<string, any>,
  isBasicSearch: boolean
) => {
  return useQuery({
    queryKey: ["retake_retook_document_out_list", params, isBasicSearch],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      return isBasicSearch
        ? RetakeService.doBasicSearchRetookDocumentOut(searchParams.toString())
        : RetakeService.doAdvancedSearchRetookDocumentOut(
            searchParams.toString()
          );
    },
    enabled: Object.keys(params).length > 0,
    ...COMMON_QUERY_OPTS,
  });
};

// Mutations
export const useRetakeDocumentInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, comment }: { docId: string; comment: any }) =>
      RetakeService.doRetakeDocIn(docId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["retake_document_in_list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["retake_retook_document_in_list"],
      });
    },
    onError: handleError,
  });
};

export const useUnretakeDocumentInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, comment }: { docId: string; comment: string }) =>
      RetakeService.doUnretakeDraft(docId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["retake_document_in_list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["retake_retook_document_in_list"],
      });
    },
    onError: handleError,
  });
};

export const useRetakeDocumentOutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      docId,
      comment,
      isDelegate,
    }: {
      docId: string;
      comment: any;
      isDelegate: boolean;
    }) => RetakeService.doRetakeDocOut(docId, comment, isDelegate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["retake_document_out_list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["retake_retook_document_out_list"],
      });
    },
    onError: handleError,
  });
};

export const useUnretakeDocumentOutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      retakeComment,
      files,
    }: {
      documentId: string;
      retakeComment: any;
      files?: File[];
    }) => RetakeService.doUnretakeDocumentOut(documentId, retakeComment, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["retake_document_out_list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["retake_retook_document_out_list"],
      });
    },
    onError: handleError,
  });
};

// Check Action Queries
export const useCheckRetakeActionQuery = (
  docId: string,
  isDelegate: boolean
) => {
  return useQuery({
    queryKey: ["check_retake_action", docId, isDelegate],
    queryFn: () => RetakeService.checkButtonRetakeByStep(docId, isDelegate),
    enabled: !!docId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useCheckImportBookButtonQuery = (
  docId: string,
  isDelegate: boolean,
  tabname: string
) => {
  return useQuery({
    queryKey: ["check_import_book_button", docId, isDelegate, tabname],
    queryFn: () =>
      RetakeService.checkImportBookButton(docId, isDelegate, tabname),
    enabled: !!docId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useListRetakeQuery = () => {
  return useQuery({
    queryKey: ["list_retake"],
    queryFn: () => RetakeService.getListRetake(),
    ...COMMON_QUERY_OPTS,
  });
};
