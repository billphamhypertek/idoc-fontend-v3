"use client";

import { useState } from "react";
import {
    MagnifyingGlassIcon,
    MixerHorizontalIcon,
    Cross2Icon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface DocumentFiltersProps {
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
    onAdvancedSearch?: (filters: Record<string, string>) => void;
    className?: string;
    showDateFilter?: boolean;
    showAdvancedSearch?: boolean;
}

const dateFilterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "15", label: "15 ngày" },
    { value: "30", label: "30 ngày" },
    { value: "90", label: "90 ngày" },
];

export function DocumentFilters({
    searchPlaceholder = "Tìm kiếm Số/Ký hiệu | Trích yếu",
    onSearchChange,
    onAdvancedSearch,
    className,
    showDateFilter = true,
    showAdvancedSearch = true,
}: DocumentFiltersProps) {
    const [searchValue, setSearchValue] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        numberOrSign: "",
        preview: "",
        docType: "",
        personEnter: "",
        startDate: "",
        endDate: "",
    });

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        onSearchChange?.(value);
    };

    const handleAdvancedSubmit = () => {
        onAdvancedSearch?.(advancedFilters);
    };

    const handleAdvancedReset = () => {
        setAdvancedFilters({
            numberOrSign: "",
            preview: "",
            docType: "",
            personEnter: "",
            startDate: "",
            endDate: "",
        });
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Quick Search Row */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full h-9 pl-9 pr-9 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20 focus:border-[hsl(var(--v3-primary))]"
                    />
                    {searchValue && (
                        <button
                            onClick={() => handleSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <Cross2Icon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Date Filter */}
                {showDateFilter && (
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                    >
                        {dateFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}

                {/* Advanced Search Toggle */}
                {showAdvancedSearch && (
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className={cn(
                            "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors",
                            "bg-[hsl(var(--v3-primary))] text-white hover:bg-[hsl(var(--v3-primary-hover))]"
                        )}
                    >
                        <MixerHorizontalIcon className="w-4 h-4" />
                        {isAdvancedOpen ? "Thu gọn" : "Tìm kiếm nâng cao"}
                        {isAdvancedOpen ? (
                            <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Advanced Search Panel */}
            {isAdvancedOpen && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700">Tìm kiếm nâng cao</h3>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Số/Ký hiệu */}
                            <div className="flex items-center gap-3">
                                <label className="w-32 text-sm font-medium text-gray-600 text-right">
                                    Số/Ký hiệu
                                </label>
                                <input
                                    type="text"
                                    value={advancedFilters.numberOrSign}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, numberOrSign: e.target.value })
                                    }
                                    placeholder="Nhập số/ký hiệu..."
                                    className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                />
                            </div>

                            {/* Trích yếu */}
                            <div className="flex items-center gap-3">
                                <label className="w-32 text-sm font-medium text-gray-600 text-right">
                                    Trích yếu
                                </label>
                                <input
                                    type="text"
                                    value={advancedFilters.preview}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, preview: e.target.value })
                                    }
                                    placeholder="Nhập từ khóa..."
                                    className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                />
                            </div>

                            {/* Loại văn bản */}
                            <div className="flex items-center gap-3">
                                <label className="w-32 text-sm font-medium text-gray-600 text-right">
                                    Loại văn bản
                                </label>
                                <select
                                    value={advancedFilters.docType}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, docType: e.target.value })
                                    }
                                    className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="cv">Công văn</option>
                                    <option value="qd">Quyết định</option>
                                    <option value="tb">Thông báo</option>
                                    <option value="bc">Báo cáo</option>
                                </select>
                            </div>

                            {/* Người tạo */}
                            <div className="flex items-center gap-3">
                                <label className="w-32 text-sm font-medium text-gray-600 text-right">
                                    Người tạo
                                </label>
                                <input
                                    type="text"
                                    value={advancedFilters.personEnter}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, personEnter: e.target.value })
                                    }
                                    placeholder="Nhập tên người tạo..."
                                    className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                />
                            </div>

                            {/* Từ ngày */}
                            <div className="flex items-center gap-3">
                                <label className="w-32 text-sm font-medium text-gray-600 text-right">
                                    Từ ngày
                                </label>
                                <input
                                    type="date"
                                    value={advancedFilters.startDate}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, startDate: e.target.value })
                                    }
                                    className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                />
                            </div>

                            {/* Đến ngày */}
                            <div className="flex items-center gap-3">
                                <label className="w-32 text-sm font-medium text-gray-600 text-right">
                                    Đến ngày
                                </label>
                                <input
                                    type="date"
                                    value={advancedFilters.endDate}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, endDate: e.target.value })
                                    }
                                    className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleAdvancedReset}
                                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                <Cross2Icon className="w-4 h-4" />
                                Đặt lại
                            </button>
                            <button
                                onClick={handleAdvancedSubmit}
                                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-[hsl(var(--v3-primary))] text-white hover:bg-[hsl(var(--v3-primary-hover))]"
                            >
                                <MagnifyingGlassIcon className="w-4 h-4" />
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
