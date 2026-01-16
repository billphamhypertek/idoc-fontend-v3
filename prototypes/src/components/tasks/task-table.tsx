"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TaskItem } from "@/data/tasks-data";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CaretSortIcon,
    CaretUpIcon,
    CaretDownIcon,
} from "@radix-ui/react-icons";
import { Clock, CheckCircle2, AlertCircle, Circle, XCircle } from "lucide-react";

interface TaskTableProps {
    data: TaskItem[];
    showCheckbox?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    onRowClick?: (item: TaskItem) => void;
    className?: string;
}

function StatusBadge({ status }: { status: TaskItem["status"] }) {
    const config = {
        pending: { label: "Chờ xử lý", class: "bg-gray-100 text-gray-700", icon: Circle },
        "in-progress": { label: "Đang thực hiện", class: "bg-blue-100 text-blue-700", icon: Clock },
        completed: { label: "Hoàn thành", class: "bg-green-100 text-green-700", icon: CheckCircle2 },
        overdue: { label: "Quá hạn", class: "bg-red-100 text-red-700", icon: AlertCircle },
        cancelled: { label: "Đã hủy", class: "bg-gray-100 text-gray-500", icon: XCircle },
    };
    const { label, class: className, icon: Icon } = config[status];
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", className)}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: TaskItem["priority"] }) {
    const config = {
        low: { label: "Thấp", class: "bg-gray-100 text-gray-600" },
        normal: { label: "Bình thường", class: "bg-blue-100 text-blue-600" },
        high: { label: "Cao", class: "bg-orange-100 text-orange-600" },
        urgent: { label: "Khẩn cấp", class: "bg-red-100 text-red-600" },
    };
    const { label, class: className } = config[priority];
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", className)}>
            {label}
        </span>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all",
                        value === 100 ? "bg-green-500" : value >= 50 ? "bg-blue-500" : "bg-amber-500"
                    )}
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="text-xs font-medium text-[hsl(var(--v3-muted-foreground))] w-8">{value}%</span>
        </div>
    );
}

export function TaskTable({
    data,
    showCheckbox = true,
    selectedIds = [],
    onSelectionChange,
    onRowClick,
    className,
}: TaskTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const itemsPerPage = 10;

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <CaretSortIcon className="w-4 h-4 text-gray-400" />;
        return sortDirection === "asc"
            ? <CaretUpIcon className="w-4 h-4 text-[hsl(var(--v3-primary))]" />
            : <CaretDownIcon className="w-4 h-4 text-[hsl(var(--v3-primary))]" />;
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange?.(paginatedData.map((item) => item.id));
        } else {
            onSelectionChange?.([]);
        }
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        if (checked) {
            onSelectionChange?.([...selectedIds, id]);
        } else {
            onSelectionChange?.(selectedIds.filter((i) => i !== id));
        }
    };

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className={cn("v3-card overflow-hidden", className)}>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white border-b border-[hsl(var(--v3-border))]">
                            {showCheckbox && (
                                <th className="w-12 px-4 py-3.5 text-center">
                                    <input
                                        type="checkbox"
                                        checked={paginatedData.length > 0 && paginatedData.every((item) => selectedIds.includes(item.id))}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[hsl(var(--v3-primary))] focus:ring-[hsl(var(--v3-primary))]"
                                    />
                                </th>
                            )}
                            <th className="w-14 px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                STT
                            </th>
                            <th className="min-w-[300px] px-4 py-3.5 text-left">
                                <button onClick={() => handleSort("title")} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]">
                                    Nội dung nhiệm vụ
                                    <SortIcon field="title" />
                                </button>
                            </th>
                            <th className="min-w-[120px] px-4 py-3.5 text-left">
                                <button onClick={() => handleSort("assigner")} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]">
                                    Người giao
                                    <SortIcon field="assigner" />
                                </button>
                            </th>
                            <th className="min-w-[100px] px-4 py-3.5 text-center">
                                <button onClick={() => handleSort("dueDate")} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]">
                                    Hạn xử lý
                                    <SortIcon field="dueDate" />
                                </button>
                            </th>
                            <th className="min-w-[100px] px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                Tiến độ
                            </th>
                            <th className="min-w-[100px] px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                Độ ưu tiên
                            </th>
                            <th className="min-w-[120px] px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                Trạng thái
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--v3-border))]">
                        {paginatedData.map((item, index) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    "hover:bg-[hsl(var(--v3-muted))]/50 cursor-pointer transition-colors",
                                    selectedIds.includes(item.id) && "bg-[hsl(var(--v3-primary))]/5",
                                    item.status === "overdue" && "bg-red-50/50"
                                )}
                            >
                                {showCheckbox && (
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-[hsl(var(--v3-primary))] focus:ring-[hsl(var(--v3-primary))]"
                                        />
                                    </td>
                                )}
                                <td className="px-4 py-3 text-center text-sm text-[hsl(var(--v3-muted-foreground))]">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-1">{item.title}</p>
                                        {item.description && (
                                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))] line-clamp-1 mt-0.5">{item.description}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">
                                    {item.assigner || item.assignee || "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-[hsl(var(--v3-muted-foreground))]">
                                    {item.dueDate}
                                </td>
                                <td className="px-4 py-3">
                                    <ProgressBar value={item.progress || 0} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <PriorityBadge priority={item.priority} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={item.status} />
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-[hsl(var(--v3-muted-foreground))]">
                                    <Clock className="w-12 h-12 mx-auto text-[hsl(var(--v3-border))] mb-3" />
                                    <p className="text-sm">Không có nhiệm vụ</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[hsl(var(--v3-border))]">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--v3-muted-foreground))]">
                    <span>Hiển thị</span>
                    <select className="h-8 px-2 rounded border border-[hsl(var(--v3-border))] bg-white text-sm">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>
                    <span>/ {data.length} kết quả</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded hover:bg-[hsl(var(--v3-muted))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                                "w-8 h-8 rounded text-sm font-medium transition-colors",
                                currentPage === page
                                    ? "bg-[hsl(var(--v3-primary))] text-white"
                                    : "hover:bg-[hsl(var(--v3-muted))]"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded hover:bg-[hsl(var(--v3-muted))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
