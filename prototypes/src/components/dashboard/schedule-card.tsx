"use client";

import { ClockIcon, ExternalLinkIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { MapPin } from "lucide-react";
import { scheduleItems } from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ScheduleCardProps {
    className?: string;
}

export function ScheduleCard({ className }: ScheduleCardProps) {
    const boardItems = scheduleItems.filter((item) => item.type === "board");
    const unitItems = scheduleItems.filter((item) => item.type === "unit");

    const today = new Date();
    const shortDate = today.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" });

    return (
        <div className={cn("v3-card flex flex-col", className)}>
            {/* Header with title inside */}
            <div className="shrink-0 flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[hsl(var(--v3-primary))]/10 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-[hsl(var(--v3-primary))]" />
                    </div>
                    <h3 className="text-base font-semibold text-[hsl(var(--v3-card-foreground))]">
                        Lịch hôm nay
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <ChevronLeftIcon className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                    </button>
                    <span className="px-2 text-sm font-semibold text-[hsl(var(--v3-primary))]">
                        {shortDate}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <ChevronRightIcon className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                    </button>
                </div>
            </div>

            {/* Tabs by Type */}
            <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
                <TabsList className="shrink-0 mx-5 mb-3 w-auto">
                    <TabsTrigger value="board" className="flex-1">
                        Lịch Ban
                    </TabsTrigger>
                    <TabsTrigger value="unit" className="flex-1">
                        Lịch Đơn vị
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="board" className="flex-1 min-h-0 m-0">
                    <ScrollArea className="h-full">
                        <ScheduleTimeline items={boardItems} />
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="unit" className="flex-1 min-h-0 m-0">
                    <ScrollArea className="h-full">
                        <ScheduleTimeline items={unitItems} />
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ScheduleTimeline({ items }: { items: typeof scheduleItems }) {
    const morning = items.filter((item) => item.period === "morning");
    const afternoon = items.filter((item) => item.period === "afternoon");

    return (
        <div className="px-5 pb-5 space-y-4">
            {morning.length > 0 && (
                <div>
                    <div className="inline-block px-2.5 py-1 mb-3 text-xs font-bold text-[hsl(var(--v3-warning))] bg-[hsl(var(--v3-warning))]/10 rounded-lg uppercase tracking-wide">
                        Sáng
                    </div>
                    <div className="space-y-0">
                        {morning.map((item, index) => (
                            <TimelineItem key={item.id} item={item} isLast={index === morning.length - 1} />
                        ))}
                    </div>
                </div>
            )}

            {afternoon.length > 0 && (
                <div>
                    <div className="inline-block px-2.5 py-1 mb-3 text-xs font-bold text-[hsl(var(--v3-info))] bg-[hsl(var(--v3-info))]/10 rounded-lg uppercase tracking-wide">
                        Chiều
                    </div>
                    <div className="space-y-0">
                        {afternoon.map((item, index) => (
                            <TimelineItem key={item.id} item={item} isLast={index === afternoon.length - 1} />
                        ))}
                    </div>
                </div>
            )}

            {items.length === 0 && (
                <div className="text-center py-8 text-sm text-[hsl(var(--v3-muted-foreground))]">
                    Không có lịch nào
                </div>
            )}
        </div>
    );
}

function TimelineItem({ item, isLast }: { item: (typeof scheduleItems)[number]; isLast: boolean }) {
    const [startTime, endTime] = item.time.split(" - ");

    return (
        <div className="flex gap-4 group cursor-pointer">
            {/* Time Column */}
            <div className="w-14 shrink-0 text-right">
                <div className="text-sm font-bold text-[hsl(var(--v3-primary))]">
                    {startTime}
                </div>
                {endTime && (
                    <div className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                        {endTime}
                    </div>
                )}
            </div>

            {/* Timeline Line */}
            <div className="relative flex flex-col items-center pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--v3-primary))] ring-4 ring-[hsl(var(--v3-primary))]/10 shrink-0" />
                {!isLast && <div className="w-0.5 flex-1 bg-[hsl(var(--v3-border))]" />}
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-5", !isLast && "mb-4 border-b border-black/5")}>
                <h4 className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))] mb-1 group-hover:text-[hsl(var(--v3-primary))] transition-colors">
                    {item.title}
                </h4>
                <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--v3-muted-foreground))]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.location}</span>
                </div>
            </div>
        </div>
    );
}
