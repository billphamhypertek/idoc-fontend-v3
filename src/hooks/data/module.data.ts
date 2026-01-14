import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { Module, ModuleDetail } from "@/definitions/types/module.type";
import { ModuleService } from "@/services/module.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetAllModulesQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.module.getAll],
    queryFn: () => ModuleService.getAllModules(),
    enabled: typeof window !== "undefined" && enabled,
  });
};

export const useUpdateShowHideModule = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: Module[] }) =>
      ModuleService.updateShowHideModule(payload),
  });
};

export const useGetDetailModule = (moduleId: number) => {
  return useQuery({
    queryKey: [queryKeys.module.getDetailModule, moduleId],
    queryFn: async () => await ModuleService.getDetailModule(moduleId),
    enabled: typeof window !== "undefined" && moduleId > 0,
  });
};

export const useUpdateModule = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: ModuleDetail }) =>
      ModuleService.updateModule(payload),
  });
};

export const useDeleteModule = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => ModuleService.deleteModule(id),
  });
};
