"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  ChevronDown,
  ChevronUp,
  Search,
  CalendarIcon,
  RotateCcw,
} from "lucide-react";
import SelectCustom from "../common/SelectCustom";
import { SearchableSelect } from "../ui/searchable-select";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { handleError } from "@/utils/common.utils";

interface DocumentSyncFilterProps {
  onSearch?: (searchData: any) => void;
  onAdvancedSearch?: (searchData: any) => void;
  title?: string;
  docTypeCategory?: any[];
  bookCategory?: any[];
  docFieldsCategory?: any[];
  onLoadOutSideReceiveList?: () => Promise<any[]>;
  outSideList?: any;
  isAdvanceSearch?: boolean;
  onToggleAdvanceSearch?: (isAdvance: boolean) => void;
  onOutsideReceiveFocus?: () => void;
  onOutsideReceiveChange?: (text: string) => void;
}

export default function DocumentSyncFilter({
  onSearch,
  onAdvancedSearch,
  title,
  docTypeCategory = [],
  bookCategory = [],
  docFieldsCategory = [],
  onLoadOutSideReceiveList,
  outSideList,
  isAdvanceSearch = false,
  onToggleAdvanceSearch,
  onOutsideReceiveFocus,
  onOutsideReceiveChange,
}: DocumentSyncFilterProps) {
  const [searchField, setSearchField] = useState({
    quickSearchText: "",
    isAdvanceSearch: isAdvanceSearch,
    numberOrSign: "",
    preview: "",
    docType: "",
    bookOut: "",
    startIssued: null as Date | null,
    endIssued: null as Date | null,
    outsideReceive: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const outsideReceiveRef = useRef<HTMLDivElement>(null);

  const hasAdvancedSearchData = () => {
    return !!(
      searchField.numberOrSign ||
      searchField.preview ||
      searchField.docType ||
      searchField.bookOut ||
      searchField.startIssued ||
      searchField.endIssued ||
      searchField.outsideReceive
    );
  };

  const handleQuickSearch = () => {
    onSearch?.({
      quickSearchText: searchField.quickSearchText,
      page: 1,
    });
  };

  const handleAdvancedSearch = () => {
    const searchData = {
      ...searchField,
      startIssued: searchField.startIssued
        ? format(searchField.startIssued, "yyyy-MM-dd")
        : "",
      endIssued: searchField.endIssued
        ? format(searchField.endIssued, "yyyy-MM-dd")
        : "",
      page: 1,
    };
    onAdvancedSearch?.(searchData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (hasAdvancedSearchData()) {
        handleAdvancedSearch();
      } else {
        handleQuickSearch();
      }
    }
  };

  const handleResetSearch = () => {
    const currentQuickSearchText = searchField.quickSearchText;
    const currentIsAdvanceSearch = searchField.isAdvanceSearch;

    setSearchField((prev) => ({
      ...prev,
      numberOrSign: "",
      preview: "",
      docType: "",
      bookOut: "",
      startIssued: null,
      endIssued: null,
      outsideReceive: "",
    }));

    if (currentQuickSearchText) {
      setTimeout(() => {
        onSearch?.({
          quickSearchText: currentQuickSearchText,
          page: 1,
        });
      }, 0);
    }
  };

  const toggleAdvancedSearch = () => {
    const newAdvanceSearch = !isAdvanceSearch;
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: newAdvanceSearch,
    }));
    onToggleAdvanceSearch?.(newAdvanceSearch);
  };

  useEffect(() => {
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: isAdvanceSearch,
    }));
  }, [isAdvanceSearch]);

  useEffect(() => {
    if (isAdvanceSearch) {
      loadOutSideReceiveList();
    } else {
      setDropdownOpen(false);
    }
  }, [isAdvanceSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        outsideReceiveRef.current &&
        !outsideReceiveRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const loadOutSideReceiveList = async () => {
    try {
      await onLoadOutSideReceiveList?.();
    } catch (error) {
      handleError(error);
    }
  };

  const selectItem = (item: any) => {
    setSearchField((prev) => ({
      ...prev,
      outsideReceive: item.name,
    }));
    setDropdownOpen(false);
  };

  const getDisabledDates = (isEndDate: boolean = false) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isEndDate) {
      if (searchField.startIssued) {
        return (date: Date) => {
          return date < searchField.startIssued! || date > today;
        };
      } else {
        return (date: Date) => {
          return date > today;
        };
      }
    } else {
      return (date: Date) => {
        return date > today;
      };
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setSearchField((prev) => ({
      ...prev,
      startIssued: date || null,
      endIssued:
        date && prev.endIssued && prev.endIssued < date ? null : prev.endIssued,
    }));
    setStartDateOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setSearchField((prev) => ({
      ...prev,
      endIssued: date || null,
    }));
    setEndDateOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      {title ? (
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                name="quickSearch"
                value={searchField.quickSearchText}
                onChange={(e) =>
                  setSearchField((prev) => ({
                    ...prev,
                    quickSearchText: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                placeholder="Tìm kiếm Số văn bản | Trích yếu"
                className="pl-8 h-8 w-[300px] border border-blue-600 focus-visible:ring-0"
              />
            </div>
            <Button
              type="button"
              onClick={toggleAdvancedSearch}
              className={cn(
                "h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
              )}
            >
              <Search className="w-4 h-4 mr-1" />
              {isAdvanceSearch ? "Thu gọn tìm kiếm" : "Tìm kiếm nâng cao"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600">Tìm kiếm nâng cao</span>
            <Button
              onClick={toggleAdvancedSearch}
              variant="outline"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-600"
            >
              {isAdvanceSearch ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
              <Input
                name="quickSearch"
                value={searchField.quickSearchText}
                onChange={(e) =>
                  setSearchField((prev) => ({
                    ...prev,
                    quickSearchText: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                placeholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                className="pl-10 w-80 h-8"
              />
            </div>
            <Button onClick={handleQuickSearch} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {isAdvanceSearch && (
        <div className="bg-white rounded-lg border">
          <h3 className="font-bold text-info mb-10 p-4 bg-blue-100">
            Tìm kiếm nâng cao
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8">
            <div className="flex items-center gap-2">
              <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                Số/Ký hiệu
              </Label>
              <Input
                name="numberOrSign"
                value={searchField.numberOrSign}
                onChange={(e) =>
                  setSearchField((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                className="flex-1 min-w-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                Trích yếu
              </Label>
              <Input
                name="preview"
                value={searchField.preview}
                onChange={(e) =>
                  setSearchField((prev) => ({
                    ...prev,
                    preview: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                className="flex-1 min-w-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                Loại văn bản
              </Label>
              <div className="flex-1 min-w-0">
                <SearchableSelect
                  options={docTypeCategory.map((item) => ({
                    label: item.name,
                    value: item.id.toString(),
                  }))}
                  value={searchField.docType || ""}
                  onValueChange={(value) =>
                    setSearchField((prev) => ({
                      ...prev,
                      docType: value,
                    }))
                  }
                  placeholder="Chọn loại văn bản"
                  searchPlaceholder="Tìm kiếm loại văn bản..."
                  className="w-full text-black bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                Sổ văn bản đi
              </Label>
              <div className="flex-1 min-w-0">
                <SelectCustom
                  options={[
                    { label: "--- Chọn ---", value: "0" },
                    ...bookCategory.map((item) => ({
                      label: item.name,
                      value: item.id.toString(),
                    })),
                  ]}
                  value={searchField.bookOut}
                  onChange={(value) =>
                    setSearchField((prev) => ({
                      ...prev,
                      bookOut: Array.isArray(value) ? value[0] : value,
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                Ngày ban hành, từ ngày
              </Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <div className="relative flex-1 min-w-0">
                    <Input
                      type="text"
                      value={
                        searchField.startIssued
                          ? format(searchField.startIssued, "dd/MM/yyyy")
                          : ""
                      }
                      placeholder="dd/mm/yyyy"
                      className={cn(
                        "w-full pr-10 cursor-pointer bg-white",
                        !searchField.startIssued && "text-muted-foreground"
                      )}
                      onClick={() => setStartDateOpen(true)}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={searchField.startIssued || undefined}
                    onSelect={handleStartDateChange}
                    disabled={getDisabledDates(false)}
                    captionLayout="dropdown"
                    required={false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                đến ngày
              </Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <div className="relative flex-1 min-w-0">
                    <Input
                      type="text"
                      value={
                        searchField.endIssued
                          ? format(searchField.endIssued, "dd/MM/yyyy")
                          : ""
                      }
                      placeholder="dd/mm/yyyy"
                      className={cn(
                        "w-full pr-10 cursor-pointer bg-white",
                        !searchField.endIssued && "text-muted-foreground"
                      )}
                      onClick={() => setEndDateOpen(true)}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={searchField.endIssued || undefined}
                    onSelect={handleEndDateChange}
                    disabled={getDisabledDates(true)}
                    captionLayout="dropdown"
                    required={false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 relative">
              <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                Nơi nhận bên ngoài
              </Label>
              <div className="relative flex-1 min-w-0" ref={outsideReceiveRef}>
                <Input
                  type="text"
                  value={searchField.outsideReceive}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchField((prev) => ({
                      ...prev,
                      outsideReceive: value,
                    }));
                    onOutsideReceiveChange?.(value);
                    if (isAdvanceSearch) {
                      loadOutSideReceiveList();
                      setDropdownOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (isAdvanceSearch) {
                      setDropdownOpen(true);
                      onOutsideReceiveFocus?.();
                    }
                  }}
                  onBlur={(e) => {
                    // Delay closing to allow item selection
                    setTimeout(() => {
                      if (
                        !outsideReceiveRef.current?.contains(
                          e.relatedTarget as Node
                        )
                      ) {
                        setDropdownOpen(false);
                      }
                    }, 200);
                  }}
                  placeholder="Chọn tỉnh..."
                  disabled={!isAdvanceSearch}
                  className={cn(
                    "w-full",
                    !isAdvanceSearch ? "bg-gray-100 cursor-not-allowed" : ""
                  )}
                />
                {(() => {
                  const items = Array.isArray(outSideList)
                    ? outSideList
                    : outSideList?.content || [];
                  return dropdownOpen && isAdvanceSearch && items.length > 0 ? (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {items.map((item: any) => (
                        <div
                          key={item.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectItem(item);
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

          <div className="flex justify-center my-6 gap-3">
            <Button
              onClick={handleAdvancedSearch}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
            <Button onClick={handleResetSearch} variant="outline">
              <RotateCcw className="w-4 h-4 mr-1" />
              Đặt lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
