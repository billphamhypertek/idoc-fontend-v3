"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data for 7 days
const chartData = [
    { day: "T2", incoming: 24, outgoing: 12 },
    { day: "T3", incoming: 18, outgoing: 15 },
    { day: "T4", incoming: 32, outgoing: 22 },
    { day: "T5", incoming: 28, outgoing: 18 },
    { day: "T6", incoming: 35, outgoing: 25 },
    { day: "T7", incoming: 18, outgoing: 12 },
    { day: "CN", incoming: 12, outgoing: 8 },
];

interface DocumentTrendChartProps {
    className?: string;
}

export function DocumentTrendChart({ className }: DocumentTrendChartProps) {
    return (
        <div className={cn("v3-card p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-[hsl(var(--v3-card-foreground))]">
                        Văn bản theo thời gian
                    </h3>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                        Thống kê lượng văn bản đến và đi trong 7 ngày qua
                    </p>
                </div>
                <div className="flex bg-[hsl(var(--v3-muted))] p-1 rounded-lg">
                    <button className="px-3 py-1 text-xs font-semibold bg-white text-[hsl(var(--v3-primary))] shadow-sm rounded-md transition-all">
                        Tuần
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))] transition-all">
                        Tháng
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--v3-border))" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 12 }}
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
                        <Area
                            type="monotone"
                            dataKey="incoming"
                            name="Văn bản đến"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIncoming)"
                        />
                        <Area
                            type="monotone"
                            dataKey="outgoing"
                            name="Văn bản đi"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorOutgoing)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
