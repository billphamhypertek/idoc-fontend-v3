"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data for task trend
const trendData = [
    { day: "T2", completed: 12, assigned: 18, overdue: 2 },
    { day: "T3", completed: 15, assigned: 14, overdue: 1 },
    { day: "T4", completed: 22, assigned: 19, overdue: 3 },
    { day: "T5", completed: 18, assigned: 16, overdue: 2 },
    { day: "T6", completed: 28, assigned: 22, overdue: 1 },
    { day: "T7", completed: 8, assigned: 5, overdue: 0 },
    { day: "CN", completed: 5, assigned: 3, overdue: 0 },
];

interface TaskTrendChartProps {
    className?: string;
}

export function TaskTrendChart({ className }: TaskTrendChartProps) {
    return (
        <div className={cn("v3-card p-6", className)}>
            <h3 className="text-lg font-bold text-[hsl(var(--v3-card-foreground))] mb-6">
                Tiến độ công việc (Tuần qua)
            </h3>

            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--v3-border))"
                            strokeOpacity={0.5}
                        />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 13 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 13 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                            labelStyle={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    completed: 'Hoàn thành',
                                    assigned: 'Được giao',
                                    overdue: 'Quá hạn'
                                };
                                return (
                                    <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] ml-1">
                                        {labels[value] || value}
                                    </span>
                                );
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="completed"
                            name="completed"
                            stroke="#22c55e"
                            strokeWidth={2.5}
                            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="assigned"
                            name="assigned"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="overdue"
                            name="overdue"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
