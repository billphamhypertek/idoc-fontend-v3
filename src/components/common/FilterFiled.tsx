import { XCircle } from "lucide-react";
import React from "react";

type FilterFieldProps = {
  label: string;
  field: string;
  value: string;
  type?: "text" | "date" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
  withSuggestions?: boolean;
  showSuggestions?: boolean;
  suggestions?: string[];
  required?: boolean;
  onChange: (field: string, value: string) => void;
  onFocus?: (field: string) => void;
  onBlur?: (field: string) => void;
  onSelectSuggestion?: (field: string, value: string) => void;
  onClear?: (field: string) => void;
  className?: string;
  showClear?: boolean;
  disabled?: boolean;
};

const FilterField: React.FC<FilterFieldProps> = ({
  label,
  field,
  value,
  type = "text",
  placeholder,
  options,
  withSuggestions,
  showSuggestions,
  suggestions,
  required = false,
  onChange,
  onFocus,
  onBlur,
  onSelectSuggestion,
  onClear,
  className,
  showClear = false,
  disabled = false,
}) => {
  const baseInputClass =
    "w-full h-9 px-3 border rounded-sm text-[13px] focus:outline-none";

  const enabledClass = "border-gray-300 focus:ring-2 focus:ring-blue-400";

  const disabledClass =
    "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

  return (
    <div className="space-y-1.5">
      <label
        className={`text-xs font-bold ${
          disabled ? "text-gray-400" : "text-gray-700"
        } ${className}`}
      >
        {label}
        {required && !disabled && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {type === "select" ? (
          <select
            value={value}
            disabled={disabled}
            onChange={(e) => !disabled && onChange(field, e.target.value)}
            className={`${baseInputClass} ${
              disabled ? disabledClass : enabledClass
            } pl-1`}
          >
            <option value="">{placeholder || "--- Chọn ---"}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            disabled={disabled}
            onChange={(e) => !disabled && onChange(field, e.target.value)}
            onFocus={() => !disabled && onFocus?.(field)}
            onBlur={() => !disabled && onBlur?.(field)}
            className={`${baseInputClass} ${
              disabled ? disabledClass : enabledClass
            }`}
            placeholder={placeholder}
          />
        )}

        {/* Suggestions */}
        {withSuggestions &&
          !disabled &&
          showSuggestions &&
          suggestions &&
          suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto z-5000">
              {suggestions.map((s, index) => (
                <div
                  key={index}
                  className="px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => onSelectSuggestion?.(field, s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}

        {/* Clear button */}
        {value && showClear && !disabled && (
          <button
            type="button"
            className="absolute right-0 top-0 z-10 flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
            onClick={() => {
              if (onClear) {
                onClear(field);
              } else {
                onChange(field, "");
              }
            }}
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterField;
