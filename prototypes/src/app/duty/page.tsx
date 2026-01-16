"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { PlusIcon, CalendarIcon, ViewHorizontalIcon, ViewGridIcon } from "@radix-ui/react-icons";
import { Clock, User, MapPin, CheckCircle2, AlertCircle, Phone, Shield, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock stats data
const stats = {
    totalShifts: 42,
    upcoming: 12,
    assigned: 5,
    coverage: 98,
};

// Mock duty schedule data
const dutySchedule = [
    {
        id: "LT001",
        date: "20/01/2026",
        dayOfWeek: "Thứ Hai",
        isToday: true,
        shifts: [
            { shift: "Sáng", time: "07:00 - 12:00", user: "Nguyễn Văn A", department: "Phòng Tổng hợp", phone: "0912.345.678", status: "completed" },
            { shift: "Chiều", time: "13:00 - 17:00", user: "Trần Thị B", department: "Phòng CNTT", phone: "0987.654.321", status: "active" },
            { shift: "Tối", time: "17:00 - 22:00", user: "Lê Văn C", department: "Phòng Hành chính", phone: "0909.123.456", status: "scheduled" },
        ],
    },
    {
        id: "LT002",
        date: "21/01/2026",
        dayOfWeek: "Thứ Ba",
        isToday: false,
        shifts: [
            { shift: "Sáng", time: "07:00 - 12:00", user: "Phạm Thị D", department: "Phòng Tổng hợp", phone: "0912.111.222", status: "scheduled" },
            { shift: "Chiều", time: "13:00 - 17:00", user: "Hoàng Văn E", department: "Phòng CNTT", phone: "0987.333.444", status: "scheduled" },
            { shift: "Tối", time: "17:00 - 22:00", user: "Vũ Thị F", department: "Phòng Hành chính", phone: "0909.555.666", status: "scheduled" },
        ],
    },
    {
        id: "LT003",
        date: "22/01/2026",
        dayOfWeek: "Thứ Tư",
        isToday: false,
        shifts: [
            { shift: "Sáng", time: "07:00 - 12:00", user: "Nguyễn Văn G", department: "Vụ Pháp chế", phone: "0912.777.888", status: "scheduled" },
            { shift: "Chiều", time: "13:00 - 17:00", user: "Trần Văn H", department: "Vụ TCCB", phone: "0987.999.000", status: "scheduled" },
            { shift: "Tối", time: "17:00 - 22:00", user: "Lê Thị I", department: "Văn phòng", phone: "0909.111.333", status: "scheduled" },
        ],
    },
];

const shiftColors = {
    "Sáng": "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    "Chiều": "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    "Tối": "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
};

const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-green-600" },
    active: { icon: Clock, color: "text-blue-600 animate-pulse" },
    scheduled: { icon: CalendarIcon, color: "text-gray-400" },
};

function DutyStats() {
    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[hsl(var(--v3-primary))] to-[hsl(var(--v3-primary-hover))] rounded-xl p-5 text-white shadow-lg shadow-blue-900/10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold">{stats.totalShifts}</p>
                    <p className="text-sm opacity-80">Tổng ca trực tháng này</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700">Tuần tới</span>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.upcoming}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Ca trực sắp tới</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <User className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">Của tôi</span>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.assigned}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Ca được phân công</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.coverage}%</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Tỷ lệ trực đảm bảo</p>
                </div>
            </div>
        </div>
    );
}

