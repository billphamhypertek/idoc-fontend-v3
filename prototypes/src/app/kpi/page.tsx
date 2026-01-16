"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import {
    Target,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    Users,
    FileText,
    Award,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    CalendarDays,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    RadialBarChart,
    RadialBar,
    Legend,
} from "recharts";

// Mock KPI summary data
const kpiSummary = {
    overall: 85,
    change: 5.2,
    completed: 42,
    inProgress: 15,
    overdue: 3,
};

// Monthly KPI trend data
const monthlyTrendData = [
    { month: "T7", kpi: 78, target: 85 },
    { month: "T8", kpi: 82, target: 85 },
    { month: "T9", kpi: 79, target: 85 },
    { month: "T10", kpi: 85, target: 85 },
    { month: "T11", kpi: 88, target: 85 },
    { month: "T12", kpi: 83, target: 85 },
    { month: "T1", kpi: 85, target: 85 },
];

// KPI breakdown by category
const kpiCategoryData = [
    { name: "Văn bản", value: 35, fill: "#22c55e" },
    { name: "Nhiệm vụ", value: 28, fill: "#3b82f6" },
    { name: "Báo cáo", value: 20, fill: "#8b5cf6" },
    { name: "Họp", value: 17, fill: "#f59e0b" },
];

// Department KPI comparison
const departmentKPIData = [
    { name: "Văn phòng", score: 92, target: 85 },
    { name: "Cục QLNS", score: 88, target: 85 },
    { name: "TT CNTT", score: 85, target: 85 },
    { name: "Vụ Pháp chế", score: 82, target: 85 },
    { name: "Vụ TCCB", score: 79, target: 85 },
];

// Weekly performance data
const weeklyPerformanceData = [
    { day: "T2", completed: 12, pending: 3 },
    { day: "T3", completed: 15, pending: 5 },
    { day: "T4", completed: 18, pending: 4 },
    { day: "T5", completed: 14, pending: 6 },
    { day: "T6", completed: 20, pending: 2 },
    { day: "T7", completed: 8, pending: 1 },
    { day: "CN", completed: 5, pending: 0 },
];

// Individual KPI items for detail cards
const kpiItems = [
    {
        id: "KPI001",
        title: "Tỷ lệ văn bản xử lý đúng hạn",
        target: 95,
        current: 92,
        unit: "%",
        trend: "up",
        change: 3.2,
        period: "Tháng 01/2026",
        icon: FileText,
        color: "#22c55e",
    },
    {
        id: "KPI002",
        title: "Số văn bản đến đã xử lý",
        target: 200,
        current: 175,
        unit: "văn bản",
        trend: "up",
        change: 12,
        period: "Tháng 01/2026",
        icon: CheckCircle2,
        color: "#3b82f6",
    },
    {
        id: "KPI003",
        title: "Thời gian xử lý trung bình",
        target: 2,
        current: 2.5,
        unit: "ngày",
        trend: "down",
        change: -0.3,
        period: "Tháng 01/2026",
        icon: Clock,
        color: "#f59e0b",
    },
    {
        id: "KPI004",
        title: "Tỷ lệ hoàn thành nhiệm vụ",
        target: 90,
        current: 88,
        unit: "%",
        trend: "up",
        change: 2.1,
        period: "Tháng 01/2026",
        icon: Target,
        color: "#8b5cf6",
    },
];

// Top performers
const topPerformers = [
    { rank: 1, name: "Nguyễn Văn A", department: "Văn phòng", score: 98, avatar: "NVA" },
    { rank: 2, name: "Trần Thị B", department: "Cục QLNS", score: 95, avatar: "TTB" },
    { rank: 3, name: "Lê Văn C", department: "TT CNTT", score: 92, avatar: "LVC" },
    { rank: 4, name: "Phạm Thị D", department: "Vụ Pháp chế", score: 89, avatar: "PTD" },
    { rank: 5, name: "Hoàng Văn E", department: "Vụ TCCB", score: 87, avatar: "HVE" },
];

const rankColors: Record<number, string> = {
    1: "bg-yellow-500",
    2: "bg-gray-400",
    3: "bg-amber-600",
};

