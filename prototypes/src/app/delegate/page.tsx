"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { PlusIcon, PersonIcon, MagnifyingGlassIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { ArrowRight, Calendar, CheckCircle2, XCircle, Clock, FileSignature, ShieldAlert, ArrowRightCircle } from "lucide-react";

// Mock delegation data
const delegations = [
    {
        id: "UQ001",
        from: "Nguyễn Văn A",
        fromRole: "Phó Giám đốc",
        fromDept: "Ban Lãnh đạo",
        to: "Trần Thị B",
        toRole: "Trưởng phòng",
        toDept: "Phòng Tổng hợp",
        startDate: "15/01/2026",
        endDate: "20/01/2026",
        reason: "Đi công tác tại TP.HCM",
        scope: "Ký duyệt văn bản đến, chỉ đạo xử lý văn bản",
        status: "active",
        documentsCount: 12,
    },
    {
        id: "UQ002",
        from: "Lê Văn C",
        fromRole: "Trưởng phòng",
        fromDept: "Phòng CNTT",
        to: "Phạm Thị D",
        toRole: "Phó phòng",
        toDept: "Phòng CNTT",
        startDate: "10/01/2026",
        endDate: "12/01/2026",
        reason: "Nghỉ phép cá nhân",
        scope: "Xử lý văn bản nội bộ, phân công nhiệm vụ",
        status: "expired",
        documentsCount: 5,
    },
    {
        id: "UQ003",
        from: "Hoàng Văn E",
        fromRole: "Giám đốc",
        fromDept: "Ban Lãnh đạo",
        to: "Nguyễn Văn A",
        toRole: "Phó Giám đốc",
        toDept: "Ban Lãnh đạo",
        startDate: "25/01/2026",
        endDate: "30/01/2026",
        reason: "Đi công tác nước ngoài",
        scope: "Toàn bộ quyền ký duyệt và chỉ đạo điều hành",
        status: "pending",
        documentsCount: 0,
    },
    {
        id: "UQ004",
        from: "Phạm Văn G",
        fromRole: "Chánh Văn phòng",
        fromDept: "Văn phòng Bộ",
        to: "Lê Thị H",
        toRole: "Phó Chánh VP",
        toDept: "Văn phòng Bộ",
        startDate: "18/01/2026",
        endDate: "19/01/2026",
        reason: "Họp tập trung",
        scope: "Ký thừa lệnh văn bản hành chính",
        status: "active",
        documentsCount: 8,
    },
];

const stats = {
    total: 15,
    active: 4,
    pending: 2,
    expired: 9,
};

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; class: string; icon: React.ElementType }> = {
        active: { label: "Đang hiệu lực", class: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
        expired: { label: "Hết hiệu lực", class: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle },
        pending: { label: "Chờ hiệu lực", class: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    };
    const { label, class: className, icon: Icon } = config[status] || config.pending;
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", className)}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}

function DelegateStats() {
    return (
        <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-[hsl(var(--v3-primary))/10] rounded-lg">
                        <FileSignature className="w-6 h-6 text-[hsl(var(--v3-primary))]" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.total}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Tổng số ủy quyền</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.active}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Đang hiệu lực</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.pending}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Chờ hiệu lực</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--v3-border))] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <XCircle className="w-6 h-6 text-gray-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-[hsl(var(--v3-card-foreground))]">{stats.expired}</p>
                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))]">Đã kết thúc</p>
                </div>
            </div>
        </div>
    );
}

