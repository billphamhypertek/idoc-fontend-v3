"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { PlusIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Car, Calendar, User, MapPin, CheckCircle2, Clock, XCircle, Fuel, AlertTriangle, Settings, History, Navigation } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock stats data
const stats = {
    total: 12,
    available: 8,
    inUse: 3,
    maintenance: 1,
};

// Mock usage data for chart
const usageData = [
    { day: "T2", trips: 15 },
    { day: "T3", trips: 18 },
    { day: "T4", trips: 12 },
    { day: "T5", trips: 20 },
    { day: "T6", trips: 16 },
    { day: "T7", trips: 8 },
    { day: "CN", trips: 4 },
];

// Mock vehicle data with visuals
const vehicles = [
    {
        id: "XE001",
        plate: "80A-123.45",
        name: "Toyota Camry 2.5Q",
        type: "Sedan",
        capacity: 4,
        driver: "Nguyễn Văn Tài",
        driverPhone: "0912.345.678",
        status: "available",
        lastMaintenance: "01/01/2026",
        nextMaintenance: "01/04/2026",
        fuelLevel: 85,
        location: "Gara B1",
        image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=2800&ixlib=rb-4.0.3",
    },
    {
        id: "XE002",
        plate: "80A-678.90",
        name: "Ford Transit Luxury",
        type: "Van",
        capacity: 16,
        driver: "Trần Văn Bình",
        driverPhone: "0987.654.321",
        status: "in-use",
        currentTrip: {
            destination: "Bộ Kế hoạch & Đầu tư",
            requester: "Vụ Tổ chức cán bộ",
            returnTime: "17:00 hôm nay"
        },
        lastMaintenance: "15/12/2025",
        fuelLevel: 45,
        location: "Đang di chuyển",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    },
    {
        id: "XE003",
        plate: "80A-111.99",
        name: "Toyota Fortuner Legender",
        type: "SUV",
        capacity: 7,
        driver: "Lê Văn Cường",
        driverPhone: "0909.123.456",
        status: "maintenance",
        issue: "Bảo dưỡng định kỳ",
        estimatedFinish: "14:00 22/01/2026",
        lastMaintenance: "10/01/2026",
        fuelLevel: 20,
        location: "Toyota Thanh Xuân",
        image: "https://images.unsplash.com/photo-1696580436068-017e92329381?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    },
    {
        id: "XE004",
        plate: "80A-555.55",
        name: "VinFast Lux A2.0",
        type: "Sedan",
        capacity: 4,
        driver: "Phạm Văn Dũng",
        driverPhone: "0912.999.888",
        status: "available",
        lastMaintenance: "05/01/2026",
        nextMaintenance: "05/04/2026",
        fuelLevel: 92,
        location: "Gara B1",
        image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=2836&ixlib=rb-4.0.3",
    },
];

const bookings = [
    {
        id: "DX001",
        vehicle: "Toyota Camry 2.5Q",
        plate: "80A-123.45",
        requester: "Vũ Ngọc Thiềm",
        department: "Phòng Tổng hợp",
        purpose: "Đưa đón lãnh đạo đi họp Chính phủ",
        date: "20/01/2026",
        time: "08:00 - 11:30",
        destination: "Văn phòng Chính phủ",
        status: "approved",
        passengers: 2
    },
    {
        id: "DX002",
        vehicle: "Ford Transit Luxury",
        plate: "80A-678.90",
        requester: "Lê Thị Hoa",
        department: "Vụ Pháp chế",
        purpose: "Đi công tác địa phương",
        date: "21/01/2026",
        time: "07:00 - 18:00",
        destination: "Hải Phòng",
        status: "pending",
        passengers: 8
    }
];

function VehicleStats() {
    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[hsl(var(--v3-primary))] to-[hsl(var(--v3-primary-hover))] rounded-xl p-5 text-white shadow-lg shadow-blue-900/10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Car className="w-6 h-6" />
                    </div>
                    <div className="px-2 py-1 bg-white/20 rounded text-xs font-medium backdrop-blur-sm">
                        Tổng số
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-sm opacity-80">Phương tiện quản lý</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">Sẵn sàng</span>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.available}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Xe có thể đặt</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-[1.25rem] shadow-sm flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))] mb-4">Nhu cầu đặt xe tuần này</h3>
                    <div className="h-[60px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData}>
                                <defs>
                                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="trips" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTrips)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-[hsl(var(--v3-card-foreground))]">93</span>
                    <span className="text-xs text-green-600 font-medium">+12% so với tuần trước</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Settings className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700">Bảo trì</span>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.maintenance}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Xe đang bảo dưỡng</p>
                </div>
            </div>
        </div>
    );
}

