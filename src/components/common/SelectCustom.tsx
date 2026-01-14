"use client";

import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Option =
  | { label: string; value: string }
  | { name: string; value: string }
  | { id: string; name: string };

export interface SelectCustomProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: Option[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  onOpenChange?: (open: boolean) => void;
  type?: "single" | "multi";
  className?: string;
  contentClassName?: string;
  valueClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  showCheckbox?: boolean;
  leftIcon?: React.ReactNode;
}

export default function SelectCustom({
  options,
  value,
  defaultValue,
  onChange,
  onOpenChange,
  type = "single",
  className,
  contentClassName,
  valueClassName,
  placeholder,
  disabled,
  showCheckbox = false,
  leftIcon,
  ...props
}: SelectCustomProps) {
  const firstRender = useRef(true);

  const normalized = useMemo(
    () =>
      options.map((opt) => {
        if ("label" in opt) {
          return { label: opt.label, value: (opt as any).value };
        }
        if ("id" in opt) {
          return { label: (opt as any).name, value: String((opt as any).id) };
        }
        return { label: (opt as any).name, value: (opt as any).value };
      }),
    [options]
  );

  const clearOption = useMemo(
    () => normalized.find((o) => o.value === ""),
    [normalized]
  );
  const selectableOptions = useMemo(
    () => normalized.filter((o) => o.value !== ""),
    [normalized]
  );

  // ---------------- MULTI SELECT ----------------
  if (type === "multi") {
    const current = Array.isArray(value) ? value : value ? [String(value)] : [];
    const display = normalized
      .filter((o) => current.includes(o.value))
      .map((o) => o.label)
      .join(", ");

    return (
      <div {...props}>
        <Select
          value={"__noop__"}
          onValueChange={() => {}}
          onOpenChange={onOpenChange}
          disabled={disabled}
        >
          <div className="relative">
            {leftIcon ? (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {leftIcon}
              </span>
            ) : null}
            <SelectTrigger
              disabled={disabled}
              className={cn("text-black", leftIcon && "pl-10", className)}
            >
              <SelectValue placeholder={placeholder}>
                {display || placeholder || "-- Chọn --"}
              </SelectValue>
            </SelectTrigger>
          </div>
          <SelectContent className={contentClassName}>
            {normalized.map((o) => {
              const checked = current.includes(o.value);
              return showCheckbox ? (
                <div
                  key={o.value}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = checked
                      ? current.filter((v) => v !== o.value)
                      : [...current, o.value];
                    if (firstRender.current) {
                      firstRender.current = false;
                    }
                    onChange?.(next);
                  }}
                >
                  <Checkbox
                    checked={checked}
                    className="mr-2"
                    onCheckedChange={(isChecked) => {
                      const next = isChecked
                        ? [...current, o.value]
                        : current.filter((v) => v !== o.value);
                      if (firstRender.current) {
                        firstRender.current = false;
                      }
                      onChange?.(next);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{o.label}</span>
                </div>
              ) : (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  onClick={(e) => {
                    e.preventDefault();
                    const next = checked
                      ? current.filter((v) => v !== o.value)
                      : [...current, o.value];
                    if (firstRender.current) {
                      firstRender.current = false;
                    }
                    onChange?.(next);
                  }}
                >
                  <span className={cn(checked && "font-semibold")}>
                    {o.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // ---------------- SINGLE SELECT ----------------
  const current = Array.isArray(value) ? value[0] : value;
  const defaultVal = Array.isArray(defaultValue)
    ? defaultValue[0]
    : defaultValue;

  return (
    <div {...props}>
      <Select
        value={current}
        defaultValue={current === undefined ? defaultVal : undefined}
        onOpenChange={onOpenChange}
        disabled={disabled}
        onValueChange={(val) => {
          if (val === "__CLEAR__") {
            onChange?.("");
            return;
          }
          if (firstRender.current) {
            firstRender.current = false;
            // chặn lần mount đầu với val rỗng
            if (val === "" || val == null) return;
          }
          onChange?.(val);
        }}
      >
        <div className="relative">
          {leftIcon ? (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {leftIcon}
            </span>
          ) : null}
          <SelectTrigger
            disabled={disabled}
            className={cn("text-black", leftIcon && "pl-10", className)}
          >
            <SelectValue
              placeholder={placeholder || "-- Chọn --"}
              className={cn(valueClassName)}
            />
          </SelectTrigger>
        </div>
        <SelectContent className={contentClassName}>
          {clearOption ? (
            <SelectItem key="__CLEAR__" value="__CLEAR__">
              {clearOption.label}
            </SelectItem>
          ) : null}
          {selectableOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
