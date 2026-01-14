import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Column } from "@/definitions";
import {
  FollowerTask,
  OrgNode,
  SubTask,
  TaskAssign,
} from "@/definitions/types/task-assign.type";
import {
  ArchiveRestore,
  CheckCircle,
  FileCheck,
  Forward,
  Pencil,
  Recycle,
  Star,
  Trash2,
  Undo2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCloseTask,
  useDeleteTask,
  useFollowerTask,
  useRejectTask,
  useRestoreTask,
  useRevokeTask,
  useToggleImportant,
} from "@/hooks/data/task.data";
import { countDateUntilNow, formatDate } from "@/utils/datetime.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Constant } from "@/definitions/constants/constant";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import WorkflowDialog from "@/components/dialogs/WorkflowDialog";
import { MarkerType } from "reactflow";
import { ToastUtils } from "@/utils/toast.utils";
import ConfirmWithFileDialog from "@/components/common/ConfirmWithFileDialog";
import { SharedFileData } from "@/definitions/types/document-out.type";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { uploadFileService } from "@/services/file.service";
import { TaskService } from "@/services/task.service";
import { notificationService } from "@/services/notification.service";
import { handleError } from "@/utils/common.utils";
import FollowerDialog from "@/components/dialogs/FollowerDialog";
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

interface Props {
  data: TaskAssign[];
  isOpen: boolean;
  onClose: () => void;
  isV2?: boolean;
}

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

