"use client";

import { ExclamationTriangleIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { pendingTasks, incomingDocuments, stats } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickActionsBadgeProps {
    className?: string;
}

export function QuickActionsBadge({ className }: QuickActionsBadgeProps) {
    const urgentDocs = incomingDocuments.filter(doc => doc.priority === "urgent" && doc.status !== "done");
    const needSign = pendingTasks.filter(task => task.type === "sign");
    const delayedTasks = stats.tasks.delayed;

    const totalActions = urgentDocs.length + needSign.length + delayedTasks;

    const actionItems = [
        { label: "Nhiệm vụ trễ hạn", count: delayedTasks, color: "text-red-700" },
        { label: "VB khẩn đến hạn", count: urgentDocs.length, color: "text-red-600" },
        { label: "Văn bản cần ký", count: needSign.length, color: "text-orange-600" },
    ].filter(item => item.count > 0);

    return (
        <div className={cn("v3-card bg-red-50/50 p-6 flex flex-col border-2 border-red-100", className)}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center animate-pulse">
                    <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-red-900">
                        Cần xử lý ngay
                    </h3>
                    <p className="text-sm text-red-700/80 font-medium">
                        Vui lòng ưu tiên giải quyết
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-8 relative">
                    <span className="text-[5rem] leading-[0.9] font-black text-red-600 drop-shadow-sm">
                        {totalActions}
                    </span>
                    <span className="absolute top-2 text-xl font-bold text-red-400 uppercase tracking-widest ml-2">
                        Việc
                    </span>
                </div>

                <div className="space-y-3">
                    {actionItems.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <span className="text-base font-semibold text-gray-700 group-hover:text-red-700 transition-colors">
                                {item.label}
                            </span>
                            <span className={cn("text-2xl font-bold", item.color)}>
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Link
                href="/tasks"
                className="mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
                <span>Xử lý ngay</span>
                <ArrowRightIcon className="w-5 h-5" />
            </Link>
        </div>
    );
}
