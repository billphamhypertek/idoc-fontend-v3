import React from "react";
import {
  Folder,
  ArrowLeft,
  Plus,
  List,
  Grid,
  SortAsc,
  SortDesc,
  Calendar,
  FileText,
  ChevronRight,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp01,
  ArrowDown10,
  ArrowDown01,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import Image from "next/image";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface FileManagerToolbarProps {
  viewMode: string;
  sortBy: string;
  onViewModeChange: (mode: string) => void;
  onSortByChange: (sort: string) => void;
  onAddProfile?: () => void;
  onAddDocument?: () => void;
  showAddDocument?: boolean;
  onGoBack?: () => void;
  onFilterChange?: (type: string) => void;
  filterType?: string;
  breadcrumbPath?: BreadcrumbItem[];
  onBreadcrumbClick?: (folderId: string) => void;
  selectedFolderId?: string;
  showFilterDropdown?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function FileManagerToolbar({
  viewMode,
  sortBy,
  onViewModeChange,
  onSortByChange,
  onAddProfile,
  onAddDocument,
  showAddDocument = false,
  onGoBack,
  onFilterChange,
  filterType = "",
  breadcrumbPath = [{ id: "home", name: "Home" }],
  onBreadcrumbClick,
  selectedFolderId = "",
  showFilterDropdown = true,
  searchTerm = "",
  onSearchChange,
}: FileManagerToolbarProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGoBack}
            className="group border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white rounded-none"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:text-white" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddProfile}
            className="group border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white rounded-none"
          >
            <Folder className="w-4 h-4 mr-2 text-blue-600 group-hover:text-white transition-colors" />
            Thêm hồ sơ
          </Button>
          {showAddDocument && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddDocument}
              className="group border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white rounded-none"
            >
              <FileText className="w-4 h-4 mr-2 text-blue-600 group-hover:text-white transition-colors" />
              Thêm tài liệu
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSortByChange(sortBy === "name-asc" ? "name-desc" : "name-asc")
            }
            title="Sắp xếp theo tên A-Z"
            className="group border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white rounded-none"
          >
            {sortBy === "name-asc" ? (
              <ArrowUpAZ className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
            ) : (
              <ArrowDownAZ className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSortByChange(sortBy === "date-asc" ? "date-desc" : "date-asc")
            }
            title="Sắp xếp theo số 1-9"
            className="group border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white rounded-none"
          >
            {sortBy === "date-asc" ? (
              <ArrowUp01 className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
            ) : (
              <ArrowDown01 className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
            )}
          </Button>
          {showFilterDropdown ? (
            <SearchableSelect
              value={filterType === "" ? "all" : filterType}
              onValueChange={(value) => {
                onFilterChange?.(value === "all" ? "" : value);
              }}
              placeholder="---Chọn---"
              className="w-48 rounded-none"
              options={[
                { label: "--- Chọn ---", value: "all" },
                { label: "Lưu trữ vĩnh viễn", value: "LUU_TRU_VINH_VIEN" },
                { label: "Lưu trữ cơ quan", value: "LUU_TRU_CO_QUAN" },
                { label: "Lưu trữ cá nhân", value: "LUU_TRU_CA_NHAN" },
              ]}
            />
          ) : (
            <Input
              type="text"
              placeholder="Tìm kiếm hồ sơ"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-48 rounded-none"
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={`group border-blue-500 text-blue-600 transition-colors bg-white hover:bg-blue-500 hover:text-white rounded-none flex items-center justify-center`}
          >
            <List className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={`group border-blue-500 text-blue-600 transition-colors bg-white hover:bg-blue-500 hover:text-white rounded-none flex items-center justify-center`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
          </Button>
        </div>
      </div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        {breadcrumbPath.map((item, index) => {
          const isLastItem = index === breadcrumbPath.length - 1;
          const isSelected =
            isLastItem ||
            (selectedFolderId && item.id === selectedFolderId) ||
            (!selectedFolderId && item.id === "home");

          return (
            <React.Fragment key={item.id}>
              {index === 0 ? (
                <button
                  onClick={() => onBreadcrumbClick?.(item.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    isSelected ? "text-black-500" : "hover:text-black-500"
                  }`}
                >
                  <Image
                    src="/v3/assets/images/files/home.png"
                    alt="Home"
                    width={16}
                    height={16}
                  />
                  <span className="text-black-400 font-semibold">
                    {item.name}
                  </span>
                </button>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => onBreadcrumbClick?.(item.id)}
                    className={`px-2 py-1 rounded transition-colors ${
                      isSelected
                        ? "text-red-500 font-semibold"
                        : "text-red-600 font-semibold hover:text-red-700"
                    }`}
                  >
                    {item.name}
                  </button>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
