"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentInReceive } from "@/data/document-in-data";
import { cn } from "@/lib/utils";
import {
    CheckCircledIcon,
    Share1Icon,
    TargetIcon,
    ReloadIcon,
} from "@radix-ui/react-icons";

const tabs = [
    { id: "pending", label: "Chờ xử lý", count: 6 },
    { id: "done", label: "Đã xử lý", count: 2 },
];

export default function DocumentInReceivePage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentInReceive);

    // Filter data by tab
    const filteredData = data.filter((item) => {
        if (activeTab === "pending") {
            return item.status === "pending" || item.status === "processing";
        }
        return item.status === "done" || item.status === "issued";
    });

    const handleStarToggle = (item: DocumentItem) => {
        setData((prev) =>
            prev.map((d) =>
                d.id === item.id ? { ...d, isImportant: !d.isImportant } : d
            )
        );
    };

    const handleRowClick = (item: DocumentItem) => {
        console.log("Row clicked:", item);
        // TODO: Navigate to detail page
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <PageLayout activeModule="doc-in" activeSubMenu="receive">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>Văn bản đến</span>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">Tiếp nhận văn bản</span>
                        </nav>
                    </div>
                </div>

                {/* Filters */}
                <DocumentFilters
                    searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                    showDateFilter={true}
                    showAdvancedSearch={true}
                />

                {/* Tabs + Actions */}
                <div className="flex items-center justify-between">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    activeTab === tab.id
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                {tab.label}
                                <span
                                    className={cn(
                                        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
                                        activeTab === tab.id
                                            ? "bg-[hsl(var(--v3-primary))] text-white"
                                            : "bg-gray-200 text-gray-600"
                                    )}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {hasSelection && (
                            <>
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
                                    <CheckCircledIcon className="w-4 h-4" />
                                    Hoàn thành ({selectedIds.length})
                                </button>
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                    <Share1Icon className="w-4 h-4" />
                                    Chuyển xử lý
                                </button>
                                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <TargetIcon className="w-4 h-4" />
                                    Giao việc
                                </button>
                            </>
                        )}
                        <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
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
