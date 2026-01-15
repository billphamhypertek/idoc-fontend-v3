"use client";

import { FileUp, ExternalLink, PenLine, CheckCircle, Send } from "lucide-react";
import { outgoingDocuments } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const statusConfig = {
    draft: {
        label: "Bản nháp",
        icon: PenLine,
        className: "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]",
        iconClassName: "text-[hsl(var(--v3-muted-foreground))]",
    },
    reviewing: {
        label: "Đang duyệt",
        icon: CheckCircle,
        className: "bg-[hsl(var(--v3-warning))]/10 text-[hsl(var(--v3-warning))]",
        iconClassName: "text-[hsl(var(--v3-warning))]",
    },
    approved: {
        label: "Đã duyệt",
        icon: Send,
        className: "bg-[hsl(var(--v3-success))]/10 text-[hsl(var(--v3-success))]",
        iconClassName: "text-[hsl(var(--v3-success))]",
    },
};

interface OutgoingDocumentsCardProps {
    className?: string;
}

export function OutgoingDocumentsCard({ className }: OutgoingDocumentsCardProps) {
    const draftCount = outgoingDocuments.filter((d) => d.status === "draft" || d.status === "reviewing").length;

    return (
        <div className={cn("bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm flex flex-col", className)}>
            <div className="shrink-0 flex items-center justify-between p-3 border-b border-[hsl(var(--v3-border))]">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 bg-[hsl(var(--v3-info))]/10 rounded-lg">
                        <FileUp className="w-5 h-5 text-[hsl(var(--v3-info))]" />
                    </div>
                    <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                        {draftCount} đang soạn/duyệt
                    </span>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded transition-colors">
                    Xem tất cả
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 space-y-2">
                    {outgoingDocuments.map((doc) => {
                        const status = statusConfig[doc.status];
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={doc.id}
                                className="p-3 rounded-lg border border-[hsl(var(--v3-border))] hover:border-[hsl(var(--v3-primary))]/50 hover:shadow-sm transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded", status.className)}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </span>
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                        {doc.date}
                                    </span>
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-2 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {doc.title}
                                </h4>

                                <div className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    <span className="truncate">Gửi: {doc.to}</span>
                                </div>

                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[hsl(var(--v3-border))]">
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                        Bước tiếp:
                                    </span>
                                    <span className="text-xs font-medium text-[hsl(var(--v3-primary))] truncate">
                                        {doc.step}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
