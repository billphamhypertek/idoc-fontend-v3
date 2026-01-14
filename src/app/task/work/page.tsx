"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Column } from "@/definitions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Check,
  Forward,
  Network,
  Recycle,
  RotateCcw,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import { TaskService } from "@/services/task.service";
import { TaskV2Service } from "@/services/taskv2.service";
import { CategoryCode } from "@/definitions/types/category.type";
import { DeadlineWarning, Task } from "@/definitions/interfaces/task.interface";
import { format } from "date-fns";
import { getDateLeftUtils, handleError } from "@/utils/common.utils";
import ProgressDialog from "@/components/task/ProgressDialog";
import SelectCustom from "@/components/common/SelectCustom";
import { useFollowerTask, useTaskList } from "@/hooks/data/task.data";
import { DATE_FORMAT } from "@/definitions/constants/common.constant";
import ConfirmWithFileDialog from "@/components/common/ConfirmWithFileDialog";
import { getUserInfo } from "@/utils/token.utils";
import { notificationService } from "@/services/notification.service";
import { SharedFileData } from "@/definitions/types/document-out.type";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { uploadFileService } from "@/services/file.service";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Bpmn2Service } from "@/services/bpmn2.service";
import TaskTransferModal from "@/components/task/TaskTransferModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WorkflowDialog from "@/components/dialogs/WorkflowDialog";
import FollowerDialog from "@/components/dialogs/FollowerDialog";
import { FollowerTask, OrgNode } from "@/definitions/types/task-assign.type";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  WorkflowData,
  WorkflowEdge,
  WorkflowNode,
} from "@/definitions/types/workflow.type";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { Badge } from "@/components/ui/badge";
import { CustomDatePicker } from "@/components/ui/calendar";
import { useTaskListV2 } from "@/hooks/data/taskv2.data";
import { buildWorkflowTree, TrackingItem } from "@/utils/workflow.utils";

const tabs = { NOT_YET: "notyet", DID: "did", DONE: "done" } as const;

interface Node {
  id: number;
  name: string;
}

