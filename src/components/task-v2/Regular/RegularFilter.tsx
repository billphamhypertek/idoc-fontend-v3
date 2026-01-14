"use client";

import SelectCustom from "@/components/common/SelectCustom";
import OrgTreeSelect from "@/components/dashboard/OrgTreeSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Constant } from "@/definitions/constants/constant";
import { useGetCategoryWithCode } from "@/hooks/data/task.data";
import type { OrgTreeNode } from "@/definitions/types/orgunit.type";
import { Search, Plus, RefreshCcw } from "lucide-react";

interface RegularFilterProps {
  searchField: {
    taskName: string;
    complexityId: string | null;
    orgIds: string[];
  };
  setSearchField: (value: any) => void;
  onSearch: () => void;
  onAddNew?: () => void;
  onReset?: () => void;
}

export default function RegularFilter({
  searchField,
  setSearchField,
  onSearch,
  onAddNew,
  onReset,
}: RegularFilterProps) {
  const { data: complexityData } = useGetCategoryWithCode(
    Constant.CATEGORY_TYPE_CODE.LEVEL_OF_COMPLEXITY
  );

  const complexityOptions = [
    { label: "--- Chọn ---", value: "null" },
    ...(complexityData?.map((item: any) => ({
      label: item.name,
      value: String(item.id),
    })) || []),
  ];

  const selectedOrgIds =
    searchField.orgIds.length > 0 ? searchField.orgIds : null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="py-6" onKeyDownCapture={handleKeyDown}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-md font-bold text-[#1e1f24]">
            Công việc thường xuyên
          </Label>
          <Input
            placeholder="Nhập tên công việc"
            value={searchField.taskName}
            onChange={(e) =>
              setSearchField({ ...searchField, taskName: e.target.value })
            }
            className="focus:ring-0 [&_span]:text-gray-600 [&_span]:font-normal [&_svg]:text-black"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-md font-bold text-[#1e1f24]">
            Mức độ phức tạp
          </Label>
          <SelectCustom
            options={complexityOptions}
            value={searchField.complexityId || "null"}
            onChange={(value) => {
              const val = Array.isArray(value) ? value[0] : value;
              setSearchField({
                ...searchField,
                complexityId: val === "null" || val === null ? null : val,
              });
            }}
            placeholder="Chọn mức độ phức tạp"
            className="focus:ring-0 [&_span]:text-gray-600 [&_span]:font-normal [&_svg]:text-black"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-md font-bold text-[#1e1f24]">
            Chọn đơn vị
          </Label>
          <OrgTreeSelect
            value={selectedOrgIds}
            onChange={(nodes: OrgTreeNode | OrgTreeNode[]) => {
              if (Array.isArray(nodes)) {
                setSearchField({
                  ...searchField,
                  orgIds: nodes.map((n) => n.id),
                });
              }
            }}
            placeholder="Chọn đơn vị"
            className="!border-gray-300 focus:border-gray-100 focus:ring-0 h-9 text-sm [&_span]:text-gray-600 [&_span]:font-normal [&_svg]:text-black"
            showCheckbox={true}
            collapsedByDefault={true}
            height="45vh"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-8">
        <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700">
          <Search className="w-4 h-4 mr-2" />
          Tìm kiếm
        </Button>
        <Button onClick={onAddNew} className="bg-green-600 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          Thêm mới
        </Button>
        <Button onClick={onReset} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
