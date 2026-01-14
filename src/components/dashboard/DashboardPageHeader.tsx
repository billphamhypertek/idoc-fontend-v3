"use client";

import React from "react";
import { Search, ClipboardList } from "lucide-react";

interface HeaderProps {
  activeTab: "personal" | "department";
  onTabChange: (tab: "personal" | "department") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  documentSecurityFilter: "all" | "regular" | "confidential";
  onDocumentSecurityFilterChange: (
    filter: "all" | "regular" | "confidential"
  ) => void;
}

const DashboardPageHeader: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  documentSecurityFilter,
  onDocumentSecurityFilterChange,
}) => {
  return (
    <div className="mb-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex rounded-full border bg-white shadow-sm p-1">
              <button
                className={`px-6 py-2 text-base font-semibold transition-all duration-200 rounded-full ${
                  activeTab === "personal"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onTabChange("personal")}
              >
                Thống kê cá nhân
              </button>
              <button
                className={`px-6 py-2 text-base font-semibold transition-all duration-200 rounded-full ${
                  activeTab === "department"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onTabChange("department")}
              >
                Thống kê đơn vị
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-3 flex-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Loại văn bản:
              </span>
              <select
                value={documentSecurityFilter}
                onChange={(e) =>
                  onDocumentSecurityFilterChange(
                    e.target.value as "all" | "regular" | "confidential"
                  )
                }
                className="text-sm h-9 border rounded-lg px-3 py-2 bg-white min-w-[140px] border-blue-600 text-blue-600"
              >
                <option value="all">Tất cả</option>
                <option value="regular">Văn bản thường</option>
                <option value="confidential">Văn bản mật</option>
              </select>
            </div>
            <div className="relative w-80 sm:w-64 md:w-72">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Sổ văn bản, Loại văn bản, ......"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pr-4 py-2 h-9 rounded-lg border focus:ring-2 transition-all duration-200 text-base pl-10 border-blue-600 text-blue-600 bg-white"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 transition-all duration-200 text-lg px-5 py-2 h-11 rounded-lg text-white hover:shadow-md whitespace-nowrap bg-blue-600 hover:bg-blue-700">
              <ClipboardList className="w-4 h-4" />
              <span>Giao việc</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageHeader;
