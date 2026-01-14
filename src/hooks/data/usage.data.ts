import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsageService } from "@/services/usage.service";
import {
  Usage,
  UsageCreateRequest,
  UsageUpdateRequest,
  UsageFileRequest,
  UsageDeleteRequest,
} from "@/definitions/types/usage.type";
import { queryKeys } from "@/definitions";

// Get category type usage
export const useGetCategoryTypeUsage = () => {
  return useQuery({
    queryKey: [queryKeys.usage.categoryType],
    queryFn: () => UsageService.getCategoryTypeUsage(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

// Get usage list
export const useGetUsageList = () => {
  return useQuery({
    queryKey: [queryKeys.usage.list],
    queryFn: () => UsageService.getUsageList(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

// Save usage mutation
export const useSaveUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UsageUpdateRequest) => UsageService.saveUsage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.usage.list],
      });
    },
  });
};

// Save new usage mutation
export const useSaveNewUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UsageCreateRequest) => UsageService.saveNewUsage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.usage.list],
      });
    },
  });
};

// Save file usage mutation
export const useSaveFileUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UsageFileRequest) => UsageService.saveFileUsage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.usage.list],
      });
    },
  });
};

// Delete usage mutation
export const useDeleteUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UsageDeleteRequest) => UsageService.deleteUsage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.usage.list],
      });
    },
  });
};
