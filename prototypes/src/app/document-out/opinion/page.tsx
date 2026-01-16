"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentOutOpinion } from "@/data/document-out-data";
import { cn } from "@/lib/utils";
import {
    CheckCircledIcon,
    ChatBubbleIcon,
} from "@radix-ui/react-icons";

const tabs = [
    { id: "pending", label: "Chờ cho ý kiến", count: 1 },
    { id: "done", label: "Đã cho ý kiến", count: 0 },
];

export default function DocumentOutOpinionPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentOutOpinion);

    const filteredData = data.filter((item) => {
        if (activeTab === "pending") return item.status === "pending";
        return item.status === "done";
    });

    const handleStarToggle = (item: DocumentItem) => {
        setData((prev) =>
            prev.map((d) =>
                d.id === item.id ? { ...d, isImportant: !d.isImportant } : d
            )
        );
    };

    const handleRowClick = (item: DocumentItem) => {
        router.push(`/document-out/${item.id}`);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <PageLayout activeModule="doc-out" activeSubMenu="opinion">
            <div className="space-y-4">
                {/* Header & Filters */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Cho ý kiến văn bản</h1>

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
                                        : "bg-[hsl(var(--v3-border))] text-[hsl(var(--v3-muted-foreground))]"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <DocumentFilters
                            searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                            showDateFilter={true}
                            showAdvancedSearch={true}
                        />
                        {hasSelection && (
                            <div className="flex items-center gap-2">
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                                    <ChatBubbleIcon className="w-4 h-4" />
                                    Gửi ý kiến
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <DocumentTable
                    data={filteredData}
                    showCheckbox={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onStarToggle={handleStarToggle}
                    onRowClick={handleRowClick}
                />
            </div>
        </PageLayout>
    );
}