function DutyList() {
    return (
        <div className="space-y-4">
            {dutySchedule.map((day) => (
                <div key={day.id} className={cn(
                    "bg-white rounded-xl border shadow-sm overflow-hidden transition-all",
                    day.isToday ? "border-[hsl(var(--v3-primary))] ring-1 ring-[hsl(var(--v3-primary))/20]" : "border-[hsl(var(--v3-border))]"
                )}>
                    {/* Day Header */}
                    <div className={cn(
                        "px-6 py-3 flex items-center justify-between border-b",
                        day.isToday ? "bg-[hsl(var(--v3-primary))/5]" : "bg-[hsl(var(--v3-muted))/30]"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                day.isToday ? "bg-[hsl(var(--v3-primary))] text-white" : "bg-white text-[hsl(var(--v3-muted-foreground))] border"
                            )}>
                                <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[hsl(var(--v3-card-foreground))]">{day.dayOfWeek}</span>
                                    {day.isToday && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--v3-primary))] text-white">
                                            HÔM NAY
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">{day.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shifts */}
                    <div className="p-6">
                        <div className="grid grid-cols-3 gap-6">
                            {day.shifts.map((shift, index) => {
                                const StatusIcon = statusConfig[shift.status as keyof typeof statusConfig].icon;
                                const statusColor = statusConfig[shift.status as keyof typeof statusConfig].color;

                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "relative p-4 rounded-xl border transition-all hover:shadow-md",
                                            shiftColors[shift.shift as keyof typeof shiftColors]
                                        )}
                                    >
                                        <div className="absolute top-4 right-4">
                                            <StatusIcon className={cn("w-5 h-5", statusColor)} />
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="font-bold text-lg">{shift.shift}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 border border-black/5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {shift.time}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                    <User className="w-4 h-4 opacity-70" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{shift.user}</p>
                                                    <p className="text-xs opacity-70">{shift.department}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 border border-white/50 text-xs font-medium">
                                                <Phone className="w-3.5 h-3.5 opacity-70" />
                                                <span>{shift.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function DutyCalendarView() {
    // Mock generic calendar cells
    const days = Array.from({ length: 35 }, (_, i) => {
        const day = i - 2; // Start from previous month
        const isCurrentMonth = day > 0 && day <= 31;

        return {
            day: day > 0 && day <= 31 ? day : day <= 0 ? 31 + day : day - 31,
            isCurrentMonth,
            isToday: day === 20,
            shifts: isCurrentMonth && [2, 5, 12, 16, 20, 24, 28].includes(day) ? [
                { type: "Sáng", name: "NV A" },
                { type: "Chiều", name: "NV B" },
            ] : []
        };
    });

    return (
        <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[hsl(var(--v3-border))] bg-[hsl(var(--v3-muted))/30]">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, i) => (
                    <div key={i} className="py-3 text-center text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-[120px]">
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={cn(
                            "border-b border-r border-[hsl(var(--v3-border))] p-2 transition-colors hover:bg-[hsl(var(--v3-muted))/20]",
                            !d.isCurrentMonth && "bg-[hsl(var(--v3-muted))/10] text-[hsl(var(--v3-muted-foreground))]",
                            d.isToday && "bg-blue-50/50"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
                                d.isToday ? "bg-[hsl(var(--v3-primary))] text-white" : ""
                            )}>
                                {d.day}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {d.shifts.map((s, idx) => (
                                <div key={idx} className="text-[10px] p-1 rounded bg-blue-100 text-blue-700 truncate font-medium border border-blue-200">
                                    {s.type}: {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DutySchedulePage() {
    return (
        <PageLayout activeModule="duty" activeSubMenu="duty">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Lịch trực nghiệp vụ</h1>
                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-white border border-[hsl(var(--v3-border))] text-[hsl(var(--v3-card-foreground))] text-sm font-medium hover:bg-[hsl(var(--v3-muted))] transition-colors">
                            Tháng 01/2026
                        </button>
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                            <PlusIcon className="w-4 h-4" />
                            Đăng ký trực
                        </button>
                    </div>
                </div>

                <DutyStats />

                <Tabs defaultValue="list" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-white border text-[hsl(var(--v3-card-foreground))]">
                            <TabsTrigger value="list" className="gap-2">
                                <ViewHorizontalIcon className="w-4 h-4" />
                                Danh sách
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-2">
                                <ViewGridIcon className="w-4 h-4" />
                                Lịch tháng
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 text-sm text-[hsl(var(--v3-muted-foreground))]">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                Đã trực
                            </span>
                            <span className="flex items-center gap-1.5 ml-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                                Đang trực
                            </span>
                            <span className="flex items-center gap-1.5 ml-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                                Chưa trực
                            </span>
                        </div>
                    </div>

                    <TabsContent value="list" className="m-0 focus-visible:ring-0">
                        <DutyList />
                    </TabsContent>

                    <TabsContent value="calendar" className="m-0 focus-visible:ring-0">
                        <DutyCalendarView />
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
}
