"use client";

import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ScheduleSummaryProps {
    className?: string;
}

// Mock specific schedule data for the timeline view
const scheduleWithDetails = [
    {
        id: 1,
        time: "08:30",
        title: "Giao ban Ban Cơ yếu Chính phủ",
        location: "Phòng họp số 1",
        type: "important"
    },
    {
        id: 2,
        time: "10:00",
        title: "Họp rà soát báo cáo Quý I",
        location: "Phòng họp số 3",
        type: "normal"
    },
    {
        id: 3,
        time: "14:00",
        title: "Tập huấn ATTT cho cán bộ mới",
        location: "Hội trường A",
        type: "normal"
    },
    {
        id: 4,
        time: "16:30",
        title: "Báo cáo tiến độ dự án V3",
        location: "Phòng họp Tech",
        type: "important"
    },
];

export function ScheduleSummary({ className }: ScheduleSummaryProps) {
    // Get current date formatted in Vietnamese
    const today = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <div className={cn("v3-card p-6 flex flex-col h-full", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[hsl(var(--v3-card-foreground))]">
                            Lịch hôm nay
                        </h3>
                        <p className="text-xs text-[hsl(var(--v3-muted-foreground))] capitalize">
                            {today}
                        </p>
                    </div>
                </div>
                <Link
                    href="/calendar"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                >
                    Xem tất cả
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 -mr-1">
                <div className="space-y-0 relative">
                    {/* Timeline vertical line */}
                    <div className="absolute left-[2.4rem] top-2 bottom-2 w-px bg-gray-100 z-0" />

                    {scheduleWithDetails.map((item, index) => (
                        <div key={item.id} className="relative z-10 flex gap-4 pb-6 last:pb-0 group">
                            {/* Time Badge */}
                            <div className="flex flex-col items-center min-w-[3rem]">
                                <span className="text-xs font-bold text-[hsl(var(--v3-card-foreground))] bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm z-10">
                                    {item.time}
                                </span>
                            </div>

                            {/* Event Dot */}
                            {/* <div className={cn(
                                "absolute left-[2.4rem] -translate-x-1/2 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-20",
                                item.type === "important" ? "bg-red-500" : "bg-blue-500"
                            )} /> */}

                            {/* Content Card */}
                            <div className={cn(
                                "flex-1 p-3 rounded-lg border transition-all duration-200",
                                item.type === "important"
                                    ? "bg-red-50/50 border-red-100 hover:border-red-200"
                                    : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                            )}>
                                <h4 className={cn(
                                    "text-sm font-semibold mb-1",
                                    item.type === "important" ? "text-red-700" : "text-[hsl(var(--v3-card-foreground))]"
                                )}>
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    {item.location}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty state or footer if needed */}
            {scheduleWithDetails.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-[hsl(var(--v3-muted-foreground))]">
                    <ClockIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Không có lịch họp</span>
                </div>
            )}
        </div>
    );
}
