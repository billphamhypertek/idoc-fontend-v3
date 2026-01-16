"use client";

import { cn } from "@/lib/utils";
import {
    PlusCircledIcon,
    ReloadIcon,
    TimerIcon,
    CheckCircledIcon
} from "@radix-ui/react-icons";

interface TaskStatsCardsProps {
    className?: string;
    stats?: {
        newTasks: number;
        inProgress: number;
        pendingReview: number;
        completed: number;
    };
}

interface StatCardProps {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    gradientClasses: string;
    iconBgClassName: string;
    iconClassName: string;
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    gradientClasses,
    iconBgClassName,
    iconClassName,
}: StatCardProps) {
    return (
        <div className={cn("rounded-lg p-6 flex flex-col items-center text-center", gradientClasses)}>
            {/* Icon box at top */}
            <div className={cn("w-14 h-14 rounded-md flex items-center justify-center mb-3", iconBgClassName)}>
                <Icon className={cn("w-6 h-6", iconClassName)} />
            </div>

            {/* Label */}
            <p className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))] mb-2">
                {title}
            </p>

            {/* Main value */}
            <h3 className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))] mb-1">
                {value.toLocaleString()}
            </h3>

            {/* Subtitle */}
            <p className="text-xs text-[hsl(var(--v3-muted-foreground))] mb-4">
                {subtitle}
            </p>

            {/* View Details button */}
            <button className="px-4 py-2 bg-white text-sm font-semibold text-[hsl(var(--v3-card-foreground))] rounded-lg shadow-sm hover:shadow-md transition-all">
                Xem chi tiết
            </button>
        </div>
    );
}

export function TaskStatsCards({ className, stats }: TaskStatsCardsProps) {
    const defaultStats = {
        newTasks: 130,
        inProgress: 45,
        pendingReview: 28,
        completed: 312,
    };

    const data = stats || defaultStats;

    return (
        <div className={cn("v3-card p-6", className)}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Mới giao"
                    value={data.newTasks}
                    subtitle="Chờ tiếp nhận"
                    icon={PlusCircledIcon}
                    gradientClasses="bg-gradient-to-b from-pink-100 to-pink-50"
                    iconBgClassName="bg-pink-200"
                    iconClassName="text-pink-700"
                />

                <StatCard
                    title="Đang xử lý"
                    value={data.inProgress}
                    subtitle="Đang thực hiện"
                    icon={ReloadIcon}
                    gradientClasses="bg-gradient-to-b from-blue-100 to-blue-50"
                    iconBgClassName="bg-blue-200"
                    iconClassName="text-blue-700"
                />

                <StatCard
                    title="Chờ duyệt"
                    value={data.pendingReview}
                    subtitle="Chờ đánh giá"
                    icon={TimerIcon}
                    gradientClasses="bg-gradient-to-b from-amber-100 to-amber-50"
                    iconBgClassName="bg-amber-200"
                    iconClassName="text-amber-700"
                />

                <StatCard
                    title="Hoàn thành"
                    value={data.completed}
                    subtitle="Trong tháng này"
                    icon={CheckCircledIcon}
                    gradientClasses="bg-gradient-to-b from-green-100 to-green-50"
                    iconBgClassName="bg-green-200"
                    iconClassName="text-green-700"
                />
            </div>
        </div>
    );
}
