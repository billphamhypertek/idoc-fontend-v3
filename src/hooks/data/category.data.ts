import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import { CategoryService as AdminCategoryService } from "@/services/category.service";
import {
  Category,
  CategorySearchResponse,
  CategoryCreateUpdateRequest,
  CategorySearchParams,
} from "@/definitions/types/category.type";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
export const useGetCategoriesByCode = (code?: string) =>
  useQuery({
    queryKey: [queryKeys.categories.byType, code],
    queryFn: () => CategoryService.getCategoriesByCode(code!),
    enabled: !!code,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

export const useAddAdditionalPosition = () => {
  return useMutation({
    mutationFn: ({
      userId,
      positions,
    }: {
      userId: string;
      positions: number[];
    }) => CategoryService.addAdditionalPosition(userId, { positions }),
  });
};

export const useRemoveAdditionalPosition = () => {
  return useMutation({
    mutationFn: ({
      userId,
      positions,
    }: {
      userId: string;
      positions: number[];
    }) => CategoryService.removeAdditionalPosition(userId, { positions }),
  });
};

// Search categories
export const useSearchCategories = (
  params: CategorySearchParams,
  enabled: boolean = true
) => {
  return useQuery<CategorySearchResponse>({
    queryKey: [queryKeys.categories.search, params],
    queryFn: () =>
      AdminCategoryService.searchCategories({
        name: params.name,
        id: params.id,
        active: params.active,
        categoryTypeId: params.categoryTypeId,
        page: params.page || 1,
        sortBy: params.sortBy,
        direction: params.direction || Constant.SORT_TYPE.DECREASE,
        size: params.size || Constant.PAGING.SIZE,
      }),
    enabled: enabled && !!params.categoryTypeId,
  });
};

// Get categories by type
export const useGetCategoriesByType = (
  categoryTypeId: number,
  enabled: boolean = true
) => {
  return useQuery<Category[]>({
    queryKey: [queryKeys.categories.byType, categoryTypeId],
    queryFn: () => AdminCategoryService.getCategoriesByType(categoryTypeId),
    enabled: enabled && !!categoryTypeId,
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreateUpdateRequest) =>
      AdminCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.byType],
      });
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CategoryCreateUpdateRequest;
    }) => AdminCategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.byType],
      });
    },
  });
};

// Active category mutation
export const useActiveCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AdminCategoryService.activeCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.byType],
      });
    },
  });
};

// Deactive category mutation
export const useDeactiveCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AdminCategoryService.deactiveCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.byType],
      });
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AdminCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.search],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.categories.byType],
      });
    },
  });
};
