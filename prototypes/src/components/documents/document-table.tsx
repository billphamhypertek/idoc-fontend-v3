"use client";

import { useState } from "react";
import {
    StarIcon,
    StarFilledIcon,
    FileIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckboxIcon,
} from "@radix-ui/react-icons";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, DocumentStatus } from "./status-badge";

export interface DocumentItem {
    id: string;
    number: string;
    title: string;
    from?: string;
    to?: string;
    date: string;
    creator?: string;
    docType?: string;
    status: DocumentStatus;
    priority?: "urgent" | "high" | "normal";
    deadline?: string;
    isImportant?: boolean;
    hasAttachment?: boolean;
}

interface DocumentTableProps {
    data: DocumentItem[];
    columns?: string[];
    onRowClick?: (item: DocumentItem) => void;
    onStarToggle?: (item: DocumentItem) => void;
    showCheckbox?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    className?: string;
}

const itemsPerPageOptions = [10, 20, 50, 100];

export function DocumentTable({
    data,
    onRowClick,
    onStarToggle,
    showCheckbox = true,
    selectedIds = [],
    onSelectionChange,
    className,
}: DocumentTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sorting
    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const aVal = a[key as keyof DocumentItem] || "";
        const bVal = b[key as keyof DocumentItem] || "";
        const comparison = String(aVal).localeCompare(String(bVal));
        return direction === "asc" ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return prev.direction === "asc" ? { key, direction: "desc" } : null;
            }
            return { key, direction: "asc" };
        });
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

    const SortIcon = ({ field }: { field: string }) => {
        if (sortConfig?.key !== field) return null;
        return sortConfig.direction === "asc" ? (
            <ChevronUpIcon className="w-4 h-4 text-[hsl(var(--v3-primary))]" />
        ) : (
            <ChevronDownIcon className="w-4 h-4 text-[hsl(var(--v3-primary))]" />
        );
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "urgent":
                return "text-red-600";
            case "high":
                return "text-amber-600";
            default:
                return "";
        }
    };

    return (
        <div className={cn("v3-card overflow-hidden", className)}>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white border-b border-[hsl(var(--v3-border))]">
                            {/* Checkbox */}
                            {showCheckbox && (
                                <th className="w-12 px-4 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={paginatedData.length > 0 && paginatedData.every((item) => selectedIds.includes(item.id))}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[hsl(var(--v3-primary))] focus:ring-[hsl(var(--v3-primary))]"
                                    />
                                </th>
                            )}
                            {/* STT */}
                            <th className="w-14 px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                STT
                            </th>
                            {/* Star */}
                            <th className="w-12 px-2 py-3 text-center">
                                <button
                                    onClick={() => handleSort("isImportant")}
                                    className="inline-flex items-center gap-1"
                                >
                                    <StarIcon className="w-4 h-4 text-gray-400" />
                                    <SortIcon field="isImportant" />
                                </button>
                            </th>
                            {/* Số/Ký hiệu */}
                            <th className="min-w-[100px] px-4 py-3.5 text-left">
                                <button
                                    onClick={() => handleSort("number")}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]"
                                >
                                    Số/Ký hiệu
                                    <SortIcon field="number" />
                                </button>
                            </th>
                            {/* Loại VB */}
                            <th className="min-w-[100px] px-4 py-3.5 text-left">
                                <button
                                    onClick={() => handleSort("docType")}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]"
                                >
                                    Loại VB
                                    <SortIcon field="docType" />
                                </button>
                            </th>
                            {/* Người tạo */}
                            <th className="min-w-[120px] px-4 py-3.5 text-left">
                                <button
                                    onClick={() => handleSort("creator")}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]"
                                >
                                    Người tạo
                                    <SortIcon field="creator" />
                                </button>
                            </th>
                            {/* Ngày BH */}
                            <th className="min-w-[100px] px-4 py-3.5 text-left">
                                <button
                                    onClick={() => handleSort("date")}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]"
                                >
                                    Ngày BH
                                    <SortIcon field="date" />
                                </button>
                            </th>
                            {/* Trích yếu */}
                            <th className="min-w-[300px] px-4 py-3.5 text-left">
                                <button
                                    onClick={() => handleSort("title")}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]"
                                >
                                    Trích yếu
                                    <SortIcon field="title" />
                                </button>
                            </th>
                            {/* Trạng thái */}
                            <th className="min-w-[120px] px-4 py-3.5 text-center">
                                <button
                                    onClick={() => handleSort("status")}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider hover:text-[hsl(var(--v3-primary))]"
                                >
                                    Trạng thái
                                    <SortIcon field="status" />
                                </button>
                            </th>
                            {/* File */}
                            <th className="w-16 px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                File
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
                                    getPriorityColor(item.priority)
                                )}
                            >
                                {/* Checkbox */}
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
                                {/* STT */}
                                <td className="px-4 py-3 text-center text-sm text-[hsl(var(--v3-muted-foreground))]">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                {/* Star */}
                                <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => onStarToggle?.(item)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        {item.isImportant ? (
                                            <StarFilledIcon className="w-4 h-4 text-amber-400" />
                                        ) : (
                                            <StarIcon className="w-4 h-4 text-[hsl(var(--v3-border))] hover:text-amber-400" />
                                        )}
                                    </button>
                                </td>
                                {/* Số/Ký hiệu */}
                                <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{item.number}</td>
                                {/* Loại VB */}
                                <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">{item.docType || "Công văn"}</td>
                                {/* Người tạo */}
                                <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">{item.creator || "-"}</td>
                                {/* Ngày BH */}
                                <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">{item.date}</td>
                                {/* Trích yếu */}
                                <td className="px-4 py-3">
                                    <p className="text-sm text-[hsl(var(--v3-card-foreground))] line-clamp-2" title={item.title}>
                                        {item.title}
                                    </p>
                                </td>
                                {/* Trạng thái */}
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={item.status} />
                                </td>
                                {/* File */}
                                <td className="px-4 py-3 text-center">
                                    {item.hasAttachment && (
                                        <Paperclip className="w-4 h-4 text-blue-600 mx-auto" />
                                    )}
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-12 text-center text-[hsl(var(--v3-muted-foreground))]">
                                    <FileIcon className="w-12 h-12 mx-auto text-[hsl(var(--v3-border))] mb-3" />
                                    <p className="text-sm">Không có dữ liệu</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--v3-border))] bg-white">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--v3-muted-foreground))]">
                    <span>Hiển thị</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="h-8 px-2 rounded border border-[hsl(var(--v3-border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span>/ {data.length} kết quả</span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "min-w-[32px] h-8 px-2 rounded text-sm font-medium",
                                    currentPage === page
                                        ? "bg-[hsl(var(--v3-primary))] text-white"
                                        : "hover:bg-gray-200"
                                )}
                            >
                                {page}
                            </button>
                        );
                    })}
                    {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div >
    );
}
