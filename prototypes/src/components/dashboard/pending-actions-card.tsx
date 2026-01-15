"use client";

import { AlertTriangle, ExternalLink, User, Clock, PenLine, FileSignature } from "lucide-react";
import { pendingTasks } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const priorityConfig = {
    urgent: {
        label: "Khẩn",
        className: "bg-[hsl(var(--v3-error))] text-white",
    },
    high: {
        label: "Quan trọng",
        className: "bg-[hsl(var(--v3-warning))] text-[hsl(var(--v3-warning-foreground))]",
    },
    normal: {
        label: "Thường",
        className: "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]",
    },
};

const typeConfig = {
    approve: {
        label: "Phê duyệt",
        icon: PenLine,
    },
    sign: {
        label: "Ký duyệt",
        icon: FileSignature,
    },
};

interface PendingActionsCardProps {
    className?: string;
}

export function PendingActionsCard({ className }: PendingActionsCardProps) {
    const urgentCount = pendingTasks.filter((t) => t.priority === "urgent" || t.priority === "high").length;

    return (
        <div className={cn("bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm flex flex-col", className)}>
            <div className="shrink-0 flex items-center justify-between p-3 border-b border-[hsl(var(--v3-border))]">
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center w-9 h-9 bg-[hsl(var(--v3-error))]/10 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-[hsl(var(--v3-error))]" />
                        {urgentCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[hsl(var(--v3-error))] rounded-full">
                                {urgentCount}
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                        {pendingTasks.length} việc cần làm
                    </span>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded transition-colors">
                    Xem tất cả
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 space-y-2">
                    {pendingTasks.map((task) => {
                        const priority = priorityConfig[task.priority];
                        const type = typeConfig[task.type];
                        const TypeIcon = type.icon;

                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    "p-3 rounded-lg border hover:shadow-sm transition-all cursor-pointer group",
                                    task.priority === "urgent"
                                        ? "border-[hsl(var(--v3-error))]/50 bg-[hsl(var(--v3-error))]/5"
                                        : "border-[hsl(var(--v3-border))] hover:border-[hsl(var(--v3-primary))]/50"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", priority.className)}>
                                            {priority.label}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-[hsl(var(--v3-muted-foreground))]">
                                            <TypeIcon className="w-3.5 h-3.5" />
                                            {type.label}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-2 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {task.title}
                                </h4>

                                <div className="flex items-center justify-between text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    <div className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{task.from}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{task.deadline}</span>
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
