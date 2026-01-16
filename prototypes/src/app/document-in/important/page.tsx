"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentInImportant } from "@/data/document-in-data";
import {
    StarFilledIcon,
    ReloadIcon,
} from "@radix-ui/react-icons";

export default function DocumentInImportantPage() {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentInImportant);

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

    return (
        <PageLayout activeModule="doc-in" activeSubMenu="important">
            <div className="space-y-4">
                {/* Header & Filters */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Văn bản quan trọng</h1>

                {/* Info Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                            <StarFilledIcon className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700">
                                {data.length} văn bản quan trọng
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DocumentFilters
                            searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                            showDateFilter={true}
                            showAdvancedSearch={true}
                        />
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
