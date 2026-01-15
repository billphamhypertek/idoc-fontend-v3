"use client";

import { CheckSquare, ExternalLink, User, Calendar } from "lucide-react";
import { assignedTasks } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const statusConfig = {
    processing: {
        label: "Đang thực hiện",
        className: "bg-[hsl(var(--v3-info))]/10 text-[hsl(var(--v3-info))]",
        progressClassName: "bg-[hsl(var(--v3-info))]",
    },
    ontrack: {
        label: "Đúng tiến độ",
        className: "bg-[hsl(var(--v3-success))]/10 text-[hsl(var(--v3-success))]",
        progressClassName: "bg-[hsl(var(--v3-success))]",
    },
    delayed: {
        label: "Chậm tiến độ",
        className: "bg-[hsl(var(--v3-error))]/10 text-[hsl(var(--v3-error))]",
        progressClassName: "bg-[hsl(var(--v3-error))]",
    },
};

interface AssignedTasksCardProps {
    className?: string;
}

export function AssignedTasksCard({ className }: AssignedTasksCardProps) {
    return (
        <div className={cn("bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm flex flex-col", className)}>
            <div className="shrink-0 flex items-center justify-between p-3 border-b border-[hsl(var(--v3-border))]">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 bg-[hsl(var(--v3-accent))]/10 rounded-lg">
                        <CheckSquare className="w-5 h-5 text-[hsl(var(--v3-accent))]" />
                    </div>
                    <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                        {assignedTasks.length} nhiệm vụ
                    </span>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded transition-colors">
                    Xem tất cả
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 space-y-2">
                    {assignedTasks.map((task) => {
                        const status = statusConfig[task.status];

                        return (
                            <div
                                key={task.id}
                                className="p-3 rounded-lg border border-[hsl(var(--v3-border))] hover:border-[hsl(var(--v3-primary))]/50 hover:shadow-sm transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded", status.className)}>
                                        {status.label}
                                    </span>
                                    <span className="text-xs font-medium text-[hsl(var(--v3-muted-foreground))]">
                                        #{task.id}
                                    </span>
                                </div>

                                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] line-clamp-2 mb-2 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                                    {task.title}
                                </h4>

                                <div className="flex items-center gap-3 mb-2 text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    <div className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[100px]">{task.assignees.join(", ")}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{task.deadline}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Progress
                                        value={task.progress}
                                        className="flex-1 h-1.5"
                                        indicatorClassName={status.progressClassName}
                                    />
                                    <span className="text-xs font-medium text-[hsl(var(--v3-card-foreground))]">
                                        {task.progress}%
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
