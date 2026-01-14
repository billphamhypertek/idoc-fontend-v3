import { queryKeys } from "@/definitions/constants/queryKey.constants";
import {
  AttachedDocumentSearch,
  SearchTaskDocument,
} from "@/definitions/types/document-out.type";
import { TaskV2Service } from "@/services/taskv2.service";
import { UserService } from "@/services/user.service";
import { handleError } from "@/utils/common.utils";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { VehicleService } from "@/services/vehicle.service";
import { ToastUtils } from "@/utils/toast.utils";

type TaskParams = Record<string, string | number | boolean | undefined>;

export const useFindBasic = (
  type: number,
  status: string,
  page: number = 0,
  size: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.findBasic, type, status, page, size],
    queryFn: () => TaskV2Service.findBasic(type, status, page, size),
    enabled,
  });
};

export const useGetListListTaskAssigner = () => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getListListTaskAssigner],
    queryFn: () => TaskV2Service.doGetListListTaskAssigner(),
  });
};

export const useCreateDeclareTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => TaskV2Service.create(data),
  });
};

export const useUpdateDeclareTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      TaskV2Service.update(id, data),
  });
};

export const useDeleteDeclareTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => TaskV2Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.taskv2.findBasic],
      });
    },
  });
};

export const useAcceptDeclareTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      TaskV2Service.acceptDeclaredTask(id, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.taskv2.findBasic],
      });
    },
  });
};

export const useFindAdvance = () => {
  return useMutation({
    mutationFn: (params: {
      type: number;
      status: string;
      taskName?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }) =>
      TaskV2Service.findAdvance(
        params.type,
        params.status,
        params.taskName,
        params.startDate,
        params.endDate,
        params.page || 0,
        params.size || 100
      ),
  });
};

export const useGetDetail = (id: number | string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getDetail, id],
    queryFn: () => TaskV2Service.getDetail(Number(id)),
    enabled: enabled && !!id,
  });
};
export const useGetListLeaderById = (
  id: number,
  enable: boolean = false,
  isV2: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.lead.info, id],
    queryFn: () =>
      isV2
        ? TaskV2Service.getListLeadById(id)
        : VehicleService.getListLeadById(id),
    enabled: !!id && enable,
  });
};

export const useCreateDepartmentTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => TaskV2Service.createDepartmentTask(data),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.taskv2.departmentTaskList],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.taskv2.countDepartmentTask],
      });
    },
  });
};

export const useUpdateDepartmentTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => TaskV2Service.updateDepartmentTask(data),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.taskv2.departmentTaskList],
      });
    },
  });
};

export const useExportDepartmentTask = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await TaskV2Service.exportDepartmentTask();
      return { success: true, data: response };
    },
  });
};

export const useCountDepartmentTask = () => {
  return useQuery({
    queryKey: [queryKeys.taskv2.countDepartmentTask],
    queryFn: () => TaskV2Service.countDepartmentTask(),
  });
};

export const useDetailDepartmentTask = (
  id: number | string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.detailDepartmentTask, id],
    queryFn: () => TaskV2Service.detailDepartmentTask(Number(id)),
    enabled: enabled && !!id,
  });
};

export const useDeleteDepartmentTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => TaskV2Service.deleteDepartmentTask(id),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.taskv2.departmentTaskList],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.taskv2.countDepartmentTask],
      });
    },
  });
};

export const useApproveOrRejectDepartmentTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      TaskV2Service.approveOrRejectDepartmentTask(id, approved),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [queryKeys.taskv2.departmentTaskList],
      });
      qc.invalidateQueries({
        queryKey: [queryKeys.taskv2.countDepartmentTask],
      });
    },
  });
};

export const useListDepartmentTask = (
  status: string,
  page: number,
  size: number,
  orgId: string
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.departmentTaskList, status, page, size, orgId],
    queryFn: () => TaskV2Service.listDepartmentTask(status, page, size, orgId),
  });
};

export const useTaskAssignQueryV2 = (
  params: Record<string, any>,
  isUserReady: boolean
) => {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return useQuery({
    queryKey: [queryKeys.taskv2.assign, params],
    queryFn: () => TaskV2Service.getTaskAssign(formData),
    enabled: typeof window !== "undefined" && isUserReady,
  });
};

