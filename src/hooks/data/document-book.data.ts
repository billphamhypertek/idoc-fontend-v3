import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DocumentBookService } from "@/services/document-book.service";
import {
  DocumentBook,
  DocumentBookSearchResponse,
  DocumentBookCreateUpdateRequest,
} from "@/definitions/types/document-book.type";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";

export const useGetDocumentBookByType = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.documentBook.byType, id],
    queryFn: () => DocumentBookService.getDocumentBookByType(id),
  });
};

// Search document books
export const useSearchDocumentBooks = (
  params: {
    name?: string;
    type?: number;
    status?: boolean;
    year?: number;
    page?: number;
    sortBy?: string;
    direction?: string;
    size?: number;
    encrypt?: string;
  },
  enabled: boolean = true
) => {
  return useQuery<DocumentBookSearchResponse>({
    queryKey: [queryKeys.documentBooks.search, params],
    queryFn: () =>
      DocumentBookService.searchDocumentBook(
        params.name,
        params.type,
        params.status,
        params.year,
        params.page || 1,
        params.direction || Constant.SORT_TYPE.DECREASE,
        params.sortBy,
        params.size || Constant.PAGING.SIZE,
        params.encrypt || "false"
      ),
    enabled,
  });
};

// Get document book by ID
export const useGetDocumentBookById = (id: number, enabled: boolean = true) => {
  return useQuery<DocumentBook>({
    queryKey: [queryKeys.documentBooks.detail, id],
    queryFn: () => DocumentBookService.getDocumentBookById(id),
    enabled: enabled && !!id,
  });
};

// Get document books by type
export const useGetDocumentBooksByType = (
  type: number,
  enabled: boolean = true
) => {
  return useQuery<DocumentBook[]>({
    queryKey: [queryKeys.documentBooks.byType, type],
    queryFn: () => DocumentBookService.getDocumentBookByType(type),
    enabled: enabled && type !== undefined,
  });
};

// Create document book mutation
export const useCreateDocumentBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentBookCreateUpdateRequest) =>
      DocumentBookService.createDocumentBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.byType],
      });
    },
  });
};

// Update document book mutation
export const useUpdateDocumentBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DocumentBookCreateUpdateRequest;
    }) => DocumentBookService.updateDocumentBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.byType],
      });
    },
  });
};

// Active document book mutation
export const useActiveDocumentBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => DocumentBookService.activeDocumentBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.byType],
      });
    },
  });
};

// Deactive document book mutation
export const useDeactiveDocumentBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => DocumentBookService.deactiveDocumentBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentBooks.byType],
      });
    },
  });
};
