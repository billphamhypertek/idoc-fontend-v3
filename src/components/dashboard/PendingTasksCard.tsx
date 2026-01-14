"use client";

import SelectCustom from "@/components/common/SelectCustom";
import { toast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notification.service";
import { TaskService } from "@/services/task.service";
import { handleError } from "@/utils/common.utils";
import { getUserInfo } from "@/utils/token.utils";
import { Check, ClipboardList, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import ConfirmWithFileDialog from "../common/ConfirmWithFileDialog";
import { ToastUtils } from "@/utils/toast.utils";

interface TaskItem {
  id: string;
  title: string;
  assignedBy?: string;
  assignees?: string[];
  deadline?: string;
  status: string;
  handlingType?: "main" | "coordinate";
}

interface Props {
  tasks: TaskItem[];
  isClient: boolean;
  getRoleStatusColor: (status: string) => string;
  onCompleteTask: (id: string, status: string) => void;
  onDetailClick: (id: string) => void;
  taskHandling?: "main" | "coordinate";
  onTaskHandlingChange?: (val: "main" | "coordinate") => void;
  isFiltering?: boolean;
  setIsFiltering?: (value: boolean) => void;
}

const configModalConfirm = {
  TASK_REFUSE: {
    title: "Từ chối",
    label: { input: "Lí do từ chối", button_confirm: "Xác nhận" },
    has_upload_file: true,
    has_encrypt: false,
    max_file_size: 300,
  },
};

const PendingTasksCard: React.FC<Props> = ({
  tasks,
  isClient,
  getRoleStatusColor,
  onCompleteTask,
  onDetailClick,
  taskHandling = "main",
  onTaskHandlingChange,
  isFiltering = false,
  setIsFiltering,
}) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskSelectedAction, setTaskSelectedAction] = useState<TaskItem | null>(
    null
  );
  const [confirmTask, setConfirmTask] = useState(false);
  const [openConfirmRefuseTask, setOpenConfirmRefuseTask] = useState(false);
  const router = useRouter();

  const options = [
    { label: "Xử lý chính", value: "main" },
    { label: "Phối hợp", value: "coordinate" },
  ];

  const handleCompleteClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowCompleteModal(true);
  };

  const handleComplete = async (opinion: string, file?: File) => {
    if (selectedTaskId) {
      onCompleteTask(selectedTaskId, "Hoàn thành");
    }
  };

  const confirmApprove = (task: any, type: number) => {
    setTaskSelectedAction(task);
    switch (type) {
      case 1:
        setConfirmTask(true);
        break;
      case 2:
        setOpenConfirmRefuseTask(true);
        break;
      default:
        break;
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
      await TaskService.updateStatus(taskSelectedAction?.id ?? 0, false, 1);
      await notificationService.countUnreadNotification();
      router.refresh();
      ToastUtils.taskCompleteSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  const acceptTask = async () => {
    if (!taskSelectedAction) return;
    try {
      await TaskService.updateStatus(taskSelectedAction.id, false, 3, "", []);

      notificationService.countUnreadNotification();
      ToastUtils.taskCompleteSuccess();
      router.refresh();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-lg h-auto flex flex-col pb-4 rounded-xl">
      <div className="pt-3 px-4">
        <div className="mb-1 flex items-center gap-2 p-2 text-gray-800">
          <ClipboardList className="w-6 h-6 text-purple-500" />
          <span className="font-bold text-2xl">Công việc cần xử lý</span>

          <div className="ml-auto flex items-center gap-2 min-w-0">
            <SelectCustom
              options={options}
              value={taskHandling}
              onChange={(value) => {
                if (setIsFiltering) {
                  setIsFiltering(true);
                  setTimeout(() => setIsFiltering(false), 500);
                }
                if (onTaskHandlingChange) {
                  onTaskHandlingChange(value as "main" | "coordinate");
                }
              }}
              className="min-w-[140px]"
            />
          </div>
        </div>
      </div>

      <div className="pb-4 px-4 flex-1 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="mb-4 p-4 rounded-xl shadow-md border border-red-400 bg-red-50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-red-500"
              onClick={() => onDetailClick(task.id)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-base font-semibold cursor-pointer flex-1 mr-2 text-gray-800">
                  {task.title}
                </p>
                <span
                  className={`text-sm px-2 py-1 border rounded-md ${getRoleStatusColor(task.status)}`}
                >
                  {task.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-base mb-2 text-gray-600">
                <span className="flex items-center gap-1">
                  <span>Giao bởi:</span>
                  <span>{task.assignedBy || "N/A"}</span>
                </span>
                <span className="flex items-center gap-1 text-base">
                  <Clock className="w-4 h-4" />
                  <span>
                    {!isClient
                      ? "Đang tải..."
                      : task.deadline && task.deadline !== "Invalid Date"
                        ? task.deadline
                        : "Không có hạn"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-blue-900 font-bold text-lg hover:bg-gray-100 hover:text-blue-950 transition-colors"
                  onClick={(e) => {
                    confirmApprove(task, 1);
                    e.stopPropagation();
                  }}
                >
                  <Check className="w-4 h-4 mr-1 inline" />
                  Tiếp nhận
                </button>

                <button
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-blue-900 font-bold text-base hover:bg-gray-100 hover:text-blue-950 transition-colors"
                  onClick={(e) => {
                    confirmApprove(task, 2);
                    e.stopPropagation();
                  }}
                >
                  <X className="w-4 h-4 mr-1 inline" />
                  Từ chối
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-base text-gray-600">không tìm thấy dữ liệu</p>
        )}
      </div>

      <ConfirmWithFileDialog
        isOpen={openConfirmRefuseTask}
        onToggle={setOpenConfirmRefuseTask}
        onSubmit={refuseTask}
        config={configModalConfirm.TASK_REFUSE}
      />

      <ConfirmDeleteDialog
        isOpen={confirmTask}
        onOpenChange={setConfirmTask}
        onConfirm={acceptTask}
        title="Hãy xác nhận"
        description={"Bạn có muốn tiếp nhận công việc này?"}
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
};

export default PendingTasksCard;
