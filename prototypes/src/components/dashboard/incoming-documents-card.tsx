"use client";

import { DownloadIcon, ExternalLinkIcon, ClockIcon, ExclamationTriangleIcon, CheckCircledIcon, UpdateIcon } from "@radix-ui/react-icons";
import { incomingDocuments } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const priorityConfig = {
    urgent: {
        label: "Khẩn",
        className: "bg-[hsl(var(--v3-error))] text-white",
    },
    high: {
        label: "Quan trọng",
        className: "bg-[hsl(var(--v3-warning))] text-white",
    },
    normal: {
        label: "Thường",
        className: "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]",
    },
};

const statusConfig = {
    pending: {
        label: "Chờ xử lý",
        icon: ExclamationTriangleIcon,
        className: "text-[hsl(var(--v3-warning))]",
    },
    processing: {
        label: "Đang xử lý",
        icon: UpdateIcon,
        className: "text-[hsl(var(--v3-info))]",
    },
    done: {
        label: "Đã xử lý",
        icon: CheckCircledIcon,
        className: "text-[hsl(var(--v3-success))]",
    },
};

interface IncomingDocumentsCardProps {
    className?: string;
}

export function IncomingDocumentsCard({ className }: IncomingDocumentsCardProps) {
    const pendingCount = incomingDocuments.filter((d) => d.status === "pending").length;

    return (
        <div className={cn("v3-card flex flex-col", className)}>
            {/* Header with title inside */}
            <div className="shrink-0 flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[hsl(var(--v3-info))]/10 rounded-lg">
                        <DownloadIcon className="w-5 h-5 text-[hsl(var(--v3-info))]" />
                    </div>
                    <h3 className="text-base font-semibold text-[hsl(var(--v3-card-foreground))]">
                        Văn bản đến
                    </h3>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded-lg transition-colors">
                    {incomingDocuments.length} văn bản
                    <ExternalLinkIcon className="w-4 h-4" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="px-5 pb-5 space-y-3">
                    {incomingDocuments.map((doc) => {
                        const priority = priorityConfig[doc.priority];
                        const status = statusConfig[doc.status];
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={doc.id}
                                className={cn(
                                    "p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group",
                                    doc.priority === "urgent"
                                        ? "border-[hsl(var(--v3-error))]/30 bg-[hsl(var(--v3-error))]/5"
                                        : "border-black/5 hover:border-[hsl(var(--v3-primary))]/30"
                                )}
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-semibold px-2 py-1 rounded-lg", priority.className)}>
                                            {priority.label}
                                        </span>
                                        <code className="text-xs font-mono text-[hsl(var(--v3-muted-foreground))] bg-[hsl(var(--v3-muted))] px-2 py-0.5 rounded">
                                            {doc.number}
                                        </code>
                                    </div>
                                    <span className={cn("flex items-center gap-1 text-xs font-medium", status.className)}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </span>
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-3 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {doc.title}
                                </h4>

                                <div className="flex items-center justify-between text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    <span className="font-medium">{doc.from}</span>
                                    <div className="flex items-center gap-1.5">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        <span>Hạn: {doc.deadline}</span>
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
