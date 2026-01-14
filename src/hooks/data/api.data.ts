import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiService } from "@/services/api.service";
import { queryKeys } from "@/definitions";
import type {
  ApiSearchParams,
  ApiAddRequest,
  ApiListResponse,
} from "@/definitions/types/api.type";
import { handleError } from "@/utils/common.utils";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

export const useApiList = (page: number = 1, params?: ApiSearchParams) => {
  return useQuery<ApiListResponse>({
    queryKey: [queryKeys.api.list, page, params],
    queryFn: async () => {
      const response = await ApiService.getApiList(page, params);
      // Transform response từ backend sang format component expect
      return {
        content: response.objList || [],
        totalElements: response.totalRecord || 0,
        totalPages: response.totalPage || 0,
        size: params?.size || 10,
        number: page,
      };
    },
    ...COMMON_QUERY_OPTS,
  });
};

export const useAddApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (apiData: ApiAddRequest) => ApiService.addApi(apiData),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.api.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useUpdateApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApiAddRequest }) =>
      ApiService.updateApi(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.api.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useToggleApiActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiService.toggleApiActive(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.api.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useDeleteApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiService.deleteApi(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.api.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
