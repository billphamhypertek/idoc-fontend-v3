"use client";

import { FileDown, ExternalLink, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { incomingDocuments } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const priorityConfig = {
    urgent: {
        label: "Khẩn",
        className: "bg-[hsl(var(--v3-error))] text-white",
    },
    high: {
        label: "Q.trọng",
        className: "bg-[hsl(var(--v3-warning))] text-[hsl(var(--v3-warning-foreground))]",
    },
    normal: {
        label: "Thường",
        className: "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]",
    },
};

const statusConfig = {
    pending: {
        label: "Chờ xử lý",
        icon: AlertCircle,
        className: "text-[hsl(var(--v3-warning))]",
    },
    processing: {
        label: "Đang xử lý",
        icon: Clock,
        className: "text-[hsl(var(--v3-info))]",
    },
    done: {
        label: "Hoàn thành",
        icon: CheckCircle2,
        className: "text-[hsl(var(--v3-success))]",
    },
};

interface IncomingDocumentsCardProps {
    className?: string;
}

export function IncomingDocumentsCard({ className }: IncomingDocumentsCardProps) {
    const pendingCount = incomingDocuments.filter((d) => d.status === "pending").length;

    return (
        <div className={cn("bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm flex flex-col", className)}>
            <div className="shrink-0 flex items-center justify-between p-3 border-b border-[hsl(var(--v3-border))]">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 bg-[hsl(var(--v3-success))]/10 rounded-lg">
                        <FileDown className="w-5 h-5 text-[hsl(var(--v3-success))]" />
                    </div>
                    <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                        {pendingCount} chờ xử lý
                    </span>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded transition-colors">
                    Xem tất cả
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 space-y-2">
                    {incomingDocuments.map((doc) => {
                        const priority = priorityConfig[doc.priority];
                        const status = statusConfig[doc.status];
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={doc.id}
                                className="p-3 rounded-lg border border-[hsl(var(--v3-border))] hover:border-[hsl(var(--v3-primary))]/50 hover:shadow-sm transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", priority.className)}>
                                            {priority.label}
                                        </span>
                                        <span className="text-sm font-medium text-[hsl(var(--v3-primary))]">
                                            {doc.number}
                                        </span>
                                    </div>
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                        {doc.date}
                                    </span>
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-2 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {doc.title}
                                </h4>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))] truncate max-w-[180px]">
                                        Từ: {doc.from}
                                    </span>
                                    <div className={cn("flex items-center gap-1 text-xs", status.className)}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        <span>{status.label}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
