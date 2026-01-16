"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardIcon, ListBulletIcon, StarFilledIcon, StarIcon, PersonIcon } from "@radix-ui/react-icons";
import { Clock, Calendar } from "lucide-react";

interface KanbanTask {
    id: string;
    title: string;
    assignedBy: string;
    assignee: string;
    daysUntilDue: number;
    isImportant: boolean;
    progress: number;
}

interface KanbanColumn {
    id: string;
    status: number;
    title: string;
    color: string;
    tasks: KanbanTask[];
}

interface TaskDistributionProps {
    className?: string;
}

// Mock data for Kanban
const kanbanColumns: KanbanColumn[] = [
    {
        id: "new",
        status: 0,
        title: "Mới giao",
        color: "#3b82f6",
        tasks: [
            { id: "T001", title: "Xây dựng API đồng bộ dữ liệu", assignedBy: "Trưởng ban", assignee: "Nguyễn Văn A", daysUntilDue: 5, isImportant: true, progress: 0 },
            { id: "T002", title: "Review tài liệu kỹ thuật", assignedBy: "Phó ban", assignee: "Trần Thị B", daysUntilDue: 3, isImportant: false, progress: 0 },
            { id: "T003", title: "Cập nhật quy trình xử lý VB", assignedBy: "Văn phòng", assignee: "Lê Văn C", daysUntilDue: 7, isImportant: false, progress: 0 },
        ],
    },
    {
        id: "in-progress",
        status: 1,
        title: "Đang xử lý",
        color: "#f59e0b",
        tasks: [
            { id: "T004", title: "Triển khai module báo cáo", assignedBy: "TT CNTT", assignee: "Phạm Thị D", daysUntilDue: 2, isImportant: true, progress: 65 },
            { id: "T005", title: "Tích hợp CKS tập trung", assignedBy: "Cục QLNS", assignee: "Hoàng Văn E", daysUntilDue: 4, isImportant: false, progress: 40 },
        ],
    },
    {
        id: "pending-review",
        status: 3,
        title: "Chờ duyệt",
        color: "#8b5cf6",
        tasks: [
            { id: "T006", title: "Báo cáo tổng kết Q4", assignedBy: "Trưởng ban", assignee: "Nguyễn Văn A", daysUntilDue: 1, isImportant: true, progress: 100 },
        ],
    },
    {
        id: "completed",
        status: 2,
        title: "Hoàn thành",
        color: "#22c55e",
        tasks: [
            { id: "T007", title: "Cập nhật giao diện Dashboard", assignedBy: "TT CNTT", assignee: "Trần Thị B", daysUntilDue: 0, isImportant: false, progress: 100 },
            { id: "T008", title: "Fix bug module văn bản đến", assignedBy: "Văn phòng", assignee: "Lê Văn C", daysUntilDue: 0, isImportant: false, progress: 100 },
            { id: "T009", title: "Training nhân sự mới", assignedBy: "Vụ TCCB", assignee: "Phạm Thị D", daysUntilDue: 0, isImportant: false, progress: 100 },
        ],
    },
];

function TaskCard({ task }: { task: KanbanTask }) {
    const getDueColor = (days: number) => {
        if (days <= 0) return "text-green-600";
        if (days <= 2) return "text-red-600";
        if (days <= 4) return "text-amber-600";
        return "text-[hsl(var(--v3-muted-foreground))]";
    };

    return (
        <div className="v3-card p-3 hover:shadow-md transition-all cursor-pointer group">
            {/* Header with star */}
            <div className="flex items-start gap-2 mb-2">
                {task.isImportant ? (
                    <StarFilledIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                    <StarIcon className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5 group-hover:text-gray-400" />
                )}
                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 leading-tight">
                    {task.title}
                </h4>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center">
                    <PersonIcon className="w-3 h-3 text-[hsl(var(--v3-primary))]" />
                </div>
                <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                    {task.assignee}
                </span>
            </div>

            {/* Progress bar (if in progress) */}
            {task.progress > 0 && task.progress < 100 && (
                <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[hsl(var(--v3-muted-foreground))]">Tiến độ</span>
                        <span className="font-medium text-[hsl(var(--v3-card-foreground))]">{task.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[hsl(var(--v3-primary))] rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Due date */}
            <div className={cn("flex items-center gap-1.5 text-xs", getDueColor(task.daysUntilDue))}>
                <Clock className="w-3.5 h-3.5" />
                {task.daysUntilDue === 0 ? (
                    <span className="font-medium">Đã hoàn thành</span>
                ) : (
                    <span>Còn {task.daysUntilDue} ngày</span>
                )}
            </div>
        </div>
    );
}

export function TaskDistribution({ className }: TaskDistributionProps) {
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

    return (
        <div className={cn("v3-card overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between bg-[hsl(var(--v3-muted))]/50 px-5 py-4 border-b border-[hsl(var(--v3-border))]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center">
                        <DashboardIcon className="w-5 h-5 text-[hsl(var(--v3-primary))]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[hsl(var(--v3-card-foreground))]">
                            Phân bố công việc
                        </h3>
                        <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                            Tổng: {kanbanColumns.reduce((sum, col) => sum + col.tasks.length, 0)} công việc
                        </p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[hsl(var(--v3-muted))] rounded-lg">
                    <button
                        onClick={() => setViewMode("kanban")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                            viewMode === "kanban"
                                ? "bg-white text-[hsl(var(--v3-card-foreground))] shadow-sm"
                                : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                        )}
                    >
                        <DashboardIcon className="w-4 h-4" />
                        Kanban
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                            viewMode === "list"
                                ? "bg-white text-[hsl(var(--v3-card-foreground))] shadow-sm"
                                : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                        )}
                    >
                        <ListBulletIcon className="w-4 h-4" />
                        Danh sách
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="p-4 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                    {kanbanColumns.map((column) => (
                        <div key={column.id} className="w-[260px] flex-shrink-0">
                            {/* Column Header */}
                            <div
                                className="flex items-center justify-between mb-3 pb-2"
                                style={{ borderLeft: `3px solid ${column.color}`, paddingLeft: "12px" }}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: column.color }}
                                    />
                                    <span className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">
                                        {column.title}
                                    </span>
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]">
                                    {column.tasks.length}
                                </span>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
                                {column.tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                                {column.tasks.length === 0 && (
                                    <div className="text-center py-8 text-sm text-[hsl(var(--v3-muted-foreground))]">
                                        Không có công việc
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
