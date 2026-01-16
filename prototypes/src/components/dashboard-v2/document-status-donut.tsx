"use client";

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { stats } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface DocumentStatusDonutProps {
    className?: string;
}

const COLORS = {
    pending: "#f59e0b",      // Yellow/Amber
    processing: "#3b82f6",   // Blue
    done: "#22c55e",         // Green
};

export function DocumentStatusDonut({ className }: DocumentStatusDonutProps) {
    const data = [
        { name: "Đã hoàn thành", value: stats.documents.incoming.done, fill: COLORS.done },
        { name: "Đang xử lý", value: stats.documents.incoming.processing, fill: COLORS.processing },
        { name: "Chờ xử lý", value: stats.documents.incoming.pending, fill: COLORS.pending },
    ];

    return (
        <div className={cn("v3-card p-6", className)}>
            <h3 className="text-lg font-bold text-[hsl(var(--v3-card-foreground))] mb-2">
                Trạng thái văn bản đến
            </h3>
            <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-4">
                Theo dõi tiến độ xử lý văn bản
            </p>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="30%"
                        outerRadius="100%"
                        barSize={20}
                        data={data}
                        startAngle={180}
                        endAngle={-180}
                    >
                        <RadialBar
                            label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 600 }}
                            background={{ fill: '#f3f4f6' }}
                            dataKey="value"
                            cornerRadius={10}
                        />
                        <Legend
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                                lineHeight: '24px',
                                right: 0
                            }}
                            formatter={(value, entry: any) => (
                                <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] ml-2">
                                    {value} <span className="text-[hsl(var(--v3-muted-foreground))]">({entry.payload.value})</span>
                                </span>
                            )}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '8px 12px'
                            }}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
