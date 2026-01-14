"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, File, X } from "lucide-react";
import StatisticDateRange from "./statisticDateRange";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";
import { useExportAnalysis } from "@/hooks/data/taskv2.data";
import { handleError } from "@/utils/common.utils";
import saveAs from "file-saver";

interface StatisticFilterProps {
  totalTasks?: number;
  onFilterChange?: (filter: string, fromDate?: string, toDate?: string) => void;
  isV2?: boolean;
}

export default function StatisticFilter({
  totalTasks = 0,
  onFilterChange,
  isV2 = false,
}: StatisticFilterProps) {
  const [openDateRangeSelection, setOpenDateRangeSelection] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const exportAnalysisMutation = useExportAnalysis();

  const setQuickFilter = (filterType: string) => {
    setActiveFilter(filterType);
    setSelectedDateRange("");
    setStartDate(null);
    setEndDate(null);

    onFilterChange?.(filterType);
  };

  const formatDateToString = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateDisplay = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const toggleDatePicker = () => {
    setOpenDateRangeSelection(!openDateRangeSelection);
  };

  const confirmDateRange = (): boolean => {
    if (!startDate || !endDate) {
      ToastUtils.error("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc");
      return false;
    }

    if (startDate && endDate && startDate > endDate) {
      ToastUtils.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return false;
    }

    if (startDate && endDate) {
      setActiveFilter("custom");
      setSelectedDateRange(
        `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
      );

      onFilterChange?.(
        "custom",
        formatDateToString(startDate),
        formatDateToString(endDate)
      );
      return true;
    }

    return false;
  };

  const clearDateRange = () => {
    setSelectedDateRange("");
    setStartDate(null);
    setEndDate(null);
    setActiveFilter("all");

    onFilterChange?.("all");
  };

  const exportAnalysisExcel = async () => {
    try {
      const fileName = `Bao_cao_phan_tich_${new Date().getTime()}.xlsx`;
      const response = await exportAnalysisMutation.mutateAsync();
      if (response) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, fileName);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-md p-4 w-full bg-white border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-black">Lọc theo thời gian:</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              className={`font-semibold ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              }`}
              onClick={() => setQuickFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={activeFilter === "week" ? "default" : "outline"}
              className={`font-semibold ${
                activeFilter === "week"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              }`}
              onClick={() => setQuickFilter("week")}
            >
              1 tuần
            </Button>
            <Button
              variant={activeFilter === "month" ? "default" : "outline"}
              className={`font-semibold ${
                activeFilter === "month"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              }`}
              onClick={() => setQuickFilter("month")}
            >
              1 tháng
            </Button>
            <Button
              variant={activeFilter === "year" ? "default" : "outline"}
              className={`font-semibold ${
                activeFilter === "year"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              }`}
              onClick={() => setQuickFilter("year")}
            >
              1 năm
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === "custom" ? "default" : "outline"}
              className={`font-semibold ${
                activeFilter === "custom"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              }`}
              onClick={toggleDatePicker}
            >
              Khoảng thời gian tùy chỉnh{" "}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>

            {selectedDateRange && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md">
                <span className="text-sm font-medium text-gray-700">
                  {selectedDateRange}
                </span>
                <button
                  onClick={clearDateRange}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {isV2 && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={exportAnalysisExcel}
            >
              <File className="w-4 h-4" />
              Xuất Excel
            </Button>
          )}
          {!isV2 && (
            <Button variant="outline" className="font-semibold cursor-default">
              {totalTasks} công việc
            </Button>
          )}
        </div>
      </div>

      <StatisticDateRange
        open={openDateRangeSelection}
        onOpenChange={setOpenDateRangeSelection}
        fromDate={startDate}
        toDate={endDate}
        onFromDateChange={setStartDate}
        onToDateChange={setEndDate}
        onConfirm={confirmDateRange}
      />
    </div>
  );
}
