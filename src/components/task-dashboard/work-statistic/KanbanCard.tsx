"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, Calendar, Clock, X, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectCustom from "@/components/common/SelectCustom";
import {
  formatTaskDate,
  getColorComplexity as getColorComplexityUtil,
} from "@/utils/dashboard.utils";
import "@/styles/KanbanView.css";
import { useState } from "react";

interface KanbanCardProps {
  columnId: string;
  tasks: any[];
  userId: number;
  status: number;
  type: number;
  editingProcessor: {
    taskId: number;
    userId: number;
    status: number;
    taskIndex: number;
    listUser: any[];
  } | null;
  onUpdateImportant: (
    task: any,
    userId: number,
    status: number,
    taskIndex: number
  ) => void;
  onViewDetail: (taskId: number, task: any) => void;
  onLoadUserXlc: (
    task: any,
    userId: number,
    status: number,
    taskIndex: number
  ) => void;
  onUpdateProcessor: (
    task: any,
    newUserId: number,
    userId: number,
    status: number,
    taskIndex: number
  ) => void;
  onCancelEdit: () => void;
  getDaysUntilDue: (endDate: number | string) => number;
}

function TaskCard({
  task,
  userId,
  status,
  type,
  taskIndex,
  editingProcessor,
  onUpdateImportant,
  onViewDetail,
  onLoadUserXlc,
  onUpdateProcessor,
  onCancelEdit,
  getDaysUntilDue,
}: Omit<KanbanCardProps, "columnId" | "tasks"> & {
  task: any;
  taskIndex: number;
}) {
  const [viewInfo, setViewInfo] = useState(false);
  const uniqueTaskId = `task-${userId}-${status}-${task.taskId}-${taskIndex}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: uniqueTaskId,
    data: {
      task,
      userId,
      status,
      type,
      taskIndex,
      uniqueId: uniqueTaskId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isEditing =
    editingProcessor?.taskId === task.taskId &&
    editingProcessor?.userId === userId &&
    editingProcessor?.status === status &&
    editingProcessor?.taskIndex === taskIndex;
  const daysUntil = getDaysUntilDue(task.endDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      data-task-id={task.taskId}
      data-type={type}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col gap-2">
        <div className="bg-[#f5f5f5] rounded-sm w-fit py-1 px-2 text-[#999]">
          <span>#{task.taskId}</span>
        </div>
        <div className="flex justify-between">
          <div className="task-header">
            {task.important ? (
              <Star
                className="star-icon cursor-pointer fill-yellow-400 text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateImportant(task, userId, status, taskIndex);
                }}
              />
            ) : (
              <Star
                className="star-icon-outline cursor-pointer text-gray-400 hover:text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateImportant(task, userId, status, taskIndex);
                }}
              />
            )}
            <h4
              className="task-title limit-2-lines cursor-pointer max-w-[200px]"
              title={task.taskName}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(task.taskId, task);
              }}
            >
              {task.taskName}
            </h4>
          </div>
          <EllipsisVertical
            className="w-5 h-5 font-bold cursor-pointer"
            onClick={() => setViewInfo(!viewInfo)}
          />
        </div>
      </div>

      {viewInfo && (
        <>
          {task.overdue && (
            <div className="task-badge">
              <Clock className="w-4 h-4" />
              <span>Quá hạn</span>
            </div>
          )}

          {!task.overdue && daysUntil > 0 && (
            <div className="task-untilDue">
              <Clock className="w-4 h-4" style={{ fontSize: "15px" }} />
              <span className="untilTitle">Hạn: </span>
              {daysUntil} ngày
            </div>
          )}

          <div className="task-info-row w-full">
            <span className="info-label">Xử lý chính:</span>
            <div className="processor-info w-full">
              {isEditing && editingProcessor ? (
                <div
                  className="flex items-center gap-2 w-full"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <SelectCustom
                    options={editingProcessor.listUser.map((user) => ({
                      id: String(user.id),
                      name: user.fullName,
                    }))}
                    value={String(task.executeId)}
                    onChange={(value) => {
                      if (typeof value === "string") {
                        onUpdateProcessor(
                          task,
                          Number(value),
                          userId,
                          status,
                          taskIndex
                        );
                        setTimeout(() => {
                          onCancelEdit();
                        }, 100);
                      }
                    }}
                    className="flex-1 h-8 text-sm"
                    style={{ width: "100%" }}
                    placeholder="Chọn người xử lý"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onCancelEdit();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <span
                  className="processor-name cursor-pointer hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onLoadUserXlc(task, userId, status, taskIndex);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span>{task.execute}</span>
                </span>
              )}
            </div>
          </div>

          {task.combination && (
            <div className="task-info-row">
              <span className="info-label">Phối hợp:</span>
              <div className="processor-info limit-2-lines">
                <span className="processor-name" title={task.combination}>
                  <span>{task.combination}</span>
                </span>
              </div>
            </div>
          )}

          <div className="task-info-row">
            <span className="info-label">Giao bởi:</span>
            <span className="assignor-name">{task.assignerName}</span>
          </div>

          <div className="task-info-row date-range">
            <Calendar className="w-4 h-4" />
            <span>
              {formatTaskDate(task.startDate)} - {formatTaskDate(task.endDate)}
            </span>
          </div>

          {task.progress != null && task.progress > 0 && (
            <div className="progress-section">
              <div className="progress-label">
                <span>Tiến độ</span>
                <span>{task.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {task.complexityName && (
            <div className="task-date text-right">
              <span
                className="mucdopt"
                style={{
                  backgroundColor: getColorComplexityUtil(task.complexityName),
                }}
              >
                {task.complexityName}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function KanbanCard(props: KanbanCardProps) {
  const { columnId, tasks, userId, status, type } = props;

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: {
      userId,
      status,
      type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`tasks-list ${isOver ? "tasks-list-over" : ""}`}
      data-status={status}
      data-user-id={userId}
    >
      {tasks.map((task, index) => (
        <TaskCard
          key={`${task.taskId}-${userId}-${status}-${index}`}
          task={task}
          userId={userId}
          status={status}
          type={type}
          taskIndex={index}
          editingProcessor={props.editingProcessor}
          onUpdateImportant={props.onUpdateImportant}
          onViewDetail={props.onViewDetail}
          onLoadUserXlc={props.onLoadUserXlc}
          onUpdateProcessor={props.onUpdateProcessor}
          onCancelEdit={props.onCancelEdit}
          getDaysUntilDue={props.getDaysUntilDue}
        />
      ))}
    </div>
  );
}
