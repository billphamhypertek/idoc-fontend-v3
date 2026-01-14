"use client";

import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Search } from "lucide-react";

interface FilterState {
  taskName: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface DeclareFilterProps {
  filter?: FilterState;
  onFilterChange?: (filter: FilterState) => void;
  onSearch?: () => void;
  onReset?: () => void;
}

export default function DeclareFilter({
  filter = { taskName: "", startDate: null, endDate: null },
  onFilterChange,
  onSearch,
  onReset,
}: DeclareFilterProps) {
  const handleTaskNameChange = (value: string) => {
    onFilterChange?.({
      ...filter,
      taskName: value,
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    onFilterChange?.({
      ...filter,
      startDate: date,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFilterChange?.({
      ...filter,
      endDate: date,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-md font-bold text-gray-700">
            Tên công việc
          </Label>
          <Input
            placeholder="Tên công việc"
            value={filter.taskName}
            onChange={(e) => handleTaskNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-md font-bold text-gray-700">Từ ngày</Label>
          <CustomDatePicker
            selected={filter.startDate}
            onChange={handleStartDateChange}
            placeholder="dd/mm/yyyy"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-md font-bold text-gray-700">Đến ngày</Label>
          <CustomDatePicker
            selected={filter.endDate}
            onChange={handleEndDateChange}
            placeholder="dd/mm/yyyy"
            min={filter.startDate ? filter.startDate.toISOString() : undefined}
          />
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium w-fit"
          onClick={onSearch}
        >
          <Search className="w-4 h-4 mr-2" />
          Tìm kiếm
        </Button>
        <Button
          variant="outline"
          className="h-9 px-4 text-sm font-medium w-fit"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
