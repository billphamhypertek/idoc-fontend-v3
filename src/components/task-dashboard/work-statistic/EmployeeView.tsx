"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Users } from "lucide-react";
import type {
  ListViewEmployee,
  ListViewTask,
  EmployeeFilter,
} from "@/definitions/types/list-view.type";
import { STATUS_CLASSNAME_MAP } from "@/definitions/types/list-view.type";
import { getInitials } from "@/utils/dashboard.utils";
import { getAvatarColor } from "@/utils/color.utils";
import "@/styles/ListView.css";

interface EmployeeViewProps {
  loading: boolean;
  employees: ListViewEmployee[];
  getVisibleTasks: (employee: ListViewEmployee) => ListViewTask[];
  shouldShowMoreCard: (employee: ListViewEmployee) => boolean;
  getRemainingCount: (employee: ListViewEmployee) => number;
  handleViewTaskDetail: (taskId: number) => void;
  handleFilterTasks: (
    filter: EmployeeFilter,
    handlerId: number | string
  ) => void;
  handleToggleEmployeeExpanded: (handlerId: number | string) => void;
  getStatusText: (status: number) => string;
  getStatusColor: (status: number) => string;
}

export default function EmployeeView({
  loading,
  employees,
  getVisibleTasks,
  shouldShowMoreCard,
  getRemainingCount,
  handleViewTaskDetail,
  handleFilterTasks,
  handleToggleEmployeeExpanded,
  getStatusText,
  getStatusColor,
}: EmployeeViewProps) {
  if (!employees || employees.length === 0) {
    return (
      <div className="empty-data">Không có dữ liệu nhân viên để hiển thị.</div>
    );
  }

  return (
    <div className="org-list">
      <div className="cv-list">
        <div className="header">
          <div className="header-left">
            <Users className="icon w-6 h-6" />
            <h1>Danh sách nhân viên và công việc</h1>
            <span className="total-count">{employees.length} người</span>
          </div>
        </div>

        <div className="employee-list">
          {employees.map((employee) => (
            <div key={employee.handlerId} className="employee-card">
              <div className="task-grid">
                <div className="task-card employee-summary">
                  <div className="employee-info">
                    <div
                      className="avatar"
                      style={{
                        backgroundColor: getAvatarColor(
                          employee.handlerName || ""
                        ),
                      }}
                    >
                      {getInitials(employee.handlerName || "", 3)}
                    </div>
                    <div className="employee-header">
                      <div className="employee-details">
                        <h2>{employee.handlerName}</h2>
                        <p className="department">{employee.orgName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="stats">
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "stat-button total",
                        employee.filter === "all" && "active"
                      )}
                      onClick={() =>
                        handleFilterTasks("all", employee.handlerId)
                      }
                    >
                      <span className="stat-label">Tổng số việc</span>
                      <span className="stat-value">{employee.count ?? 0}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "stat-button pending-button",
                        employee.filter === "progress" && "active"
                      )}
                      onClick={() =>
                        handleFilterTasks("progress", employee.handlerId)
                      }
                    >
                      <span className="stat-label">Đang thực hiện</span>
                      <span className="stat-value">
                        {employee.inProgressCount ?? 0}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "stat-button overdue-button",
                        employee.filter === "overdue" && "active"
                      )}
                      onClick={() =>
                        handleFilterTasks("overdue", employee.handlerId)
                      }
                    >
                      <span className="stat-label">Quá hạn</span>
                      <span className="stat-value">
                        {employee.overdueCount ?? 0}
                      </span>
                    </Button>
                  </div>
                </div>

                {getVisibleTasks(employee).map((task) => (
                  <div key={task.taskId} className="task-card">
                    <h3
                      className="task-title cursor-pointer"
                      title={task.taskName}
                      onClick={() => handleViewTaskDetail(task.taskId)}
                    >
                      {task.taskName}
                    </h3>
                    <div className="task-details">
                      <div className="task-field">
                        <span className="field-label">Giao bởi: </span>
                        <span className="field-value" title={task.assignerName}>
                          {task.assignerName}
                        </span>
                      </div>
                      <div className="task-field">
                        <span className="field-label">Xử lý chính: </span>
                        <span
                          className="field-value approved"
                          title={task.execute}
                        >
                          {task.execute}
                        </span>
                      </div>
                      <div className="task-field">
                        <span className="field-label">Phối hợp: </span>
                        <span className="field-value" title={task.combination}>
                          {task.combination}
                        </span>
                      </div>
                    </div>

                    {!task.overdue ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "status-button",
                          STATUS_CLASSNAME_MAP[task.status] || ""
                        )}
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {getStatusText(task.status)}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        className="status-button overdue"
                      >
                        Quá hạn
                      </Button>
                    )}
                  </div>
                ))}

                {shouldShowMoreCard(employee) && (
                  <div
                    className="task-card more-card"
                    onClick={() =>
                      handleToggleEmployeeExpanded(employee.handlerId)
                    }
                  >
                    <div className="more-content">
                      {getRemainingCount(employee) > 0 ? (
                        <>
                          <div className="more-number">
                            +{getRemainingCount(employee)}
                          </div>
                          <div className="more-text">việc nữa</div>
                        </>
                      ) : (
                        <div className="more-number">Thu gọn</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
