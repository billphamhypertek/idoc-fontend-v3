// src/components/multi-select.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, ChevronDown, Search, XCircle, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CommandSeparator,
} from "@/components/ui/command";

const multiSelectVariants = cva(
  "m-1 transition-all ease-in-out hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "bg-white text-foreground border-input hover:border-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  hasSearch?: boolean;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    [key: string]: any;
  }[];

  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  value?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
  triggerClassName?: string;
  badgeClassName?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  selectAllOption?: boolean;
  renderOption?: (option: any, idx: number) => React.ReactNode;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      value,
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      triggerClassName,
      badgeClassName,
      hasSearch = true,
      emptyMessage = "No options found",
      searchPlaceholder = "Search options...",
      selectAllOption = false,
      renderOption,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value || defaultValue || []
    );
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedOption, setHighlightedOption] = React.useState<
      string | null
    >(null);

    // Update internal state when external value changes
    React.useEffect(() => {
      if (value !== undefined) {
        // Filter out any empty values that might cause empty badges
        const validValues = value.filter(
          (val) => val && String(val).trim() !== ""
        );
        setSelectedValues(validValues);
      }
    }, [value]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      let newSelectedValues: string[];

      // Handle "select all" logic if the option is "all" or "0"
      if ((option === "all" || option === "0") && selectAllOption) {
        if (selectedValues.includes(option)) {
          // If "all" is already selected, deselect it
          newSelectedValues = selectedValues.filter(
            (value) => value !== option
          );
        } else {
          // If "all" is being selected, clear other options and only select "all"
          // But only if maxCount allows it
          if (maxCount >= 1) {
            newSelectedValues = [option];
          } else {
            return;
          }
        }
      } else if (
        selectedValues.includes("all") ||
        selectedValues.includes("0")
      ) {
        // If "all" is already selected and we're selecting another option,
        // remove "all" and add the new option (if maxCount allows)
        if (maxCount >= 1) {
          newSelectedValues = selectedValues.filter(
            (value) => value !== "all" && value !== "0"
          );
          newSelectedValues.push(option);
        } else {
          return;
        }
      } else {
        // Normal toggle behavior for other options
        if (selectedValues.includes(option)) {
          // If option is already selected, remove it
          newSelectedValues = selectedValues.filter(
            (value) => value !== option
          );
        } else {
          // If option is not selected, check maxCount before adding
          if (selectedValues.length >= maxCount) {
            // If already at max count, don't add new option
            return;
          }
          newSelectedValues = [...selectedValues, option];
        }
      }

      // Filter out any empty values that might cause empty badges
      const validValues = newSelectedValues.filter(
        (value) => value && String(value).trim() !== ""
      );
      setSelectedValues(validValues);
      onValueChange(validValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    // Filter options based on search query
    const filteredOptions = searchQuery
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Reset search when popover closes
    React.useEffect(() => {
      if (!isPopoverOpen) {
        setSearchQuery("");
        setHighlightedOption(null);
      }
    }, [isPopoverOpen]);

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            variant="outline"
            className={cn(
              multiSelectVariants({ variant }),
              "h-9 flex w-full px-3 py-2 rounded-md border text-sm items-center justify-between bg-background [&_svg]:pointer-events-auto transition-colors",
              selectedValues.length > 0 ? "pl-2" : "pl-3",
              isPopoverOpen && "border-primary ring-2 ring-primary/20",
              "[&_.custom-scrollbar]:overflow-x-auto [&_.custom-scrollbar::-webkit-scrollbar]:h-1 [&_.custom-scrollbar::-webkit-scrollbar-thumb]:bg-gray-300 [&_.custom-scrollbar::-webkit-scrollbar-thumb]:rounded-full [&_.custom-scrollbar::-webkit-scrollbar-track]:bg-transparent",
              "[&_.badge-container]:flex [&_.badge-container]:flex-nowrap [&_.badge-container]:items-center [&_.badge-container]:gap-1.5 [&_.badge-container]:overflow-x-auto [&_.badge-container]:py-0.5 [&_.badge-container]:w-full",
              triggerClassName,
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full min-w-0">
                <div className="flex overflow-hidden flex-1 items-center min-w-0 pl-1">
                  <div className="w-full badge-container custom-scrollbar">
                    {selectedValues
                      .filter((value) => value && String(value).trim() !== "") // Filter out empty values when rendering
                      .map((value) => {
                        const option = options.find((o) => o.value === value);
                        const IconComponent = option?.icon;
                        return option ? ( // Only render if option exists
                          <Badge
                            key={value}
                            variant="default"
                            className={cn(
                              "bg-blue-100 text-blue-700 hover:bg-blue-200 py-0.5 h-6 text-xs rounded-md whitespace-nowrap flex-shrink-0 flex items-center transition-colors shadow-sm",
                              value === "all" || value === "0"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "",
                              badgeClassName
                            )}
                          >
                            <div className="px-1.5 flex items-center max-w-fit">
                              {IconComponent ? (
                                <IconComponent className="w-3.5 h-3.5 shrink-0 mr-1" />
                              ) : (
                                <Tag className="mr-1 w-4 h-4 opacity-70 shrink-0" />
                              )}
                              <span className="truncate max-w-[80px] font-medium">
                                {option.label}
                              </span>
                              <XCircle
                                className="w-3.5 h-3.5 ml-1 cursor-pointer shrink-0 opacity-70 hover:opacity-100 hover:text-red-500 transition-colors"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleOption(value);
                                }}
                              />
                            </div>
                          </Badge>
                        ) : null;
                      })}
                  </div>
                </div>
                <div className="flex gap-1 items-center ml-2 shrink-0">
                  {selectedValues.length >= 2 && (
                    <XCircle
                      className="h-4 text-gray-400 transition-colors cursor-pointer hover:text-red-500"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClear();
                      }}
                    />
                  )}
                  <ChevronDown
                    className="h-4 text-gray-400 transition-transform duration-200"
                    style={{
                      transform: isPopoverOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-500 truncate pl-1">
                  {placeholder}
                </span>
                <ChevronDown
                  className="h-4 text-gray-400 transition-transform duration-200 shrink-0"
                  style={{
                    transform: isPopoverOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border-border/50 overflow-hidden"
          align="start"
          side="bottom"
          style={{
            width: "var(--radix-popover-trigger-width)",
            maxWidth: "var(--radix-popover-trigger-width)",
            minWidth: "var(--radix-popover-trigger-width)",
          }}
        >
          <Command className="w-full max-w-full">
            {hasSearch && (
              <div className="flex items-center px-3 w-full border-b">
                <CommandInput
                  placeholder={searchPlaceholder}
                  className="w-full h-9 focus:outline-none"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onKeyDown={handleInputKeyDown}
                />
              </div>
            )}
            <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden w-full max-w-full">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="p-1.5 w-full overflow-hidden">
                {filteredOptions.map((option, idx) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer w-full min-w-0 max-w-full",
                      selectedValues.includes(option.value) && "bg-[#F2994A]/10"
                    )}
                  >
                    <div className="flex-1 min-w-0 max-w-full truncate">
                      {renderOption ? renderOption(option, idx) : option.label}
                    </div>
                    {selectedValues.includes(option.value) && (
                      <CheckIcon className="ml-auto h-4 w-4 text-[#F2994A] flex-shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator className="my-1" />
              {selectedValues.length >= 2 && (
                <div className="flex justify-end p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClear();
                    }}
                  >
                    Xóa tất cả
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
