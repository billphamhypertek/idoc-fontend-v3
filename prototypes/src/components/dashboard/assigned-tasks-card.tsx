"use client";

import { CheckCircledIcon, ExternalLinkIcon, PersonIcon, ClockIcon } from "@radix-ui/react-icons";
import { assignedTasks } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const statusConfig = {
    processing: {
        label: "Đang xử lý",
        className: "text-[hsl(var(--v3-info))]",
        progressClass: "bg-[hsl(var(--v3-info))]",
    },
    ontrack: {
        label: "Đúng tiến độ",
        className: "text-[hsl(var(--v3-success))]",
        progressClass: "bg-[hsl(var(--v3-success))]",
    },
    delayed: {
        label: "Chậm tiến độ",
        className: "text-[hsl(var(--v3-error))]",
        progressClass: "bg-[hsl(var(--v3-error))]",
    },
};

interface AssignedTasksCardProps {
    className?: string;
}

export function AssignedTasksCard({ className }: AssignedTasksCardProps) {
    return (
        <div className={cn("bg-white rounded-xl shadow-[var(--v3-shadow-card)] flex flex-col", className)}>
            {/* Header with title inside */}
            <div className="shrink-0 flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[hsl(var(--v3-success))]/10 rounded-xl">
                        <CheckCircledIcon className="w-5 h-5 text-[hsl(var(--v3-success))]" />
                    </div>
                    <h3 className="text-base font-semibold text-[hsl(var(--v3-card-foreground))]">
                        Nhiệm vụ đang theo dõi
                    </h3>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded-xl transition-colors">
                    {assignedTasks.length} nhiệm vụ
                    <ExternalLinkIcon className="w-4 h-4" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="px-5 pb-5 space-y-3">
                    {assignedTasks.map((task) => {
                        const status = statusConfig[task.status];

                        return (
                            <div
                                key={task.id}
                                className="p-4 rounded-xl border border-black/5 hover:shadow-md hover:border-[hsl(var(--v3-primary))]/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className={cn("text-xs font-semibold", status.className)}>
                                        {status.label}
                                    </span>
                                    <span className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">
                                        {task.progress}%
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-2 bg-[hsl(var(--v3-muted))] rounded-full mb-3 overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all", status.progressClass)}
                                        style={{ width: `${task.progress}%` }}
                                    />
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-3 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {task.title}
                                </h4>

                                <div className="flex items-center justify-between text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    <div className="flex items-center gap-1.5">
                                        <PersonIcon className="w-3.5 h-3.5" />
                                        <span>{task.assignedBy}</span>
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
