"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, House, List } from "lucide-react";
import type {
  ListViewOrg,
  ListViewTask,
  DashboardFilter,
} from "@/definitions/types/list-view.type";
import { DASHBOARD_COLORS } from "@/utils/color.utils";
import { useTaskTableColumns } from "./TaskTableColumns";
import "@/styles/ListView.css";

interface DashboardViewProps {
  loading: boolean;
  orgs: ListViewOrg[];
  selectedOrg: ListViewOrg | null;
  selectedDepartmentId: number | null;
  selectedFilter: DashboardFilter;
  filteredTasks: ListViewTask[];
  hoveredTask: ListViewTask | null;
  setSelectedDepartmentId: (id: number) => void;
  setHoveredTask: (task: ListViewTask | null) => void;
  handleViewTaskByOrg: (org: ListViewOrg) => void;
  handleViewTaskDetail: (taskId: number) => void;
  handleFilterTasksDashboard: (filter: DashboardFilter) => void;
  handleLoadUserXlc: (orgId: number, status: number, taskId: number) => void;
  handleSelectProcessor: (
    orgId: number,
    status: number,
    taskId: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  handleProcessorBlur: (orgId: number, status: number, taskId: number) => void;
  getTaskCountByStatus: (status: number) => number;
  getStatusProcessText: (status: number) => string;
  getStatusColorDashboard: (status: number) => string;
  getStatusText: (status: number) => string;
  getStatusColor: (status: number) => string;
  isFilterActiveDashboard: (status: DashboardFilter) => boolean;
}

export default function DashboardView({
  loading,
  orgs,
  selectedOrg,
  selectedDepartmentId,
  selectedFilter,
  filteredTasks,
  hoveredTask,
  setSelectedDepartmentId,
  setHoveredTask,
  handleViewTaskByOrg,
  handleViewTaskDetail,
  handleFilterTasksDashboard,
  handleLoadUserXlc,
  handleSelectProcessor,
  handleProcessorBlur,
  getTaskCountByStatus,
  getStatusProcessText,
  getStatusColorDashboard,
  getStatusText,
  getStatusColor,
  isFilterActiveDashboard,
}: DashboardViewProps) {
  const taskColumns = useTaskTableColumns({
    selectedOrg,
    selectedFilter,
    hoveredTask,
    setHoveredTask,
    handleLoadUserXlc,
    handleSelectProcessor,
    handleProcessorBlur,
    getStatusText,
    getStatusColor,
  });

  if (!loading && (!orgs || orgs.length === 0)) {
    return (
      <div className="dept-task-view">
        <div className="empty-data">Không có dữ liệu phòng để hiển thị.</div>
      </div>
    );
  }

  if (!selectedOrg) {
    return null;
  }

  const countTasks = selectedOrg?.count ?? 0;

  return (
    <div className="dept-task-view">
      {orgs && orgs.length > 0 ? (
        <div className="layout-container">
          <div className="departments-sidebar">
            {orgs.map((org) => (
              <div
                key={org.handlerId}
                className={cn(
                  "department-item",
                  selectedDepartmentId === org.handlerId && "selected"
                )}
                onClick={() => setSelectedDepartmentId(org.handlerId)}
              >
                <div className="dept-header">
                  <div className="dept-icon">
                    <House className="w-5 h-5" />
                  </div>
                  <div className="dept-info">
                    <span className="dept-name">{org.handlerName}</span>
                    <span className="task-count">{org.count ?? 0} việc</span>
                    <span className="task-progress">{org.progress ?? 0}%</span>
                    <span
                      className="task-details"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleViewTaskByOrg(org);
                      }}
                    >
                      <List className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tasks-content">
            <div className="content-header">
              <div className="header-left">
                <FileText className="w-5 h-5 text-[#7c3aed]" />
                <h2>Danh sách công việc</h2>
                <span className="total-count">{countTasks} việc</span>
              </div>
            </div>

            <div className="filter-tabs">
              {[0, 2, 1].map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "filter-tab",
                    isFilterActiveDashboard(status as DashboardFilter) &&
                      "active"
                  )}
                  onClick={() =>
                    handleFilterTasksDashboard(status as DashboardFilter)
                  }
                >
                  <span
                    className="dot"
                    style={{ backgroundColor: getStatusColorDashboard(status) }}
                  />
                  <span>{getStatusProcessText(status)}</span>
                  <span className="count">{getTaskCountByStatus(status)}</span>
                </Button>
              ))}
            </div>

            <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0">
              <Table<ListViewTask>
                columns={taskColumns}
                dataSource={filteredTasks}
                showPagination={false}
                loading={loading}
                onRowClick={(task) => handleViewTaskDetail(task.taskId)}
                rowClassName={() => ""}
                cellClassName={() => "text-center align-top"}
                emptyText="Không có công việc để hiển thị."
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
