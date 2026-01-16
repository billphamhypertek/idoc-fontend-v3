"use client";

import { UploadIcon, ExternalLinkIcon, Pencil1Icon, CheckCircledIcon, RocketIcon } from "@radix-ui/react-icons";
import { outgoingDocuments } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const statusConfig = {
    draft: {
        label: "Dự thảo",
        icon: Pencil1Icon,
        className: "text-[hsl(var(--v3-muted-foreground))] bg-[hsl(var(--v3-muted))]",
    },
    reviewing: {
        label: "Đang duyệt",
        icon: RocketIcon,
        className: "text-[hsl(var(--v3-info))] bg-[hsl(var(--v3-info))]/10",
    },
    approved: {
        label: "Đã duyệt",
        icon: CheckCircledIcon,
        className: "text-[hsl(var(--v3-success))] bg-[hsl(var(--v3-success))]/10",
    },
};

interface OutgoingDocumentsCardProps {
    className?: string;
}

export function OutgoingDocumentsCard({ className }: OutgoingDocumentsCardProps) {
    const draftCount = outgoingDocuments.filter((d) => d.status === "draft" || d.status === "reviewing").length;

    return (
        <div className={cn("v3-card flex flex-col", className)}>
            {/* Header with title inside */}
            <div className="shrink-0 flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[hsl(var(--v3-warning))]/10 rounded-lg">
                        <UploadIcon className="w-5 h-5 text-[hsl(var(--v3-warning))]" />
                    </div>
                    <h3 className="text-base font-semibold text-[hsl(var(--v3-card-foreground))]">
                        Văn bản đi
                    </h3>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded-lg transition-colors">
                    {outgoingDocuments.length} văn bản
                    <ExternalLinkIcon className="w-4 h-4" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="px-5 pb-5 space-y-3">
                    {outgoingDocuments.map((doc) => {
                        const status = statusConfig[doc.status];
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={doc.id}
                                className="p-4 rounded-lg border border-black/5 hover:shadow-md hover:border-[hsl(var(--v3-primary))]/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg", status.className)}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </span>
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                        {doc.date}
                                    </span>
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-3 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {doc.title}
                                </h4>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))] font-medium">
                                        Gửi: {doc.to}
                                    </span>
                                    <span className="text-xs text-[hsl(var(--v3-info))] font-medium bg-[hsl(var(--v3-info))]/10 px-2 py-0.5 rounded">
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
