"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable, DocumentItem } from "@/components/documents/document-table";
import { documentInReceive } from "@/data/document-in-data";
import {
    DownloadIcon,
    ReloadIcon,
} from "@radix-ui/react-icons";
import { FileDown } from "lucide-react";

export default function DocumentInSearchPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [data, setData] = useState<DocumentItem[]>(documentInReceive);
    const [searchResults, setSearchResults] = useState<DocumentItem[]>(documentInReceive);

    const handleStarToggle = (item: DocumentItem) => {
        setData((prev) =>
            prev.map((d) =>
                d.id === item.id ? { ...d, isImportant: !d.isImportant } : d
            )
        );
        setSearchResults((prev) =>
            prev.map((d) =>
                d.id === item.id ? { ...d, isImportant: !d.isImportant } : d
            )
        );
    };

    const handleRowClick = (item: DocumentItem) => {
        console.log("Row clicked:", item);
    };

    const handleSearch = (value: string) => {
        if (!value.trim()) {
            setSearchResults(data);
            return;
        }
        const filtered = data.filter(
            (item) =>
                item.number.toLowerCase().includes(value.toLowerCase()) ||
                item.title.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(filtered);
    };

    const handleAdvancedSearch = (filters: Record<string, string>) => {
        console.log("Advanced search:", filters);
        // Apply filters
        let filtered = [...data];
        if (filters.numberOrSign) {
            filtered = filtered.filter((item) =>
                item.number.toLowerCase().includes(filters.numberOrSign.toLowerCase())
            );
        }
        if (filters.preview) {
            filtered = filtered.filter((item) =>
                item.title.toLowerCase().includes(filters.preview.toLowerCase())
            );
        }
        setSearchResults(filtered);
    };

    return (
        <PageLayout activeModule="doc-in" activeSubMenu="search">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>Văn bản đến</span>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">Tra cứu văn bản</span>
                        </nav>
                    </div>
                </div>

                {/* Filters */}
                <DocumentFilters
                    searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu | Nơi gửi"
                    showDateFilter={true}
                    showAdvancedSearch={true}
                    onSearchChange={handleSearch}
                    onAdvancedSearch={handleAdvancedSearch}
                />

                {/* Results Info Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            Tìm thấy: <strong className="text-gray-900">{searchResults.length}</strong> kết quả
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                            <FileDown className="w-4 h-4" />
                            Xuất Excel
                        </button>
                        <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                            <ReloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <DocumentTable
                    data={searchResults}
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
