import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { AddDelegateFlow } from "@/definitions/types/delegate_flow.type";
import { DelegateFlowService } from "@/services/delegate_flow.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetDelegateFlowListQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [queryKeys.delegateFlow.getList, params],
    queryFn: () => DelegateFlowService.getDelegateFlowList(params),
    enabled: typeof window !== "undefined",
  });
};

export const useAddDelegateFlow = () => {
  return useMutation({
    mutationFn: (payload: AddDelegateFlow) =>
      DelegateFlowService.addDelegateFlow(payload),
  });
};

export const useDeleteDelegateFlow = () => {
  return useMutation({
    mutationFn: (id: number) => DelegateFlowService.deleteDelegateFlow(id),
  });
};
