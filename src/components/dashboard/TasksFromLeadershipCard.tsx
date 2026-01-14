"use client";

import React, { useState } from "react";
import { ClipboardList, Clock, Check } from "lucide-react";
import CompleteModal from "@/components/dialogs/CompleteModal";

interface TaskItem {
  id: string;
  title: string;
  assignedBy?: string;
  assignees?: string[];
  deadline?: string;
  status: string;
}

interface Props {
  tasks: TaskItem[];
  isClient: boolean;
  getRoleStatusColor: (status: string) => string;
  onCompleteTask: (id: string, status: string) => void;
}

const TasksFromLeadershipCard: React.FC<Props> = ({
  tasks,
  isClient,
  getRoleStatusColor,
  onCompleteTask,
}) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleCompleteClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowCompleteModal(true);
  };

  const handleComplete = async (opinion: string, file?: File) => {
    if (selectedTaskId) {
      // Gọi API để hoàn thành task với ý kiến và file
      onCompleteTask(selectedTaskId, "Hoàn thành");
    }
  };
  return (
    <div className="bg-white border border-gray-200 shadow-lg h-auto flex flex-col pb-4 rounded-xl">
      <div className="pt-3 px-4">
        <div className="mb-1 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors text-gray-800">
          <ClipboardList className="w-6 h-6" />
          <span className="font-bold">Công việc cần xử lý</span>
          <span className="ml-auto flex items-center gap-2 invisible h-11"></span>
        </div>
      </div>
      <div className="pb-4 px-4 flex-1 overflow-y-auto max-h-[400px]">
        {tasks.length > 0 ? (
          tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="mb-4 p-4 rounded-xl shadow-md border border-red-400 bg-red-50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-red-500"
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
                <span>Giao bởi: {task.assignedBy}</span>
                {task.deadline && task.deadline !== "Invalid Date" && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{!isClient ? "Đang tải..." : task.deadline}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  className="border border-gray-300 px-4 py-1.5 rounded-md font-bold text-base text-blue-900 bg-white hover:bg-gray-100 hover:text-blue-950 transition-colors"
                  onClick={() => handleCompleteClick(task.id)}
                >
                  <Check className="w-4 h-4 mr-1 inline" />
                  Hoàn thành
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-base text-gray-600">không tìm thấy dữ liệu</p>
        )}
      </div>

      {/* Complete Modal */}
      <CompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onComplete={handleComplete}
        title="Hoàn thành"
      />
    </div>
  );
};

export default TasksFromLeadershipCard;
