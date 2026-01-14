import { queryKeys } from "@/definitions/constants/queryKey.constants";
import {
  WorkflowConfig,
  WorkflowConfigRequest,
} from "@/definitions/types/workflow-config.type";
import { WorkflowConfigService } from "@/services/workflow-config.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetWorkflowConfigListQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [queryKeys.workflowConfig.search, params],
    queryFn: () => WorkflowConfigService.getWorkflowConfigList(params),
    enabled: typeof window !== "undefined",
  });
};

export const useAddWorkflowConfig = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: WorkflowConfigRequest }) =>
      WorkflowConfigService.addWorkflowConfig(payload),
    meta: {
      skipGlobalErrorHandler: true,
    },
  });
};

export const useUpdateWorkflowConfigDetail = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: WorkflowConfigRequest }) =>
      WorkflowConfigService.updateWorkflowConfigDetail(payload),
    meta: {
      skipGlobalErrorHandler: true,
    },
  });
};

export const useUpdateWorkflowConfig = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: WorkflowConfig }) =>
      WorkflowConfigService.updateWorkflowConfig(payload),
  });
};

export const useDeleteWorkflowConfig = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      WorkflowConfigService.deleteWorkflowConfig(id),
  });
};

export const useGetWorkflowConfigDetailQuery = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      WorkflowConfigService.getWorkflowConfigDetail(id),
  });
};

export const useGetWorkflowConfigDetailById = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.workflowConfig.detail, id],
    queryFn: () => WorkflowConfigService.getWorkflowConfigDetail(id),
    enabled: typeof window !== "undefined" && id !== 0,
    staleTime: 0,
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: [queryKeys.users.all],
    queryFn: () => WorkflowConfigService.getAllUsersOrderPosition(),
    enabled: typeof window !== "undefined",
  });
};

export const useGetPositionsByOrgId = () => {
  return useMutation({
    mutationFn: ({ orgId, page }: { orgId: number; page: number }) =>
      WorkflowConfigService.getPositionsByOrgId(orgId, page),
  });
};
