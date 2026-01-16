"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentInCoordinate } from "@/data/document-in-data";
import { cn } from "@/lib/utils";
import {
    CheckCircledIcon,
    ChatBubbleIcon,
    ReloadIcon,
} from "@radix-ui/react-icons";

const tabs = [
    { id: "pending", label: "Chờ phối hợp", count: 1 },
    { id: "processing", label: "Đang phối hợp", count: 1 },
];

export default function DocumentInCoordinatePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentInCoordinate);

    const filteredData = data.filter((item) => {
        if (activeTab === "pending") return item.status === "pending";
        return item.status === "processing";
    });

    const handleStarToggle = (item: DocumentItem) => {
        setData((prev) =>
            prev.map((d) =>
                d.id === item.id ? { ...d, isImportant: !d.isImportant } : d
            )
        );
    };

    const handleRowClick = (item: DocumentItem) => {
        router.push(`/document-in/${item.id}`);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <PageLayout activeModule="doc-in" activeSubMenu="coordinate">
            <div className="space-y-4">
                {/* Header & Filters */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Phối hợp</h1>

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
                                <span
                                    className={cn(
                                        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
                                        activeTab === tab.id
                                            ? "bg-[hsl(var(--v3-primary))] text-white"
                                            : "bg-[hsl(var(--v3-border))] text-[hsl(var(--v3-muted-foreground))]"
                                    )}
                                >
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
                            <>
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
                                    <CheckCircledIcon className="w-4 h-4" />
                                    Hoàn thành phối hợp
                                </button>
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                    <ChatBubbleIcon className="w-4 h-4" />
                                    Gửi ý kiến
                                </button>
                            </>
                        )}
                        <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[hsl(var(--v3-border))] text-[hsl(var(--v3-muted-foreground))] hover:bg-[hsl(var(--v3-muted))] transition-colors">
                            <ReloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <DocumentTable
                    data={filteredData}
                    showCheckbox={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onRowClick={handleRowClick}
                    onStarToggle={handleStarToggle}
                />
            </div>
        </PageLayout>
    );
}
