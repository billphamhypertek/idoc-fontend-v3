"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentInternalSearch } from "@/data/document-internal-data";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function DocumentInternalSearchPage() {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentInternalSearch);

    const handleStarToggle = (item: DocumentItem) => {
        setData((prev) =>
            prev.map((d) =>
                d.id === item.id ? { ...d, isImportant: !d.isImportant } : d
            )
        );
    };

    const handleRowClick = (item: DocumentItem) => {
        router.push(`/document-internal/${item.id}`);
    };

    return (
        <PageLayout activeModule="doc-internal" activeSubMenu="search">
            <div className="space-y-4">
                {/* Header */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Tra cứu văn bản</h1>

                {/* Info & Filters */}
                <div className="flex items-center justify-between">
                    {/* Results count */}
                    <div className="flex items-center gap-2 text-[hsl(var(--v3-muted-foreground))]">
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        <span className="text-sm">
                            Tìm thấy <strong className="text-[hsl(var(--v3-card-foreground))]">{data.length}</strong> văn bản
                        </span>
                    </div>

                    {/* Filters */}
                    <DocumentFilters
                        searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu | Nội dung"
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
