import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { searchTaskParams } from "@/definitions/types/task.type";
import { DocumentOutService } from "@/services/document-out.service";
import { TaskService } from "@/services/task.service";
import { UserService } from "@/services/user.service";
import { OrganizationService } from "@/services/organization.service";
import {
  FollowerTask,
  TaskAssignCreate,
} from "@/definitions/types/task-assign.type";
import {
  AttachedDocumentSearch,
  SearchTaskDocument,
} from "@/definitions/types/document-out.type";
import { DocumentRecordService } from "@/services/document-record.service";
import { TaskV2Service } from "@/services/taskv2.service";

type TaskParams = Record<string, string | number | boolean | undefined>;

export const useTaskList = (
  activeTab: string,
  params: TaskParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: [queryKeys.task.list, activeTab, params],
    queryFn: async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value ?? ""));
      }
      const response = await TaskService.getListMainTasks(activeTab, formData);
      return response ?? { content: [], totalElements: 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useTaskAssignQuery = (
  params: Record<string, any>,
  isUserReady: boolean
) => {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return useQuery({
    queryKey: [queryKeys.task.assign, params],
    queryFn: () => TaskService.getTaskAssign(formData),
    enabled: typeof window !== "undefined" && isUserReady,
  });
};

export const useToggleImportant = (isV2: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      isV2 ? TaskV2Service.setImportant(id) : TaskService.setImportant(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.assign],
      }),
  });
};

export const useFindFollower = (isV2: boolean = false) =>
  useMutation({
    mutationFn: (id: string) =>
      isV2
        ? UserService.doTaskGetListUserFollowingTaskV2(id)
        : UserService.doTaskGetListUserFollowingTask(id),
  });

export const useGetOrgTreeById = () =>
  useMutation({
    mutationFn: (id: string) => OrganizationService.getOrgTreeById(id),
  });

export const useOrganizations = () =>
  useMutation({
    mutationFn: () => OrganizationService.getOrgAllSorted(),
  });

export const useAcceptTask = (isV2: boolean = false) =>
  useMutation({
    mutationFn: (params: {
      taskId: number | string;
      isExcute: boolean;
      status: number | string;
    }) =>
      isV2
        ? TaskV2Service.updateStatusV2(
            params.taskId,
            params.isExcute,
            params.status
          )
        : TaskService.updateStatus(
            params.taskId,
            params.isExcute,
            params.status
          ),
  });

export const useRejectTask = (isV2: boolean = false) =>
  useMutation({
    mutationFn: (params: {
      taskId: number | string;
      isExcute: boolean;
      status: number | string;
    }) =>
      isV2
        ? TaskV2Service.updateStatusV2(
            params.taskId,
            params.isExcute,
            params.status
          )
        : TaskService.updateStatus(
            params.taskId,
            params.isExcute,
            params.status
          ),
  });

export const useRevokeTask = (isV2: boolean = false) =>
  useMutation({
    mutationFn: (params: {
      taskId: number | string;
      isExcute: boolean;
      status: number | string;
    }) =>
      isV2
        ? TaskV2Service.updateStatusV2(
            params.taskId,
            params.isExcute,
            params.status
          )
        : TaskService.updateStatus(
            params.taskId,
            params.isExcute,
            params.status
          ),
  });

export const useCloseTask = (isV2: boolean = false) =>
  useMutation({
    mutationFn: (params: {
      taskId: number | string;
      isExcute: boolean;
      status: number | string;
    }) =>
      isV2
        ? TaskV2Service.updateStatusV2(
            params.taskId,
            params.isExcute,
            params.status
          )
        : TaskService.updateStatus(
            params.taskId,
            params.isExcute,
            params.status
          ),
  });

export const useRestoreTask = (isV2: boolean = false) =>
  useMutation({
    mutationFn: (params: {
      taskId: number | string;
      isExcute: boolean;
      status: number | string;
    }) =>
      isV2
        ? TaskV2Service.updateStatusV2(
            params.taskId,
            params.isExcute,
            params.status
          )
        : TaskService.updateStatus(
            params.taskId,
            params.isExcute,
            params.status
          ),
  });

export const useDeleteTask = (isV2: boolean = false) =>
  useMutation({
    mutationFn: (id: number | string) =>
      isV2 ? TaskV2Service.deleteTask(id) : TaskService.doDeleteTask(id),
  });

