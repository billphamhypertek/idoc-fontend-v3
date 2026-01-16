"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data for weekly trend
const weeklyData = [
    { day: "T2", incoming: 28, outgoing: 15, tasks: 12 },
    { day: "T3", incoming: 22, outgoing: 18, tasks: 8 },
    { day: "T4", incoming: 35, outgoing: 22, tasks: 15 },
    { day: "T5", incoming: 30, outgoing: 20, tasks: 10 },
    { day: "T6", incoming: 40, outgoing: 28, tasks: 18 },
    { day: "T7", incoming: 10, outgoing: 5, tasks: 3 },
    { day: "CN", incoming: 5, outgoing: 2, tasks: 1 },
];

interface WeeklyTrendChartProps {
    className?: string;
}

export function WeeklyTrendChart({ className }: WeeklyTrendChartProps) {
    return (
        <div className={cn("v3-card p-6", className)}>
            <h3 className="text-lg font-bold text-[hsl(var(--v3-card-foreground))] mb-6">
                Xu hướng công việc (Tuần qua)
            </h3>

            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} barGap={8} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--v3-border))" strokeOpacity={0.5} />
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
                            cursor={{ fill: 'hsl(var(--v3-muted))', opacity: 0.3 }}
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
                                    incoming: 'VB Đến',
                                    outgoing: 'VB Đi',
                                    tasks: 'Nhiệm vụ'
                                };
                                return (
                                    <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] ml-1">
                                        {labels[value] || value}
                                    </span>
                                );
                            }}
                        />
                        <Bar
                            dataKey="incoming"
                            name="incoming"
                            fill="#22c55e"
                            radius={[10, 10, 10, 10]}
                            barSize={12}
                        />
                        <Bar
                            dataKey="outgoing"
                            name="outgoing"
                            fill="#3b82f6"
                            radius={[10, 10, 10, 10]}
                            barSize={12}
                        />
                        <Bar
                            dataKey="tasks"
                            name="tasks"
                            fill="#8b5cf6"
                            radius={[10, 10, 10, 10]}
                            barSize={12}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
