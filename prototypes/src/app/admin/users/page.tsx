"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Users, Shield, CheckCircle2, XCircle, Settings } from "lucide-react";

// Mock users data
const users = [
    {
        id: "U001",
        name: "Nguyễn Văn A",
        email: "nguyenvana@gov.vn",
        department: "Phòng Tổng hợp",
        role: "Trưởng phòng",
        status: "active",
        lastLogin: "15/01/2026 10:30",
    },
    {
        id: "U002",
        name: "Trần Thị B",
        email: "tranthib@gov.vn",
        department: "Phòng CNTT",
        role: "Chuyên viên",
        status: "active",
        lastLogin: "15/01/2026 09:15",
    },
    {
        id: "U003",
        name: "Lê Văn C",
        email: "levanc@gov.vn",
        department: "Phòng Hành chính",
        role: "Phó phòng",
        status: "inactive",
        lastLogin: "10/01/2026 14:00",
    },
];

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; class: string }> = {
        active: { label: "Hoạt động", class: "bg-green-100 text-green-700" },
        inactive: { label: "Không hoạt động", class: "bg-gray-100 text-gray-700" },
    };
    const { label, class: className } = config[status] || config.inactive;
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", className)}>
            {label}
        </span>
    );
}

export default function AdminUsersPage() {
    return (
        <PageLayout activeModule="admin" activeSubMenu="users">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Quản lý người dùng</h1>
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                        Thêm người dùng
                    </button>
                </div>

                {/* Users Table */}
                <div className="v3-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white border-b border-[hsl(var(--v3-border))]">
                                <th className="w-14 px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase">STT</th>
                                <th className="min-w-[200px] px-4 py-3.5 text-left text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase">Người dùng</th>
                                <th className="min-w-[150px] px-4 py-3.5 text-left text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase">Đơn vị</th>
                                <th className="min-w-[120px] px-4 py-3.5 text-left text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase">Vai trò</th>
                                <th className="min-w-[120px] px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase">Đăng nhập cuối</th>
                                <th className="min-w-[100px] px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase">Trạng thái</th>
                                <th className="w-24 px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--v3-border))]">
                            {users.map((user, index) => (
                                <tr key={user.id} className="hover:bg-[hsl(var(--v3-muted))]/50 transition-colors">
                                    <td className="px-4 py-3 text-center text-sm text-[hsl(var(--v3-muted-foreground))]">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center text-[hsl(var(--v3-primary))] font-semibold text-sm">
                                                {user.name.split(" ").pop()?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{user.name}</p>
                                                <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">{user.department}</td>
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">{user.role}</td>
                                    <td className="px-4 py-3 text-center text-sm text-[hsl(var(--v3-muted-foreground))]">{user.lastLogin}</td>
                                    <td className="px-4 py-3 text-center"><StatusBadge status={user.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]">
                                                <Pencil1Icon className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-[hsl(var(--v3-muted-foreground))] hover:text-red-500">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    );
}