export const useTaskExecuteQueryV2 = (
  params: Record<string, any>,
  isUserReady: boolean
) => {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return useQuery({
    queryKey: [queryKeys.taskv2.assign, params],
    queryFn: () => TaskV2Service.getTaskExecute(formData),
    enabled: typeof window !== "undefined" && isUserReady,
  });
};

export const useGetAttachedDocumentQueryV2 = (
  params: AttachedDocumentSearch | SearchTaskDocument,
  page: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.attachedDocument, params, page],
    queryFn: () => {
      if (params.docType === "0") {
        return TaskV2Service.doSearchAttachedDocument(
          params as AttachedDocumentSearch,
          page
        );
      } else {
        return TaskV2Service.doSearchDocumentOut(
          params as SearchTaskDocument,
          page
        );
      }
    },
    enabled: enabled,
  });
};

export const useTaskListV2 = (
  activeTab: string,
  params: TaskParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: [queryKeys.taskv2.list, activeTab, params],
    queryFn: async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value ?? ""));
      }
      const response = await TaskV2Service.getListMainTasks(
        activeTab,
        formData
      );
      return response ?? { content: [], totalElements: 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useTaskCombinationListV2 = (
  activeTab: string,
  params: TaskParams,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.combinationList, activeTab, params],
    queryFn: async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value ?? ""));
      }
      const response = await TaskV2Service.getListCombinationTasksV2(
        activeTab,
        formData
      );
      return response ?? { content: [], totalElements: 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled: enabled,
  });
};

export const useGetFindByIdTaskV2 = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getFindByIdTask, id],
    queryFn: async () => {
      const data = await TaskV2Service.getFindByIdTaskV2(id);
      return data || null;
    },
    enabled: enabled && !!id,
  });
};

export const useGetActionV2 = (
  id: number,
  assigner: boolean = false,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getAction, id, assigner],
    queryFn: async () => await TaskV2Service.getActionV2(id, assigner),
    enabled: enabled,
  });
};

export const useGetTrackingV2 = (id: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getTracking, id],
    queryFn: async () => await TaskV2Service.getTrackingV2(id),
    enabled: enabled,
  });
};

export const useGetUserFlowV2 = (taskId: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getUserFlow, taskId],
    queryFn: async () => await TaskV2Service.getUserFlowV2(taskId),
    enabled: enabled,
  });
};

export const useGetRealTimeV2 = (
  taskId: number,
  userId: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getRealTime, taskId, userId],
    queryFn: async () => {
      const data = await TaskV2Service.getRealTimeV2(taskId, userId);
      return data || null;
    },
    enabled: enabled,
  });
};

export const useGetListUserFollowV2 = (
  taskId: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getListUserFollow],
    queryFn: async () =>
      await UserService.doTaskGetListUserFollowingTaskV2(taskId),
    enabled: enabled,
  });
};

export const useGetByUserExecuteV2 = (params: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getByUserExecute, params],
    queryFn: async () => await TaskV2Service.getByUserExecuteV2(params),
    enabled: enabled,
  });
};

export const useGetCurrentJobAssignerV2 = (
  taskId: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getCurrentJobAssigner, taskId],
    queryFn: async () =>
      await UserService.doTaskGetListLeaderAssigningTaskV2(taskId.toString()),
    enabled: enabled && taskId > 0,
  });
};

export const useExportAnalysis = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await TaskV2Service.exportAnalysis();
      return { success: true, data: response };
    },
  });
};

export const useGetRegularWeek = (approve: boolean = false, userId?: any) => {
  return useQuery({
    queryKey: [queryKeys.taskv2.getRegularWeek, approve, userId],
    queryFn: async () => await TaskV2Service.getRegularWeek(approve, userId),
  });
};

export const useUpdateRegularWeek = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      await TaskV2Service.updateRegularWeek(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.taskv2.getRegularWeek, false],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

export const useExportRegularWeek = () => {
  return useMutation({
    mutationFn: async () => await TaskV2Service.exportRegular(),
    onSuccess: () => {
      ToastUtils.success("Xuất file excel thành công");
    },
    onError: (error) => {
      ToastUtils.error("Có lỗi khi xuất file excel");
    },
  });
};
