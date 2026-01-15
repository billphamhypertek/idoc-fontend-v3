"use client";

import { DownloadIcon, UploadIcon, CheckCircledIcon, FileTextIcon } from "@radix-ui/react-icons";
import { stats } from "@/data/mock-data";
import { cn } from "@/lib/utils";

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
        <div className={cn("rounded-2xl p-6 flex flex-col items-center text-center", gradientClasses)}>
            {/* Icon box at top */}
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-3", iconBgClassName)}>
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

export function StatsSection() {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-[var(--v3-shadow-card)]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Văn bản đến"
                    value={stats.documents.incoming.pending + stats.documents.incoming.processing + stats.documents.incoming.done}
                    subtitle={`${stats.documents.incoming.pending} đang chờ xử lý`}
                    icon={DownloadIcon}
                    gradientClasses="bg-gradient-to-b from-green-100 to-green-50"
                    iconBgClassName="bg-green-200"
                    iconClassName="text-green-700"
                />

                <StatCard
                    title="Văn bản đi"
                    value={stats.documents.outgoing.draft + stats.documents.outgoing.reviewing + stats.documents.outgoing.issued}
                    subtitle={`${stats.documents.outgoing.draft + stats.documents.outgoing.reviewing} đang soạn/duyệt`}
                    icon={UploadIcon}
                    gradientClasses="bg-gradient-to-b from-blue-100 to-blue-50"
                    iconBgClassName="bg-blue-200"
                    iconClassName="text-blue-700"
                />

                <StatCard
                    title="Nhiệm vụ"
                    value={stats.tasks.assigned + stats.tasks.pending}
                    subtitle={`${stats.tasks.completed} đã hoàn thành`}
                    icon={CheckCircledIcon}
                    gradientClasses="bg-gradient-to-b from-pink-100 to-pink-50"
                    iconBgClassName="bg-pink-200"
                    iconClassName="text-pink-700"
                />

                <StatCard
                    title="Báo cáo"
                    value={stats.reports.total}
                    subtitle={`${stats.reports.submitted}/${stats.reports.total} đã nộp`}
                    icon={FileTextIcon}
                    gradientClasses="bg-gradient-to-b from-emerald-100 to-emerald-50"
                    iconBgClassName="bg-emerald-200"
                    iconClassName="text-emerald-700"
                />
            </div>
        </div>
    );
}