export default function TaskWork() {
  const queryClient = useQueryClient();
  // State
  const [taskPriority, setTaskPriority] = useState<CategoryCode[]>([]);
  const [listDeadlineWarning] = useState<DeadlineWarning[]>([
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCanAddTransfer, setShowCanAddTransfer] = useState(false);
  const [isNodesPopoverOpen, setIsNodesPopoverOpen] = useState(false);

  // Params
  const [activeTab, setActiveTab] = useState<string>(tabs.NOT_YET);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [dayLeft, setDayLeft] = useState<string>("");
  const [taskName, setTaskName] = useState<string>("");
  const [priority, setPriority] = useState<string>("0");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [shouldSearch, setShouldSearch] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("");
  const [direction, setDirection] = useState<string>("DESC");
  const hasRestoredState = useRef<boolean>(false);

  // Progress dialog
  const [isOpenProgress, setIsOpenProgress] = useState<boolean>(false);
  const [taskSelectedAction, setTaskSelectedAction] = useState<Task | null>(
    null
  );

  const [isOpenConfirmDoneTask, setOpenConfirmDoneTask] =
    useState<boolean>(false);
  const [isOpenConfirmRefuseTask, setOpenConfirmRefuseTask] =
    useState<boolean>(false);
  const [isConfirmTask, setConfirmTask] = useState<boolean>(false);

  const [workflowDialog, setWorkflowDialog] = useState<boolean>(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(
    null
  );
  const [workflowItem, setWorkflowItem] = useState<{ workName: string }>({
    workName: "",
  });

  const [workItem, setWorkItem] = useState<{
    workName: string;
    id: string | number;
  }>({ workName: "", id: "" });
  const [followerDialog, setFollowerDialog] = useState<boolean>(false);
  const [userFollows, setUserFollows] = useState<any[]>([]);

  // Variables
  const pathname = usePathname();
  const router = useRouter();
  const isExecute: boolean = pathname?.includes("/task/work") ?? false;
  const isV2 = useMemo(() => pathname?.includes("task-v2"), [pathname]);

  // Key để lưu state vào sessionStorage
  const STORAGE_KEY = "task_work_search_state";

  const { mutate: doFollowerTaskAction } = useFollowerTask(isV2 ?? false);

  const configModalConfirm = {
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

  const renderTodoButton = (task: Task) => {
    const config: {
      key: string;
      enable: boolean;
      title: string;
      color: string;
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
      icon: React.ReactNode;
      isPopover?: boolean;
    }[] = [
      {
        key: "canTodo",
        enable: task.taskCombinationStatus === 0,
        title: "Nhận việc",
        color: "text-black",
        onClick: (e) => {
          e.stopPropagation();
          confirmApprove(task, 1);
        },
        icon: <Check className="w-4 h-4" />,
      },
      {
        key: "canTodo",
        enable: task.button.canTodo === "ENABLE",
        title: "Tiếp nhận",
        color: isExecute ? "text-black" : "text-green-500",
        onClick: (e) => {
          e.stopPropagation();
          confirmApprove(task, 1);
        },
        icon: <Check className="w-4 h-4" />,
      },
      {
        key: "canReject",
        enable: task.button.canReject === "ENABLE",
        title: "Từ chối",
        color: "text-red-500",
        onClick: (e) => {
          e.stopPropagation();
          confirmApprove(task, 2);
        },
        icon: <X className="w-4 h-4" />,
      },
      {
        key: "canDone",
        enable: task.button.canDone === "ENABLE",
        title: "Hoàn thành",
        color: "text-green-500",
        onClick: (e) => {
          e.stopPropagation();
          confirmApprove(task, 3);
        },
        icon: <Check className="w-4 h-4" />,
      },
      {
        key: "canRevokeFinish",
        enable: task.button.canRevokeFinish === "ENABLE",
        title: "Thu hồi hoàn thành",
        color: "text-yellow-500",
        onClick: (e) => {
          e.stopPropagation();
          confirmApprove(task, 1);
        },
        icon: <RotateCcw className="w-4 h-4" />,
      },
      {
        key: "canTransfer",
        enable: task.button.canTransfer === "ENABLE",
        title: "Chuyển xử lý",
        color: "text-red-500",
        onClick: (e) => {
          e.stopPropagation();
          loadNodes(task, false);
        },
        icon: <Forward className="w-4 h-4" />,
        isPopover: true,
      },
      {
        key: "canAddTransfer",
        enable: task.button.canAddTransfer === "ENABLE",
        title: "Bổ sung xử lý",
        color: "text-red-500",
        onClick: (e) => {
          e.stopPropagation();
          loadNodes(task, true);
        },
        icon: <Recycle className="w-4 h-4" />,
        isPopover: true,
      },
      {
        key: "follow",
        enable: true,
        title: "Người theo dõi",
        color: "text-indigo-500",
        onClick: (e) => {
          e.stopPropagation();
          doLoadUserFollowingTask(task);
        },
        icon: <User className="w-4 h-4" />,
      },
      {
        key: "familyTree",
        enable: true,
        title: "Sơ đồ giao việc",
        color: "text-cyan-500",
        onClick: (e) => {
          e.stopPropagation();
          openFamilyTreeModal(task);
        },
        icon: <Network className="w-4 h-4" />,
      },
    ];

    return config
      .filter((btn) => btn.enable)
      .map((btn) => {
        if (btn.isPopover) {
          return (
            <Popover
              key={btn.key}
              open={isNodesPopoverOpen && selectedTask?.id === task.id}
              onOpenChange={(open) => {
                if (!open) {
                  setIsNodesPopoverOpen(false);
                  setSelectedTask(null);
                }
              }}
            >
              <PopoverTrigger asChild>
                <div className="flex items-center justify-center p-2 hover:bg-gray-200 rounded cursor-pointer">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          btn.onClick(e);
                        }}
                        className={`${btn.color} p-1`}
                      >
                        {btn.icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{btn.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTransferModal(task, node);
                      }}
                    >
                      {node.name || "Chưa đặt tên"}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        }

        return (
          <div
            key={btn.key}
            className="flex items-center justify-center p-2 hover:bg-gray-200 rounded cursor-pointer"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    btn.onClick(e);
                  }}
                  className={`${btn.color} p-1`}
                >
                  {btn.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{btn.title}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      });
  };

  const checkNavigateDetail = (task: Task) => {
    if (task?.id !== undefined && task?.id !== null) {
      if (isV2) {
        router.push(`/task-v2/work/detail/${task.id}`);
      } else {
        router.push(`/task/work/detail/${task.id}`);
      }
    }
  };

  const handleRowClick = (task: Task) => {
    // Lưu state vào sessionStorage trước khi navigate
    const stateToSave = {
      activeTab,
      currentPage,
      itemsPerPage,
      taskName,
      priority,
      startDate,
      endDate,
      sortBy,
      direction,
      dayLeft,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    checkNavigateDetail(task);
  };

  const handleSort = (
    sortConfig: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (sortConfig) {
      setSortBy(sortConfig.key);
      setDirection(sortConfig.direction === "asc" ? "ASC" : "DESC");
      setCurrentPage(1);
      setShouldSearch(true);
    } else {
      setSortBy("");
      setDirection("DESC");
      setCurrentPage(1);
      setShouldSearch(true);
    }
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

  const draftHandleColumns: Column<Task>[] = [
    {
      header: <span className="text-xs font-medium">STT</span>,
      className: "text-center py-1 w-4",
      sortable: false,
      accessor: (task: Task, index: number) => (
        <span
          className="text-xs font-medium"
          style={{ color: task.deadlineWarning?.color ?? "black" }}
        >
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      header: (
        <div className="flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded">
          <Star className={cn("w-4 h-4", "text-gray-400")} />
        </div>
      ),
      className: "py-1 w-3",
      sortKey: "IMPORTANT_EXE",
      accessor: (task: Task) => (
        <div className="flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded">
          <Star
            className={cn(
              "w-4 h-4",
              task.important
                ? "fill-yellow-400 text-yellow-400 stroke-yellow-600 stroke-2"
                : "text-gray-400"
            )}
            onClick={(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
              e.stopPropagation();
              markTaskImportant(task);
            }}
          />
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700">
          <span>Tên công việc</span>
        </div>
      ),
      className: "py-1 w-64",
      sortKey: "NAME",
      accessor: (task: Task) => (
        <span style={{ color: task.deadlineWarning?.color ?? "black" }}>
          {task.taskName}
        </span>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700">
          <span>Ngày bắt đầu</span>
        </div>
      ),
      className: "py-1 w-24 whitespace-nowrap text-center",
      sortKey: "START_DATE",
      accessor: (task: Task) => (
        <div className="text-center">
          <span style={{ color: task.deadlineWarning?.color ?? "black" }}>
            {format(
              typeof task.startDate === "string" ||
                typeof task.startDate === "number"
                ? new Date(task.startDate)
                : task.startDate,
              DATE_FORMAT
            )}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700">
          <span>Ngày kết thúc </span>
        </div>
      ),
      className: "py-1 w-24 whitespace-nowrap text-center",
      sortKey: "END_DATE",
      accessor: (task: Task) => (
        <div className="text-center">
          <span style={{ color: task.deadlineWarning?.color ?? "black" }}>
            {format(
              typeof task.endDate === "string" ||
                typeof task.endDate === "number"
                ? new Date(task.endDate)
                : task.endDate,
              DATE_FORMAT
            )}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700">
          <span>Người giao việc</span>
        </div>
      ),
      className: "py-1 w-32 whitespace-nowrap text-center",
      sortKey: "PERSON_HANDLE",
      accessor: (task: Task) => (
        <span style={{ color: task.deadlineWarning?.color ?? "black" }}>
          {task.userAssignName}
        </span>
      ),
    },
    {
      header: (
        <div className="flex justify-start items-center py-1 cursor-pointer hover:text-blue-700">
          <span>Nhóm công việc</span>
        </div>
      ),
      className: "py-1 w-24 break-words",
      sortKey: "IMPORTANT_EXE",
      accessor: (task: Task) => (
        <span style={{ color: task.deadlineWarning?.color ?? "black" }}>
          {task.priorityName}
        </span>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700">
          <span>Trạng thái</span>
        </div>
      ),
      className: "py-2 w-16 break-words",
      sortKey: "STATUS_TASK_EXE",
      accessor: (task: Task) => getStatusBadge(task.statusName),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700">
          <span>Thao tác</span>
        </div>
      ),
      className: "py-2 w-16 text-center",
      sortable: false,
      accessor: (task: Task) => (
        <TooltipProvider>
          <div
            className="flex gap-2 justify-center items-center text-base"
            onClick={(e) => e.stopPropagation()}
          >
            {renderTodoButton(task)}
          </div>
        </TooltipProvider>
      ),
    },
    ...(activeTab !== tabs.DID && activeTab !== tabs.DONE
      ? [
          {
            header: (
              <div className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700">
                <span>Tiến độ</span>
              </div>
            ),
            className: "text-center min-w-[30px] w-[30px] px-1",
            sortable: false,
            accessor: (task: Task) => {
              let progressValue: number;
              if (typeof task.progress === "string") {
                progressValue = parseInt(task.progress.replace("%", ""), 10);
              } else if (typeof task.progress === "number") {
                progressValue = task.progress;
              } else {
                progressValue = 0;
              }
              const pct = Math.max(0, Math.min(progressValue, 100));
              return (
                <div
                  className="relative w-[100px] h-2.5 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenProgress(true);
                    setTaskSelectedAction(task);
                  }}
                  title={`${pct}%`}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={
                        "text-[10px] leading-[10px] font-semibold " +
                        (pct >= 50 ? "!text-white" : "!text-gray-800")
                      }
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  const params = useMemo(
    () => ({
      taskName,
      priority: priority === "0" ? "" : priority,
      startDate,
      endDate,
      dayLeft,
      page: currentPage,
      size: itemsPerPage,
      sortBy,
      direction,
    }),
    [
      taskName,
      priority,
      startDate,
      endDate,
      dayLeft,
      currentPage,
      itemsPerPage,
      sortBy,
      direction,
    ]
  );

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useTaskList(activeTab, params, shouldSearch && !isV2);

  const {
    data: dataV2,
    isLoading: loadingV2,
    error: errorV2,
    refetch: refetchV2,
  } = useTaskListV2(activeTab, params, shouldSearch && (isV2 ?? false));

  const getDeadlineWarning = (task: Task): DeadlineWarning | null => {
    // Assign deadline property for compatibility with getDateLeftUtils
    const taskWithDeadline = { ...task, deadline: task.endDate };

    const numberOfRemainingDate = getDateLeftUtils(taskWithDeadline);
    if (numberOfRemainingDate < 0) {
      return null;
    }
    return (
      listDeadlineWarning
        .sort((a, b) => (a.numberOfDays < b.numberOfDays ? -1 : 1))
        .find((item) => item.numberOfDays >= numberOfRemainingDate) ?? null
    );
  };

  // Lưu lại data đã được search để tránh hiển thị cached data khi đang nhập
  const [displayedData, setDisplayedData] = useState<{
    content?: Task[];
    totalElements?: number;
  } | null>(null);

  useEffect(() => {
    // Chỉ cập nhật displayedData khi shouldSearch là true (đã click tìm kiếm hoặc chuyển trang)
    // Hoặc khi data được load lần đầu (displayedData chưa có)
    const source = isV2 ? dataV2 : data;
    if (shouldSearch && source) {
      setDisplayedData(source);
    } else if (!displayedData && source) {
      // Khởi tạo displayedData lần đầu khi data được load
      setDisplayedData(source);
    }
  }, [shouldSearch, data, dataV2, displayedData, isV2]);

  const loadingMerged = isV2 ? loadingV2 : loading;
  const errorMerged = isV2 ? errorV2 : error;
  const refetchMerged = isV2 ? refetchV2 : refetch;

  const tasks: Task[] =
    displayedData?.content?.map((task: Task) => {
      if (activeTab === tabs.NOT_YET || activeTab === tabs.DID) {
        task.deadlineWarning = getDeadlineWarning(task) ?? undefined;
      }
      return task;
    }) ?? [];

  const totalItems: number =
    displayedData?.totalElements ?? data?.totalElements ?? 0;

  const { data: workTypeCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.PRIORITY
  );

  useEffect(() => {
    if (workTypeCategoryData) setTaskPriority(workTypeCategoryData);
  }, [workTypeCategoryData]);

  // Restore state từ sessionStorage khi component mount (chạy trước các useEffect khác)
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
        if (state.taskName !== undefined) setTaskName(state.taskName);
        if (state.priority !== undefined) setPriority(state.priority);
        if (state.startDate !== undefined) setStartDate(state.startDate);
        if (state.endDate !== undefined) setEndDate(state.endDate);
        if (state.sortBy !== undefined) setSortBy(state.sortBy);
        if (state.direction !== undefined) setDirection(state.direction);
        if (state.dayLeft !== undefined) setDayLeft(state.dayLeft);
        if (state.activeTab) setActiveTab(state.activeTab);

        // Xóa state đã lưu sau khi restore
        sessionStorage.removeItem(STORAGE_KEY);

        // Trigger search
        setShouldSearch(true);

        // Reset flag sau khi restore xong để các lần thay đổi search sau vẫn reset page
        setTimeout(() => {
          hasRestoredState.current = false;
        }, 100);
      }
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Gọi API khi component mount
  useEffect(() => {
    setShouldSearch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refetchMerged();
  }, []);

  const confirmApprove = (task: Task, type: number) => {
    setTaskSelectedAction(task);
    switch (type) {
      case 1:
        setConfirmTask(true);
        break;
      case 2:
        setOpenConfirmRefuseTask(true);
        break;
      case 3:
        if (isV2) {
          doneTask("", []);
        } else {
          setOpenConfirmDoneTask(true);
        }
        break;
      default:
        break;
    }
  };

  const acceptTask = async () => {
    if (!taskSelectedAction) return;
    try {
      const updater = isV2
        ? TaskV2Service.updateStatusV2
        : TaskService.updateStatus;
      await updater(taskSelectedAction.id, false, 1, "", []);
      notificationService.countUnreadNotification();
      ToastUtils.success("Tiếp nhận công việc thành công");
      refetchMerged();
      //router.push(`/task/work/detail/${taskSelectedAction.id}`);
    } catch (error) {
      handleError(error);
    }
  };

  const refuseTask = async (reason: string, selectedFiles: File[]) => {
    const formData = new FormData();
    formData.append("comment", reason);
    selectedFiles.forEach((file: File) => {
      formData.append("files", file);
    });
    formData.append("taskId", String(taskSelectedAction?.id ?? ""));
    formData.append("status", String(2));
    formData.append("isExcute", String(false));
    const userInfo = JSON.parse(getUserInfo() || "{}");
    formData.append("userId", String(userInfo?.id ?? ""));

    try {
      const updater = isV2
        ? TaskV2Service.updateStatusV2
        : TaskService.updateStatus;
      await updater(taskSelectedAction?.id ?? 0, false, 2);
      await notificationService.countUnreadNotification();
      await refetchMerged();
      ToastUtils.success("Nhận công việc thành công");
    } catch (error) {
      handleError(error);
    }
  };

  const setSharedFileData = (
    taskId: number | string,
    reason: string,
    selectedFiles: File[]
  ): SharedFileData => {
    return {
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
    };
  };

  const doneTask = async (reason: string, selectedFiles: File[]) => {
    if (!taskSelectedAction) return;
    const taskId = taskSelectedAction.id;
    const data = setSharedFileData(taskId, reason, selectedFiles);
    const encryptFile = data.files
      ? (data.files as any[]).filter((i) => i.encrypt)
      : [];
    if (encryptFile === undefined || encryptFile.length === 0) {
      await uploadFileService.saveCmtAndAtmByNonEnc(data);
    }
    const response = await uploadFileService.doSharePermissionDocFile(data);
    if (response === false) {
      return response;
    }

    try {
      const updater = isV2
        ? TaskV2Service.updateStatusV2
        : TaskService.updateStatus;
      await updater(taskId, false, 3, reason, selectedFiles);
      await notificationService.countUnreadNotification();
      await refetchMerged();
      ToastUtils.success("Hoàn thành công việc thành công");
    } catch (error) {
      await handleError(error);
    }
  };

  const loadNodes = async (task: Task, type: boolean) => {
    setSelectedTask(task);
    setShowCanAddTransfer(type);
    try {
      const taskDetail = isV2
        ? await TaskV2Service.findById(task.id)
        : await TaskService.findById(task.id);
      let data = [];
      if (!taskDetail?.nodeId) {
        data = await Bpmn2Service.getStartNode(Constant.THREAD_TYPE.ASSIGN);
      } else {
        data = await Bpmn2Service.getNextNodes(taskDetail.nodeId);
      }
      setNodes(data ?? []);
      setIsNodesPopoverOpen(true);
    } catch (error) {
      await handleError(error);
    }
  };

  const openTransferModal = (task: Task, node: Node) => {
    setSelectedTask(task);
    setSelectedNode(node);
    setIsTransferModalOpen(true);
    setIsNodesPopoverOpen(false);
  };

  const openFamilyTreeModal = (item: Task) => {
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

  const doLoadUserFollowingTask = (task: Task) => {
    setSelectedTask(task);
    setWorkItem({
      id: task.id,
      workName: task.taskName ?? "",
    });
    setUserFollows(task.userFollows == null ? [] : task.userFollows);
    setFollowerDialog(true);
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

    const taskId = selectedTask?.id;
    if (!taskId) {
      return;
    }

    doFollowerTaskAction(
      { id: taskId, payload: payload },
      {
        onSuccess: () => {
          ToastUtils.taskFollowerSuccess();
          setSelectedTask(null);
          setFollowerDialog(false);
          notificationService.countUnreadNotification();
          queryClient.invalidateQueries({
            queryKey: ["taskList", params],
          });
        },
        onError: (err: Error) => {
          ToastUtils.taskFollowerError();
        },
      }
    );
  };

  const handleTabChange = (tab: string) => {
    setDayLeft("");
    setCurrentPage(1);
    setShouldSearch(true);
    setActiveTab(tab);
  };

  useEffect(() => {
    if (shouldSearch) {
      refetchMerged();
    }
  }, [activeTab]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setShouldSearch(true);
  };

  const search = () => {
    setCurrentPage(1);
    setShouldSearch(true);
    refetchMerged();
  };

  const resetSearch = () => {
    setTaskName("");
    setPriority("0");
    setStartDate("");
    setEndDate("");
    setSortBy("");
    setDirection("DESC");
    setCurrentPage(1);
    setShouldSearch(true);
    refetchMerged();
  };

  const handleDeadlineClick = (deadline: DeadlineWarning) => {
    if (!Constant.ADD_SEARCH_FOLLOW_DAYLEFT) return;
    setDayLeft(String(deadline.dayLeft));
    setCurrentPage(1);
  };

  const toggleProgressDialog = (open: boolean) => {
    setIsOpenProgress(open);
    if (!open) {
      setTaskSelectedAction(null);
    }
  };

  const updateProgress = async ({
    progress,
    comment,
  }: {
    progress: number;
    comment: string;
  }) => {
    if (!taskSelectedAction) return null;

    try {
      const data = new FormData();
      Object.entries({ progress, comment }).forEach(([key, value]) => {
        data.append(key, String(value));
      });

      const updater = isV2
        ? TaskV2Service.updateProgressV2
        : TaskService.updateProgress;
      await updater(taskSelectedAction.id, data);

      ToastUtils.success("Thiết lập tiến độ thành công");
      taskSelectedAction.progress = progress;
    } catch (error) {
      handleError(error);
    }
  };

  const markTaskImportant = async (task: Task) => {
    try {
      const formData = new FormData();
      formData.append("taskId", String(task.id));

      const updater = isV2
        ? TaskV2Service.updateImportantTaskExecuteV2
        : TaskService.updateImportantTaskExecute;
      await updater(formData);
      refetchMerged();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="px-4 space-y-4 lg:space-y-8">
      <BreadcrumbNavigation
        currentPage="Việc xử lý chính"
        showHome={false}
        items={[
          {
            href: "",
            label: "Quản lý công việc",
          },
        ]}
      />
      <div
        className="border border-gray-200 rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: "#e8e9eb" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Danh sách công việc
            </h1>
            <p className="text-sm text-gray-600">
              Danh sách công việc với vai trò xử lý chính
            </p>
          </div>
        </div>
      </div>

      {/* search */}
      <div className="border rounded-lg p-4 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Tên công việc</div>
              <div>
                <Input
                  className="h-9 text-sm"
                  placeholder="Tên công việc"
                  value={taskName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setShouldSearch(false);
                    setTaskName(e.target.value);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      search();
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Nhóm các công việc</div>
              <SelectCustom
                value={priority}
                onChange={(val: string | string[]) => {
                  setShouldSearch(false);
                  setPriority(Array.isArray(val) ? val[0] : val);
                }}
                options={[
                  { name: "-- Chọn --", id: "0" },
                  ...taskPriority.map((item) => ({
                    id: item.id.toString(),
                    name: item.name,
                  })),
                ]}
                placeholder="-- Chọn --"
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Ngày bắt đầu công việc</div>
              <div>
                <CustomDatePicker
                  selected={parseDateStringYMD(startDate)}
                  onChange={(date) => {
                    setShouldSearch(false);
                    setStartDate(formatDateYMD(date));
                  }}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
            <div className="space-y-2 flex-1 w-full">
              <div className="font-bold text-sm">Ngày kết thúc công việc</div>
              <div>
                <CustomDatePicker
                  selected={parseDateStringYMD(endDate)}
                  onChange={(date) => {
                    setShouldSearch(false);
                    setEndDate(formatDateYMD(date));
                  }}
                  placeholder="dd/mm/yyyy"
                  min={startDate || undefined}
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
              className="h-9 px-3 text-xs"
              onClick={resetSearch}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Đặt lại
            </Button>
          </div>
        </form>
      </div>

      {/* notice */}
      <div className="flex flex-col lg:flex-row items-center border rounded-lg p-2 gap-4 lg:gap-8">
        {listDeadlineWarning.map((deadline) => (
          <div
            key={deadline.id}
            className={`flex items-center gap-2 p-2 rounded-sm ${
              Constant.ADD_SEARCH_FOLLOW_DAYLEFT
                ? "cursor-pointer hover:bg-gray-200"
                : "cursor-default"
            }`}
            onClick={() => handleDeadlineClick(deadline)}
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: deadline.color }}
            ></div>
            <span className="text-gray-700 text-sm">{deadline.name}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => handleTabChange(tabs.NOT_YET)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tabs.NOT_YET
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Chờ xử lý
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(tabs.DID)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tabs.DID
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Đã xử lý
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(tabs.DONE)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tabs.DONE
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Hoàn thành
            </button>
          </nav>
        </div>

        <div>
          <Table
            sortable
            columns={draftHandleColumns}
            dataSource={tasks}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
            onSort={handleSort}
            loading={loadingMerged}
            showPagination
            bgColor="bg-white"
            rowClassName={(_item: Task, index: number) =>
              index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
            }
            className="overflow-hidden cursor-pointer"
            emptyText={
              loadingMerged
                ? "Đang tải dữ liệu..."
                : errorMerged
                  ? `Lỗi: ${errorMerged instanceof Error ? errorMerged.message : String(errorMerged)}`
                  : "Không tồn tại công việc"
            }
            onItemsPerPageChange={(size: number) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <ProgressDialog
        isOpen={isOpenProgress}
        onToggle={toggleProgressDialog}
        progress={
          typeof taskSelectedAction?.progress === "number"
            ? taskSelectedAction.progress
            : 0
        }
        onSubmit={async (data) => {
          await updateProgress(data);
        }}
      />

      {/* modal task done */}
      <ConfirmWithFileDialog
        isOpen={isOpenConfirmDoneTask}
        onToggle={setOpenConfirmDoneTask}
        onSubmit={async (reason: string, files: File[]) => {
          await doneTask(reason, files);
        }}
        config={configModalConfirm.TASK_DONE}
      />
      <ConfirmWithFileDialog
        isOpen={isOpenConfirmRefuseTask}
        onToggle={setOpenConfirmRefuseTask}
        onSubmit={refuseTask}
        config={configModalConfirm.TASK_REFUSE}
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmTask}
        onOpenChange={setConfirmTask}
        onConfirm={acceptTask}
        title="Hãy xác nhận"
        description={
          isExecute
            ? "Bạn có muốn tiếp nhận công việc này?"
            : "Bạn có muốn nhận công việc này?"
        }
        confirmText="Đồng ý"
        cancelText="Đóng"
        positionButton={true}
      />

      {/* Task Transfer Modal */}
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
          refetchMerged();
          setIsTransferModalOpen(false);
          setSelectedTask(null);
          setSelectedNode(null);
        }}
        isV2={isV2}
      />

      <WorkflowDialog
        isOpen={workflowDialog}
        onClose={() => setWorkflowDialog(false)}
        workItem={workflowItem}
        workflowData={selectedWorkflow || undefined}
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
    </div>
  );
}