// Gauge chart data for overall KPI
const gaugeData = [
    { name: "KPI", value: kpiSummary.overall, fill: "#22c55e" },
];

export default function KPIPage() {
    const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");

    return (
        <PageLayout
            activeModule="kpi"
            activeSubMenu="kpi"
        >
            <div className="space-y-6">
                {/* Header Row: Title & Filters */}
                <div className="flex items-center justify-between">
                    {/* Left: Breadcrumb */}
                    {/* Left: Title */}
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">KPI</h1>

                    {/* Right: Time Range & Date Filter */}
                    <div className="flex items-center gap-3">
                        <div className="flex bg-[hsl(var(--v3-muted))] p-1 rounded-lg">
                            <button
                                onClick={() => setTimeRange("week")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    timeRange === "week"
                                        ? "bg-white text-[hsl(var(--v3-primary))] shadow-sm"
                                        : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                )}
                            >
                                Tuần
                            </button>
                            <button
                                onClick={() => setTimeRange("month")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    timeRange === "month"
                                        ? "bg-white text-[hsl(var(--v3-primary))] shadow-sm"
                                        : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                )}
                            >
                                Tháng
                            </button>
                            <button
                                onClick={() => setTimeRange("quarter")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    timeRange === "quarter"
                                        ? "bg-white text-[hsl(var(--v3-primary))] shadow-sm"
                                        : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                )}
                            >
                                Quý
                            </button>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[hsl(var(--v3-border))] rounded-lg text-sm text-[hsl(var(--v3-muted-foreground))]">
                            <CalendarDays className="w-4 h-4" />
                            <span>Tháng 01/2026</span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards with Overall KPI Gauge */}
                <div className="grid grid-cols-5 gap-6">
                    {/* Overall KPI Score - Featured Card */}
                    <div className="col-span-2 bg-gradient-to-br from-[hsl(var(--v3-primary))] to-[hsl(var(--v3-primary-hover))] rounded-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80 mb-1">Điểm KPI tổng hợp</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-bold">{kpiSummary.overall}</span>
                                    <span className="text-2xl font-medium opacity-70 mb-1">%</span>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span className="text-sm font-medium">+{kpiSummary.change}% so với tháng trước</span>
                                </div>
                            </div>
                            <div className="w-32 h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="70%"
                                        outerRadius="100%"
                                        barSize={12}
                                        data={gaugeData}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <RadialBar
                                            background={{ fill: 'rgba(255,255,255,0.2)' }}
                                            dataKey="value"
                                            cornerRadius={10}
                                            fill="rgba(255,255,255,0.9)"
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Other Summary Cards - wrapped in a card container */}
                    <div className="col-span-3 v3-card p-4">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="v3-card-gradient-green p-4 flex flex-col justify-between">
                                <div className="v3-icon-box-green mb-3">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-1">Đã hoàn thành</p>
                                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{kpiSummary.completed}</p>
                                </div>
                            </div>

                            <div className="v3-card-gradient-blue p-4 flex flex-col justify-between">
                                <div className="v3-icon-box-blue mb-3">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-1">Đang thực hiện</p>
                                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{kpiSummary.inProgress}</p>
                                </div>
                            </div>

                            <div className="v3-card-gradient-pink p-4 flex flex-col justify-between">
                                <div className="v3-icon-box-pink mb-3">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-1">Quá hạn</p>
                                    <p className="text-3xl font-bold text-[hsl(var(--v3-icon-pink))]">{kpiSummary.overdue}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-3 gap-6">
                    {/* KPI Trend Chart */}
                    <div className="col-span-2 v3-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))]">Xu hướng KPI</h3>
                                <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Theo dõi điểm KPI qua các tháng</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">KPI thực tế</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Mục tiêu</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorKPI" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--v3-border))" strokeOpacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[60, 100]}
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
                                        formatter={(value: number, name: string) => [
                                            `${value}%`,
                                            name === 'kpi' ? 'KPI thực tế' : 'Mục tiêu'
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="target"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fill="none"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="kpi"
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorKPI)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* KPI Category Breakdown - Donut Chart */}
                    <div className="v3-card p-6">
                        <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))] mb-2">Phân bổ KPI</h3>
                        <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-4">Theo loại công việc</p>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={kpiCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {kpiCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                        formatter={(value: number) => [`${value}%`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {kpiCategoryData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                    <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">{item.name}</span>
                                    <span className="text-xs font-semibold text-[hsl(var(--v3-card-foreground))] ml-auto">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Department KPI Comparison */}
                    <div className="v3-card p-6">
                        <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))] mb-2">KPI theo đơn vị</h3>
                        <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-4">So sánh điểm KPI giữa các phòng ban</p>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={departmentKPIData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 30, left: 70, bottom: 0 }}
                                >
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fill: 'hsl(var(--v3-card-foreground))', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid hsl(var(--v3-border))',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value: number) => [`${value}%`, 'Điểm KPI']}
                                    />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                        {departmentKPIData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.score >= entry.target ? '#22c55e' : '#f59e0b'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weekly Performance */}
                    <div className="v3-card p-6">
                        <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))] mb-2">Hiệu suất tuần</h3>
                        <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-4">Số nhiệm vụ hoàn thành/chờ xử lý</p>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--v3-border))" strokeOpacity={0.5} />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--v3-muted-foreground))', fontSize: 12 }}
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
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar dataKey="completed" name="Hoàn thành" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="pending" name="Chờ xử lý" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Performers Leaderboard */}
                    <div className="v3-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Award className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))]">Top KPI cá nhân</h3>
                                <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">Nhân viên có điểm KPI cao nhất</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {topPerformers.map((person) => (
                                <div
                                    key={person.rank}
                                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--v3-muted))]/50 hover:bg-[hsl(var(--v3-muted))] transition-colors"
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                        rankColors[person.rank] || "bg-[hsl(var(--v3-muted-foreground))]"
                                    )}>
                                        {person.rank}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center text-xs font-semibold text-[hsl(var(--v3-primary))]">
                                        {person.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] truncate">
                                            {person.name}
                                        </p>
                                        <p className="text-xs text-[hsl(var(--v3-muted-foreground))] truncate">
                                            {person.department}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-[hsl(var(--v3-success))]">
                                            {person.score}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KPI Detail Cards */}
                <div>
                    <h2 className="font-semibold text-[hsl(var(--v3-card-foreground))] mb-4">Chi tiết chỉ tiêu KPI</h2>
                    <div className="grid grid-cols-4 gap-6">
                        {kpiItems.map((item) => {
                            const progress = (item.current / item.target) * 100;
                            const isPositive = item.trend === "up";
                            const isOnTrack = progress >= 90 || (item.trend === "down" && progress <= 100);
                            const IconComponent = item.icon;

                            return (
                                <div
                                    key={item.id}
                                    className="v3-card p-5"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${item.color}15` }}
                                        >
                                            <IconComponent className="w-5 h-5" style={{ color: item.color }} />
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                            isOnTrack
                                                ? "bg-green-100 text-green-700"
                                                : "bg-amber-100 text-amber-700"
                                        )}>
                                            {isPositive ? (
                                                <ArrowUpRight className="w-3 h-3" />
                                            ) : (
                                                <ArrowDownRight className="w-3 h-3" />
                                            )}
                                            {Math.abs(item.change)}{typeof item.change === 'number' && item.unit === '%' ? '%' : ''}
                                        </div>
                                    </div>

                                    <h4 className="font-medium text-[hsl(var(--v3-card-foreground))] mb-1 line-clamp-2 min-h-[40px]">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))] mb-3">{item.period}</p>

                                    <div className="flex items-end gap-1 mb-3">
                                        <span className="text-2xl font-bold text-[hsl(var(--v3-card-foreground))]">{item.current}</span>
                                        <span className="text-sm text-[hsl(var(--v3-muted-foreground))] mb-0.5">/ {item.target} {item.unit}</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-[hsl(var(--v3-muted-foreground))]">Tiến độ</span>
                                            <span className={cn(
                                                "font-semibold",
                                                progress >= 90 ? "text-green-600" : progress >= 70 ? "text-amber-600" : "text-red-600"
                                            )}>
                                                {Math.round(progress)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    progress >= 90 ? "bg-green-500" : progress >= 70 ? "bg-amber-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
