import { queryKeys } from "@/definitions";
import workflowService from "@/services/workflow.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to get form node start
 */
export const useGetFormNodeStart = (formType: string) => {
  return useQuery({
    queryKey: [queryKeys.workFlow.getFormNodeStart, formType],
    queryFn: () => workflowService.getFormNodeStart(formType),
    enabled: !!formType,
  });
};

/**
 * Hook to get next start node
 */
export const useGetNextNode = (nodeId: number) => {
  return useQuery({
    queryKey: [queryKeys.workFlow.getNextStartNode, nodeId],
    queryFn: () => workflowService.getNextNode(nodeId),
    enabled: !!nodeId,
  });
};

export const useGetStartNode = (formType: string, formId?: string) => {
  return useQuery({
    queryKey: [queryKeys.workFlow.getStartNode, formType, formId],
    queryFn: () => workflowService.getStartNode(formType, formId),
    enabled: !!formType,
  });
};
export const useGetNodeUser = (nodeId: number) => {
  return useQuery({
    queryKey: [queryKeys.workFlow.getNodeUser, nodeId],
    queryFn: () => workflowService.getNodeUser(nodeId),
    enabled: !!nodeId,
  });
};

export const useTransferNode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => workflowService.transferNode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.valueDynamic.search],
      });
    },
  });
};