export const useFollowerTask = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: FollowerTask[];
    }) =>
      isV2
        ? TaskV2Service.updateFollowerTaskV2(id, payload)
        : TaskService.updateFollowerTask(id, payload),
  });
};

export const useTaskCombinationList = (
  activeTab: string,
  params: TaskParams,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.task.combinationList, activeTab, params],
    queryFn: async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value ?? ""));
      }
      const response = await TaskService.getListCombinationTasks(
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

export const useGetFindOrgAll = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.task.findOrgAll],
    queryFn: async () => await TaskService.getFindOrgAll(),
    enabled: enabled,
  });
};

export const useGetCategoryWithCode = (
  code: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.document_in.categoryWithCode, code],
    queryFn: async () => await DocumentOutService.getCategoryWithCode(code),
    enabled: enabled,
  });
};

export const useDoSearchTaskFollow = (
  body: searchTaskParams,
  page: number,
  newVersion: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.doSearchTaskFollow, body, page],
    queryFn: async () =>
      await (newVersion
        ? TaskV2Service.doSearchTaskFollowV2(body, page)
        : TaskService.doSearchTaskFollow(body, page)),
  });
};

export const useGetAction = (
  id: number,
  assigner: boolean = false,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.task.getAction, id, assigner],
    queryFn: async () => await TaskService.getAction(id, assigner),
    enabled: enabled,
  });
};

export const useGetUserFlow = (taskId: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.task.getUserFlow, taskId],
    queryFn: async () => await TaskService.getUserFlow(taskId),
    enabled: enabled,
  });
};

export const useGetRealTime = (
  taskId: number,
  userId: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.getRealTime, taskId, userId],
    queryFn: async () => {
      const data = await TaskService.getRealTime(taskId, userId);
      return data || null;
    },
    enabled: enabled,
  });
};

export const useGetListUserFollow = (
  taskId: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.getListUserFollow],
    queryFn: async () =>
      await UserService.doTaskGetListUserFollowingTask(taskId),
    enabled: enabled,
  });
};

export const useGetByUserExecute = (params: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.task.getByUserExecute, params],
    queryFn: async () => await TaskService.getByUserExecute(params),
    enabled: enabled,
  });
};

export const useGetTracking = (id: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.task.getTracking, id],
    queryFn: async () => await TaskService.getTracking(id),
    enabled: enabled,
  });
};

export const useGetFindByIdTask = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.task.getFindByIdTask, id],
    queryFn: async () => {
      const data = await TaskService.getFindByIdTask(id);
      return data || null;
    },
    enabled: enabled && !!id,
  });
};

// Hook cho lấy danh sách job assigner
export const useGetJobAssignerList = (
  orgId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.task.getJobAssignerList, orgId],
    queryFn: async () =>
      await UserService.doGetListListTaskAssignerByOrgId(orgId.toString()),
    enabled: enabled && orgId > 0,
  });
};

// Hook cho lấy lãnh đạo chỉ đạo hiện tại
export const useGetCurrentJobAssigner = (
  taskId: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.getCurrentJobAssigner, taskId],
    queryFn: async () =>
      await UserService.doTaskGetListLeaderAssigningTask(taskId.toString()),
    enabled: enabled && taskId > 0,
  });
};

export const useDoSearchTask = (
  body: searchTaskParams,
  page: number,
  isV2: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.doSearchTask, body, page],
    queryFn: async () =>
      await (isV2
        ? TaskV2Service.doSearchTask(body, page)
        : TaskService.doSearchTask(body, page)),
  });
};

export const useGetTaskOrgUserLead = (
  status: boolean,
  page: number,
  dayLeft: string,
  userOrgId: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [
      queryKeys.task.getTaskOrgUserLead,
      status,
      page,
      dayLeft,
      userOrgId,
    ],
    queryFn: async () =>
      await TaskService.getTaskOrgUserLead(status, page, dayLeft, userOrgId),
    enabled: enabled,
  });
};

export const useTaskExecuteQuery = (
  params: Record<string, any>,
  isUserReady: boolean
) => {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return useQuery({
    queryKey: [queryKeys.task.assign, params],
    queryFn: () => TaskService.getTaskExecute(formData),
    enabled: typeof window !== "undefined" && isUserReady,
  });
};

