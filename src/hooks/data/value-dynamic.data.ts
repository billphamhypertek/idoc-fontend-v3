import { queryKeys } from "@/definitions";
import valueDynamicService, {
  ValueDynamicSearchParams,
  ValueDynamicTransferParams,
} from "@/services/value-dynamic.service";
import { useQuery, useMutation } from "@tanstack/react-query";

/**
 * Hook to fetch value-dynamic list
 */
export const useGetValueDynamicList = (
  params: ValueDynamicSearchParams,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.valueDynamic.search, params],
    queryFn: () => valueDynamicService.searchValueDynamic(params),
    enabled: enabled && !!params.formId,
  });
};

/**
 * Hook to fetch value-dynamic list (full version for search page)
 */
export const useGetValueDynamicListFull = (
  params: ValueDynamicSearchParams,
  body: any,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.valueDynamic.search, "full", params, body],
    queryFn: () => valueDynamicService.searchValueDynamicFull(params, body),
    enabled: enabled && !!params.formId,
  });
};

/**
 * Hook to delete value-dynamic by IDs
 */
export const useDeleteValueDynamicByIds = () => {
  return useMutation({
    mutationFn: (ids: number[]) =>
      valueDynamicService.deleteValueDynamicByIds(ids),
  });
};

/**
 * Hook to get value-dynamic detail
 */
export const useGetValueDynamicDetail = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.valueDynamic.detail, id],
    queryFn: () => valueDynamicService.getValueDynamicDetail(id),
    enabled: !!id,
  });
};

/**
 * Hook to done value-dynamic by valueId
 */
export const useDoneValueDynamic = () => {
  return useMutation({
    mutationFn: (valueId: number) =>
      valueDynamicService.doneValueDynamic(valueId),
  });
};

/**
 * Hook to recall value-dynamic by valueId
 */
export const useRecallValueDynamic = () => {
  return useMutation({
    mutationFn: (valueId: number) =>
      valueDynamicService.recallValueDynamic(valueId),
  });
};

/**
 * Hook to reject value-dynamic by valueId
 */
export const useRejectValueDynamic = () => {
  return useMutation({
    mutationFn: ({ valueId, reason }: { valueId: number; reason?: string }) =>
      valueDynamicService.rejectValueDynamic(valueId, reason),
  });
};

/**
 * Hook to calendar review value-dynamic by valueId
 */
export const useCalendarReviewValueDynamic = () => {
  return useMutation({
    mutationFn: ({ valueId }: { valueId: number }) =>
      valueDynamicService.calendarReviewValueDynamic(valueId),
  });
};

/**
 * Hook to transfer value-dynamic
 */
export const useTransferValueDynamic = () => {
  return useMutation({
    mutationFn: (params: ValueDynamicTransferParams) =>
      valueDynamicService.transferValueDynamic(params),
  });
};
export const useCreateValueDynamic = () => {
  return useMutation({
    mutationFn: ({
      formId,
      formData,
    }: {
      formId: number;
      formData: FormData;
    }) => valueDynamicService.createValueDynamic(formId, formData),
  });
};

/**
 * Hook to update value-dynamic (JSON object)
 */
export const useUpdateValueDynamic = () => {
  return useMutation({
    mutationFn: ({
      id,
      formId,
      data,
    }: {
      id: number;
      formId: number;
      data: Record<string, any>;
    }) => valueDynamicService.updateValueDynamic(id, formId, data),
  });
};

/**
 * Hook to get value-dynamic tracking
 */
export const useGetValueDynamicTracking = (
  id: number,
  page: number,
  size: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.valueDynamic.tracking, id, page, size],
    queryFn: () => valueDynamicService.getTracking(id, page, size),
    enabled: enabled && !!id,
  });
};
export const useGetValueDynamicCalendar = (
  formId: number,
  week: number,
  year: number,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.valueDynamic.calendar, formId, week, year],
    queryFn: () => valueDynamicService.getListCalendar(formId, week, year),
    enabled: enabled && !!formId,
  });
};
