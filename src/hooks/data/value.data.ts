import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ValueService } from "@/services/value.service";
import { queryKeys } from "@/definitions";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

export const useGetValues = (
  catId: number | undefined,
  docId: number | undefined,
  enabled = true
) => {
  return useQuery({
    queryKey: [queryKeys.value.values, catId, docId],
    queryFn: () => ValueService.loadValues(catId!, docId!),
    enabled: !!catId && !!docId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useAddValues = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => ValueService.addValues(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.value.values] });
    },
  });
};

export const useUpdateValues = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => ValueService.updateValues(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.value.values] });
    },
  });
};
