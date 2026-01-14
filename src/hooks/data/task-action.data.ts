import { queryKeys } from "@/definitions";
import { TaskService } from "@/services/task.service";
import { handleError } from "@/utils/common.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../use-toast";
import { ToastUtils } from "@/utils/toast.utils";
import { TaskV2Service } from "@/services/taskv2.service";

export const useSaveRealTime = (
  taskId: number,
  userId: number,
  startDate: string,
  endDate: string,
  isV2: boolean = false
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      isV2
        ? await TaskV2Service.saveRealTimeV2(taskId, userId, startDate, endDate)
        : await TaskService.saveRealTime(taskId, userId, startDate, endDate),
    onSuccess: () => {
      if (isV2) {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.taskv2.getRealTime, taskId, userId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.task.getRealTime, taskId, userId],
        });
      }
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Hook cho update task
export const useUpdateTask = (isV2: boolean = false) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData: any) =>
      isV2
        ? await TaskV2Service.updateTaskV2(taskData)
        : await TaskService.updateTask(taskData),
    onSuccess: (data, variables) => {
      ToastUtils.success("Lưu thành công");
      if (isV2) {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.taskv2.getFindByIdTask, variables.id],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.task.getFindByIdTask, variables.id],
        });
      }
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Hook cho save task attachment
export const useSaveTaskAttachment = (isV2: boolean = false) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, files }: { taskId: number; files: File[] }) =>
      isV2
        ? await TaskV2Service.doSaveTaskAttachment(taskId, files)
        : await TaskService.doSaveTaskAttachment(taskId, files),
    onSuccess: (data, variables) => {
      if (isV2) {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.taskv2.getFindByIdTask, variables.taskId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.task.getFindByIdTask, variables.taskId],
        });
      }
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useDeleteTaskAction = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async (taskId: number) =>
      isV2
        ? await TaskV2Service.deleteTask(taskId)
        : await TaskService.deleteTask(taskId),
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useUpdateAcceptTask = (isV2: boolean = false) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      taskId: number;
      status: number;
      isExcute: boolean;
      comment?: string;
      files?: any;
      userId?: number;
    }) =>
      isV2
        ? await TaskV2Service.updateAcceptTaskV2(
            params.taskId,
            params.status,
            params.isExcute,
            params.comment,
            params.files,
            params.userId
          )
        : await TaskService.updateAcceptTask(
            params.taskId,
            params.status,
            params.isExcute,
            params.comment,
            params.files,
            params.userId
          ),
    onSuccess: (data, variables) => {
      if (isV2) {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.taskv2.getFindByIdTask, variables.taskId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.task.getFindByIdTask, variables.taskId],
        });
      }
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