export default function DelegatePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    return (
        <PageLayout activeModule="delegate" activeSubMenu="delegate">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Ủy quyền xử lý</h1>
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                        Tạo ủy quyền mới
                    </button>
                </div>

                <DelegateStats />

                {/* Filter Bar */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[hsl(var(--v3-border))] shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo người ủy quyền, người nhận..."
                            className="w-full h-9 pl-9 pr-4 rounded-lg bg-[hsl(var(--v3-muted))/50] border-transparent focus:bg-white focus:border-[hsl(var(--v3-primary))] focus:ring-1 focus:ring-[hsl(var(--v3-primary))] transition-all text-sm outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="h-6 w-px bg-[hsl(var(--v3-border))]" />
                    <div className="flex items-center gap-2">
                        {["all", "active", "pending", "expired"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    filterStatus === status
                                        ? "bg-[hsl(var(--v3-primary))] text-white"
                                        : "bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))/80]"
                                )}
                            >
                                {status === "all" ? "Tất cả" :
                                    status === "active" ? "Đang hiệu lực" :
                                        status === "pending" ? "Chờ hiệu lực" : "Đã kết thúc"}
                            </button>
                        ))}
                    </div>
                    <button className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--v3-border))] text-xs font-medium hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <MixerHorizontalIcon className="w-3.5 h-3.5" />
                        Bộ lọc khác
                    </button>
                </div>

                {/* Delegation Cards */}
                <div className="space-y-4">
                    {delegations.map((item) => (
                        <div key={item.id} className="group bg-white rounded-xl border border-[hsl(var(--v3-border))] shadow-sm hover:shadow-md transition-all p-5">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-6">
                                    {/* From */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full ring-2 ring-[hsl(var(--v3-primary))/10] bg-[hsl(var(--v3-primary))/5] flex items-center justify-center">
                                            <PersonIcon className="w-6 h-6 text-[hsl(var(--v3-primary))]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">{item.from}</p>
                                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{item.fromRole}</p>
                                            <p className="text-[10px] text-[hsl(var(--v3-muted-foreground))] uppercase tracking-wider mt-0.5">{item.fromDept}</p>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex flex-col items-center gap-1 px-4">
                                        <div className="h-px w-16 bg-[hsl(var(--v3-border))]" />
                                        <div className="p-1 rounded-full bg-[hsl(var(--v3-muted))]">
                                            <ArrowRight className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                                        </div>
                                        <div className="h-px w-16 bg-[hsl(var(--v3-border))]" />
                                    </div>

                                    {/* To */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full ring-2 ring-green-100 bg-green-50 flex items-center justify-center">
                                            <PersonIcon className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">{item.to}</p>
                                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{item.toRole}</p>
                                            <p className="text-[10px] text-[hsl(var(--v3-muted-foreground))] uppercase tracking-wider mt-0.5">{item.toDept}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={item.status} />
                                    <span className="text-xs font-mono text-[hsl(var(--v3-muted-foreground))]">#{item.id}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-6 pt-5 border-t border-[hsl(var(--v3-border))]">
                                <div className="col-span-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-3.5 h-3.5 text-[hsl(var(--v3-muted-foreground))]" />
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))] font-medium">Thời gian ủy quyền</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))] pl-5.5">
                                        {item.startDate} - {item.endDate}
                                    </p>
                                </div>

                                <div className="col-span-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ShieldAlert className="w-3.5 h-3.5 text-[hsl(var(--v3-muted-foreground))]" />
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))] font-medium">Lý do</span>
                                    </div>
                                    <p className="text-sm text-[hsl(var(--v3-card-foreground))] pl-5.5 line-clamp-1">{item.reason}</p>
                                </div>

                                <div className="col-span-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowRightCircle className="w-3.5 h-3.5 text-[hsl(var(--v3-muted-foreground))]" />
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))] font-medium">Phạm vi</span>
                                    </div>
                                    <p className="text-sm text-[hsl(var(--v3-card-foreground))] pl-5.5 line-clamp-1">{item.scope}</p>
                                </div>

                                <div className="col-span-2 text-right">
                                    <div className="inline-flex flex-col items-end">
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))] mb-0.5">Văn bản đã xử lý</span>
                                        <span className="text-xl font-bold text-[hsl(var(--v3-primary))]">{item.documentsCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
}
