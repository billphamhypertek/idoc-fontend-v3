import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { Process, ProcessRequest } from "@/definitions/types/process.type";
import { ProcessService } from "@/services/process.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetProcessListQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [queryKeys.bpmn.search, params],
    queryFn: () => ProcessService.getProcessList(params),
    enabled: typeof window !== "undefined",
  });
};

export const useAddProcess = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: ProcessRequest }) =>
      ProcessService.addProcess(payload),
    meta: {
      skipGlobalErrorHandler: true,
    },
  });
};

export const useUpdateProcessDetail = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: ProcessRequest }) =>
      ProcessService.updateProcessDetail(payload),
    meta: {
      skipGlobalErrorHandler: true,
    },
  });
};

export const useUpdateProcess = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: Process }) =>
      ProcessService.updateProcess(payload),
  });
};

export const useDeleteProcess = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => ProcessService.deleteProcess(id),
  });
};

export const useGetProcessDetailQuery = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => ProcessService.getProcessDetail(id),
  });
};

export const useGetProcessDetailById = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.bpmn.detail, id],
    queryFn: () => ProcessService.getProcessDetail(id),
    enabled: typeof window !== "undefined" && id !== 0,
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: [queryKeys.users.all],
    queryFn: () => ProcessService.getAllUsersOrderPosition(),
    enabled: typeof window !== "undefined",
  });
};

export const useGetPositionsByOrgId = () => {
  return useMutation({
    mutationFn: ({ orgId, page }: { orgId: number; page: number }) =>
      ProcessService.getPositionsByOrgId(orgId, page),
  });
};
