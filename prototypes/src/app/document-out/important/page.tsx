"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentOutImportant } from "@/data/document-out-data";
import { cn } from "@/lib/utils";
import { StarFilledIcon } from "@radix-ui/react-icons";

export default function DocumentOutImportantPage() {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentOutImportant);

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

    return (
        <PageLayout activeModule="doc-out" activeSubMenu="important">
            <div className="space-y-4">
                {/* Header & Filters */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Văn bản quan trọng</h1>

                {/* Header with star icon */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500">
                        <StarFilledIcon className="w-5 h-5" />
                        <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">
                            Các văn bản được đánh dấu quan trọng ({data.length})
                        </span>
                    </div>

                    <DocumentFilters
                        searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                        showDateFilter={true}
                        showAdvancedSearch={true}
                    />
                </div>

                {/* Table */}
                <DocumentTable
                    data={data}
                    showCheckbox={false}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onStarToggle={handleStarToggle}
                    onRowClick={handleRowClick}
                />
            </div>
        </PageLayout>
    );
}
