"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import {
    TaskStatsCards,
    TaskUrgentActions,
    TaskDistribution,
    TaskTrendChart,
    TaskLeaderboard,
} from "@/components/task-dashboard";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    BarChartIcon,
    ActivityLogIcon,
} from "@radix-ui/react-icons";
import { Building, Network, User } from "lucide-react";

// Tab configuration
const tabs = [
    { id: "tkcv", label: "Thống kê công việc", icon: ActivityLogIcon },
    { id: "tk", label: "Thống kê", icon: BarChartIcon },
];

export default function TaskDashboardPage() {
    const [activeTab, setActiveTab] = useState("tkcv");
    const [selectedDonvi, setSelectedDonvi] = useState<string[]>([]);
    const [selectedPhong, setSelectedPhong] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string[]>([]);

    return (
        <PageLayout
            activeModule="tasks"
            activeSubMenu="tasks"
        >
            <div className="space-y-6">
                {/* Header */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Thống kê công việc</h1>

                {/* Tab Navigation + Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-[hsl(var(--v3-muted))] rounded-lg w-fit">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        activeTab === tab.id
                                            ? "bg-white text-[hsl(var(--v3-primary))] shadow-sm"
                                            : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex items-center gap-3">
                        {/* Đơn vị */}
                        <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-green-500" />
                            <select className="h-9 w-[160px] px-3 text-sm rounded-lg border border-[hsl(var(--v3-border))] bg-white text-[hsl(var(--v3-card-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20">
                                <option value="">Chọn đơn vị</option>
                                <option value="vp">Văn phòng</option>
                                <option value="qlns">Cục QLNS</option>
                                <option value="cntt">TT CNTT</option>
                            </select>
                        </div>

                        {/* Phòng */}
                        <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-blue-500" />
                            <select className="h-9 w-[160px] px-3 text-sm rounded-lg border border-[hsl(var(--v3-border))] bg-white text-[hsl(var(--v3-card-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20">
                                <option value="">Chọn phòng</option>
                                <option value="p1">Phòng 1</option>
                                <option value="p2">Phòng 2</option>
                                <option value="p3">Phòng 3</option>
                            </select>
                        </div>

                        {/* Người dùng */}
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" />
                            <select className="h-9 w-[160px] px-3 text-sm rounded-lg border border-[hsl(var(--v3-border))] bg-white text-[hsl(var(--v3-card-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20">
                                <option value="">Chọn người</option>
                                <option value="u1">Nguyễn Văn A</option>
                                <option value="u2">Trần Thị B</option>
                                <option value="u3">Lê Văn C</option>
                            </select>
                        </div>

                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors">
                            <PlusIcon className="w-4 h-4" />
                            Giao việc
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "tkcv" && (
                    <div className="space-y-6">
                        {/* Row 1: Stats Cards */}
                        <TaskStatsCards />

                        {/* Row 2: Urgent + Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <TaskUrgentActions />
                            <TaskDistribution className="lg:col-span-2" />
                        </div>

                        {/* Row 3: Trend + Leaderboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <TaskTrendChart className="lg:col-span-2" />
                            <TaskLeaderboard />
                        </div>
                    </div>
                )}

                {activeTab === "tk" && (
                    <div className="space-y-6">
                        {/* Placeholder for Thống kê tab */}
                        <div className="v3-card p-12 text-center">
                            <BarChartIcon className="w-16 h-16 mx-auto text-[hsl(var(--v3-muted-foreground))] mb-4" />
                            <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))] mb-2">
                                Thống kê chi tiết
                            </h3>
                            <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                                Biểu đồ thống kê chi tiết sẽ được hiển thị ở đây
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout >
    );
}
