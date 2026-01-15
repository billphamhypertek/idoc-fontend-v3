"use client";

import { FileDown, FileUp, CheckSquare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { stats } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBgClassName: string;
    iconClassName: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBgClassName,
    iconClassName,
    trend,
    trendValue,
}: StatCardProps) {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendClassName =
        trend === "up"
            ? "text-[hsl(var(--v3-success))]"
            : trend === "down"
                ? "text-[hsl(var(--v3-error))]"
                : "text-[hsl(var(--v3-muted-foreground))]";

    return (
        <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm p-5">
            <div className="flex items-start justify-between">
                <div className={cn("flex items-center justify-center w-12 h-12 rounded-lg", iconBgClassName)}>
                    <Icon className={cn("w-6 h-6", iconClassName)} />
                </div>
                {trend && trendValue && (
                    <div className={cn("flex items-center gap-0.5 text-xs font-medium", trendClassName)}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h3 className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">
                    {value.toLocaleString()}
                </h3>
                <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] mt-1">
                    {title}
                </p>
                <p className="text-xs text-[hsl(var(--v3-muted-foreground))] mt-0.5">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

export function StatsSection() {
    return (
        <div className="grid grid-cols-4 gap-4">
            <StatCard
                title="Văn bản đến"
                value={stats.documents.incoming.pending + stats.documents.incoming.processing + stats.documents.incoming.done}
                subtitle={`${stats.documents.incoming.pending} đang chờ xử lý`}
                icon={FileDown}
                iconBgClassName="bg-[hsl(var(--v3-success))]/10"
                iconClassName="text-[hsl(var(--v3-success))]"
                trend="up"
                trendValue="+12%"
            />

            <StatCard
                title="Văn bản đi"
                value={stats.documents.outgoing.draft + stats.documents.outgoing.reviewing + stats.documents.outgoing.issued}
                subtitle={`${stats.documents.outgoing.draft + stats.documents.outgoing.reviewing} đang soạn/duyệt`}
                icon={FileUp}
                iconBgClassName="bg-[hsl(var(--v3-info))]/10"
                iconClassName="text-[hsl(var(--v3-info))]"
                trend="up"
                trendValue="+8%"
            />

            <StatCard
                title="Nhiệm vụ"
                value={stats.tasks.assigned + stats.tasks.pending}
                subtitle={`${stats.tasks.completed} đã hoàn thành`}
                icon={CheckSquare}
                iconBgClassName="bg-[hsl(var(--v3-accent))]/10"
                iconClassName="text-[hsl(var(--v3-accent))]"
                trend={stats.tasks.delayed > 0 ? "down" : "neutral"}
                trendValue={stats.tasks.delayed > 0 ? `${stats.tasks.delayed} chậm` : "Đúng tiến độ"}
            />

            <StatCard
                title="Báo cáo"
                value={stats.reports.total}
                subtitle={`${stats.reports.submitted}/${stats.reports.total} đã nộp`}
                icon={FileDown}
                iconBgClassName="bg-[hsl(var(--v3-primary))]/10"
                iconClassName="text-[hsl(var(--v3-primary))]"
                trend="neutral"
                trendValue="Tháng này"
            />
        </div>
    );
}
