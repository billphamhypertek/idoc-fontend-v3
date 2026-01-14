"use client";

import * as React from "react";
import type { DateRange as RDPDateRange } from "react-day-picker";
import { format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { DateRange } from "./../../definitions/types/orgunit.type";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateRangePickerProps {
  dateRange?: DateRange;
  selectedPeriod: string; // <- dùng thật
  onDateChange: (range: DateRange) => void;
  onPeriodChange: (period: string) => void; // <- dùng thật
  className?: string;
}

const toRDP = (r?: DateRange): RDPDateRange | undefined =>
  r?.from ? { from: r.from, to: r.to } : undefined;

const toExternal = (r?: RDPDateRange): DateRange => ({
  from: r?.from,
  to: r?.to,
});

const fmt = (d?: Date) => (d ? format(d, "dd/MM/yyyy") : "");

export function DateRangePicker({
  dateRange,
  selectedPeriod,
  onDateChange,
  onPeriodChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = toRDP(dateRange);

  const display =
    selected?.from || selected?.to
      ? `${fmt(selected?.from)}${selected?.from ? " - " : ""}${fmt(selected?.to)}`
      : "Từ ngày - Đến ngày";

  const handleSelect = (range: RDPDateRange | undefined) => {
    onDateChange(toExternal(range));
    // Nếu chọn đủ 2 đầu mốc thì đóng popover
    if (range?.from && range?.to) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 min-w-[300px] justify-between rounded-lg border px-3 text-sm font-medium",
            selected
              ? "text-blue-700 border-blue-500 hover:border-blue-600"
              : "text-muted-foreground",
            className
          )}
        >
          {display}
          <ChevronDown className="w-4 h-4 text-blue-500 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-auto p-3 md:p-4 md:w-[560px] overflow-hidden border-0"
        )}
        align="start"
        sideOffset={8}
      >
        {/* Thanh chọn Kỳ */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-blue-700">Kỳ</div>
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className={cn(
                "appearance-none rounded-lg border border-blue-200 bg-white px-3 py-2 pr-7 text-sm font-medium text-blue-700 shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-300"
              )}
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
              <option value="custom">Tùy chọn</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
          </div>
        </div>

        {/* Calendar range */}
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={2}
          captionLayout="dropdown"
          showOutsideDays
          pagedNavigation
          initialFocus
          locale={viLocale}
          defaultMonth={selected?.from ?? selected?.to ?? new Date()}
        />

        <div className={cn("mt-2 text-xs text-muted-foreground")}>
          {selected?.from && !selected?.to && "Chọn ngày kết thúc…"}
          {selected?.from &&
            selected?.to &&
            `Đã chọn: ${fmt(selected.from)} - ${fmt(selected.to)}`}
          {!selected?.from && !selected?.to && "Chọn ngày bắt đầu…"}
        </div>
      </PopoverContent>
    </Popover>
  );
}
