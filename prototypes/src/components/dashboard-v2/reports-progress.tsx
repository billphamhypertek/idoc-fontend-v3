"use client";

import { BarChartIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface ReportsProgressProps {
    className?: string;
}

const reportData = [
    { label: "Báo cáo tuần", progress: 80, color: "#22c55e" },
    { label: "Báo cáo tháng", progress: 60, color: "#3b82f6" },
    { label: "Báo cáo quý", progress: 40, color: "#8b5cf6" },
];

export function ReportsProgress({ className }: ReportsProgressProps) {
    return (
        <div className={cn("v3-card p-6", className)}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-[hsl(var(--v3-info))]/10 flex items-center justify-center">
                    <BarChartIcon className="w-5 h-5 text-[hsl(var(--v3-info))]" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))]">
                    Tiến độ báo cáo
                </h3>
            </div>

            <div className="space-y-5">
                {reportData.map((report) => (
                    <div key={report.label}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">
                                {report.label}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: report.color }}>
                                {report.progress}%
                            </span>
                        </div>
                        <div className="h-2.5 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${report.progress}%`,
                                    backgroundColor: report.color
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[hsl(var(--v3-border))]">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--v3-muted-foreground))]">Tổng báo cáo</span>
                    <span className="font-semibold text-[hsl(var(--v3-card-foreground))]">8/10 đã nộp</span>
                </div>
            </div>
        </div>
    );
}
