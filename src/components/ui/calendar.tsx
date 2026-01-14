"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleXIcon,
} from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { formatDateWithFormat, formatDateYMD } from "@/utils/datetime.utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-9 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}
function Calendar22() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Date of birth
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon className="mr-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
function CustomDatePicker({
  selected,
  onChange,
  placeholder = "Chọn ngày",
  disabledFuture,
  showClearButton = true,
  className,
  readOnly = false,
  disabled = false,
  min,
  id,
  disableDates,
  dateFormat = "dd/mm/yyyy",
}: {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabledFuture?: boolean;
  showClearButton?: boolean;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
  min?: string;
  id?: string;
  disableDates?: string[];
  dateFormat?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isDisabled = disabled || readOnly;

  // Date formatting function
  const formatDate = (date: Date, format: string): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    switch (format) {
      case "dd/MM/yyyy":
        return `${day}/${month}/${year}`;
      case "MM/dd/yyyy":
        return `${month}/${day}/${year}`;
      case "yyyy-MM-dd":
        return `${year}-${month}-${day}`;
      case "dd-MM-yyyy":
        return `${day}-${month}-${year}`;
      case "MM-dd-yyyy":
        return `${month}-${day}-${year}`;
      case "dd/MM/yy":
        return `${day}/${month}/${year.toString().slice(-2)}`;
      case "dd.MM.yyyy":
        return `${day}.${month}.${year}`;
      case "yyyy/MM/dd":
        return `${year}/${month}/${day}`;
      case "dd/MM/yyyy HH:MM":
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case "MM/dd/yyyy HH:MM":
        return `${month}/${day}/${year} ${hours}:${minutes}`;
      case "yyyy-MM-dd HH:MM":
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      case "dd-MM-yyyy HH:MM":
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      case "MM-dd-yyyy HH:MM":
        return `${month}-${day}-${year} ${hours}:${minutes}`;
      case "dd/MM/yy HH:MM":
        return `${day}/${month}/${year.toString().slice(-2)} ${hours}:${minutes}`;
      case "dd.MM.yyyy HH:MM":
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      case "yyyy/MM/dd HH:MM":
        return `${year}/${month}/${day} ${hours}:${minutes}`;
      default:
        return date.toLocaleDateString("en-GB");
    }
  };

  return (
    <div className="relative" id={id}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className={className}>
          <Button
            variant="outline"
            className={`w-full justify-between font-normal ${selected ? "" : "text-[#0000008A]"} ${selected && showClearButton ? "pr-10" : ""} focus:outline-none focus:ring-2 focus:ring-blue-400 ${className || ""}`}
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) setOpen(!open);
            }}
          >
            {selected ? formatDate(selected, dateFormat) : placeholder}
            <CalendarIcon className="mr-0 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            classNames={{
              root: "rounded-md",
            }}
            selected={selected || undefined}
            defaultMonth={selected ? new Date(selected) : new Date()}
            onSelect={(date) => {
              onChange(date || null);
              setOpen(false);
            }}
            disabled={(date) => {
              const today = new Date();

              // disable ngày tương lai nếu có disabledFuture
              if (disabledFuture && date > today) return true;

              // disable ngày nhỏ hơn min nếu có min (so sánh theo ngày, không theo time)
              if (min) {
                // Normalize cả hai date về cùng timezone và chỉ so sánh phần ngày
                const dateNormalized = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate()
                );

                // Parse min string (YYYY-MM-DD) và normalize về local timezone
                const minDate = new Date(min);
                const minNormalized = new Date(
                  minDate.getFullYear(),
                  minDate.getMonth(),
                  minDate.getDate()
                );

                // So sánh: disable nếu date < min (nhỏ hơn min)
                if (dateNormalized < minNormalized) return true;
              }

              // disable các ngày trong disableDates
              if (disableDates && disableDates.length > 0) {
                const dateStr = formatDateWithFormat(date, dateFormat);
                if (disableDates.includes(dateStr)) return true;
              }

              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {selected && showClearButton && !isDisabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
        >
          <CircleXIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
interface CustomTimePickerProps {
  selected: Date | null;
  onChange: (time: Date | null) => void;
  placeholder?: string;
  error?: boolean;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
  dateFormat?: string;
}

function CustomTimePicker({
  selected,
  onChange,
  placeholder = "Chọn giờ",
  error = false,
  allowClear = true,
  className,
  disabled = false,
  dateFormat,
}: CustomTimePickerProps) {
  const [value, setValue] = React.useState<string>(
    selected
      ? `${selected.getHours().toString().padStart(2, "0")}:${selected
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : ""
  );

  React.useEffect(() => {
    setValue(
      selected
        ? `${selected.getHours().toString().padStart(2, "0")}:${selected
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        : ""
    );
  }, [selected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value;
    setValue(val);
    if (val) {
      const [hour, minute] = val.split(":").map(Number);
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      onChange(date);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type="time"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-9 pr-8 text-sm block bg-white ${className} ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        }`}
      />
      {value && allowClear && !disabled && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onChange(null);
          }}
          className="absolute right-1 top-0 bottom-0 p-1 text-gray-500 hover:text-gray-700"
        >
          <CircleXIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export {
  Calendar,
  CalendarDayButton,
  Calendar22,
  CustomDatePicker,
  CustomTimePicker,
};
