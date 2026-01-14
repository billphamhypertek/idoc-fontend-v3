import { queryKeys } from "@/definitions/constants/queryKey.constants";
import {
  FormConfigRequest,
  FormConfigService,
} from "@/services/form-config.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to get form config list with pagination and search
 */
export const useGetFormConfigListQuery = (
  params: any,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.formConfig.list, params],
    queryFn: () => FormConfigService.getFormConfigList(params),
    enabled: typeof window !== "undefined" && enabled,
  });
};

/**
 * Hook to get simple list of form configs (non-paginated)
 */
export const useGetFormConfigSimpleListQuery = (
  typeWorkflow: string = "",
  searchKey: string = ""
) => {
  return useQuery({
    queryKey: [queryKeys.formConfig.simpleList, typeWorkflow, searchKey],
    queryFn: () =>
      FormConfigService.getFormConfigSimpleList(typeWorkflow, searchKey),
    enabled: typeof window !== "undefined" && typeWorkflow !== "",
  });
};

/**
 * Hook to get form config detail
 */
export const useGetFormConfigDetailQuery = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.formConfig.detail, id],
    queryFn: () => FormConfigService.getFormConfigDetail(id),
    enabled: typeof window !== "undefined" && !!id,
  });
};

/**
 * Hook to add new form config
 */
export const useAddFormConfig = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: FormConfigRequest }) =>
      FormConfigService.addFormConfig(payload),
    meta: {
      skipGlobalErrorHandler: true,
    },
  });
};

/**
 * Hook to update form config
 */
export const useUpdateFormConfig = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormConfigRequest }) =>
      FormConfigService.updateFormConfig(id, payload),
    meta: {
      skipGlobalErrorHandler: true,
    },
  });
};

/**
 * Hook to delete form config
 */
export const useDeleteFormConfig = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      FormConfigService.deleteFormConfig(id),
  });
};

/**
 * Hook to get form config type list
 */
export const useGetFormConfigTypeListQuery = () => {
  return useQuery({
    queryKey: [queryKeys.formConfig.typeList],
    queryFn: () => FormConfigService.getFormConfigTypeList(),
    enabled: typeof window !== "undefined",
  });
};

/**
 * Hook to toggle active/deactive form config
 */
export const useToggleActiveFormConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      FormConfigService.toggleActiveFormConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.formConfig.list],
      });
    },
  });
};

/**
 * Hook to get API endpoint list for form
 */
export const useGetApiEndpointListQuery = (searchKey: string = "") => {
  return useQuery({
    queryKey: [queryKeys.formConfig.apiEndpoints, searchKey],
    queryFn: () => FormConfigService.getApiEndpointList(searchKey),
    enabled: typeof window !== "undefined",
  });
};

/**
 * Hook to get preview data from API endpoint
 */
export const useGetApiPreviewData = () => {
  return useMutation({
    mutationFn: ({ apiUrl }: { apiUrl: string }) =>
      FormConfigService.getApiPreviewData(apiUrl),
  });
};
