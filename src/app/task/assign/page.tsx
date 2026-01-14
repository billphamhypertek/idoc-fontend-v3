"use client";
import { usePathname, useRouter } from "next/navigation";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import useAuthStore from "@/stores/auth.store";
import { Column, queryKeys } from "@/definitions";
import {
  FollowerTask,
  OrgNode,
  TaskAssign,
} from "@/definitions/types/task-assign.type";
import {
  ArchiveRestore,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Forward,
  List,
  Network,
  Pencil,
  Recycle,
  RotateCcw,
  Search,
  Share2,
  Star,
  Trash2,
  Undo2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAcceptTask,
  useCloseTask,
  useDeleteTask,
  useFollowerTask,
  useRejectTask,
  useRestoreTask,
  useRevokeTask,
  useTaskAssignQuery,
  useToggleImportant,
} from "@/hooks/data/task.data";
import {
  countDateUntilNow,
  formatDate,
  formatDateYMD,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Input } from "@/components/ui/input";
import { Constant } from "@/definitions/constants/constant";
import { CategoryCode } from "@/definitions/types/category.type";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SelectCustom from "@/components/common/SelectCustom";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import WorkflowDialog from "@/components/dialogs/WorkflowDialog";
import ChildWorkflowDialog from "@/components/dialogs/ChildWorkflowDialog";
import { MarkerType } from "reactflow";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmWithFileDialog from "@/components/common/ConfirmWithFileDialog";
import { SharedFileData } from "@/definitions/types/document-out.type";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { uploadFileService } from "@/services/file.service";
import { TaskService } from "@/services/task.service";
import { notificationService } from "@/services/notification.service";
import { handleError } from "@/utils/common.utils";
import FollowerDialog from "@/components/dialogs/FollowerDialog";
import WorkAssignDialog from "@/components/work-assign/createDialog";
import { Task } from "@/definitions/interfaces/task.interface";
import { Bpmn2Service } from "@/services/bpmn2.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TaskTransferModal from "@/components/task/TaskTransferModal";
import {
  WorkflowData,
  WorkflowEdge,
  WorkflowNode,
} from "@/definitions/types/workflow.type";
import { CustomDatePicker } from "@/components/ui/calendar";
import { ListChildDialog } from "@/components/dialogs/ListChildDialog";
import { useTaskAssignQueryV2 } from "@/hooks/data/taskv2.data";
import { TaskV2Service } from "@/services/taskv2.service";
import { buildWorkflowTree, TrackingItem } from "@/utils/workflow.utils";

const tabs = {
  CHO_XU_LY: "pending",
  HOAN_THANH: "completed",
} as const;

const defaultSearchState = {
  taskName: "",
  priorityId: "",
  orgId: "",
  startDate: "",
  endDate: "",
};

interface Node {
  id: number;
  name: string;
}

type SearchState = typeof defaultSearchState;

type ConfigModalConfirm = {
  TASK_DONE: {
    title: string;
    label: { input: string; button_confirm: string };
    has_upload_file: boolean;
    has_encrypt: boolean;
    max_file_size: number;
  };
  TASK_REFUSE: {
    title: string;
    label: { input: string; button_confirm: string };
    has_upload_file: boolean;
    has_encrypt: boolean;
    max_file_size: number;
  };
};

