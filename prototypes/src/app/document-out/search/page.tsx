"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentOutSearch } from "@/data/document-out-data";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function DocumentOutSearchPage() {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentOutSearch);
    const [searchResults, setSearchResults] = useState<DocumentItem[]>(documentOutSearch);

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
        <PageLayout activeModule="doc-out" activeSubMenu="search">
            <div className="space-y-4">
                {/* Header & Filters */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Tra cứu văn bản</h1>

                {/* Results count */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[hsl(var(--v3-muted-foreground))]">
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        <span className="text-sm">
                            Tìm thấy <strong className="text-[hsl(var(--v3-card-foreground))]">{searchResults.length}</strong> văn bản
                        </span>
                    </div>

                    <DocumentFilters
                        searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu | Nội dung"
                        showDateFilter={true}
                        showAdvancedSearch={true}
                    />
                </div>

                {/* Table */}
                <DocumentTable
                    data={searchResults}
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
