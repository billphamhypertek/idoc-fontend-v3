"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { stats } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface TaskStatusDonutProps {
    className?: string;
}

const COLORS = {
    assigned: "#3b82f6",     // Blue
    pending: "#f59e0b",      // Yellow/Amber
    completed: "#22c55e",    // Green
    delayed: "#ef4444",      // Red
};

export function TaskStatusDonut({ className }: TaskStatusDonutProps) {
    const data = [
        { name: "Đang xử lý", value: stats.tasks.assigned, color: COLORS.assigned },
        { name: "Chờ duyệt", value: stats.tasks.pending, color: COLORS.pending },
        { name: "Hoàn thành", value: stats.tasks.completed, color: COLORS.completed },
        { name: "Trễ hạn", value: stats.tasks.delayed, color: COLORS.delayed },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className={cn("v3-card p-6", className)}>
            <h3 className="text-lg font-bold text-[hsl(var(--v3-card-foreground))] mb-4">
                Trạng thái nhiệm vụ
            </h3>

            <div className="h-[240px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            cornerRadius={10}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '8px 12px'
                            }}
                            itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">
                        {stats.tasks.pending}
                    </span>
                    <p className="text-xs font-medium text-[hsl(var(--v3-muted-foreground))] uppercase tracking-wider mt-1">
                        Chờ duyệt
                    </p>
                </div>
            </div>

            <div className="space-y-3 mt-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full transition-all group-hover:scale-110"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))] group-hover:text-[hsl(var(--v3-card-foreground))] transition-colors">
                                {item.name}
                            </span>
                        </div>
                        <span className={cn(
                            "text-sm font-bold",
                            item.name === "Trễ hạn" ? "text-red-500" : "text-[hsl(var(--v3-card-foreground))]"
                        )}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