export default function ListAssignPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPending, setTotalPending] = useState<number>(0);
  const [totalComplete, setTotalComplete] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>(tabs.CHO_XU_LY);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [status, setStatus] = useState<boolean>(false);
  const [currentSelectedItem, setCurrentSelectedItem] = useState<
    TaskAssign | undefined
  >();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [confirmAcceptTask, setConfirmAcceptTask] = useState<boolean>(false);
  const [confirmCloseTask, setConfirmCloseTask] = useState<boolean>(false);
  const [confirmRejectTask, setConfirmRejectTask] = useState<boolean>(false);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<boolean>(false);
  const [confirmRevokeTask, setConfirmRevokeTask] = useState<boolean>(false);
  const [confirmRestoreTask, setConfirmRestoreTask] = useState<boolean>(false);
  const [confirmCompleteTask, setConfirmCompleteTask] =
    useState<boolean>(false);
  const [workflowDialog, setWorkflowDialog] = useState<boolean>(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(
    null
  );
  const [workflowItem, setWorkflowItem] = useState<{ workName: string }>({
    workName: "",
  });
  const [childWorkflowDialog, setChildWorkflowDialog] =
    useState<boolean>(false);
  const [selectedChildTaskId, setSelectedChildTaskId] = useState<number | null>(
    null
  );

  const [nodes, setNodes] = useState<Node[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskAssign | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCanAddTransfer, setShowCanAddTransfer] = useState(false);
  const [isNodesPopoverOpen, setIsNodesPopoverOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [workItem, setWorkItem] = useState<{
    workName: string;
    id: string | number;
  }>({ workName: "", id: "" });
  const [followerDialog, setFollowerDialog] = useState<boolean>(false);
  const [userFollows, setUserFollows] = useState<any[]>([]);

  // New state for WorkAssignDialog modal
  const [workAssignDialog, setWorkAssignDialog] = useState<boolean>(false);
  const [workAssignItem, setWorkAssignItem] = useState<{
    id: string | number;
    workName: string;
  }>({ id: "", workName: "" });

  const [isOpenListChild, setIsOpenListChild] = useState<boolean>(false);
  const [listChildData, setListChildData] = useState<TaskAssign[]>([]);

  const [searchParams, setSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [tempSearchParams, setTempSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [sortBy, setSortBy] = useState<string>("");
  const [direction, setDirection] = useState<string>("DESC");

  // Key để lưu state vào sessionStorage
  const STORAGE_KEY = "task_assign_search_state";
  const hasRestoredState = useRef<boolean>(false);
  const { data: workTypeCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.PRIORITY
  );
  const [taskPriority, setTaskPriority] = useState<CategoryCode[]>([]);
  const [taskAssignRequestsData, setTaskAssignRequestsData] = useState<
    TaskAssign[]
  >([]);
  const [listDeadlineWarning] = useState<
    {
      id: number;
      name: string;
      numberOfDays: number;
      color: string;
      dayLeft: number;
    }[]
  >([
    {
      id: 2,
      name: "Hạn xử lý không quá 3 ngày",
      numberOfDays: 3,
      color: "blue",
      dayLeft: 0,
    },
    {
      id: 4,
      name: "Hạn xử lý hơn 3 ngày",
      numberOfDays: 100000,
      color: "black",
      dayLeft: 3,
    },
    { id: 3, name: "Quá hạn", numberOfDays: 0, color: "red", dayLeft: -1 },
  ]);
  const configModalConfirm: ConfigModalConfirm = {
    TASK_DONE: {
      title: "Hoàn thành",
      label: { input: "Ý kiến xử lý", button_confirm: "Hoàn thành" },
      has_upload_file: true,
      has_encrypt: true,
      max_file_size: 300,
    },
    TASK_REFUSE: {
      title: "Từ chối",
      label: { input: "Lí do từ chối", button_confirm: "Xác nhận" },
      has_upload_file: true,
      has_encrypt: false,
      max_file_size: 300,
    },
  };
  const isUserReady = !!user?.id;
  const advanceParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      direction,
      sortBy,
      status: status,
      userId: user?.id,
      taskName: searchParams.taskName,
      priority: searchParams.priorityId !== "0" ? searchParams.priorityId : "",
      orgId: searchParams.orgId,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      dayLeft: "",
    }),
    [searchParams, status, user, currentPage, itemsPerPage, sortBy, direction]
  );

  const pathname = usePathname();
  const isV2 = useMemo(() => pathname?.includes("task-v2"), [pathname]);

  const { mutate: doAcceptTaskAction } = useAcceptTask(isV2 ?? false);
  const { mutate: doCloseTaskAction } = useCloseTask(isV2 ?? false);
  const { mutate: doRejectTaskAction } = useRejectTask(isV2 ?? false);
  const { mutate: doRevokeTaskAction } = useRevokeTask(isV2 ?? false);
  const { mutate: doDeleteTaskAction } = useDeleteTask(isV2 ?? false);
  const { mutate: doRestoreTaskAction } = useRestoreTask(isV2 ?? false);
  const { mutate: doFollowerTaskAction } = useFollowerTask(isV2 ?? false);

  const {
    data: currentData,
    isLoading,
    error,
    refetch,
  } = useTaskAssignQuery(advanceParams, isUserReady && !isV2);

  const {
    data: currentDataV2,
    isLoading: isLoadingV2,
    error: errorV2,
    refetch: refetchV2,
  } = useTaskAssignQueryV2(advanceParams, isUserReady && (isV2 ?? false));

  const currentDataMerged = isV2 ? currentDataV2 : currentData;
  const isLoadingMerged = isV2 ? isLoadingV2 : isLoading;
  const errorMerged = isV2 ? errorV2 : error;
  const refetchMerged = isV2 ? refetchV2 : refetch;

  useEffect(() => {
    if (workTypeCategoryData) setTaskPriority(workTypeCategoryData);
  }, [workTypeCategoryData]);

  // Restore state từ sessionStorage khi component mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);

        // Đánh dấu đã restore TRƯỚC khi restore activeTab để tránh reset page
        hasRestoredState.current = true;

        // Restore tất cả state cùng lúc
        if (state.currentPage) setCurrentPage(state.currentPage);
        if (state.itemsPerPage) setItemsPerPage(state.itemsPerPage);
        if (state.searchParams) {
          setSearchParams(state.searchParams);
          setTempSearchParams(state.searchParams); // Đồng bộ tempSearchParams
        }
        if (state.sortBy !== undefined) setSortBy(state.sortBy);
        if (state.direction !== undefined) setDirection(state.direction);
        if (state.status !== undefined) setStatus(state.status);
        if (state.activeTab) setActiveTab(state.activeTab);

        // Xóa state đã lưu sau khi restore
        sessionStorage.removeItem(STORAGE_KEY);

        // Reset flag sau khi restore xong để các lần thay đổi search sau vẫn reset page
        setTimeout(() => {
          hasRestoredState.current = false;
        }, 100);
      }
    } catch (error) {
      handleError(error);
    }
  }, []);

  const totalItems: number = currentDataMerged?.totalRecord || 0;

  useEffect(() => {
    const temp = currentDataMerged?.objList || [];
    setTaskAssignRequestsData(temp);
  }, [currentDataMerged]);

  useEffect(() => {
    if (activeTab === "pending") {
      const size = taskAssignRequestsData.filter(
        (item: TaskAssign) =>
          item.statusName !== "Hoàn thành" &&
          item.statusName !== "Đóng" &&
          item.statusName !== "Bị thu hồi"
      ).length;
      setTotalPending(size);
    } else {
      const size = taskAssignRequestsData.filter(
        (item: TaskAssign) =>
          item.statusName === "Hoàn thành" ||
          item.statusName === "Đóng" ||
          item.statusName === "Bị thu hồi"
      ).length;
      setTotalComplete(size);
    }
  }, [activeTab, taskAssignRequestsData]);

  const { mutate: toggleImportant } = useToggleImportant(isV2 ?? false);
  const setImportant = async (r: TaskAssign) => {
    try {
      await toggleImportant(Number(r.id));
      refetchMerged();
    } catch (error) {
      handleError(error);
    }
  };

  const handleTabChange = (tab: string) => {
    setCurrentPage(1);
    setActiveTab(tab);
    if (tabs.CHO_XU_LY === tab) {
      setStatus(false);
    } else {
      setStatus(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchSubmit = () => {
    // Chỉ reset page nếu không phải đang restore từ sessionStorage
    if (!hasRestoredState.current) {
      setCurrentPage(1);
    }
    setSearchParams((prev) => ({
      ...prev,
      ...tempSearchParams,
    }));
  };

  const handleSearchReset = () => {
    setSearchParams(defaultSearchState);
    setTempSearchParams(defaultSearchState);
    setSortBy("");
    setDirection("DESC");
  };

  const handleSort = (
    sortConfig: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (sortConfig) {
      setSortBy(sortConfig.key);
      setDirection(sortConfig.direction === "asc" ? "ASC" : "DESC");
      setCurrentPage(1);
    } else {
      setSortBy("");
      setDirection("DESC");
      setCurrentPage(1);
    }
  };

  const getClassTaskName = (item: TaskAssign) => {
    return getClassTextDeadline(item.endDate);
  };

  const getClassTextDeadline = (timestamp: number) => {
    const days = countDateUntilNow(timestamp);
    if (days < 0) {
      return "text-red-600";
    }
    if (days >= 0 && days <= 3) {
      return "text-blue-600";
    }
    return "";
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <div />;
    }
    const statusConfig = {
      "Đang thực hiện": {
        variant: "outline" as const,
        className: "text-orange-600 border-orange-200 bg-orange-50",
      },
      "Hoàn thành": {
        variant: "outline" as const,
        className: "text-green-600 border-green-200 bg-green-50",
      },
      "Hoàn thành (Chờ đánh giá)": {
        variant: "outline" as const,
        className: "text-green-600 border-green-200 bg-green-50",
      },
      "Chờ tiếp nhận": {
        variant: "outline" as const,
        className: "text-blue-600 border-blue-200 bg-blue-50",
      },
      "Mới tới": {
        variant: "outline" as const,
        className: "text-blue-600 border-blue-200 bg-blue-50",
      },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
      return (
        <Badge
          variant="outline"
          className="text-xs font-medium text-gray-600 border-gray-200 bg-gray-50"
        >
          {status}
        </Badge>
      );
    }

    return (
      <Badge
        variant={config.variant}
        className={`text-xs font-medium ${config.className}`}
      >
        {status}
      </Badge>
    );
  };

  const openConfirmAcceptTaskDialog = () => {
    setConfirmAcceptTask(true);
  };

  const checkNavigateDetail = (item: TaskAssign) => {
    if (item?.id !== undefined && item?.id !== null) {
      if (isV2) {
        router.push(`/task-v2/assign/detail/${item.id}`);
      } else {
        router.push(`/task/assign/detail/${item.id}`);
      }
    }
  };

  const doAcceptTask = () => {
    const payload = {
      taskId: currentSelectedItem?.id,
      isExcute: false,
      status: 1 as number,
    };
    doAcceptTaskAction(
      {
        ...payload,
        taskId: currentSelectedItem?.id ?? "",
      },
      {
        onSuccess: () => {
          ToastUtils.taskAcceptSuccess();
          setCurrentSelectedItem(undefined);
          setConfirmAcceptTask(false);
          notificationService.countUnreadNotification();
          refetchMerged();
        },
        onError: () => {
          ToastUtils.taskAcceptError();
        },
      }
    );
  };

  const openConfirmCloseTaskDialog = () => {
    setConfirmCloseTask(true);
  };

  const doCloseTask = () => {
    const payload = {
      taskId: currentSelectedItem?.id,
      isExcute: true,
      status: 4,
    };
    doCloseTaskAction(
      {
        ...payload,
        taskId: currentSelectedItem?.id ?? "",
      },
      {
        onSuccess: () => {
          ToastUtils.taskCloseSuccess();
          setCurrentSelectedItem(undefined);
          setConfirmCloseTask(false);
          notificationService.countUnreadNotification();
          refetchMerged();
        },
        onError: () => {
          ToastUtils.taskCloseError();
        },
      }
    );
  };

  const openConfirmRejectTaskDialog = () => {
    setConfirmRejectTask(true);
  };

  const doRejectTask = () => {
    const payload = {
      isExcute: true,
      status: 2,
      taskId: currentSelectedItem?.id ?? "",
    };
    doRejectTaskAction(payload, {
      onSuccess: () => {
        ToastUtils.taskRejectSuccess();
        setCurrentSelectedItem(undefined);
        setConfirmRejectTask(false);
        notificationService.countUnreadNotification();
        refetchMerged();
      },
      onError: () => {
        ToastUtils.taskRejectError();
      },
    });
  };

  const openConfirmRevokeTaskDialog = () => {
    setConfirmRevokeTask(true);
  };

  const doRevokeTask = () => {
    const payload = {
      isExcute: true,
      status: 5,
      taskId: currentSelectedItem?.id ?? "",
    };
    doRevokeTaskAction(payload, {
      onSuccess: () => {
        ToastUtils.taskRevokeSuccess();
        setCurrentSelectedItem(undefined);
        setConfirmRevokeTask(false);
        notificationService.countUnreadNotification();
        refetchMerged();
      },
      onError: () => {
        ToastUtils.taskRevokeError();
      },
    });
  };

  const openConfirmDeleteTaskDialog = () => {
    setConfirmDeleteTask(true);
  };

  const doDeleteTask = () => {
    doDeleteTaskAction(currentSelectedItem?.id ?? "", {
      onSuccess: () => {
        ToastUtils.taskDeleteSuccess();
        setCurrentSelectedItem(undefined);
        setConfirmDeleteTask(false);
        notificationService.countUnreadNotification();
        refetchMerged();
      },
      onError: () => {
        ToastUtils.taskDeleteError();
      },
    });
  };

  const openConfirmRestoreTaskDialog = () => {
    setConfirmRestoreTask(true);
  };

  const doRestoreTask = () => {
    const payload = {
      taskId: currentSelectedItem?.id,
      isExcute: true,
      status: 0,
    };
    doRestoreTaskAction(
      {
        ...payload,
        taskId: payload.taskId ?? "",
        status: payload.status ?? 0,
      },
      {
        onSuccess: () => {
          ToastUtils.taskRestoreSuccess();
          setCurrentSelectedItem(undefined);
          setConfirmRestoreTask(false);
          notificationService.countUnreadNotification();
          refetchMerged();
        },
        onError: () => {
          ToastUtils.taskRestoreError();
        },
      }
    );
  };

  const openConfirmCompleteTaskDialog = () => {
    setConfirmCompleteTask(true);
  };

  const setSharedFileData = (
    taskId: number | string | undefined,
    reason: string,
    selectedFiles: any[]
  ): SharedFileData => ({
    objId: Number(taskId),
    files: selectedFiles,
    comment: reason,
    userIdShared: [],
    allFileNames: [],
    attType: CERT_OBJ_TYPE.task,
    cmtType: "GIAO_VIEC_BINH_LUAN",
    objType: CERT_OBJ_TYPE.task,
    userOrobj: CERT_OBJ_TYPE.org,
    checkObjEnc: false,
  });

  const doCompleteTask = async (reason: string, selectedFiles: any[]) => {
    const taskId = currentSelectedItem?.id;
    const data = setSharedFileData(taskId, reason, selectedFiles);
    const encryptFile = data.files
      ? data.files.filter((i: any) => i.encrypt)
      : [];
    if (encryptFile === undefined || encryptFile.length === 0) {
      await uploadFileService.saveCmtAndAtmByNonEnc(data);
    }
    const response = await uploadFileService.doSharePermissionDocFile(data);
    if (response === false) {
      return response;
    }

    if (typeof taskId === "undefined") {
      throw new Error("Task ID is undefined");
    }

    const updater = isV2
      ? TaskV2Service.updateStatusV2
      : TaskService.updateStatus;

    try {
      await updater(taskId, true, 3, reason, selectedFiles);
      notificationService.countUnreadNotification();
      if (isV2) {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.taskv2.assign, advanceParams],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.task.assign, advanceParams],
        });
      }

      ToastUtils.taskCompleteSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  const openWorkFlowDialog = (item: TaskAssign) => {
    const tracking = (item.tracking || []) as TrackingItem[];

    const workflowData = buildWorkflowTree(tracking);

    if (!workflowData) {
      return;
    }

    setSelectedWorkflow(workflowData);
    setWorkflowItem({
      workName: item.taskName ?? "",
    });
    setWorkflowDialog(true);
  };

  const openFollowerDialog = (item: TaskAssign) => {
    setWorkItem({
      id: item.id,
      workName: item.taskName ?? "",
    });
    setUserFollows(item.userFollows == null ? [] : item.userFollows);
    setFollowerDialog(true);
  };

  const openListViewFollowDialog = (item: TaskAssign) => {
    if (item.id) {
      setSelectedChildTaskId(Number(item.id));
      setChildWorkflowDialog(true);
    }
  };

  // New: openWorkAssignDialog function
  const openWorkAssignDialog = (item: TaskAssign) => {
    setWorkAssignItem({
      id: item.id,
      workName: item.taskName ?? "",
    });
    setWorkAssignDialog(true);
  };

  const doFollowerTask = (followers: OrgNode[]) => {
    if (!followers || followers.length === 0) {
      return;
    }
    const payload: FollowerTask[] = followers.map(
      (item: OrgNode): FollowerTask => ({
        id: Number(item.id),
        fullName: item.name,
        positionName: item.positionName,
        orgName: item.orgName,
      })
    );

    const taskId = currentSelectedItem?.id;
    if (!taskId) {
      return;
    }

    doFollowerTaskAction(
      { id: taskId, payload: payload },
      {
        onSuccess: () => {
          ToastUtils.taskFollowerSuccess();
          setCurrentSelectedItem(undefined);
          setFollowerDialog(false);
          notificationService.countUnreadNotification();
          refetchMerged();
        },
        onError: (err: Error) => {
          ToastUtils.taskFollowerError();
        },
      }
    );
  };

  const flattenTasks = (
    tasks: TaskAssign[],
    expandedIds: string[],
    level: number = 0
  ): TaskAssign[] => {
    if (!tasks || !Array.isArray(tasks)) {
      return [];
    }

    return tasks.flatMap((task) => {
      if (!task) {
        return [];
      }

      // Ensure task has level property
      const taskWithLevel: TaskAssign = { ...task, level };

      const flattened: TaskAssign[] = [taskWithLevel];

      if (expandedIds.includes(String(task.id)) && task.subTasks?.length) {
        try {
          // Map SubTask to TaskAssign format, preserving all properties including subTasks
          const subTasksAsTaskAssign: TaskAssign[] = task.subTasks
            .filter((subTask) => subTask != null)
            .map((subTask) => {
              // Spread all properties and add level, subTasks will be preserved from spread
              return {
                ...subTask,
                level: level + 1,
              } as TaskAssign;
            });
          const children = flattenTasks(
            subTasksAsTaskAssign,
            expandedIds,
            level + 1
          );
          flattened.push(...children);
        } catch (error) {
          handleError(error);
        }
      }

      return flattened;
    });
  };

  const loadNodes = async (task: TaskAssign, type: boolean) => {
    try {
      setSelectedTask(task);
      setShowCanAddTransfer(type);
      const response = await (isV2
        ? TaskV2Service.findById(task.id)
        : TaskService.findById(task.id));

      let data;

      if (!response.nodeId) {
        data = await Bpmn2Service.getStartNode(Constant.THREAD_TYPE.ASSIGN);
      } else {
        data = await Bpmn2Service.getNextNodes(response.nodeId);
      }

      setNodes(data as Node[]);
      setIsNodesPopoverOpen(true);
    } catch (error) {
      handleError(error);
    }
  };

  const openTransferModal = (task: TaskAssign, node: Node) => {
    setSelectedTask(task);
    setSelectedNode(node);
    setIsTransferModalOpen(true);
    setIsNodesPopoverOpen(false);
  };

  const assignColumns: Column<TaskAssign>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-4",
      sortable: false,
      accessor: (_item: TaskAssign, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <div className="w-8 h-9 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded">
            <Star className={cn("w-4 h-4", "text-gray-400")} />
          </div>
        </div>
      ),
      className: "py-1 w-4",
      sortKey: "IMPORTANT",
      accessor: (item: TaskAssign) => (
        <div className="flex justify-center items-center py-1">
          <div
            className="w-8 h-9 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              setImportant(item);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={() => {}}
          >
            <Star
              className={cn(
                "w-4 h-4",
                item.important
                  ? "fill-yellow-400 text-yellow-400 stroke-yellow-600 stroke-2"
                  : "text-gray-400"
              )}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Tên công việc",
      className: "py-2 w-44",
      sortKey: "NAME",
      accessor: (item: TaskAssign) => {
        return <div className={getClassTaskName(item)}>{item.taskName}</div>;
      },
    },
    {
      header: "Ngày bắt đầu",
      className: "text-center py-2 w-24",
      sortKey: "START_DATE",
      accessor: (item: TaskAssign) => <div>{formatDate(item.startDate)}</div>,
    },
    {
      header: "Ngày kết thúc",
      className: "text-center py-2 w-24",
      sortKey: "END_DATE",
      accessor: (item: TaskAssign) => (
        <div className={getClassTextDeadline(item.endDate)}>
          {formatDate(item.endDate)}
        </div>
      ),
    },
    {
      header: "Người giao việc",
      className: "text-center py-2 w-24",
      sortable: false,
      accessor: (item: TaskAssign) => <div>{item.userAssignName}</div>,
    },
    {
      header: "Nhóm công việc",
      className: "text-center py-2 w-24",
      sortKey: "IMPORTANT",
      accessor: (item: TaskAssign) => <div>{item.priorityName}</div>,
    },
    {
      header: "Trạng thái",
      className: "text-center py-2 w-24",
      sortable: false,
      accessor: (item: TaskAssign) => getStatusBadge(item.statusName),
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "text-center py-2 w-24",
      sortable: false,
      renderActions: (item: TaskAssign) => (
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {item.button?.canAddTransfer === "ENABLE" && (
            <Popover
              open={isNodesPopoverOpen && selectedTask?.id === item.id}
              onOpenChange={(open) => {
                if (!open) {
                  setIsNodesPopoverOpen(false);
                  setSelectedTask(null);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  title="Bổ sung xử lý"
                  onClick={() => loadNodes(item, true)}
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-green-100 rounded transition-colors"
                >
                  <Recycle className="w-4 h-4 text-green-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      onClick={() => openTransferModal(item, node)}
                    >
                      {node.name || "Chưa đặt tên"}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {item.button?.canClose === "ENABLE" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                setCurrentSelectedItem(item);
                openConfirmCloseTaskDialog();
              }}
              title="Đóng việc"
            >
              <FileCheck className="w-4 h-4 text-blue-600" />
            </Button>
          )}
          {(!isV2 && item.button?.canReject === "ENABLE") ||
            (isV2 && item.button?.canRejectApprove === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-red-100 rounded transition-colors"
                onClick={() => {
                  setCurrentSelectedItem(item);
                  openConfirmRejectTaskDialog();
                }}
                title="Từ chối"
              >
                <XCircle className="w-4 h-4 text-red-600" />
              </Button>
            ))}
          {item.button?.canRevoke === "ENABLE" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                setCurrentSelectedItem(item);
                openConfirmRevokeTaskDialog();
              }}
              title="Thu hồi"
            >
              <Undo2 className="w-4 h-4 text-blue-600" />
            </Button>
          )}
          {item.button?.canTransfer === "ENABLE" && (
            <Popover
              open={isNodesPopoverOpen && selectedTask?.id === item.id}
              onOpenChange={(open) => {
                if (!open) {
                  setIsNodesPopoverOpen(false);
                  setSelectedTask(null);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  title="Chuyển xử lý"
                  onClick={() => loadNodes(item, false)}
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                >
                  <Forward className="w-4 h-4 text-blue-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      onClick={() => openTransferModal(item, node)}
                    >
                      {node.name || "Chưa đặt tên"}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {item.button?.canDone === "ENABLE" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-green-100 rounded transition-colors"
              onClick={() => {
                setCurrentSelectedItem(item);
                openConfirmCompleteTaskDialog();
              }}
              title="Hoàn thành"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
            </Button>
          )}
          {item.button?.canEdit === "ENABLE" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                checkNavigateDetail(item);
              }}
              title="Sửa"
            >
              <Pencil className="w-4 h-4 text-blue-600" />
            </Button>
          )}
          {item.button?.canDelete === "ENABLE" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-red-100 rounded transition-colors"
              onClick={() => {
                setCurrentSelectedItem(item);
                openConfirmDeleteTaskDialog();
              }}
              title="Xóa"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          )}
          {item.button?.canRestore === "ENABLE" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                setCurrentSelectedItem(item);
                openConfirmRestoreTaskDialog();
              }}
              title="Khôi phục"
            >
              <ArchiveRestore className="w-4 h-4 text-blue-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            onClick={() => {
              setCurrentSelectedItem(item);
              openFollowerDialog(item);
            }}
            title="Người theo dõi"
          >
            <User className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            onClick={() => openWorkFlowDialog(item)}
            title="Sơ đồ giao việc"
          >
            <Network className="w-4 h-4 text-blue-600" />
          </Button>
          {item.subTasks && item.subTasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                setListChildData(item.subTasks as TaskAssign[]);
                setIsOpenListChild(true);
              }}
              title="Xem công việc con"
            >
              <List className="w-4 h-4 text-blue-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-red-100 rounded transition-colors"
            onClick={() => openListViewFollowDialog(item)}
            title="Sơ đồ công việc "
          >
            <Network className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 space-y-4 lg:space-y-8">
      <BreadcrumbNavigation
        items={[
          {
            href: "/task/assign",
            label: "Quản lý công việc",
          },
        ]}
        currentPage="Công việc đã giao"
        showHome={false}
      />
      <div
        className="border border-gray-200 rounded-lg p-4"
        style={{ backgroundColor: "#e8e9eb" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Danh sách giao việc
            </h1>
            <p className="text-sm text-gray-600">
              Danh sách công việc đã giao cho cá nhân thực hiện
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              onClick={() => setWorkAssignDialog(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Giao việc
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Tên công việc</div>
              <div>
                <Input
                  className="h-9 text-sm"
                  placeholder="Nhập từ khóa…"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTempSearchParams((prev) => ({
                      ...prev,
                      taskName: e.target.value,
                    }))
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  value={tempSearchParams.taskName}
                />
              </div>
            </div>
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Nhóm các công việc</div>
              <SelectCustom
                value={tempSearchParams.priorityId}
                onChange={(value: string | string[]) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    priorityId: Array.isArray(value) ? value[0] : value,
                  }))
                }
                options={[
                  { label: "-- Chọn --", value: "0" },
                  ...taskPriority.map((item) => ({
                    label: item.name,
                    value: String(item.id),
                  })),
                ]}
                placeholder="-- Chọn --"
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Ngày bắt đầu công việc</div>
              <div className="relative">
                <CustomDatePicker
                  selected={parseDateStringYMD(tempSearchParams.startDate)}
                  onChange={(date) =>
                    setTempSearchParams((prev) => ({
                      ...prev,
                      startDate: formatDateYMD(date),
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Ngày kết thúc công việc</div>
              <div className="relative">
                <CustomDatePicker
                  selected={parseDateStringYMD(tempSearchParams.endDate)}
                  onChange={(date) =>
                    setTempSearchParams((prev) => ({
                      ...prev,
                      endDate: formatDateYMD(date),
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  min={tempSearchParams.startDate || undefined}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end gap-2 mt-4">
            <Button
              type="submit"
              size="sm"
              className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-3 h-3 mr-1" />
              Tìm kiếm
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSearchReset}
              className="h-9 px-3 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Đặt lại
            </Button>
          </div>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row items-center border rounded-lg p-2 gap-4 lg:gap-8">
        {listDeadlineWarning.map((deadline) => (
          <div
            key={deadline.id}
            className={`flex items-center gap-2 p-2 rounded-sm
                             ${Constant.ADD_SEARCH_FOLLOW_DAYLEFT ? "cursor-pointer hover:bg-gray-200" : "cursor-default"}`}
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: deadline.color }}
            />
            <span className="text-gray-700 text-sm">{deadline.name}</span>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => handleTabChange("pending")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Đang thực hiện
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("completed")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "completed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hoàn thành
          </button>
        </nav>
      </div>

      <Table
        sortable
        columns={assignColumns}
        dataSource={taskAssignRequestsData}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onSort={handleSort}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: TaskAssign, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoadingMerged
            ? "Đang tải dữ liệu..."
            : errorMerged
              ? `Lỗi: ${errorMerged && typeof errorMerged === "object" && "message" in errorMerged ? ((errorMerged as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
              : "Không tồn tại công việc"
        }
        onRowClick={(item: TaskAssign) => {
          // Lưu state vào sessionStorage trước khi navigate
          const stateToSave = {
            activeTab,
            currentPage,
            itemsPerPage,
            searchParams,
            sortBy,
            direction,
            status,
          };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
          checkNavigateDetail(item);
        }}
        onItemsPerPageChange={(size: number) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        loading={isLoadingMerged}
      />
      <ConfirmDeleteDialog
        isOpen={confirmCloseTask}
        onOpenChange={setConfirmCloseTask}
        onConfirm={doCloseTask}
        title="Hãy xác nhận"
        description="Bạn có muốn đóng công việc này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmRejectTask}
        onOpenChange={setConfirmRejectTask}
        onConfirm={doRejectTask}
        title="Hãy xác nhận"
        description="Bạn có muốn từ chối công việc này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmDeleteTask}
        onOpenChange={setConfirmDeleteTask}
        onConfirm={doDeleteTask}
        title="Hãy xác nhận"
        description="Bạn chắc chắn muốn xóa công việc này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmRevokeTask}
        onOpenChange={setConfirmRevokeTask}
        onConfirm={doRevokeTask}
        title="Hãy xác nhận"
        description="Bạn muốn thu hồi công việc này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmRestoreTask}
        onOpenChange={setConfirmRestoreTask}
        onConfirm={doRestoreTask}
        title="Hãy xác nhận"
        description="Bạn muốn khôi phục công việc này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <WorkflowDialog
        isOpen={workflowDialog}
        onClose={() => setWorkflowDialog(false)}
        workItem={workflowItem}
        workflowData={selectedWorkflow || undefined}
      />
      <ChildWorkflowDialog
        isOpen={childWorkflowDialog}
        onClose={() => {
          setChildWorkflowDialog(false);
          setSelectedChildTaskId(null);
        }}
        taskId={selectedChildTaskId || 0}
      />
      <FollowerDialog
        isOpen={followerDialog}
        isFollow={true}
        onClose={() => setFollowerDialog(false)}
        taskId={workItem?.id}
        selectedWorkItem={workItem}
        initialFollowers={userFollows}
        onConfirm={(followers) => {
          doFollowerTask(followers);
        }}
        isV2={isV2}
      />
      <ConfirmWithFileDialog
        isOpen={confirmCompleteTask}
        onToggle={(open: boolean) => {
          setConfirmCompleteTask(open);
        }}
        onSubmit={(reason: string, selectedFiles: any[]) => {
          void doCompleteTask(reason, selectedFiles);
        }}
        config={configModalConfirm.TASK_DONE}
      />
      {workAssignDialog && (
        <WorkAssignDialog
          open={workAssignDialog}
          onClose={() => {
            setWorkAssignDialog(false);
            handleSearchReset();
            refetchMerged();
          }}
          isV2={isV2}
        />
      )}
      <TaskTransferModal
        visible={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedTask(null);
          setSelectedNode(null);
        }}
        taskId={selectedTask?.id || 0}
        nodeId={selectedNode?.id || 0}
        showCanAddTransfer={showCanAddTransfer}
        callback={() => {
          handleSearchReset();
          setIsTransferModalOpen(false);
          setSelectedTask(null);
          setSelectedNode(null);
          refetchMerged();
        }}
        isV2={isV2}
      />

      <ListChildDialog
        isOpen={isOpenListChild}
        onClose={() => {
          setIsOpenListChild(false);
          refetchMerged();
        }}
        data={listChildData}
        isV2={isV2}
      />
    </div>
  );
}
