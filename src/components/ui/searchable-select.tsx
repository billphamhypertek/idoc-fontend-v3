"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  initialItemsToShow?: number;
  itemsPerLoad?: number;
}

// Memoized option item component for better performance
const OptionItem = React.memo(
  ({
    option,
    isSelected,
    onSelect,
  }: {
    option: { value: string; label: string };
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <CommandItem
      key={option.value}
      value={option.label}
      onSelect={onSelect}
      className="cursor-pointer pl-3"
    >
      <Check
        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
      />
      {option.label}
    </CommandItem>
  )
);
OptionItem.displayName = "OptionItem";

export function SearchableSelect({
  options = [],
  value,
  onValueChange,
  placeholder = "Chọn...",
  className,
  disabled = false,
  emptyMessage = "Không tìm thấy kết quả",
  searchPlaceholder = "Tìm kiếm...",
  initialItemsToShow = 50,
  itemsPerLoad = 50,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [visibleItemsCount, setVisibleItemsCount] =
    React.useState(initialItemsToShow);
  const listRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // Ensure options is always an array (memoized to prevent unnecessary re-renders)
  const safeOptions = React.useMemo(
    () => (Array.isArray(options) ? options : []),
    [options]
  );

  const selectedOption = React.useMemo(
    () => safeOptions.find((option) => option?.value === value),
    [safeOptions, value]
  );

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return safeOptions;
    const query = searchQuery.toLowerCase();
    return safeOptions.filter(
      (option) =>
        option?.label?.toLowerCase().includes(query) ||
        option?.value?.toLowerCase().includes(query)
    );
  }, [safeOptions, searchQuery]);

  // Reset visible items count when search query changes or popover opens
  React.useEffect(() => {
    setVisibleItemsCount(initialItemsToShow);
  }, [searchQuery, open, initialItemsToShow]);

  // Reset search query and visible items when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setVisibleItemsCount(initialItemsToShow);
    }
  }, [open, initialItemsToShow]);

  // Get visible options for rendering
  const visibleOptions = React.useMemo(
    () => filteredOptions.slice(0, visibleItemsCount),
    [filteredOptions, visibleItemsCount]
  );

  const hasMore = filteredOptions.length > visibleItemsCount;

  // Load more items when scrolling near the end
  const loadMore = React.useCallback(() => {
    if (hasMore) {
      setVisibleItemsCount((prev) =>
        Math.min(prev + itemsPerLoad, filteredOptions.length)
      );
    }
  }, [hasMore, itemsPerLoad, filteredOptions.length]);

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    if (!open || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: listRef.current,
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [open, hasMore, loadMore]);

  // Handle select with memoized callback
  const handleSelect = React.useCallback(
    (optionValue: string) => {
      onValueChange?.(optionValue === value ? "" : optionValue);
      setOpen(false);
      setSearchQuery("");
    },
    [onValueChange, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 w-[200px] justify-between bg-background",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false} className="flex flex-col overflow-hidden">
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9 flex-shrink-0"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList
            ref={listRef}
            className="max-h-[200px] min-h-0 overflow-y-auto overflow-x-hidden flex-1"
            style={{ overscrollBehavior: "contain" }}
          >
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {visibleOptions.length > 0 && (
              <CommandGroup>
                {visibleOptions.map((option) => {
                  if (!option || !option.value || !option.label) return null;
                  return (
                    <OptionItem
                      key={option.value}
                      option={option}
                      isSelected={value === option.value}
                      onSelect={() => handleSelect(option.value)}
                    />
                  );
                })}
                {/* Sentinel element for infinite scroll */}
                {hasMore && (
                  <div
                    ref={sentinelRef}
                    className="h-1 w-full flex items-center justify-center py-2"
                  >
                    <div className="text-xs text-gray-400">
                      Đang tải thêm...
                    </div>
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
