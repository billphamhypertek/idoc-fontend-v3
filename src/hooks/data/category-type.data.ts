import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryTypeService } from "@/services/category-type.service";
import {
  CategoryType,
  CategoryTypeSearchResponse,
  CategoryTypeCreateUpdateRequest,
} from "@/definitions/types/category-type.type";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";

// Get all category types with paging
export const useGetCategoryTypes = (
  params: {
    page?: number;
    size?: number;
  } = {},
  enabled: boolean = true
) => {
  return useQuery<CategoryTypeSearchResponse>({
    queryKey: [queryKeys.categoryTypes.list, params],
    queryFn: () =>
      CategoryTypeService.getAllCategoryTypesWithPaging({
        page: params.page || 1,
        size: params.size || Constant.PAGING.SIZE,
      }),
    enabled,
  });
};

// Create category type mutation
export const useCreateCategoryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryTypeCreateUpdateRequest) =>
      CategoryTypeService.createCategoryType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categoryTypes.list],
      });
    },
  });
};

// Update category type mutation
export const useUpdateCategoryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CategoryTypeCreateUpdateRequest;
    }) => CategoryTypeService.updateCategoryType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categoryTypes.list],
      });
    },
  });
};

// Active category type mutation
export const useActiveCategoryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CategoryTypeService.activeCategoryType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categoryTypes.list],
      });
    },
  });
};

// Deactive category type mutation
export const useDeactiveCategoryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CategoryTypeService.deactiveCategoryType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categoryTypes.list],
      });
    },
  });
};

// Delete category type mutation
export const useDeleteCategoryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CategoryTypeService.deleteCategoryType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categoryTypes.list],
      });
    },
  });
};
