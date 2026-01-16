"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { calendarBoard, CalendarEvent } from "@/data/calendar-data";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    CalendarIcon,
    Share1Icon,
} from "@radix-ui/react-icons";
import { Clock, MapPin } from "lucide-react";

const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

function generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    return days;
}

function EventCard({ event }: { event: CalendarEvent }) {
    const typeColors = {
        meeting: "bg-blue-100 border-blue-300 text-blue-700",
        event: "bg-purple-100 border-purple-300 text-purple-700",
        reminder: "bg-amber-100 border-amber-300 text-amber-700",
        deadline: "bg-red-100 border-red-300 text-red-700",
    };

    return (
        <div className={cn("p-4 rounded-lg border-l-4", typeColors[event.type])}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-medium text-[hsl(var(--v3-card-foreground))]">{event.title}</h4>
                    {event.description && (
                        <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-[hsl(var(--v3-muted-foreground))]">
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.startTime} - {event.endTime}
                        </span>
                        {event.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                            </span>
                        )}
                    </div>
                </div>
                <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    event.priority === "high" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                )}>
                    {event.priority === "high" ? "Quan trọng" : "Bình thường"}
                </span>
            </div>
        </div>
    );
}

export default function CalendarUnitPage() {
    const router = useRouter();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const activeTab = "unit";

    // In a real app, this would filter for Unit calendar
    // For now we use the same data for prototype
    const events = calendarBoard.slice(0, 2);

    const calendarDays = generateCalendarDays(currentYear, currentMonth);

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleTabChange = (tabId: string) => {
        if (tabId === "board") {
            router.push("/calendar/board");
        } else {
            router.push("/calendar/unit");
        }
    };

    return (
        <PageLayout activeModule="calendar" activeSubMenu="unit">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Lịch công tác</h1>
                        <div className="flex items-center gap-1 bg-[hsl(var(--v3-muted))] p-1 rounded-lg">
                            <button
                                onClick={() => handleTabChange("board")}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                                    activeTab === "board"
                                        ? "bg-white text-[hsl(var(--v3-card-foreground))] shadow-sm"
                                        : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                )}
                            >
                                Lịch Ban
                            </button>
                            <button
                                onClick={() => handleTabChange("unit")}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                                    activeTab === "unit"
                                        ? "bg-white text-[hsl(var(--v3-card-foreground))] shadow-sm"
                                        : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                )}
                            >
                                Lịch Đơn vị
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-card-foreground))] text-sm font-medium hover:bg-[hsl(var(--v3-muted-hover))] transition-colors border border-[hsl(var(--v3-border))]">
                            <Share1Icon className="w-4 h-4" />
                            Xuất lịch
                        </button>
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                            <PlusIcon className="w-4 h-4" />
                            Đăng ký lịch Đơn vị
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Calendar */}
                    <div className="w-[320px] shrink-0">
                        <div className="v3-card p-4">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))]">
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <span className="font-semibold text-[hsl(var(--v3-card-foreground))]">
                                    {months[currentMonth]} {currentYear}
                                </span>
                                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))]">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Days of Week */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="text-center text-xs font-medium text-[hsl(var(--v3-muted-foreground))] py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, index) => (
                                    <button
                                        key={index}
                                        onClick={() => day && setSelectedDate(day)}
                                        disabled={!day}
                                        className={cn(
                                            "h-9 rounded-lg text-sm font-medium transition-colors",
                                            !day && "invisible",
                                            day === selectedDate && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                                                ? "bg-[hsl(var(--v3-primary))] text-white"
                                                : day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                                                    ? "bg-[hsl(var(--v3-primary))]/10 text-[hsl(var(--v3-primary))]"
                                                    : "hover:bg-[hsl(var(--v3-muted))]"
                                        )}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="flex-1">
                        <div className="v3-card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarIcon className="w-5 h-5 text-[hsl(var(--v3-primary))]" />
                                <h3 className="font-semibold text-[hsl(var(--v3-card-foreground))]">
                                    Sự kiện sắp tới
                                </h3>
                                <span className="ml-auto text-sm text-[hsl(var(--v3-muted-foreground))]">
                                    {events.length} sự kiện
                                </span>
                            </div>

                            <div className="space-y-3">
                                {events.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
