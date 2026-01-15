"use client";

import { Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { scheduleItems } from "@/data/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScheduleItemProps {
    time: string;
    title: string;
    location: string;
    participants: string;
}

function ScheduleItem({ time, title, location, participants }: ScheduleItemProps) {
    return (
        <div className="flex gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors group cursor-pointer">
            <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-sm font-semibold text-[hsl(var(--v3-primary))]">
                    {time.split(" - ")[0]}
                </span>
                <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                    {time.split(" - ")[1]}
                </span>
            </div>
            <div className="flex-1 border-l-2 border-[hsl(var(--v3-primary))] pl-3">
                <h4 className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] group-hover:text-[hsl(var(--v3-primary))] transition-colors line-clamp-2">
                    {title}
                </h4>
                {location && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[hsl(var(--v3-muted-foreground))]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{location}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ScheduleCardProps {
    className?: string;
}

export function ScheduleCard({ className }: ScheduleCardProps) {
    const today = new Date();
    const formatDate = () => {
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        return `${days[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}`;
    };

    const morningItems = scheduleItems.filter((item) => item.period === "morning");
    const afternoonItems = scheduleItems.filter((item) => item.period === "afternoon");

    return (
        <div className={cn("bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm flex flex-col", className)}>
            <div className="shrink-0 flex items-center justify-between p-3 border-b border-[hsl(var(--v3-border))]">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 bg-[hsl(var(--v3-primary))]/10 rounded-lg">
                        <Clock className="w-5 h-5 text-[hsl(var(--v3-primary))]" />
                    </div>
                    <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                        {formatDate()}
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    <button className="p-1.5 rounded hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <ChevronLeft className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                    </button>
                    <button className="px-2.5 py-1.5 text-sm font-medium text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/10 rounded transition-colors">
                        Hôm nay
                    </button>
                    <button className="p-1.5 rounded hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <ChevronRight className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                    </button>
                </div>
            </div>

            <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0 p-3">
                <TabsList className="shrink-0 w-full mb-2">
                    <TabsTrigger value="board" className="flex-1 text-sm">
                        Lịch Ban
                    </TabsTrigger>
                    <TabsTrigger value="unit" className="flex-1 text-sm">
                        Lịch Đơn vị
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="board" className="flex-1 min-h-0 mt-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-3">
                            {/* Morning */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-white bg-[hsl(var(--v3-warning))] px-2 py-0.5 rounded">
                                        SÁNG
                                    </span>
                                    <div className="flex-1 h-px bg-[hsl(var(--v3-border))]" />
                                </div>
                                <div className="space-y-1">
                                    {morningItems.map((item) => (
                                        <ScheduleItem key={item.id} {...item} />
                                    ))}
                                </div>
                            </div>

                            {/* Afternoon */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-white bg-[hsl(var(--v3-info))] px-2 py-0.5 rounded">
                                        CHIỀU
                                    </span>
                                    <div className="flex-1 h-px bg-[hsl(var(--v3-border))]" />
                                </div>
                                <div className="space-y-1">
                                    {afternoonItems.map((item) => (
                                        <ScheduleItem key={item.id} {...item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="unit" className="flex-1 min-h-0 mt-0">
                    <div className="flex items-center justify-center h-full text-sm text-[hsl(var(--v3-muted-foreground))]">
                        Chưa có lịch đơn vị
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