export const useGetAttachedDocumentQuery = (
  params: AttachedDocumentSearch | SearchTaskDocument,
  page: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.attachedDocument, params, page],
    queryFn: () => {
      if (params.docType === "0") {
        return DocumentRecordService.doSearchAttachedDocument(
          params as AttachedDocumentSearch,
          page
        );
      } else {
        return DocumentRecordService.doSearchDocumentOut(
          params as SearchTaskDocument,
          page
        );
      }
    },
    enabled: enabled,
  });
};

export const useGetAllTaskStatistic = (
  startDate: string = "",
  orgId: string = "",
  endDate: string = "",
  enabled: boolean = true,
  isV2: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.getAllTaskStatistic, startDate, orgId, endDate],
    queryFn: async () =>
      isV2
        ? await TaskV2Service.getAllTaskStatistic(startDate, orgId, endDate)
        : await TaskService.getAllTaskStatistic(startDate, orgId, endDate),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSaveTaskAssign = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: ({ payload }: { payload: TaskAssignCreate }) =>
      isV2
        ? TaskV2Service.addTaskAssignTo(payload)
        : TaskService.saveTaskAssign(payload),
  });
};

export const useAttachTaskAssign = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async ({
      payload,
      id,
    }: {
      payload: { files: File[]; type: number | null };
      id: number | string;
    }) => {
      const formData = new FormData();
      if (Array.isArray(payload.files) && payload.files.length > 0) {
        payload.files.forEach((file: File) => {
          formData.append("files", file);
        });
      }
      if (payload.type !== null && payload.type !== undefined) {
        formData.append("type", String(payload.type));
      }
      return isV2
        ? TaskV2Service.doSaveTaskAttachment(id, payload.files)
        : TaskService.attachTask(formData, id);
    },
  });
};

export const useDoAddTransfer = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async ({
      taskId,
      payload,
    }: {
      taskId: number | string;
      payload: any;
    }) => {
      return isV2
        ? TaskV2Service.doAddTransfer(taskId, payload)
        : TaskService.doAddTransfer(taskId, payload);
    },
  });
};

export const useGetAllUsersByOrgAndSub = (orgId: number) => {
  return useQuery({
    queryKey: [queryKeys.task.getAllUsersByOrgAndSub, orgId],
    queryFn: async () => await TaskService.getAllUsersByOrgAndSub(orgId),
  });
};

export const useGetTaskKpi = (
  from: string,
  to: string,
  orgId: number | string,
  userId: string | number,
  page: number,
  size: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.task.getTaskKpi, from, to, orgId, userId, page, size],
    queryFn: async () =>
      await TaskService.doGetTaskKpi(from, to, orgId, userId, page, size),
    enabled,
  });
};

export const useGetDetailKpi = (
  from: string,
  to: string,
  userId: string | number,
  page: number,
  size: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.task.getDetailKpi, from, to, userId, page, size],
    queryFn: async () =>
      await TaskService.doGetDetailKpi(from, to, userId, page, size),
    enabled,
  });
};

export const useGetDetailKpiTask = (
  taskId: number | string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.getDetailKpiTask, taskId],
    queryFn: async () => await TaskService.doGetDetailKpiTask(taskId),
    enabled,
  });
};

// Dashboard hooks
export const useGetTaskDashboardByDepartment = (
  orgId: string,
  weekCheck: boolean = false,
  monthCheck: boolean = false,
  yearCheck: boolean = false,
  fromDate: string = "",
  toDate: string = "",
  enabled: boolean = true,
  isV2: boolean = false
) => {
  return useQuery({
    queryKey: [
      isV2
        ? queryKeys.taskv2.dashboardByDepartment
        : queryKeys.task.dashboardByDepartment,
      orgId,
      weekCheck,
      monthCheck,
      yearCheck,
      fromDate,
      toDate,
    ],
    queryFn: async () =>
      isV2
        ? await TaskV2Service.getTaskDashboardByDepartmentV2(
            orgId,
            weekCheck,
            monthCheck,
            yearCheck,
            fromDate,
            toDate
          )
        : await TaskService.getTaskDashboardByDepartment(
            orgId,
            weekCheck,
            monthCheck,
            yearCheck,
            fromDate,
            toDate
          ),
    enabled: enabled,
  });
};