export function ListChildDialog({
  data,
  isOpen,
  onClose,
  isV2 = false,
}: Props) {
  const router = useRouter();
  const [currentSelectedItem, setCurrentSelectedItem] = useState<
    TaskAssign | undefined
  >();
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

  const [listChildData, setListChildData] = useState<TaskAssign[]>([]);

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

  const { mutate: toggleImportant } = useToggleImportant(isV2 ?? false);
  const setImportant = async (r: TaskAssign) => {
    try {
      await toggleImportant(Number(r.id));
    } catch (error) {
      handleError(error);
    }
  };
  const { mutate: doCloseTaskAction } = useCloseTask(isV2 ?? false);
  const { mutate: doRejectTaskAction } = useRejectTask(isV2 ?? false);
  const { mutate: doRevokeTaskAction } = useRevokeTask(isV2 ?? false);
  const { mutate: doDeleteTaskAction } = useDeleteTask(isV2 ?? false);
  const { mutate: doRestoreTaskAction } = useRestoreTask(isV2 ?? false);
  const { mutate: doFollowerTaskAction } = useFollowerTask(isV2 ?? false);

  // Hàm chuyển SubTask thành TaskAssign
  const convertSubTaskToTaskAssign = (subTask: SubTask): TaskAssign => {
    return {
      id: subTask.id,
      taskName: subTask.taskName,
      codeTask: subTask.codeTask,
      userAssignName: subTask.userAssignName,
      statusName: subTask.statusName,
      startDate: subTask.startDate,
      endDate: subTask.endDate,
      progress: subTask.progress,
      important: subTask.important,
      nodeId: subTask.nodeId,
      button: subTask.button,
      userExcutePrimaryName: subTask.userExcutePrimaryName,
      priorityName: subTask.priorityName,
      close: subTask.close,
      orgName: subTask.orgName,
      read: subTask.read,
      nextNode: subTask.nextNode,
      description: subTask.description,
      parentId: subTask.parentId,
      comments: subTask.comments,
      assigners: subTask.assigners,
      results: subTask.results,
      subTasks: subTask.subTasks,
      result: subTask.result,
      tracking: subTask.tracking,
      type: subTask.type,
      userFollows: subTask.userFollows,
      level: subTask.level,
    };
  };

  // Hàm duỗi mảng TaskAssign và subTasks thành mảng 1 cấp
  const flattenTaskAssignArray = (tasks: TaskAssign[]): TaskAssign[] => {
    const result: TaskAssign[] = [];

    const processTask = (task: TaskAssign) => {
      // Thêm task hiện tại vào kết quả
      result.push(task);

      // Nếu có subTasks, xử lý đệ quy
      if (task.subTasks && task.subTasks.length > 0) {
        task.subTasks.forEach((subTask) => {
          // Chuyển SubTask thành TaskAssign
          const taskAssign = convertSubTaskToTaskAssign(subTask);
          // Xử lý đệ quy để xử lý cả subTasks của subTask
          processTask(taskAssign);
        });
      }
    };

    tasks.forEach((task) => {
      processTask(task);
    });

    return result;
  };

  useEffect(() => {
    if (isOpen && data) {
      const flattenedData = flattenTaskAssignArray(data);
      setListChildData(flattenedData);
    }
  }, [isOpen, data]);

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
          onClose();
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
        onClose();
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
        onClose();
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
        onClose();
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
          onClose();
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

    await TaskService.updateStatus(taskId, true, 3, reason, selectedFiles)
      .then(() => {
        notificationService.countUnreadNotification();
        ToastUtils.taskCompleteSuccess();
      })
      .catch((error: unknown) => handleError(error));
  };

  const openWorkFlowDialog = (item: TaskAssign) => {
    const tracking = item.tracking || [];
    // The type of t is unknown, so we use 'any' for now
    const root = tracking.find((t: any) => t.key === t.parent);
    if (!root) {
      return;
    }
    const children = tracking.filter(
      (t: any) => t.parent === root.key && t.key !== root.key
    );
    const nodes: WorkflowNode[] = [];

    nodes.push({
      id: root.key?.toString?.() ?? String(root.key),
      type: "organization",
      position: { x: 300, y: 50 },
      data: {
        role: root.execute ? "Xử lý chính" : "Phối hợp",
        name: root.name,
        title: root.position,
        department: root.org,
        isMainProcessor: root.execute,
      },
    });

    const childSpacing = 400;
    const startX = 300 - ((children.length - 1) * childSpacing) / 2;

    children.forEach((child: any, index: number) => {
      nodes.push({
        id: child.key?.toString?.() ?? String(child.key),
        type: "organization",
        position: {
          x: startX + index * childSpacing,
          y: 300,
        },
        data: {
          role: child.execute ? "Xử lý chính" : "Phối hợp",
          name: child.name,
          title: child.position,
          department: child.org,
          isMainProcessor: child.execute,
        },
      });
    });

    const edges: WorkflowEdge[] = children.map((child: any) => ({
      id: `e${root.key}-${child.key}`,
      source: root.key?.toString?.() ?? String(root.key),
      target: child.key?.toString?.() ?? String(child.key),
      type: "smoothstep",
      animated: false,
      style: {
        stroke: "#374151",
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#374151",
        width: 20,
        height: 20,
      },
    }));
    setSelectedWorkflow({ nodes, edges });
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
          onClose();
        },
        onError: (err: Error) => {
          ToastUtils.taskFollowerError();
        },
      }
    );
  };

  const loadNodes = async (task: TaskAssign, type: boolean) => {
    setSelectedTask(task);
    setShowCanAddTransfer(type);
    await TaskService.findById(task.id).then(async (response) => {
      if (!response.nodeId) {
        await Bpmn2Service.getStartNode(Constant.THREAD_TYPE.ASSIGN).then(
          (data) => {
            setNodes(data as Node[]);
            setIsNodesPopoverOpen(true);
          }
        );
      } else {
        await Bpmn2Service.getNextNodes(response.nodeId).then((data) => {
          setNodes(data as Node[]);
          setIsNodesPopoverOpen(true);
        });
      }
    });
  };

  const openTransferModal = (task: TaskAssign, node: Node) => {
    setSelectedTask(task);
    setSelectedNode(node);
    setIsTransferModalOpen(true);
    setIsNodesPopoverOpen(false);
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
          <span className="text-xs font-medium">{index + 1}</span>
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
        <div className="flex items-center justify-center gap-1.5">
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    onClick={() => {
                      setCurrentSelectedItem(item);
                      openConfirmCloseTaskDialog();
                    }}
                  >
                    <FileCheck className="w-4 h-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Đóng việc</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {item.button?.canReject === "ENABLE" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    onClick={() => {
                      setCurrentSelectedItem(item);
                      openConfirmRejectTaskDialog();
                    }}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Từ chối</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {item.button?.canRevoke === "ENABLE" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    onClick={() => {
                      setCurrentSelectedItem(item);
                      openConfirmRevokeTaskDialog();
                    }}
                  >
                    <Undo2 className="w-4 h-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Thu hồi</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                    onClick={() => {
                      setCurrentSelectedItem(item);
                      openConfirmCompleteTaskDialog();
                    }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hoàn thành</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {item.button?.canEdit === "ENABLE" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    onClick={() => {
                      checkNavigateDetail(item);
                    }}
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sửa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {item.button?.canDelete === "ENABLE" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    onClick={() => {
                      setCurrentSelectedItem(item);
                      openConfirmDeleteTaskDialog();
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xóa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {item.button?.canRestore === "ENABLE" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    onClick={() => {
                      setCurrentSelectedItem(item);
                      openConfirmRestoreTaskDialog();
                    }}
                  >
                    <ArchiveRestore className="w-4 h-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Khôi phục</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  onClick={() => {
                    setCurrentSelectedItem(item);
                    openFollowerDialog(item);
                  }}
                >
                  <User className="w-4 h-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Người theo dõi</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="max-w-7xl max-h-[75vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                {"Danh sách công việc mức dưới"}
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-1 h-9 px-3 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md font-medium transition-colors"
              aria-label="Đóng"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 max-h-[calc(75vh-56px-56px)] px-0 py-4 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <Table
                sortable
                showPageSize={false}
                showPagination={false}
                columns={assignColumns}
                dataSource={listChildData ?? []}
                bgColor="bg-white"
                rowClassName={(_item: TaskAssign, index: number) =>
                  index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
                }
                onRowClick={(item: TaskAssign) => {
                  checkNavigateDetail(item);
                }}
              />
            </div>
          </div>
        </div>
      </CustomDialogContent>

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
          setIsTransferModalOpen(false);
          setSelectedTask(null);
          setSelectedNode(null);
          onClose();
        }}
        isV2={isV2}
      />
    </Dialog>
  );
}
