"use client";

import React, { useState } from "react";
import { ClipboardList, Clock, Check, Share2 } from "lucide-react";
import CompleteModal from "@/components/dialogs/CompleteModal";
import { useRouter } from "next/navigation";
import WorkAssignDialog from "../work-assign/createDialog";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  assignedBy?: string;
  assignees?: string[];
  deadline?: string;
  endDate?: number;
  status: string;
}

interface Props {
  tasks: TaskItem[];
  isClient: boolean;
  getRoleStatusColor: (status: string) => string;
  onCompleteTask: (id: string, status: string) => void;
  onDetailClick: (id: string) => void;
  onRefetchAssignedTasks: () => void;
}

const AssignedTasksCard: React.FC<Props> = ({
  tasks,
  isClient,
  getRoleStatusColor,
  onCompleteTask,
  onDetailClick,
  onRefetchAssignedTasks,
}) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [openWorkAssignDialog, setOpenWorkAssignDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const router = useRouter();

  const handleCompleteClick = (taskId: string, e: any) => {
    e.stopPropagation();
    setSelectedTaskId(taskId);
    setShowCompleteModal(true);
  };

  const handleComplete = async (opinion: string, file?: File) => {
    if (selectedTaskId) {
      onCompleteTask(selectedTaskId, "Hoàn thành");
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-lg h-auto flex flex-col pb-4 rounded-xl">
      <div className="pt-3 px-4">
        <div className="mb-1 flex items-center gap-2 p-2 text-gray-800">
          <ClipboardList className="w-6 h-6 text-green-500" />
          <span className="font-bold text-2xl">Việc đã giao</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="invisible h-11 min-w-[140px]"></div>
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
                  <span>Giao cho:</span>
                  <span className="flex items-center gap-1 flex-wrap">
                    {task.assignees?.map((assignee: string, idx: number) => (
                      <span key={idx}>
                        {assignee}
                        {idx < (task.assignees?.length ?? 0) - 1 && ","}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {!isClient
                      ? "Đang tải..."
                      : task.deadline && task.deadline !== "Invalid Date"
                        ? task.deadline
                        : "Không có hạn"}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-lg text-gray-600">
                <Clock className="w-4 h-4" />
                {/* <span>Ngày kết thúc: {!isClient ? "Đang tải..." : task.endDate ? new Date(task.endDate).toLocaleDateString("vi-VN") : "Không có"}</span>
                 */}
                <span>
                  Ngày kết thúc:{" "}
                  {!isClient
                    ? "Đang tải..."
                    : task.endDate
                      ? new Date(Number(task.endDate)).toLocaleDateString(
                          "vi-VN"
                        )
                      : "Không có"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-blue-900 font-bold text-lg hover:bg-gray-100 hover:text-blue-950 transition-colors"
                  onClick={(e) => handleCompleteClick(task?.id, e)}
                >
                  <Check className="w-4 h-4 mr-1 inline" />
                  Hoàn thành
                </button>

                <button
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-blue-900 font-bold text-base hover:bg-gray-100 hover:text-blue-950 transition-colors"
                  onClick={(e) => {
                    setOpenWorkAssignDialog(true);
                    e.stopPropagation();
                    setSelectedTask(task);
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1 inline" />
                  Giao việc
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-base text-gray-600">không tìm thấy dữ liệu</p>
        )}
      </div>
      <CompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onComplete={handleComplete}
        title="Hoàn thành"
      />
      {openWorkAssignDialog && (
        <WorkAssignDialog
          open={openWorkAssignDialog}
          onClose={() => {
            setOpenWorkAssignDialog(false);
            onRefetchAssignedTasks();
          }}
          isAddChildTask={true}
          parentTaskFromDetail={selectedTask}
        />
      )}{" "}
    </div>
  );
};

export default AssignedTasksCard;
