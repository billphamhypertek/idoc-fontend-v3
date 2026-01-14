"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StatisticDateRangeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromDate?: Date | null;
  toDate?: Date | null;
  onFromDateChange?: (date: Date | null) => void;
  onToDateChange?: (date: Date | null) => void;
  onConfirm?: () => boolean | void;
}

export default function StatisticDateRange({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  open,
  onOpenChange,
  onConfirm,
}: StatisticDateRangeProps) {
  const getNextMonth = (date: Date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  };

  const [startMonth, setStartMonth] = useState<Date>(fromDate || new Date());
  const [endMonth, setEndMonth] = useState<Date>(
    toDate || getNextMonth(fromDate || new Date())
  );

  useEffect(() => {
    if (fromDate) {
      setStartMonth(fromDate);
      if (!toDate) {
        setEndMonth(getNextMonth(fromDate));
      }
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (toDate) setEndMonth(toDate);
  }, [toDate]);

  const handleConfirm = () => {
    if (onConfirm) {
      const result = onConfirm();
      if (result === false) {
        return;
      }
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const prevMonth = (type: "start" | "end") => {
    if (type === "start") {
      const newDate = new Date(startMonth);
      newDate.setMonth(newDate.getMonth() - 1);
      setStartMonth(newDate);
    } else {
      const newDate = new Date(endMonth);
      newDate.setMonth(newDate.getMonth() - 1);
      setEndMonth(newDate);
    }
  };

  const nextMonth = (type: "start" | "end") => {
    if (type === "start") {
      const newDate = new Date(startMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      setStartMonth(newDate);
    } else {
      const newDate = new Date(endMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      setEndMonth(newDate);
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl [&>button]:hidden">
        <DialogHeader className="border-b pb-4 ">
          <DialogTitle>Chọn khoảng thời gian</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-3">
            {/* <div className="flex items-center justify-between mb-2 bg-gray-100 rounded-md p-2">
              <Button
                className="p-1 hover:bg-gray-100 rounded bg-transparent text-black shadow-none outline-none"
                onClick={() => prevMonth("start")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="font-medium">{formatMonth(startMonth)}</span>
              <Button
                className="p-1 hover:bg-gray-100 rounded bg-transparent text-black shadow-none outline-none"
                onClick={() => nextMonth("start")}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div> */}
            <div className="text-sm font-medium mb-2">Từ ngày</div>
            <CustomDatePicker
              selected={fromDate || null}
              onChange={(date) => {
                onFromDateChange?.(date);
                if (date) setStartMonth(date);
                if (date && toDate && date > toDate) {
                  onToDateChange?.(date);
                }
              }}
              placeholder="dd/mm/yyyy"
              showClearButton={false}
            />
          </div>

          <div className="space-y-3">
            {/* <div className="flex items-center justify-between mb-2 bg-gray-100 rounded-md p-2">
              <Button
                className="p-1 hover:bg-gray-100 rounded bg-transparent text-black shadow-none outline-none"
                onClick={() => prevMonth("end")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="font-medium">{formatMonth(endMonth)}</span>
              <Button
                className="p-1 hover:bg-gray-100 rounded bg-transparent text-black shadow-none outline-none"
                onClick={() => nextMonth("end")}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div> */}
            <div className="text-sm font-medium mb-2">Đến ngày</div>
            <CustomDatePicker
              selected={toDate || null}
              onChange={(date) => {
                onToDateChange?.(date);
                if (date) setEndMonth(date);
              }}
              placeholder="dd/mm/yyyy"
              showClearButton={false}
              min={fromDate ? fromDate.toISOString().split("T")[0] : undefined}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
