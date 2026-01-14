import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { OutSys } from "@/definitions/types/out-sys.type";
import { OutSysService } from "@/services/out-sys.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetOutSystemListQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [queryKeys.outSys.getList, params],
    queryFn: () => OutSysService.getOutSystemList(params),
    enabled: typeof window !== "undefined",
  });
};

export const useAddNewOutSys = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: OutSys }) =>
      OutSysService.addNewOutSys(payload),
  });
};

export const useUpdateOutSys = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: OutSys }) =>
      OutSysService.updateOutSys(payload),
  });
};

export const useDeactiveOutSys = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => OutSysService.deactiveOutSys(id),
  });
};

export const useActiveOutSys = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => OutSysService.activeOutSys(id),
  });
};

export const useDeleteOutSys = () => {
  return useMutation({
    mutationFn: (id: number) => OutSysService.deleteOutSys(id),
  });
};

export const useCreateLinkOutSys = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: OutSys }) =>
      OutSysService.createLinkOutSys(payload),
  });
};

export const useGetOutSystemHistoryListQuery = (
  params: Record<string, any>
) => {
  return useQuery({
    queryKey: [queryKeys.outSys.getHistoryList, params],
    queryFn: () => OutSysService.getOutSystemHistoryList(params),
    enabled: typeof window !== "undefined",
  });
};
