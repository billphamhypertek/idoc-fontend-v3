"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskItem, tasksFollowing } from "@/data/tasks-data";
import { EyeOpenIcon } from "@radix-ui/react-icons";

export default function TasksFollowingPage() {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data] = useState<TaskItem[]>(tasksFollowing);

    const handleRowClick = (item: TaskItem) => {
        router.push(`/tasks/${item.id}`);
    };

    return (
        <PageLayout activeModule="tasks" activeSubMenu="following">
            <div className="space-y-4">
                {/* Page Header */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Đang theo dõi</h1>

                {/* Info & Filters */}
                <div className="flex items-center justify-between">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-[hsl(var(--v3-primary))]">
                        <EyeOpenIcon className="w-5 h-5" />
                        <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">
                            Các nhiệm vụ đang theo dõi ({data.length})
                        </span>
                    </div>

                    {/* Filters */}
                    <DocumentFilters
                        searchPlaceholder="Tìm kiếm nhiệm vụ..."
                        showDateFilter={true}
                        showAdvancedSearch={true}
                    />
                </div>

                {/* Table */}
                <TaskTable
                    data={data}
                    showCheckbox={false}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onRowClick={handleRowClick}
                />
            </div>
        </PageLayout>
    );
}
