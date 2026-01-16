"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { meetingRooms, roomBookings, MeetingRoom } from "@/data/calendar-data";
import { PlusIcon } from "@radix-ui/react-icons";
import { Users, MapPin, Monitor, Mic, Video, CheckCircle2, XCircle, Clock } from "lucide-react";

function RoomCard({ room }: { room: MeetingRoom }) {
    const statusConfig = {
        available: { label: "Trống", class: "bg-green-100 text-green-700", icon: CheckCircle2 },
        booked: { label: "Đã đặt", class: "bg-red-100 text-red-700", icon: XCircle },
        maintenance: { label: "Bảo trì", class: "bg-gray-100 text-gray-700", icon: Clock },
    };
    const { label, class: statusClass, icon: StatusIcon } = statusConfig[room.status];

    return (
        <div className="v3-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-[hsl(var(--v3-card-foreground))]">{room.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--v3-muted-foreground))] mt-1">
                        <MapPin className="w-4 h-4" />
                        {room.location}
                    </div>
                </div>
                <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", statusClass)}>
                    <StatusIcon className="w-3 h-3" />
                    {label}
                </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-[hsl(var(--v3-muted-foreground))] mb-3">
                <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {room.capacity} người
                </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {room.equipment.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-[hsl(var(--v3-muted))] text-xs rounded-full text-[hsl(var(--v3-muted-foreground))]">
                        {item}
                    </span>
                ))}
            </div>

            <button
                disabled={room.status !== "available"}
                className={cn(
                    "w-full h-9 rounded-lg text-sm font-medium transition-colors",
                    room.status === "available"
                        ? "bg-[hsl(var(--v3-primary))] text-white hover:bg-[hsl(var(--v3-primary-hover))]"
                        : "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))] cursor-not-allowed"
                )}
            >
                {room.status === "available" ? "Đặt phòng" : "Không khả dụng"}
            </button>
        </div>
    );
}

export default function CalendarRoomPage() {
    return (
        <PageLayout activeModule="calendar" activeSubMenu="room">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Đặt phòng họp</h1>
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                        Đặt phòng mới
                    </button>
                </div>

                {/* Room Grid */}
                <div>
                    <h3 className="font-semibold text-[hsl(var(--v3-card-foreground))] mb-4">
                        Danh sách phòng họp ({meetingRooms.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {meetingRooms.map((room) => (
                            <RoomCard key={room.id} room={room} />
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
