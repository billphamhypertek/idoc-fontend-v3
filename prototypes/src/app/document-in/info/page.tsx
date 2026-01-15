"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentInInfo } from "@/data/document-in-data";
import {
    EyeOpenIcon,
    ReloadIcon,
} from "@radix-ui/react-icons";

export default function DocumentInInfoPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentInInfo);

    const handleStarToggle = (item: DocumentItem) => {
        setData((prev) =>
            prev.map((d) =>
                d.id === item.id ? { ...d, isImportant: !d.isImportant } : d
            )
        );
    };

    const handleRowClick = (item: DocumentItem) => {
        console.log("Row clicked:", item);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <PageLayout activeModule="doc-in" activeSubMenu="info">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>Văn bản đến</span>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">Nhận để biết</span>
                        </nav>
                    </div>
                </div>

                {/* Filters */}
                <DocumentFilters
                    searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                    showDateFilter={true}
                    showAdvancedSearch={true}
                />

                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            Tổng cộng: <strong className="text-gray-900">{data.length}</strong> văn bản
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasSelection && (
                            <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                <EyeOpenIcon className="w-4 h-4" />
                                Đánh dấu đã đọc ({selectedIds.length})
                            </button>
                        )}
                        <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                            <ReloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <DocumentTable
                    data={data}
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
