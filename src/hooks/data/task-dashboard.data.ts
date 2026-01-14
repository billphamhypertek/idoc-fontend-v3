import { useMutation } from "@tanstack/react-query";
import { TaskService } from "@/services/task.service";
import { TaskV2Service } from "@/services/taskv2.service";

export const useLoadDepartmentData = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async (params: {
      orgId: string;
      weekCheck?: boolean;
      monthCheck?: boolean;
      yearCheck?: boolean;
      fromDate?: string;
      toDate?: string;
    }) => {
      const {
        orgId,
        weekCheck = false,
        monthCheck = false,
        yearCheck = false,
        fromDate = "",
        toDate = "",
      } = params;

      return isV2
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
          );
    },
  });
};

export const useLoadDashboardList = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async (params: { userIds: string | number; text?: string }) => {
      // If userIds is a string containing comma, pass it directly (e.g., "1,2,3")
      // Otherwise, parse to number for single userId
      const userIdsParam =
        typeof params.userIds === "string" && params.userIds.includes(",")
          ? params.userIds
          : typeof params.userIds === "string"
            ? parseInt(params.userIds, 10) || 0
            : params.userIds;
      return isV2
        ? await TaskV2Service.getTaskDashboardListV2(params.text || "")
        : await TaskService.getTaskDashboardList(
            userIdsParam,
            params.text || ""
          );
    },
  });
};

export const useLoadUserTasks = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async (params: {
      userId: string | number;
      weekCheck?: boolean;
      monthCheck?: boolean;
      yearCheck?: boolean;
      fromDate?: string;
      toDate?: string;
    }) => {
      const numericUserId =
        typeof params.userId === "string"
          ? parseInt(params.userId, 10)
          : params.userId;
      return isV2
        ? await TaskV2Service.listTasksbyUserV2(numericUserId)
        : await TaskService.listTasksbyUser(
            numericUserId,
            params.weekCheck || false,
            params.monthCheck || false,
            params.yearCheck || false,
            params.fromDate || "",
            params.toDate || ""
          );
    },
  });
};

export const useLoadKanbanList = () => {
  return useMutation({
    mutationFn: async (params: {
      orgId: string | number;
      text?: string;
      isOrg: boolean;
      isExecute?: boolean | null;
    }) => {
      return await TaskService.taskDashboardKanbanList(
        params.orgId,
        params.text || "",
        params.isOrg,
        params.isExecute
      );
    },
  });
};

export const useSetImportantKanban = () => {
  return useMutation({
    mutationFn: async (params: { taskId: number; type: string }) => {
      return await TaskService.setImportantKanban(params.taskId, params.type);
    },
  });
};

export const useListDashboard = () => {
  return useMutation({
    mutationFn: async (params: { taskId: number }) => {
      return await TaskService.listDashboard(params.taskId);
    },
  });
};

export const useUpdateUserHandle = () => {
  return useMutation({
    mutationFn: async (params: {
      taskId: number;
      newUserId: number;
      userId: number;
    }) => {
      return await TaskService.updateUserHandle(
        params.taskId,
        params.newUserId,
        params.userId
      );
    },
  });
};

export const useUpdateStatusKanban = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async (params: {
      taskId: number;
      fromStatus: number;
      toStatus: number;
      frUserId: number;
      toUserId: number;
      type: number;
    }) => {
      return isV2
        ? await TaskV2Service.updateStatusKanbanV2(
            params.taskId,
            params.fromStatus,
            params.toStatus,
            params.frUserId,
            params.toUserId,
            params.type
          )
        : await TaskService.updateStatusKanban(
            params.taskId,
            params.fromStatus,
            params.toStatus,
            params.frUserId,
            params.toUserId,
            params.type
          );
    },
  });
};

export const useLoadTaskDashboardListOrg = () => {
  return useMutation({
    mutationFn: async (params: { orgIds: number[]; text?: string }) => {
      return await TaskService.getTaskDashboardListOrg(
        params.orgIds,
        params.text || ""
      );
    },
  });
};

export const useGetTaskStatisticDetail = (isV2: boolean = false) => {
  return useMutation({
    mutationFn: async (params: {
      orgId: number;
      startDate: string;
      endDate: string;
    }) => {
      return isV2
        ? await TaskV2Service.getTaskStatisticDetailV2(
            params.orgId,
            params.startDate,
            params.endDate
          )
        : await TaskService.getTaskStatisticDetail(
            params.orgId,
            params.startDate,
            params.endDate
          );
    },
  });
};
