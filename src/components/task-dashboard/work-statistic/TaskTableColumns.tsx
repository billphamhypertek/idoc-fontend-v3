"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Column } from "@/definitions/types/table.type";
import type {
  ListViewTask,
  ListViewOrg,
} from "@/definitions/types/list-view.type";
import { STATUS_CLASSNAME_MAP } from "@/definitions/types/list-view.type";
import {
  formatTaskDate,
  getInitials,
  getCollaborators,
} from "@/utils/dashboard.utils";
import { getAvatarColor } from "@/utils/color.utils";
import SelectCustom from "@/components/common/SelectCustom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import "@/styles/ListView.css";

export interface TaskTableColumn extends Column<ListViewTask> {
  noRowClick?: boolean;
}

const CollaboratorsCell = ({
  task,
  hoveredTask,
  setHoveredTask,
}: {
  task: ListViewTask;
  hoveredTask: ListViewTask | null;
  setHoveredTask: (task: ListViewTask | null) => void;
}) => {
  const [tooltipPosition, setTooltipPosition] = React.useState<
    "top" | "bottom"
  >("bottom");
  const collaborators = getCollaborators(task.combination);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setHoveredTask(task);

    const rect = event.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceAbove > spaceBelow && spaceBelow < 200) {
      setTooltipPosition("top");
    } else {
      setTooltipPosition("bottom");
    }
  };

  return (
    <div
      className="list-collaborators"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={(event) => {
        event.stopPropagation();
        setHoveredTask(null);
      }}
    >
      <div className="list-avatar-group">
        {collaborators.slice(0, 2).map((name) => (
          <div
            key={name}
            className="list-user-avatar small"
            style={{ backgroundColor: getAvatarColor(name) }}
          >
            {getInitials(name)}
          </div>
        ))}
        {collaborators.length > 2 && (
          <div className="list-user-avatar small more-count">
            +{collaborators.length - 2}
          </div>
        )}
      </div>
      {hoveredTask?.taskId === task.taskId && collaborators.length > 0 && (
        <div
          className={`list-tooltip-collaborators list-tooltip-${tooltipPosition}`}
        >
          {collaborators.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskTableColumnsProps {
  selectedOrg: ListViewOrg | null;
  selectedFilter: number;
  hoveredTask: ListViewTask | null;
  setHoveredTask: (task: ListViewTask | null) => void;
  handleLoadUserXlc: (orgId: number, status: number, taskId: number) => void;
  handleSelectProcessor: (
    orgId: number,
    status: number,
    taskId: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  handleProcessorBlur: (orgId: number, status: number, taskId: number) => void;
  getStatusText: (status: number) => string;
  getStatusColor: (status: number) => string;
}

export const useTaskTableColumns = ({
  selectedOrg,
  selectedFilter,
  hoveredTask,
  setHoveredTask,
  handleLoadUserXlc,
  handleSelectProcessor,
  handleProcessorBlur,
  getStatusText,
  getStatusColor,
}: TaskTableColumnsProps): TaskTableColumn[] => {
  return [
    {
      header: "TÊN CÔNG VIỆC",
      className: "text-left align-top text-sm",
      accessor: (task) => (
        <div className="list-task-name-wrapper" title={task.taskName}>
          <span
            className={cn(
              "status-dot",
              STATUS_CLASSNAME_MAP[task.status] || ""
            )}
          />
          <div>
            <div
              className="list-task-title list-text-ellipsis"
              title={task.taskName}
            >
              {task.taskName}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "GIAO VIỆC BỞI",
      accessor: (task) => task.assignerName,
      className: "text-center align-top text-sm",
    },
    {
      header: "XỬ LÝ CHÍNH",
      className: "align-top text-sm",
      noRowClick: true,
      accessor: (task) => {
        if (!selectedOrg) {
          return null;
        }

        return !task.isEditingProcessor ? (
          <div className="list-processor-wrapper">
            <div
              className="list-user-avatar small cursor-pointer"
              style={{ backgroundColor: getAvatarColor(task.execute || "") }}
              onClick={(event) => {
                event.stopPropagation();
                handleLoadUserXlc(
                  selectedOrg.handlerId,
                  selectedFilter,
                  task.taskId
                );
              }}
            >
              {getInitials(task.execute || "", 3)}
            </div>
            <span
              className="list-handler-name list-text-ellipsis"
              onClick={(event) => {
                event.stopPropagation();
                handleLoadUserXlc(
                  selectedOrg.handlerId,
                  selectedFilter,
                  task.taskId
                );
              }}
            >
              {task.execute}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 w-full"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <SelectCustom
              options={
                task.listUser?.map((user) => ({
                  id: String(user.id),
                  name: user.fullName,
                })) || []
              }
              value={
                task.selectedProcessor !== undefined
                  ? String(task.selectedProcessor)
                  : task.executeId !== undefined
                    ? String(task.executeId)
                    : ""
              }
              onChange={(value) => {
                if (typeof value === "string" && value) {
                  const numValue = Number(value);
                  if (!Number.isNaN(numValue)) {
                    // Create a synthetic event for handleSelectProcessor
                    const syntheticEvent = {
                      target: { value: String(numValue) },
                    } as React.ChangeEvent<HTMLSelectElement>;
                    handleSelectProcessor(
                      selectedOrg.handlerId,
                      selectedFilter,
                      task.taskId,
                      syntheticEvent
                    );
                  }
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
                handleProcessorBlur(
                  selectedOrg.handlerId,
                  selectedFilter,
                  task.taskId
                );
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      header: "NGƯỜI PHỐI HỢP",
      className: "align-top text-sm",
      noRowClick: true,
      accessor: (task) => (
        <CollaboratorsCell
          task={task}
          hoveredTask={hoveredTask}
          setHoveredTask={setHoveredTask}
        />
      ),
    },
    {
      header: "THỜI GIAN BẮT ĐẦU",
      accessor: (task) =>
        task.startDate ? formatTaskDate(task.startDate) : "",
      className: "align-top text-sm whitespace-nowrap",
    },
    {
      header: "THỜI GIAN KẾT THÚC",
      className: "align-top text-sm whitespace-nowrap",
      accessor: (task) => (
        <span className={cn(task.overdue && "list-overdue-date")}>
          {task.endDate ? formatTaskDate(task.endDate) : ""}
        </span>
      ),
    },
    {
      header: "TRẠNG THÁI",
      className: "align-top text-sm",
      accessor: (task) =>
        !task.overdue ? (
          <span
            className={cn(
              "list-status-badge",
              STATUS_CLASSNAME_MAP[task.status] || ""
            )}
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {getStatusText(task.status)}
          </span>
        ) : (
          <span className="list-status-badge overdue">Quá hạn</span>
        ),
    },
  ];
};
