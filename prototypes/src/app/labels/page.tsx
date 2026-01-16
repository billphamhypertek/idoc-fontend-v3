"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { PlusIcon, Pencil1Icon, TrashIcon, MagnifyingGlassIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Tag, FileText, Clock, Users, ArrowUpRight, BarChart3, PieChart as PieChartIcon, LayoutGrid, List as ListIcon, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock labels data
const labels = [
    { id: "NV001", name: "Khẩn cấp", color: "#ef4444", count: 15, growth: 12, description: "Văn bản cần xử lý ngay trong ngày", createdBy: "Admin", lastUsed: "10 phút trước" },
    { id: "NV002", name: "Quan trọng", color: "#f59e0b", count: 28, growth: 5, description: "Văn bản quan trọng cần chú ý đặc biệt", createdBy: "Admin", lastUsed: "1 giờ trước" },
    { id: "NV003", name: "Chờ duyệt", color: "#3b82f6", count: 42, growth: 8, description: "Văn bản đang chờ lãnh đạo phê duyệt", createdBy: "System", lastUsed: "5 phút trước" },
    { id: "NV004", name: "Đã hoàn thành", color: "#22c55e", count: 156, growth: 15, description: "Văn bản đã xử lý xong và đóng hồ sơ", createdBy: "System", lastUsed: "2 phút trước" },
    { id: "NV005", name: "Lưu trữ", color: "#6b7280", count: 89, growth: 2, description: "Văn bản đã được lưu trữ vào kho", createdBy: "Admin", lastUsed: "1 ngày trước" },
    { id: "NV006", name: "Nội bộ", color: "#8b5cf6", count: 34, growth: -3, description: "Văn bản chỉ lưu hành nội bộ trong đơn vị", createdBy: "Manager", lastUsed: "3 giờ trước" },
    { id: "NV007", name: "Mật", color: "#dc2626", count: 5, growth: 0, description: "Tài liệu mật cần bảo vệ", createdBy: "Admin", lastUsed: "2 ngày trước" },
    { id: "NV008", name: "Tham khảo", color: "#14b8a6", count: 45, growth: 7, description: "Tài liệu dùng để tham khảo", createdBy: "User", lastUsed: "4 giờ trước" },
];

const usageData = labels.map(l => ({ name: l.name, value: l.count, color: l.color }));

const mockChartData = [
    { name: "T2", used: 24 },
    { name: "T3", used: 18 },
    { name: "T4", used: 32 },
    { name: "T5", used: 45 },
    { name: "T6", used: 30 },
    { name: "T7", used: 15 },
    { name: "CN", used: 10 },
];

function LabelStats() {
    return (
        <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Usage Chart */}
            <div className="col-span-2 bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-[hsl(var(--v3-card-foreground))]">Thống kê sử dụng nhãn</h3>
                        <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Số lượng văn bản được gắn nhãn trong 7 ngày qua</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[hsl(var(--v3-muted))] rounded-lg">
                        <BarChart3 className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                        <span className="text-sm font-medium">Tuần này</span>
                    </div>
                </div>
                <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockChartData}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="used" fill="hsl(var(--v3-primary))" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm">
                <h3 className="font-semibold text-[hsl(var(--v3-card-foreground))] mb-4">Phân bổ văn bản</h3>
                <div className="h-[160px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={usageData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {usageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-[hsl(var(--v3-card-foreground))]">{labels.reduce((a, b) => a + b.count, 0)}</span>
                            <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Tổng số</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Chờ duyệt</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LabelGridCard({ label }: { label: typeof labels[0] }) {
    return (
        <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))] transition-colors">
                    <Pencil1Icon className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-[hsl(var(--v3-muted-foreground))] hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-start gap-4 mb-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${label.color}15` }}
                >
                    <Tag className="w-6 h-6" style={{ color: label.color }} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="font-semibold text-[hsl(var(--v3-card-foreground))] truncate pr-8">{label.name}</h4>
                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))] mt-1 line-clamp-2 min-h-[2.5em]">{label.description}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--v3-border))]">
                <div className="flex flex-col">
                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))] mb-0.5">Sử dụng</span>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-[hsl(var(--v3-card-foreground))]">{label.count}</span>
                        <span className={cn(
                            "text-xs font-medium flex items-center",
                            label.growth >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                            {label.growth > 0 && "+"}{label.growth}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))] mb-0.5">Gần nhất</span>
                    <span className="text-xs font-medium text-[hsl(var(--v3-card-foreground))] bg-[hsl(var(--v3-muted))] px-2 py-1 rounded-md">
                        {label.lastUsed}
                    </span>
                </div>
            </div>
        </div>
    );
}

function LabelListItem({ label }: { label: typeof labels[0] }) {
    return (
        <div className="grid grid-cols-12 gap-4 p-4 bg-white border border-[hsl(var(--v3-border))] rounded-lg hover:shadow-sm items-center transition-all group">
            <div className="col-span-4 flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${label.color}20` }}
                >
                    <Tag className="w-4 h-4" style={{ color: label.color }} />
                </div>
                <div>
                    <h4 className="font-medium text-[hsl(var(--v3-card-foreground))] text-sm">{label.name}</h4>
                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))] line-clamp-1">{label.description}</p>
                </div>
            </div>

            <div className="col-span-2 flex flex-col justify-center">
                <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Người tạo</span>
                <span className="text-sm text-[hsl(var(--v3-card-foreground))]">{label.createdBy}</span>
            </div>

            <div className="col-span-2 flex flex-col justify-center">
                <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Hoạt động cuối</span>
                <span className="text-sm text-[hsl(var(--v3-card-foreground))]">{label.lastUsed}</span>
            </div>

            <div className="col-span-2 flex flex-col justify-center">
                <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Sử dụng</span>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[hsl(var(--v3-card-foreground))]">{label.count}</span>
                    <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        label.growth >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                        {label.growth > 0 && "+"}{label.growth}%
                    </span>
                </div>
            </div>

            <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]">
                    <Pencil1Icon className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-[hsl(var(--v3-muted-foreground))] hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export default function LabelsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    return (
        <PageLayout activeModule="labels" activeSubMenu="labels">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Quản lý nhãn</h1>
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                        Tạo nhãn mới
                    </button>
                </div>

                <LabelStats />

                {/* Toolbar */}
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-[hsl(var(--v3-border))] shadow-sm">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative w-64 ml-2">
                            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhãn..."
                                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[hsl(var(--v3-muted))/30] border-transparent focus:bg-white focus:border-[hsl(var(--v3-primary))] focus:ring-1 focus:ring-[hsl(var(--v3-primary))] transition-all text-sm outline-none"
                            />
                        </div>
                        <div className="h-6 w-px bg-[hsl(var(--v3-border))]" />
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))] transition-colors">
                            <MixerHorizontalIcon className="w-4 h-4" />
                            Bộ lọc
                        </button>
                    </div>

                    <div className="flex bg-[hsl(var(--v3-muted))] p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === "grid" ? "bg-white text-[hsl(var(--v3-primary))] shadow-sm" : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === "list" ? "bg-white text-[hsl(var(--v3-primary))] shadow-sm" : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Labels Content */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-4 gap-4">
                        {labels.map((label) => (
                            <LabelGridCard key={label.id} label={label} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {labels.map((label) => (
                            <LabelListItem key={label.id} label={label} />
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
