"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type Option = {
  id: string | number;
  name: string;
};

interface MultiSelectProps {
  options: Option[];
  value: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  placeholderSearch?: string;
  className?: string;
  showNumberOfItems?: boolean;
  chooseAll?: boolean;
  noDataMessage?: string;
  popoverClassName?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  placeholderSearch,
  className,
  showNumberOfItems = false,
  chooseAll = false,
  noDataMessage = "Không tìm thấy nhãn nào",
  popoverClassName,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const measureContainerRef = React.useRef<HTMLDivElement | null>(null);
  const countMeasureRef = React.useRef<HTMLSpanElement | null>(null);
  const badgeMeasureRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = React.useState<number>(1);
  const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>(
    undefined
  );

  const toggleOption = (option: Option) => {
    if (value.some((v) => v.id === option.id)) {
      onChange(value.filter((v) => v.id !== option.id));
    } else {
      onChange([...value, option]);
    }
  };

  const handleSelectAll = () => {
    const allSelected = value.length === options.length;
    if (allSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const allSelected = options.length > 0 && value.length === options.length;

  // Compute how many badges fit in a single line then reserve room for +N
  React.useEffect(() => {
    if (!showNumberOfItems || value.length === 0) {
      setVisibleCount(1);
      return;
    }
    const gapPx = 8; // gap-2
    const getCountWidth = (remain: number) => {
      if (!countMeasureRef.current) return 28;
      countMeasureRef.current.textContent = `+${remain}`;
      // Force reflow read
      return countMeasureRef.current.offsetWidth;
    };
    const compute = () => {
      const containerWidth = containerRef.current?.offsetWidth ?? 0;
      if (containerWidth <= 0) {
        setVisibleCount(1);
        return;
      }
      const widths = badgeMeasureRefs.current
        .slice(0, value.length)
        .map((el) => el?.offsetWidth ?? 0);
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const remainingAfter = widths.length - (i + 1);
        const reserved = remainingAfter > 0 ? getCountWidth(remainingAfter) : 0;
        const nextUsed =
          used +
          (count > 0 ? gapPx : 0) +
          widths[i] +
          (remainingAfter > 0 ? gapPx + reserved : 0);
        if (nextUsed <= containerWidth) {
          used = used + (count > 0 ? gapPx : 0) + widths[i];
          count = i + 1;
          continue;
        }
        break;
      }
      setVisibleCount(Math.max(1, count));
    };
    compute();
    // Recompute on resize
    const ro = new ResizeObserver(() => compute());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [value, showNumberOfItems]);

  // Đồng bộ width của popover/command với width của button containerRef
  React.useEffect(() => {
    const updateWidth = () => {
      const w = triggerRef.current?.offsetWidth;
      if (w && w > 0) {
        setPopoverWidth(w);
      }
    };

    updateWidth();

    const ro = new ResizeObserver(() => updateWidth());
    if (triggerRef.current) {
      ro.observe(triggerRef.current);
    }

    return () => {
      ro.disconnect();
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <div
          ref={triggerRef}
          className={cn(
            "w-full min-h-[36px] border border-gray-300 rounded-md flex items-center gap-2 px-3 cursor-pointer hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all",
            showNumberOfItems ? "flex-nowrap overflow-hidden" : "flex-wrap",
            className
          )}
        >
          <div
            ref={containerRef}
            className={cn(
              "flex-1 flex items-center gap-2 min-h-[20px] min-w-0",
              showNumberOfItems
                ? "overflow-hidden whitespace-nowrap"
                : "flex-wrap max-h-[70px] overflow-y-auto"
            )}
          >
            {value.length === 0 && (
              <span className="text-gray-800 text-sm">
                {placeholder || "Chọn nhãn để gắn..."}
              </span>
            )}
            {!showNumberOfItems &&
              value.map((s) => (
                <Badge
                  key={s.id}
                  variant="secondary"
                  className="inline-flex items-center justify-center gap-1 px-2 text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded-md min-h-[24px] h-auto"
                >
                  <span className="break-words whitespace-normal">
                    {s.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(s);
                    }}
                    className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                    type="button"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            {showNumberOfItems && value.length > 0 && (
              <div className="max-w-[calc(100%-40px)] flex-1 flex items-center gap-2 min-h-[20px] min-w-0">
                {value.slice(0, visibleCount).map((s) => (
                  <Badge
                    key={s.id}
                    variant="secondary"
                    className="inline-flex items-center justify-start gap-1 px-2 text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded-md min-h-[24px] h-auto max-w-full"
                  >
                    <span className="truncate" title={s.name}>
                      {s.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(s);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                      type="button"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {value.length - visibleCount > 0 && (
                  <Badge
                    key="remaining-count"
                    variant="secondary"
                    className="inline-flex items-center justify-center px-2 text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-md min-h-[24px] h-auto flex-shrink-0"
                  >
                    +{value.length - visibleCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="h-full flex justify-center items-center">
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </div>
          {/* hidden measurement elements for computing visible badges */}
          {showNumberOfItems && value.length > 0 && (
            <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
              <div ref={measureContainerRef} className="flex gap-2">
                {value.map((s, idx) => (
                  <div
                    key={`measure-${s.id}`}
                    ref={(el) => {
                      badgeMeasureRefs.current[idx] = el;
                    }}
                    className="inline-flex items-center justify-start gap-1 px-2 text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded-md min-h-[24px] h-auto"
                  >
                    <span className="whitespace-nowrap">{s.name}</span>
                    <span className="ml-1 w-4 h-4" />
                  </div>
                ))}
              </div>
              <span
                ref={countMeasureRef}
                className="inline-flex items-center justify-center px-2 text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-md min-h-[24px] h-auto"
              >
                +9
              </span>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", popoverClassName)}
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={32}
        avoidCollisions={true}
        style={
          popoverWidth
            ? {
                width: popoverWidth,
                maxWidth: popoverWidth,
                minWidth: popoverWidth,
              }
            : undefined
        }
      >
        <Command>
          <CommandInput
            placeholder={placeholderSearch || "Tìm kiếm nhãn..."}
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9"
          />
          <CommandList className="w-full max-w-full">
            <CommandEmpty>{noDataMessage}</CommandEmpty>
            <CommandGroup>
              {chooseAll && options.length > 0 && (
                <CommandItem
                  key="select-all"
                  onSelect={handleSelectAll}
                  className="flex items-center cursor-pointer hover:bg-gray-50"
                >
                  <div
                    className={cn(
                      "mr-2 h-4 w-4 border border-gray-300 rounded flex items-center justify-center flex-shrink-0",
                      allSelected ? "bg-blue-600 border-blue-600" : "bg-white"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 text-white",
                        allSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  <span className="flex-1 break-words whitespace-normal">
                    Chọn tất cả
                  </span>
                </CommandItem>
              )}
              {options
                .filter((o) =>
                  o.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((option) => {
                  const isSelected = value.some((v) => v.id === option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      onSelect={() => toggleOption(option)}
                      className="flex items-start cursor-pointer hover:bg-gray-50 py-2"
                    >
                      <div
                        className={cn(
                          "mr-2 h-4 w-4 border border-gray-300 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 text-white",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                      <span className="flex-1 break-words whitespace-normal min-w-0">
                        {option.name}
                      </span>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
