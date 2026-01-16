"use client";

import { useState } from "react";
import {
    MagnifyingGlassIcon,
    MixerHorizontalIcon,
    Cross2Icon,
    ChevronDownIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full h-9 pl-9 pr-9 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20 focus:border-[hsl(var(--v3-primary))]"
                    />
                    {searchValue && (
                        <button
                            onClick={() => handleSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
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
                        className="h-9 px-4 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                    >
                        {dateFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}

                {/* Advanced Search Popover */}
                {showAdvancedSearch && (
                    <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors",
                                    "bg-[hsl(var(--v3-primary))] text-white hover:bg-[hsl(var(--v3-primary-hover))]",
                                    isAdvancedOpen && "ring-2 ring-[hsl(var(--v3-primary))]/20"
                                )}
                            >
                                <MixerHorizontalIcon className="w-4 h-4" />
                                Tìm kiếm nâng cao
                                <ChevronDownIcon className={cn("w-4 h-4 transition-transform", isAdvancedOpen && "rotate-180")} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[90vw] sm:w-[600px] p-0" align="end">
                            <div className="bg-[hsl(var(--v3-muted))] px-4 py-3 border-b border-[hsl(var(--v3-border))]">
                                <h3 className="font-semibold text-[hsl(var(--v3-card-foreground))]">Tìm kiếm nâng cao</h3>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Số/Ký hiệu */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))]">
                                            Số/Ký hiệu
                                        </label>
                                        <input
                                            type="text"
                                            value={advancedFilters.numberOrSign}
                                            onChange={(e) =>
                                                setAdvancedFilters({ ...advancedFilters, numberOrSign: e.target.value })
                                            }
                                            placeholder="Nhập số/ký hiệu..."
                                            className="w-full h-9 px-3 rounded-lg border border-[hsl(var(--v3-border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                        />
                                    </div>

                                    {/* Trích yếu */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))]">
                                            Trích yếu
                                        </label>
                                        <input
                                            type="text"
                                            value={advancedFilters.preview}
                                            onChange={(e) =>
                                                setAdvancedFilters({ ...advancedFilters, preview: e.target.value })
                                            }
                                            placeholder="Nhập từ khóa..."
                                            className="w-full h-9 px-3 rounded-lg border border-[hsl(var(--v3-border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                        />
                                    </div>

                                    {/* Loại văn bản */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))]">
                                            Loại văn bản
                                        </label>
                                        <select
                                            value={advancedFilters.docType}
                                            onChange={(e) =>
                                                setAdvancedFilters({ ...advancedFilters, docType: e.target.value })
                                            }
                                            className="w-full h-9 px-3 rounded-lg border border-[hsl(var(--v3-border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="cv">Công văn</option>
                                            <option value="qd">Quyết định</option>
                                            <option value="tb">Thông báo</option>
                                            <option value="bc">Báo cáo</option>
                                        </select>
                                    </div>

                                    {/* Người tạo */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))]">
                                            Người tạo
                                        </label>
                                        <input
                                            type="text"
                                            value={advancedFilters.personEnter}
                                            onChange={(e) =>
                                                setAdvancedFilters({ ...advancedFilters, personEnter: e.target.value })
                                            }
                                            placeholder="Nhập tên người tạo..."
                                            className="w-full h-9 px-3 rounded-lg border border-[hsl(var(--v3-border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                        />
                                    </div>

                                    {/* Từ ngày */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))]">
                                            Từ ngày
                                        </label>
                                        <input
                                            type="date"
                                            value={advancedFilters.startDate}
                                            onChange={(e) =>
                                                setAdvancedFilters({ ...advancedFilters, startDate: e.target.value })
                                            }
                                            className="w-full h-9 px-3 rounded-lg border border-[hsl(var(--v3-border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                        />
                                    </div>

                                    {/* Đến ngày */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))]">
                                            Đến ngày
                                        </label>
                                        <input
                                            type="date"
                                            value={advancedFilters.endDate}
                                            onChange={(e) =>
                                                setAdvancedFilters({ ...advancedFilters, endDate: e.target.value })
                                            }
                                            className="w-full h-9 px-3 rounded-lg border border-[hsl(var(--v3-border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[hsl(var(--v3-border))]">
                                    <button
                                        onClick={handleAdvancedReset}
                                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[hsl(var(--v3-border))] text-sm font-medium text-[hsl(var(--v3-muted-foreground))] hover:bg-[hsl(var(--v3-muted))]"
                                    >
                                        <Cross2Icon className="w-4 h-4" />
                                        Đặt lại
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleAdvancedSubmit();
                                            setIsAdvancedOpen(false);
                                        }}
                                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-[hsl(var(--v3-primary))] text-white hover:bg-[hsl(var(--v3-primary-hover))]"
                                    >
                                        <MagnifyingGlassIcon className="w-4 h-4" />
                                        Tìm kiếm
                                    </button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    );
}
