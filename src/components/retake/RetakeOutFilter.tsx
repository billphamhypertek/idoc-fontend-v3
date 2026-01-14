"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  LayoutPanelTop,
  Undo2,
  ArchiveRestore,
} from "lucide-react";
import { CustomDatePicker } from "../ui/calendar";
import { format } from "date-fns";
import SelectCustom from "../common/SelectCustom";

interface RetakeOutFilterProps {
  onSearch?: (searchData: any) => void;
  onAdvancedSearch?: (searchData: any) => void;
  isAdvanceSearch?: boolean;
  onToggleAdvanceSearch?: (isAdvance: boolean) => void;
  docTypeCategory?: any[];
  onResetSearch?: () => void;
  onResetAdvancedFields?: () => void;
  currentDocumentId?: string | null;
  currentDocument?: any;
  currentTab?: string;
  onRetakeDocument?: (document: any) => void;
  onUnretakeDocument?: (document: any) => void;
  title?: string;
}

export default function RetakeOutFilter({
  onSearch,
  onAdvancedSearch,
  isAdvanceSearch = false,
  onToggleAdvanceSearch,
  docTypeCategory = [],
  onResetSearch,
  onResetAdvancedFields,
  currentDocumentId,
  currentDocument,
  currentTab,
  onRetakeDocument,
  onUnretakeDocument,
  title,
}: RetakeOutFilterProps) {
  const [searchField, setSearchField] = useState({
    quickSearchText: "",
    isAdvanceSearch: isAdvanceSearch,
    preview: "",
    numberOrSign: "",
    startIssued: null as Date | null,
    endIssued: null as Date | null,
    orgIssuedName: "",
    numberArrival: "",
  });

  const [filteredOrgNames, setFilteredOrgNames] = useState<string[]>([]);
  const [orgAutocompleteOpen, setOrgAutocompleteOpen] = useState(false);

  // Initialize filtered org names when docTypeCategory changes
  useEffect(() => {
    if (
      docTypeCategory &&
      Array.isArray(docTypeCategory) &&
      docTypeCategory.length > 0
    ) {
      const orgNames = docTypeCategory.map((org) => org.name);
      setFilteredOrgNames(orgNames);
    } else {
      setFilteredOrgNames([]);
    }
  }, [docTypeCategory]);

  const filterOrgIssuedName = (event: string) => {
    if (!docTypeCategory || !Array.isArray(docTypeCategory)) {
      setFilteredOrgNames([]);
      return;
    }

    if (!event) {
      const orgNames = docTypeCategory.map((org) => org.name);
      setFilteredOrgNames(orgNames);
    } else {
      const filtered = docTypeCategory
        .filter(
          (item) =>
            `${item.id}` === event ||
            (item.name && item.name.toLowerCase().includes(event.toLowerCase()))
        )
        .map((org) => org.name);
      setFilteredOrgNames(filtered);
    }
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

  const handleAdvancedSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdvancedSearch();
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickSearch();
  };

  const toggleAdvancedSearch = () => {
    const newAdvanceSearch = !isAdvanceSearch;
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: newAdvanceSearch,
      ...(newAdvanceSearch
        ? {}
        : {
            preview: "",
            numberOrSign: "",
            startIssued: null,
            endIssued: null,
            numberArrival: "",
            orgIssuedName: "",
          }),
    }));
    onToggleAdvanceSearch?.(newAdvanceSearch);

    if (!newAdvanceSearch) {
      onResetAdvancedFields?.();
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setSearchField((prev) => ({
      ...prev,
      startIssued: date,
      endIssued:
        date && prev.endIssued && prev.endIssued < date ? null : prev.endIssued,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setSearchField((prev) => ({
      ...prev,
      endIssued: date,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          <div className="flex gap-2">
            {currentDocumentId && currentTab === "canRetake" && (
              <Button
                variant="outline"
                onClick={() => onRetakeDocument?.(currentDocument)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Undo2 className="w-4 h-4" />
                Thu hồi
              </Button>
            )}

            {currentDocumentId && currentTab === "retook" && (
              <Button
                variant="outline"
                onClick={() => onUnretakeDocument?.(currentDocument)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
              >
                <ArchiveRestore className="w-4 h-4" />
                Khôi phục
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleQuickSearchSubmit} className="relative">
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleQuickSearch();
                }
              }}
              placeholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
              className="pl-10 pr-4 h-8 border border-blue-600 focus-visible:ring-0 w-[300px]"
            />
          </form>
          <Button
            onClick={toggleAdvancedSearch}
            variant="outline"
            size="sm"
            className="h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
            type="button"
          >
            <Search className="w-4 h-4 mr-1" />
            {isAdvanceSearch ? "Thu gọn tìm kiếm" : "Tìm kiếm nâng cao"}
          </Button>
        </div>
      </div>

      {isAdvanceSearch && (
        <div className=" bg-white rounded-lg border mb-4">
          <h3 className="font-bold text-info mb-10 p-4 bg-blue-100 rounded-t-lg">
            Tìm kiếm nâng cao
          </h3>
          <form onSubmit={handleAdvancedSearchSubmit}>
            <div className="space-y-4 mb-4 px-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-bold text-gray-700 w-[160px] flex-shrink-0 text-right text-[14px]">
                    Trích yếu
                  </Label>
                  <Input
                    type="text"
                    value={searchField.preview}
                    onChange={(e) =>
                      setSearchField((prev) => ({
                        ...prev,
                        preview: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdvancedSearch();
                      }
                    }}
                    className="h-9 text-sm bg-background flex-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-bold text-gray-700 w-[160px] flex-shrink-0 text-right text-[14px]">
                    Số đến
                  </Label>
                  <Input
                    type="text"
                    value={searchField.numberArrival}
                    onChange={(e) =>
                      setSearchField((prev) => ({
                        ...prev,
                        numberArrival: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdvancedSearch();
                      }
                    }}
                    className="h-9 text-sm bg-background flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="font-bold text-gray-700 w-[160px] flex-shrink-0 text-right text-[14px]">
                    Số, KH của VB đến
                  </Label>
                  <Input
                    type="text"
                    value={searchField.numberOrSign}
                    onChange={(e) =>
                      setSearchField((prev) => ({
                        ...prev,
                        numberOrSign: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdvancedSearch();
                      }
                    }}
                    className="h-9 text-sm bg-background flex-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-bold text-gray-700 w-[160px] flex-shrink-0 text-right text-[14px]">
                    Ngày vào sổ, từ ngày
                  </Label>
                  <div className="flex-1">
                    <CustomDatePicker
                      selected={searchField.startIssued}
                      onChange={handleStartDateChange}
                      placeholder="dd/mm/yyyy"
                      disabledFuture={true}
                      showClearButton={true}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-gray-700 w-[160px] flex-shrink-0 text-right text-[14px]">
                    Đến ngày
                  </Label>
                  <div className="flex-1">
                    <CustomDatePicker
                      selected={searchField.endIssued}
                      onChange={handleEndDateChange}
                      placeholder="dd/mm/yyyy"
                      disabledFuture={true}
                      showClearButton={true}
                      min={
                        searchField.startIssued
                          ? searchField.startIssued.toISOString().split("T")[0]
                          : undefined
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-bold text-gray-700 w-[160px] flex-shrink-0 text-right text-[14px]">
                    Đơn vị ban hành
                  </Label>
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      value={searchField.orgIssuedName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchField((prev) => ({
                          ...prev,
                          orgIssuedName: value,
                        }));
                        filterOrgIssuedName(value);
                        setOrgAutocompleteOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAdvancedSearch();
                        }
                      }}
                      onFocus={() => setOrgAutocompleteOpen(true)}
                      onBlur={() => {
                        // Delay để cho phép click vào option
                        setTimeout(() => setOrgAutocompleteOpen(false), 200);
                      }}
                      className="h-9 text-sm bg-background"
                    />

                    {orgAutocompleteOpen &&
                      filteredOrgNames &&
                      filteredOrgNames.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredOrgNames.map((orgName) => (
                            <div
                              key={orgName}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSearchField((prev) => ({
                                  ...prev,
                                  orgIssuedName: orgName,
                                }));
                                setOrgAutocompleteOpen(false);
                              }}
                            >
                              {orgName}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="my-6 flex items-center justify-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 inline-flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Tìm kiếm
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onResetSearch?.()}
                className="h-9 px-3 text-xs inline-flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt lại
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
