"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { PlusIcon, Pencil1Icon, TrashIcon, PlayIcon, PauseIcon } from "@radix-ui/react-icons";
import { Workflow, GitBranch, Clock, CheckCircle2, XCircle, Settings } from "lucide-react";

// Mock workflow data
const workflows = [
    {
        id: "WF001",
        name: "Xử lý văn bản đến",
        description: "Quy trình tiếp nhận và phân phối văn bản đến các đơn vị",
        steps: 5,
        status: "active",
        lastRun: "15/01/2026 10:30",
        runs: 156,
        successRate: 98,
    },
    {
        id: "WF002",
        name: "Phê duyệt văn bản đi",
        description: "Quy trình soạn thảo và phê duyệt văn bản đi",
        steps: 4,
        status: "active",
        lastRun: "15/01/2026 09:45",
        runs: 89,
        successRate: 95,
    },
    {
        id: "WF003",
        name: "Giao việc tự động",
        description: "Tự động phân công nhiệm vụ dựa trên loại văn bản",
        steps: 3,
        status: "paused",
        lastRun: "10/01/2026 14:00",
        runs: 45,
        successRate: 92,
    },
    {
        id: "WF004",
        name: "Nhắc nhở quá hạn",
        description: "Gửi thông báo nhắc nhở khi văn bản/nhiệm vụ sắp quá hạn",
        steps: 2,
        status: "active",
        lastRun: "15/01/2026 08:00",
        runs: 234,
        successRate: 100,
    },
];

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; class: string; icon: React.ElementType }> = {
        active: { label: "Đang hoạt động", class: "bg-green-100 text-green-700", icon: CheckCircle2 },
        paused: { label: "Tạm dừng", class: "bg-amber-100 text-amber-700", icon: PauseIcon },
        inactive: { label: "Không hoạt động", class: "bg-gray-100 text-gray-700", icon: XCircle },
    };
    const { label, class: className, icon: Icon } = config[status] || config.inactive;
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", className)}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

export default function AdminWorkflowsPage() {
    return (
        <PageLayout activeModule="admin" activeSubMenu="workflows">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Quản lý Workflow</h1>
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                        Tạo Workflow
                    </button>
                </div>

                {/* Workflow Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {workflows.map((workflow) => (
                        <div key={workflow.id} className="v3-card p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center">
                                        <Workflow className="w-5 h-5 text-[hsl(var(--v3-primary))]" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[hsl(var(--v3-card-foreground))]">{workflow.name}</h4>
                                        <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{workflow.description}</p>
                                    </div>
                                </div>
                                <StatusBadge status={workflow.status} />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-3 py-3 border-y border-[hsl(var(--v3-border))]">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-[hsl(var(--v3-card-foreground))]">{workflow.steps}</p>
                                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">Bước</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-[hsl(var(--v3-card-foreground))]">{workflow.runs}</p>
                                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">Lần chạy</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-green-600">{workflow.successRate}%</p>
                                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">Thành công</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-medium text-[hsl(var(--v3-card-foreground))]">{workflow.lastRun}</p>
                                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">Lần cuối</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    {workflow.status === "active" ? (
                                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500 text-amber-600 text-xs font-medium hover:bg-amber-50 transition-colors">
                                            <PauseIcon className="w-3 h-3" />
                                            Tạm dừng
                                        </button>
                                    ) : (
                                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-500 text-green-600 text-xs font-medium hover:bg-green-50 transition-colors">
                                            <PlayIcon className="w-3 h-3" />
                                            Kích hoạt
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]">
                                        <Pencil1Icon className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-red-50 text-[hsl(var(--v3-muted-foreground))] hover:text-red-500">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
}