function VehicleCard({ vehicle }: { vehicle: typeof vehicles[0] }) {
    const statusConfig = {
        available: { label: "Sẵn sàng", class: "bg-green-100/50 text-green-700 border-green-200", icon: CheckCircle2 },
        "in-use": { label: "Đang di chuyển", class: "bg-blue-100/50 text-blue-700 border-blue-200", icon: Navigation },
        maintenance: { label: "Đang bảo trì", class: "bg-amber-100/50 text-amber-700 border-amber-200", icon: Settings },
    };
    const { label, class: statusClass, icon: StatusIcon } = statusConfig[vehicle.status as keyof typeof statusConfig];

    return (
        <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm overflow-hidden hover:shadow-md transition-all group">
            {/* Image Header */}
            <div className="h-32 bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" // Use standard img tag
                />
                <div className="absolute bottom-3 left-4 z-20 text-white">
                    <h4 className="font-bold text-lg leading-tight">{vehicle.name}</h4>
                    <span className="text-sm opacity-90 font-mono tracking-wide">{vehicle.plate}</span>
                </div>
                <div className="absolute top-3 right-3 z-20">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md border", statusClass)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {label}
                    </span>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Specific Status Info */}
                {vehicle.status === "in-use" && vehicle.currentTrip && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-blue-800 font-medium">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Đang đến: {vehicle.currentTrip.destination}</span>
                        </div>
                        <div className="flex justify-between text-blue-600/80 pl-5.5">
                            <span>{vehicle.currentTrip.requester}</span>
                            <span>Về lúc: {vehicle.currentTrip.returnTime}</span>
                        </div>
                    </div>
                )}
                {vehicle.status === "maintenance" && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-800 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{vehicle.issue}</span>
                        </div>
                        <div className="text-amber-600/80 pl-5.5">
                            Xong dự kiến: {vehicle.estimatedFinish}
                        </div>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    <div className="col-span-2 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-[hsl(var(--v3-card-foreground))] truncate">{vehicle.driver}</p>
                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{vehicle.driverPhone}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[hsl(var(--v3-muted-foreground))]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{vehicle.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[hsl(var(--v3-muted-foreground))]">
                        <User className="w-3.5 h-3.5" />
                        <span>{vehicle.capacity} chỗ</span>
                    </div>
                </div>

                {/* Status Bars */}
                <div className="space-y-3 pt-2 border-t border-dashed">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-[hsl(var(--v3-muted-foreground))]">
                                <Fuel className="w-3.5 h-3.5" />
                                <span>Nhiên liệu</span>
                            </div>
                            <span className={cn(
                                "font-medium",
                                vehicle.fuelLevel < 30 ? "text-red-500" : "text-[hsl(var(--v3-card-foreground))]"
                            )}>{vehicle.fuelLevel}%</span>
                        </div>
                        <div className="h-1.5 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full", vehicle.fuelLevel < 30 ? "bg-red-500" : "bg-green-500")}
                                style={{ width: `${vehicle.fuelLevel}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    disabled={vehicle.status !== "available"}
                    className={cn(
                        "w-full h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        vehicle.status === "available"
                            ? "bg-[hsl(var(--v3-primary))] text-white hover:bg-[hsl(var(--v3-primary-hover))] shadow-sm"
                            : "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))] cursor-not-allowed"
                    )}
                >
                    {vehicle.status === "available" ? (
                        <>
                            <Calendar className="w-4 h-4" />
                            Đăng ký xe
                        </>
                    ) : vehicle.status === "in-use" ? (
                        "Đang sử dụng"
                    ) : (
                        "Đang bảo trì"
                    )}
                </button>
            </div>
        </div>
    );
}

function BookingItem({ booking }: { booking: typeof bookings[0] }) {
    return (
        <div className="flex items-start gap-4 p-4 bg-white border border-[hsl(var(--v3-border))] rounded-xl hover:shadow-sm transition-all">
            <div className="flex flex-col items-center min-w-[60px] text-center">
                <div className="text-lg font-bold text-[hsl(var(--v3-card-foreground))]">{booking.date.split('/')[0]}</div>
                <div className="text-xs text-[hsl(var(--v3-muted-foreground))] uppercase">Tháng {booking.date.split('/')[1]}</div>
                <div className="mt-2 text-xs font-mono bg-[hsl(var(--v3-muted))] px-1.5 py-0.5 rounded text-[hsl(var(--v3-muted-foreground))]">
                    {booking.time.split(' - ')[0]}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-[hsl(var(--v3-card-foreground))]">{booking.purpose}</h4>
                    <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium border",
                        booking.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                        {booking.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[hsl(var(--v3-card-foreground))] mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[hsl(var(--v3-primary))]" />
                    <span className="font-medium">{booking.destination}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[hsl(var(--v3-muted-foreground))] bg-[hsl(var(--v3-muted))/30] p-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                        <Car className="w-3 h-3" />
                        <span>{booking.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span>{booking.requester}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function VehiclesPage() {
    return (
        <PageLayout activeModule="vehicles" activeSubMenu="vehicles">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Quản lý xe</h1>
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                        Đặt xe mới
                    </button>
                </div>

                <VehicleStats />

                <Tabs defaultValue="vehicles" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-white border text-[hsl(var(--v3-card-foreground))]">
                            <TabsTrigger value="vehicles" className="gap-2">
                                <Car className="w-4 h-4" />
                                Danh sách xe ({vehicles.length})
                            </TabsTrigger>
                            <TabsTrigger value="requests" className="gap-2">
                                <History className="w-4 h-4" />
                                Yêu cầu đặt xe ({bookings.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-64">
                            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm xe, biển số..."
                                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))/20] focus:border-[hsl(var(--v3-primary))]"
                            />
                        </div>
                    </div>

                    <TabsContent value="vehicles" className="m-0 focus-visible:ring-0">
                        <div className="grid grid-cols-4 gap-6">
                            {vehicles.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="requests" className="m-0 focus-visible:ring-0">
                        <div className="grid grid-cols-2 gap-4">
                            {bookings.map((booking) => (
                                <BookingItem key={booking.id} booking={booking} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
}
