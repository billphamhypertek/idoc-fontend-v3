import { queryKeys } from "@/definitions";
import { WatchListService } from "@/services/watch-list.service";
import { handleError } from "@/utils/common.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateCreateWatchList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watchList: any) => {
      const response = await WatchListService.updateWatchList(watchList);
      return { success: true, data: response };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useDeleteWatchList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watchList: any) => {
      const response = await WatchListService.deleteWatchList(watchList);
      return { success: true, data: response };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useSendNoteWatchList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watchList: any) => {
      const response = await WatchListService.sendNoteWatchList(watchList);
      return { success: true, data: response };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useApproveWatchList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watchList: any) => {
      const response = await WatchListService.approveWatchList(watchList);
      return response;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.list],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.checkStatusWatchList],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useFinishWatchList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watchList: any) => {
      const response = await WatchListService.finishWatchList(watchList);
      return { success: true, data: response };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.list],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.listOrgWaitFinish],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useRejectWatchList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watchList: any) => {
      const response = await WatchListService.rejectWatchList(watchList);
      return { success: true, data: response };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.list],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useRejectWatchListFromFinish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watchList: any) => {
      const response =
        await WatchListService.rejectWatchListFromFinish(watchList);
      return { success: true, data: response };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.list],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.manageWatchList.listOrgWaitFinish],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
