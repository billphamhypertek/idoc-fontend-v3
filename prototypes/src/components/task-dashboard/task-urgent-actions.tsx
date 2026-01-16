"use client";

import { ExclamationTriangleIcon, ArrowRightIcon, ClockIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UrgentTask {
    id: string;
    title: string;
    daysOverdue: number;
    assignedBy: string;
}

interface TaskUrgentActionsProps {
    className?: string;
}

// Mock data for urgent tasks
const urgentTasks: UrgentTask[] = [
    { id: "NV001", title: "Báo cáo tổng kết Q4/2025", daysOverdue: 3, assignedBy: "Trưởng ban" },
    { id: "NV002", title: "Review code module văn bản", daysOverdue: 2, assignedBy: "Phó Trưởng ban" },
    { id: "NV003", title: "Xây dựng API đồng bộ", daysOverdue: 1, assignedBy: "TT CNTT" },
    { id: "NV004", title: "Update tài liệu hướng dẫn", daysOverdue: 0, assignedBy: "Văn phòng" },
    { id: "NV005", title: "Tích hợp CKS tập trung", daysOverdue: 0, assignedBy: "Cục QLNS" },
];

export function TaskUrgentActions({ className }: TaskUrgentActionsProps) {
    const overdueCount = urgentTasks.filter(t => t.daysOverdue > 0).length;
    const todayCount = urgentTasks.filter(t => t.daysOverdue === 0).length;

    const getPriorityColor = (daysOverdue: number) => {
        if (daysOverdue >= 2) return "bg-red-100 border-red-200 text-red-700";
        if (daysOverdue === 1) return "bg-red-50 border-red-100 text-red-600";
        return "bg-amber-50 border-amber-100 text-amber-700";
    };

    const getPriorityDot = (daysOverdue: number) => {
        if (daysOverdue >= 2) return "bg-red-500";
        if (daysOverdue === 1) return "bg-red-400";
        return "bg-amber-500";
    };

    return (
        <div className={cn("bg-red-50/50 rounded-lg p-6 border-2 border-red-100 flex flex-col shadow-sm", className)}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center animate-pulse">
                    <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-red-900">
                        Cần xử lý ngay
                    </h3>
                    <p className="text-sm text-red-700/80 font-medium">
                        Vui lòng ưu tiên giải quyết
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-sm font-medium text-red-700">
                        Quá hạn: <span className="font-bold">{overdueCount}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-medium text-amber-700">
                        Hôm nay: <span className="font-bold">{todayCount}</span>
                    </span>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] scrollbar-thin">
                {urgentTasks.map((task) => (
                    <div
                        key={task.id}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                            getPriorityColor(task.daysOverdue)
                        )}
                    >
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getPriorityDot(task.daysOverdue))}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {task.title}
                            </p>
                            <p className="text-xs opacity-70">
                                Giao bởi: {task.assignedBy}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold flex-shrink-0">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {task.daysOverdue > 0
                                ? `${task.daysOverdue} ngày`
                                : "Hôm nay"
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <Link
                href="/tasks/assigned"
                className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
                <span>Xem tất cả</span>
                <ArrowRightIcon className="w-4 h-4" />
            </Link>
        </div>
    );
}
