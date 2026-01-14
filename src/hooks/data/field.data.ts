import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FieldService } from "@/services/field.service";
import { queryKeys } from "@/definitions";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

export const useGetFields = (catId: number | undefined, enabled = true) => {
  return useQuery({
    queryKey: [queryKeys.field.fields, catId],
    queryFn: () => FieldService.getFields(catId!),
    enabled: !!catId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};
