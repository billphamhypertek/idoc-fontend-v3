"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  useLoadTaskDashboardListOrg,
  useLoadDashboardList,
  useListDashboard,
  useUpdateUserHandle,
} from "@/hooks/data/task-dashboard.data";
import { useGetOrgChildrenList } from "@/hooks/data/organization.data";
import { useGetAllUsersByOrgList } from "@/hooks/data/user.data";
import { DASHBOARD_COLORS } from "@/utils/color.utils";
import { TaskStatusColor } from "@/utils/color.utils";
import { TaskStatusLabel } from "@/utils/dashboard.utils";
import "@/styles/ListView.css";
import type {
  ListViewTask,
  ListViewOrg,
  ListViewEmployee,
  DashboardFilter,
  EmployeeFilter,
  ListViewProps,
} from "@/definitions/types/list-view.type";
import DashboardView from "./DashboardView";
import EmployeeView from "./EmployeeView";
import { handleError } from "@/utils/common.utils";
import LoadingFull from "@/components/common/LoadingFull";
import { ToastUtils } from "@/utils/toast.utils";

export default function ListView({
  isDashboard = false,
  selectedUsers,
  textSearch,
  idDonvi,
  callBackClickList,
  setIsDashboard,
}: ListViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const loadTaskDashboardListOrgMutation = useLoadTaskDashboardListOrg();
  const loadDashboardListMutation = useLoadDashboardList();
  const listDashboardMutation = useListDashboard();
  const updateUserHandleMutation = useUpdateUserHandle();
  const getOrgChildrenListMutation = useGetOrgChildrenList();
  const getAllUsersByOrgListMutation = useGetAllUsersByOrgList();

  const [loading, setLoading] = useState<boolean>(false);
  const [orgs, setOrgs] = useState<ListViewOrg[]>([]);
  const [employees, setEmployees] = useState<ListViewEmployee[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [selectedFilter, setSelectedFilter] = useState<DashboardFilter>(0);
  const [hoveredTask, setHoveredTask] = useState<ListViewTask | null>(null);

  const orgIds = useMemo(() => {
    if (!idDonvi) return [] as number[];
    if (Array.isArray(idDonvi)) {
      return idDonvi
        .filter((id) => id !== null && id !== undefined)
        .map((id) => Number(id));
    }
    return [Number(idDonvi)];
  }, [idDonvi]);

  const orgIdKey = useMemo(() => orgIds.join(","), [orgIds]);

  const selectedUserIds = useMemo(() => {
    if (!selectedUsers) return [] as number[];
    if (Array.isArray(selectedUsers)) {
      return selectedUsers
        .map((user) => Number(user?.id ?? user))
        .filter((id) => !Number.isNaN(id));
    }
    if (typeof selectedUsers === "object" && selectedUsers?.id) {
      const parsed = Number(selectedUsers.id);
      return Number.isNaN(parsed) ? [] : [parsed];
    }
    return [];
  }, [selectedUsers]);

  const selectedUserKey = useMemo(
    () => selectedUserIds.join(","),
    [selectedUserIds]
  );

  const normalizedSearchText = useMemo(
    () => (textSearch ?? "").toString(),
    [textSearch]
  );

  const mapTaskData = useCallback((task: any): ListViewTask => {
    return {
      ...task,
      taskId: Number(task.taskId),
      status: Number(task.status),
      executeId:
        task.executeId !== undefined && task.executeId !== null
          ? Number(task.executeId)
          : undefined,
      isEditingProcessor: false,
      selectedProcessor:
        task.executeId !== undefined && task.executeId !== null
          ? Number(task.executeId)
          : undefined,
      listUser: undefined,
    } as ListViewTask;
  }, []);

  const loadOrgsAndTasks = useCallback(
    async (targetOrgIds: number[]) => {
      if (!targetOrgIds || targetOrgIds.length === 0) {
        setOrgs([]);
        setSelectedDepartmentId(null);
        return;
      }

      try {
        const response = await loadTaskDashboardListOrgMutation.mutateAsync({
          orgIds: targetOrgIds,
          text: normalizedSearchText,
        });

        const mapped: ListViewOrg[] = (response || []).map((org: any) => ({
          handlerId: Number(org.handlerId),
          handlerName: org.handlerName,
          count: org.count ?? 0,
          level: org.level ?? 0,
          progress: org.progress ?? 0,
          columns: (org.columns || []).map((col: any) => ({
            status: Number(col.status),
            tasks: (col.tasks || []).map(mapTaskData),
          })),
        }));

        setOrgs(mapped);
        setSelectedDepartmentId((prev) => {
          if (prev && mapped.some((org) => org.handlerId === prev)) {
            return prev;
          }
          return mapped.length > 0 ? mapped[0].handlerId : null;
        });
      } catch (error) {
        handleError(error);
        setOrgs([]);
        setSelectedDepartmentId(null);
      }
    },
    [mapTaskData, normalizedSearchText]
  );

  const loadTasksByUser = useCallback(
    async (userIds: number[]) => {
      if (!userIds || userIds.length === 0) {
        setEmployees([]);
        return;
      }

      try {
        const response = await loadDashboardListMutation.mutateAsync({
          userIds: userIds.join(","),
          text: normalizedSearchText,
        });

        const mapped: ListViewEmployee[] = (response || []).map((emp: any) => ({
          ...emp,
          tasks: (emp.tasks || []).map(mapTaskData),
          expanded: false,
          filter: "all",
        }));

        setEmployees(mapped);
      } catch (error) {
        handleError(error);
        setEmployees([]);
      }
    },
    [mapTaskData, normalizedSearchText]
  );

  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();
      setLoading(true);
      try {
        // Nếu không có user được chọn, luôn hiển thị dashboard view
        if (selectedUserIds.length === 0) {
          if (!isDashboard) {
            setIsDashboard?.(true);
          }
          await loadOrgsAndTasks(orgIds);
        } else if (isDashboard) {
          // Nếu có user được chọn nhưng đang ở dashboard view, chuyển sang employee view
          setIsDashboard?.(false);
          await loadTasksByUser(selectedUserIds);
        } else {
          // Đang ở employee view và có user được chọn
          await loadTasksByUser(selectedUserIds);
        }
      } catch (error) {
        handleError(error);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1000; // 1 giây
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        if (remainingTime > 0) {
          setTimeout(() => {
            setLoading(false);
          }, remainingTime);
        } else {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [
    orgIdKey,
    selectedUserKey,
    normalizedSearchText,
    isDashboard,
    loadOrgsAndTasks,
    loadTasksByUser,
  ]);

  const selectedOrg = useMemo(() => {
    if (selectedDepartmentId == null) return null;
    return orgs.find((org) => org.handlerId === selectedDepartmentId) || null;
  }, [orgs, selectedDepartmentId]);

  const filteredTasks = useMemo(() => {
    if (!selectedOrg) return [] as ListViewTask[];
    const column = selectedOrg.columns?.find(
      (col) => Number(col.status) === selectedFilter
    );
    return column?.tasks || [];
  }, [selectedOrg, selectedFilter]);

  const getTaskCountByStatus = useCallback(
    (status: number): number => {
      if (!selectedOrg) return 0;
      const column = selectedOrg.columns?.find(
        (col) => Number(col.status) === Number(status)
      );
      return column?.tasks?.length || 0;
    },
    [selectedOrg]
  );

  const getStatusProcessText = useCallback((status: number): string => {
    if (status === 0) return "Đang xử lý";
    if (status === 1) return "Đã hoàn thành";
    return "Quá hạn";
  }, []);

  const getStatusColorDashboard = useCallback((status: number): string => {
    if (status === 0) return DASHBOARD_COLORS.statusInProgress;
    if (status === 1) return DASHBOARD_COLORS.statusCompleted;
    return DASHBOARD_COLORS.statusNew;
  }, []);

  const getStatusText = useCallback((status: number): string => {
    return TaskStatusLabel[status] || "Không xác định";
  }, []);

  const getStatusColor = useCallback((status: number): string => {
    return TaskStatusColor[status] || "#9ca3af";
  }, []);

  const isFilterActiveDashboard = useCallback(
    (status: DashboardFilter) => selectedFilter === status,
    [selectedFilter]
  );

  const handleFilterTasksDashboard = useCallback((filter: DashboardFilter) => {
    setSelectedFilter(filter);
  }, []);

  const handleViewTaskDetail = useCallback(
    (taskId: number) => {
      router.push(`/task/search/detail/${taskId}`);
    },
    [router]
  );

  const handleToggleEmployeeExpanded = useCallback(
    (handlerId: number | string) => {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.handlerId === handlerId
            ? { ...emp, expanded: !emp.expanded }
            : emp
        )
      );
    },
    []
  );

  const handleFilterTasks = useCallback(
    (filter: EmployeeFilter, handlerId: number | string) => {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.handlerId === handlerId
            ? { ...emp, filter, expanded: false }
            : emp
        )
      );
    },
    []
  );

  const getVisibleTasks = useCallback(
    (employee: ListViewEmployee): ListViewTask[] => {
      const tasks = employee.tasks || [];
      const filter = employee.filter || "all";

      let filtered: ListViewTask[] = [];
      if (filter === "all") {
        filtered = tasks;
      } else if (filter === "overdue") {
        filtered = tasks.filter((task) => !!task.overdue);
      } else {
        filtered = tasks.filter((task) => !task.overdue);
      }

      return employee.expanded ? filtered : filtered.slice(0, 4);
    },
    []
  );

  const shouldShowMoreCard = useCallback(
    (employee: ListViewEmployee): boolean => {
      const tasks = employee.tasks || [];
      const filter = employee.filter || "all";

      let filtered: ListViewTask[] = [];
      if (filter === "all") {
        filtered = tasks;
      } else if (filter === "overdue") {
        filtered = tasks.filter((task) => !!task.overdue);
      } else {
        filtered = tasks.filter((task) => !task.overdue);
      }

      return filtered.length > 4;
    },
    []
  );

  const getRemainingCount = useCallback(
    (employee: ListViewEmployee): number => {
      if (employee.expanded) return 0;

      const tasks = employee.tasks || [];
      const filter = employee.filter || "all";

      let filtered: ListViewTask[] = [];
      if (filter === "all") {
        filtered = tasks;
      } else if (filter === "overdue") {
        filtered = tasks.filter((task) => !!task.overdue);
      } else {
        filtered = tasks.filter((task) => !task.overdue);
      }

      return filtered.length > 4 ? filtered.length - 4 : 0;
    },
    []
  );

  const updateTaskInOrgs = useCallback(
    (
      orgId: number,
      status: number,
      taskId: number,
      updater: (task: ListViewTask) => ListViewTask
    ) => {
      setOrgs((prev) =>
        prev.map((org) => {
          if (org.handlerId !== orgId) return org;
          return {
            ...org,
            columns: org.columns.map((col) => {
              if (Number(col.status) !== Number(status)) return col;
              return {
                ...col,
                tasks: col.tasks.map((task) =>
                  Number(task.taskId) === Number(taskId) ? updater(task) : task
                ),
              };
            }),
          };
        })
      );
    },
    []
  );

  const handleLoadUserXlc = useCallback(
    async (orgId: number, status: number, taskId: number) => {
      try {
        const users = await listDashboardMutation.mutateAsync({
          taskId,
        });

        if (!users || users.length === 0) {
          ToastUtils.error(
            "Không có người phù hợp để thay đổi người xử lý chính"
          );
          return;
        }

        updateTaskInOrgs(orgId, status, taskId, (task) => ({
          ...task,
          isEditingProcessor: true,
          listUser: users,
          selectedProcessor: task.executeId,
        }));
      } catch (error) {
        ToastUtils.error("Không thể tải danh sách người xử lý");
      }
    },
    [updateTaskInOrgs, listDashboardMutation]
  );

  const handleProcessorBlur = useCallback(
    (orgId: number, status: number, taskId: number) => {
      setTimeout(() => {
        updateTaskInOrgs(orgId, status, taskId, (task) => ({
          ...task,
          isEditingProcessor: false,
          listUser: undefined,
        }));
      }, 150);
    },
    [updateTaskInOrgs]
  );

  const handleUpdateProcessor = useCallback(
    async (
      orgId: number,
      status: number,
      taskId: number,
      newUserId: number
    ) => {
      const currentOrg = orgs.find((org) => org.handlerId === orgId);
      const column = currentOrg?.columns.find(
        (col) => Number(col.status) === Number(status)
      );
      const currentTask = column?.tasks.find(
        (task) => Number(task.taskId) === Number(taskId)
      );

      if (!currentTask) {
        return;
      }

      updateTaskInOrgs(orgId, status, taskId, (task) => ({
        ...task,
        selectedProcessor: newUserId,
      }));

      try {
        const result = await updateUserHandleMutation.mutateAsync({
          taskId,
          newUserId,
          userId: currentTask.executeId || 0,
        });

        if (result) {
          const selectedUser = currentTask.listUser?.find(
            (user) => Number(user.id) === Number(newUserId)
          );

          updateTaskInOrgs(orgId, status, taskId, (task) => ({
            ...task,
            execute: selectedUser?.fullName || task.execute,
            executeId: newUserId,
            isEditingProcessor: false,
            listUser: undefined,
          }));

          setEmployees((prev) =>
            prev.map((emp) => ({
              ...emp,
              tasks: (emp.tasks || []).map((task) =>
                Number(task.taskId) === Number(taskId)
                  ? {
                      ...task,
                      execute: selectedUser?.fullName || task.execute,
                      executeId: newUserId,
                    }
                  : task
              ),
            }))
          );

          ToastUtils.success("Đổi người xử lý chính thành công");
        }
      } catch (error) {
        ToastUtils.error("Không thể cập nhật người xử lý");
      } finally {
        updateTaskInOrgs(orgId, status, taskId, (task) => ({
          ...task,
          isEditingProcessor: false,
          listUser: undefined,
        }));
      }
    },
    [orgs, updateTaskInOrgs, updateUserHandleMutation]
  );

  const handleSelectProcessor = useCallback(
    (
      orgId: number,
      status: number,
      taskId: number,
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const value = Number(event.target.value);
      if (Number.isNaN(value)) return;
      handleUpdateProcessor(orgId, status, taskId, value);
    },
    [handleUpdateProcessor]
  );

  const handleLoadDetail = useCallback(
    async (orgId: number) => {
      try {
        const data = await getOrgChildrenListMutation.mutateAsync({ orgId });
        return data || [];
      } catch (error) {
        handleError(error);
        return [];
      }
    },
    [getOrgChildrenListMutation]
  );

  const handleViewTaskByOrg = useCallback(
    async (org: ListViewOrg) => {
      if (!callBackClickList) return;

      const selectOrg = { id: org.handlerId, name: org.handlerName };

      if (org.level === 0) {
        const data = await handleLoadDetail(org.handlerId);
        callBackClickList(0, data);
      } else if (org.level === 1) {
        const data = await handleLoadDetail(org.handlerId);
        callBackClickList(1, data, selectOrg);
      } else if (org.level === 2) {
        try {
          const data = await getAllUsersByOrgListMutation.mutateAsync({
            orgId: org.handlerId,
          });
          callBackClickList(2, data || [], selectOrg);
        } catch (error) {
          handleError(error);
          callBackClickList(2, [], selectOrg);
        }
      }
    },
    [callBackClickList, handleLoadDetail, getAllUsersByOrgListMutation]
  );

  return (
    <div className="list-view-wrapper">
      {isDashboard && (
        <DashboardView
          loading={loading}
          orgs={orgs}
          selectedOrg={selectedOrg}
          selectedDepartmentId={selectedDepartmentId}
          selectedFilter={selectedFilter}
          filteredTasks={filteredTasks}
          hoveredTask={hoveredTask}
          setSelectedDepartmentId={setSelectedDepartmentId}
          setHoveredTask={setHoveredTask}
          handleViewTaskByOrg={handleViewTaskByOrg}
          handleViewTaskDetail={handleViewTaskDetail}
          handleFilterTasksDashboard={handleFilterTasksDashboard}
          handleLoadUserXlc={handleLoadUserXlc}
          handleSelectProcessor={handleSelectProcessor}
          handleProcessorBlur={handleProcessorBlur}
          getTaskCountByStatus={getTaskCountByStatus}
          getStatusProcessText={getStatusProcessText}
          getStatusColorDashboard={getStatusColorDashboard}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
          isFilterActiveDashboard={isFilterActiveDashboard}
        />
      )}

      {!isDashboard && (
        <EmployeeView
          loading={loading}
          employees={employees}
          getVisibleTasks={getVisibleTasks}
          shouldShowMoreCard={shouldShowMoreCard}
          getRemainingCount={getRemainingCount}
          handleViewTaskDetail={handleViewTaskDetail}
          handleFilterTasks={handleFilterTasks}
          handleToggleEmployeeExpanded={handleToggleEmployeeExpanded}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
        />
      )}
      <LoadingFull isLoading={loading} />
    </div>
  );
}
