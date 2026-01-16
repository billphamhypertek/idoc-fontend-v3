"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskItem, tasksAssigned } from "@/data/tasks-data";
import { cn } from "@/lib/utils";
import {
    CheckCircledIcon,
    ReloadIcon,
    ChatBubbleIcon,
} from "@radix-ui/react-icons";

const tabs = [
    { id: "all", label: "Tất cả", count: 4 },
    { id: "pending", label: "Chờ xử lý", count: 1 },
    { id: "in-progress", label: "Đang thực hiện", count: 2 },
    { id: "overdue", label: "Quá hạn", count: 1 },
];

export default function TasksAssignedPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data] = useState<TaskItem[]>(tasksAssigned);

    const filteredData = activeTab === "all"
        ? data
        : data.filter((item) => item.status === activeTab);

    const handleRowClick = (item: TaskItem) => {
        router.push(`/tasks/${item.id}`);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <PageLayout activeModule="tasks" activeSubMenu="assigned">
            <div className="space-y-4">
                {/* Page Header */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Nhiệm vụ được giao</h1>

                {/* Tabs + Actions */}
                <div className="flex items-center justify-between">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-[hsl(var(--v3-muted))] p-1 rounded-lg">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    activeTab === tab.id
                                        ? "bg-white text-[hsl(var(--v3-card-foreground))] shadow-sm"
                                        : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                )}
                            >
                                {tab.label}
                                <span className={cn(
                                    "inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-semibold rounded-full",
                                    activeTab === tab.id
                                        ? "bg-[hsl(var(--v3-primary))] text-white"
                                        : "bg-[hsl(var(--v3-border))] text-[hsl(var(--v3-muted-foreground))]",
                                    tab.id === "overdue" && activeTab !== tab.id && "bg-red-100 text-red-600"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <DocumentFilters
                            searchPlaceholder="Tìm kiếm nhiệm vụ..."
                            showDateFilter={true}
                            showAdvancedSearch={true}
                        />
                        {hasSelection && (
                            <>
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-sm font-medium text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))] transition-colors">
                                    <ChatBubbleIcon className="w-4 h-4" />
                                    Báo cáo tiến độ
                                </button>
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-green-500 bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
                                    <CheckCircledIcon className="w-4 h-4" />
                                    Hoàn thành
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Table */}
                <TaskTable
                    data={filteredData}
                    showCheckbox={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onRowClick={handleRowClick}
                />
            </div>
        </PageLayout>
    );
}
