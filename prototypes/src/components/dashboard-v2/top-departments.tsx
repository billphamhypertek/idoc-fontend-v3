"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface TopDepartmentsProps {
    className?: string;
}

// Mock data for departments
const departmentData = [
    { name: "Văn phòng", value: 45, color: "#22c55e" },
    { name: "Cục QLNS", value: 32, color: "#3b82f6" },
    { name: "TT CNTT", value: 28, color: "#8b5cf6" },
    { name: "Vụ Pháp chế", value: 22, color: "#f59e0b" },
    { name: "Vụ TCCB", value: 18, color: "#ec4899" },
];

export function TopDepartments({ className }: TopDepartmentsProps) {
    return (
        <div className={cn("v3-card p-6", className)}>
            <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))] mb-6">
                Đơn vị xử lý nhiều nhất
            </h3>

            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={departmentData}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
                    >
                        <XAxis
                            type="number"
                            tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 12 }}
                            axisLine={{ stroke: 'hsl(var(--v3-border))' }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: 'hsl(var(--v3-card-foreground))', fontSize: 13 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid hsl(var(--v3-border))',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value} văn bản`, '']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {departmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
