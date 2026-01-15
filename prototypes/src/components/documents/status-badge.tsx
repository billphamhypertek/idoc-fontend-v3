"use client";

import { cn } from "@/lib/utils";

export type DocumentStatus =
    | "pending"
    | "processing"
    | "done"
    | "issued"
    | "returned"
    | "draft"
    | "reviewing"
    | "approved"
    | "rejected";

interface StatusBadgeProps {
    status: DocumentStatus;
    label?: string;
    className?: string;
}

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
    pending: {
        label: "Chờ xử lý",
        className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    processing: {
        label: "Đang xử lý",
        className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    done: {
        label: "Đã xử lý",
        className: "bg-green-100 text-green-700 border-green-200",
    },
    issued: {
        label: "Đã ban hành",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    returned: {
        label: "Bị trả lại",
        className: "bg-red-100 text-red-700 border-red-200",
    },
    draft: {
        label: "Dự thảo",
        className: "bg-gray-100 text-gray-700 border-gray-200",
    },
    reviewing: {
        label: "Đang duyệt",
        className: "bg-purple-100 text-purple-700 border-purple-200",
    },
    approved: {
        label: "Đã duyệt",
        className: "bg-teal-100 text-teal-700 border-teal-200",
    },
    rejected: {
        label: "Từ chối",
        className: "bg-rose-100 text-rose-700 border-rose-200",
    },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold whitespace-nowrap",
                config.className,
                className
            )}
        >
            {label || config.label}
        </span>
    );
}
