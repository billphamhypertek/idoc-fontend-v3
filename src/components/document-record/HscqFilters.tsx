"use client";

import React from "react";
import OrgTreeSelect from "@/components/dashboard/OrgTreeSelect";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchParams } from "@/app/document-record/coquan/page";
import SelectCustom from "@/components/common/SelectCustom";
import { SearchableSelect } from "@/components/ui/searchable-select";

type Org = {
  id: string | number;
  name: string;
  child?: Org[];
};

interface HscqFiltersProps {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  folderNameTemp: string;
  setFolderNameTemp: React.Dispatch<React.SetStateAction<string>>;
  onSearch: () => void;
  yearList: number[];
  users: any[];
  orgList: Org[];
}

export function HscqFilters({
  searchParams,
  setSearchParams,
  folderNameTemp,
  setFolderNameTemp,
  onSearch,
  yearList,
  users,
  orgList,
}: HscqFiltersProps) {
  const searchParamsTemp = "";
  const handleChangeCreateBy = (v: string) => {
    setSearchParams((p) => ({
      ...p,
      createBy: v === "all" ? "" : String(v),
    }));
  };

  const handleChangeYearCreate = (v: string | string[]) => {
    setSearchParams((p) => ({
      ...p,
      yearCreate: v === "all" ? "" : String(v),
    }));
  };

  const yearOptions = [
    { id: "all", name: "-- Tất cả --" },
    ...yearList.map((y) => ({ id: String(y), name: String(y) })),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white rounded-2xl">
      {/* Phòng ban */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Phòng ban
        </label>
        <OrgTreeSelect
          value={searchParams.orgQLId}
          onChange={(node: any) =>
            setSearchParams((p) => ({ ...p, orgQLId: node.id }))
          }
          placeholder="Chọn phòng ban"
          allowSelectTypes={["org", "room", "leadership"]}
          className="w-full h-9 [&_*]:text-black [&>button]:border-gray-300 [&>button]:hover:border-gray-400 [&>button]:focus:border-gray-400 [&>button]:text-gray-700 [&>button>span]:text-gray-700 [&>button>svg]:text-gray-500"
        />
      </div>

      {/* Tiêu đề */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Tiêu đề
        </label>
        <Input
          placeholder="Tên hồ sơ"
          className="h-9 text-black"
          value={folderNameTemp}
          onChange={(e) => setFolderNameTemp(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && onSearch()}
        />
      </div>
      {/* Người lập */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Người lập
        </label>
        <SearchableSelect
          options={[
            { value: "all", label: "-- Tất cả --" },
            ...users.map((u) => ({
              value: String(u.id),
              label: u.fullName,
            })),
          ]}
          value={searchParams.createBy ?? "all"}
          onValueChange={handleChangeCreateBy}
          placeholder="-- Tất cả --"
          searchPlaceholder="Tìm kiếm người lập..."
          className="w-full text-black bg-white"
        />
      </div>

      {/* Năm lập */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Năm lập
        </label>
        <SelectCustom
          options={yearOptions}
          value={searchParams.yearCreate || "all"}
          onChange={handleChangeYearCreate}
          placeholder="-- Tất cả --"
          className={cn("w-full text-black")}
        />
      </div>

      {/* Nút tìm kiếm */}
      <div className="col-span-1 md:col-span-3 lg:col-span-4 flex justify-center">
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={onSearch}
        >
          <div className="flex gap-2 items-center">
            <Search color="white" size={20} strokeWidth={1.5} />
            Tìm kiếm
          </div>
        </button>
      </div>
    </div>
  );
}
