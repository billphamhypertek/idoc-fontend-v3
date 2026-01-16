"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentInInfo } from "@/data/document-in-data";
import {
    EyeOpenIcon,
    ReloadIcon,
} from "@radix-ui/react-icons";

export default function DocumentInInfoPage() {
    const router = useRouter();
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
        router.push(`/document-in/${item.id}`);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <PageLayout activeModule="doc-in" activeSubMenu="info">
            <div className="space-y-4">
                {/* Header & Filters */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Nhận để biết</h1>

                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">
                            Tổng cộng: <strong className="text-[hsl(var(--v3-card-foreground))]">{data.length}</strong> văn bản
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <DocumentFilters
                            searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                            showDateFilter={true}
                            showAdvancedSearch={true}
                        />
                        {hasSelection && (
                            <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                <EyeOpenIcon className="w-4 h-4" />
                                Đánh dấu đã đọc ({selectedIds.length})
                            </button>
                        )}
                        <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[hsl(var(--v3-border))] text-[hsl(var(--v3-muted-foreground))] hover:bg-[hsl(var(--v3-muted))] transition-colors">
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
