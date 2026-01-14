"use client";

import { SearchInput } from "@/components/document-in/SearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RotateCcw, Search } from "lucide-react";

interface CalendarRoomFilterProps {
  quickSearchText: string;
  onQuickSearchChange: (text: string) => void;
  onQuickSearch: () => void;
  isAdvancedSearch: boolean;
  onAdvancedSearchToggle: (value: boolean) => void;
  searchFields: {
    name: string;
    address: string;
    quantity: number | null;
    acreage: number | null;
    description: string;
  };
  onSearchFieldsChange: (
    fields: CalendarRoomFilterProps["searchFields"]
  ) => void;
  onAdvancedSearch: (fields: CalendarRoomFilterProps["searchFields"]) => void;
  onResetSearch: () => void;
}

export default function CalendarRoomFilter({
  quickSearchText,
  onQuickSearchChange,
  onQuickSearch,
  isAdvancedSearch,
  onAdvancedSearchToggle,
  searchFields,
  onSearchFieldsChange,
  onAdvancedSearch,
  onResetSearch,
}: CalendarRoomFilterProps) {
  const handleFieldChange = (
    field: keyof typeof searchFields,
    value: string | number | null
  ) => {
    onSearchFieldsChange({
      ...searchFields,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdvancedSearch(searchFields);
  };

  return (
    <div className="space-y-4 px-4">
      <div className="flex justify-end items-center gap-3">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Tìm kiếm Tên | Địa điểm | Mô tả"
            value={quickSearchText}
            setSearchInput={onQuickSearchChange}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => onAdvancedSearchToggle(!isAdvancedSearch)}
          className={cn(
            "h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
          )}
        >
          <Search className="w-4 h-4 mr-1" />
          {isAdvancedSearch ? "Thu gọn tìm kiếm" : "Tìm kiếm nâng cao"}
        </Button>
      </div>

      {isAdvancedSearch && (
        <div className="bg-white rounded-lg border mb-4">
          <h3 className="font-bold text-info mb-10 p-4 bg-blue-100 rounded-t-lg">
            Tìm kiếm nâng cao
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8">
              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Tên phòng họp
                </Label>
                <Input
                  value={searchFields.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Địa điểm
                </Label>
                <Input
                  value={searchFields.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Số người
                </Label>
                <Input
                  type="number"
                  value={searchFields.quantity ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "quantity",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Diện tích
                </Label>
                <Input
                  type="number"
                  value={searchFields.acreage ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "acreage",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Mô tả
                </Label>
                <Input
                  value={searchFields.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  className="flex-1 min-w-0"
                />
              </div>
            </div>
            {/* Search Actions */}
            <div className="flex items-center justify-center gap-3 my-6">
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-1" />
                Tìm kiếm
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs"
                onClick={onResetSearch}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Đặt lại
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