export const useGetTaskDashboardData = (
  orgId: string,
  userId: string = "",
  weekCheck: boolean = false,
  monthCheck: boolean = false,
  yearCheck: boolean = false,
  fromDate: string = "",
  toDate: string = "",
  enabled: boolean = true,
  isV2: boolean = false
) => {
  return useQuery({
    queryKey: [
      isV2 ? queryKeys.taskv2.dashboardData : queryKeys.task.dashboardData,
      orgId,
      userId,
      weekCheck,
      monthCheck,
      yearCheck,
      fromDate,
      toDate,
    ],
    queryFn: async () =>
      isV2
        ? await TaskV2Service.getTaskDashboardDataV2(
            orgId,
            userId,
            weekCheck,
            monthCheck,
            yearCheck,
            fromDate,
            toDate
          )
        : await TaskService.getTaskDashboardData(
            orgId,
            userId,
            weekCheck,
            monthCheck,
            yearCheck,
            fromDate,
            toDate
          ),
    enabled: enabled,
  });
};

export const useGetTaskDashboardListOrg = (
  orgIds: number[],
  text: string = "",
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.task.dashboardListOrg, orgIds, text],
    queryFn: async () =>
      await TaskService.getTaskDashboardListOrg(orgIds, text),
    enabled: enabled && orgIds.length > 0,
  });
};

export const useGetTaskDashboardList = (
  orgId: number,
  text: string = "",
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.task.dashboardList, orgId, text],
    queryFn: async () => await TaskService.getTaskDashboardList(orgId, text),
    enabled: enabled && orgId > 0,
  });
};

export const useListTasksByUser = (userId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.task.listTasksByUser, userId],
    queryFn: async () => await TaskService.listTasksbyUser(userId),
    enabled: enabled && userId > 0,
  });
};

export const useRegularTaskList = (
  page: number,
  size: number,
  text?: string,
  orgId?: number,
  complexityId?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      queryKeys.task.regularList,
      page,
      size,
      text,
      orgId,
      complexityId,
    ],
    queryFn: async () =>
      await TaskService.doPageRegular(page, size, text, orgId, complexityId),
    enabled,
  });
};

export const useCreateRegular = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => TaskService.createRegular(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.regularList],
      });
    },
  });
};

export const useUpdateRegular = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => TaskService.updateRegular(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.regularList],
      });
    },
  });
};

export const useDeleteRegular = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TaskService.deleteRegular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.regularList],
      });
    },
  });
};

// Declared Task Hooks
export const useCreateDeclaredTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (createDto: any) => TaskService.createDeclaredTask(createDto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.declaredTask],
      });
    },
  });
};

export const useUpdateDeclaredTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateDto }: { id: number; updateDto: any }) =>
      TaskService.updateDeclaredTask(id, updateDto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.declaredTask],
      });
    },
  });
};

export const useDeleteDeclaredTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TaskService.deleteDeclaredTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.declaredTask],
      });
    },
  });
};

export const useFindBasicDeclaredTask = (
  type: number,
  status: string,
  page: number = 0,
  size: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      queryKeys.task.declaredTask,
      "findBasic",
      type,
      status,
      page,
      size,
    ],
    queryFn: async () =>
      await TaskService.findBasicDeclaredTask(type, status, page, size),
    enabled: enabled && !!status,
  });
};

export const useFindAdvanceDeclaredTask = (
  type: number,
  status?: string,
  taskName?: string,
  startDate?: string,
  endDate?: string,
  page: number = 0,
  size: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      queryKeys.task.declaredTask,
      "findAdvance",
      type,
      status,
      taskName,
      startDate,
      endDate,
      page,
      size,
    ],
    queryFn: async () =>
      await TaskService.findAdvanceDeclaredTask(
        type,
        status,
        taskName,
        startDate,
        endDate,
        page,
        size
      ),
    enabled: enabled,
  });
};

export const useGetTaskOrgUserLeadV2 = (
  status: boolean,
  page: number,
  dayLeft: string,
  orgId: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [
      queryKeys.taskv2.getTaskOrgUserLeadV2,
      status,
      page,
      dayLeft,
      orgId,
    ],
    queryFn: async () =>
      await TaskService.getTaskOrgUserLeadV2(status, page, dayLeft, orgId),
    enabled: enabled,
  });
};

export const useGetListViewFollow = (
  taskId: number,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [queryKeys.task.listViewFollow, taskId],
    queryFn: async () => await TaskService.getListViewFollow(taskId),
    enabled: enabled,
  });
};
