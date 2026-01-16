"use client";

import { ExclamationTriangleIcon, ExternalLinkIcon, PersonIcon, ClockIcon, Pencil1Icon, FileTextIcon } from "@radix-ui/react-icons";
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
        className: "bg-[hsl(var(--v3-warning))] text-white",
    },
    normal: {
        label: "Thường",
        className: "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]",
    },
};

const typeConfig = {
    approve: {
        label: "Phê duyệt",
        icon: Pencil1Icon,
    },
    sign: {
        label: "Ký duyệt",
        icon: FileTextIcon,
    },
};

interface PendingActionsCardProps {
    className?: string;
}

export function PendingActionsCard({ className }: PendingActionsCardProps) {
    const urgentCount = pendingTasks.filter((t) => t.priority === "urgent" || t.priority === "high").length;

    return (
        <div className={cn("v3-card flex flex-col", className)}>
            {/* Header with title inside */}
            <div className="shrink-0 flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[hsl(var(--v3-error))]/10 rounded-lg">
                        <ExclamationTriangleIcon className="w-5 h-5 text-[hsl(var(--v3-error))]" />
                    </div>
                    <h3 className="text-base font-semibold text-[hsl(var(--v3-card-foreground))]">
                        Cần xử lý ngay
                    </h3>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded-lg transition-colors">
                    {pendingTasks.length} việc
                    <ExternalLinkIcon className="w-4 h-4" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="px-5 pb-5 space-y-3">
                    {pendingTasks.map((task) => {
                        const priority = priorityConfig[task.priority];
                        const type = typeConfig[task.type];
                        const TypeIcon = type.icon;

                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    "p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group",
                                    task.priority === "urgent"
                                        ? "border-[hsl(var(--v3-error))]/30 bg-[hsl(var(--v3-error))]/5"
                                        : "border-black/5 hover:border-[hsl(var(--v3-primary))]/30"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-semibold px-2 py-1 rounded-lg", priority.className)}>
                                            {priority.label}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-[hsl(var(--v3-muted-foreground))]">
                                            <TypeIcon className="w-3.5 h-3.5" />
                                            {type.label}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-3 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {task.title}
                                </h4>

                                <div className="flex items-center justify-between text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    <div className="flex items-center gap-1.5">
                                        <PersonIcon className="w-3.5 h-3.5" />
                                        <span>{task.from}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ClockIcon className="w-3.5 h-3.5" />
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
