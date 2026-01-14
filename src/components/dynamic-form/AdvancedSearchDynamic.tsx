"use client";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export interface DynamicFilters {
  [key: string]: any;
}

interface FieldDetail {
  id: number;
  name: string;
  title: string;
  dataType: string;
  placeholder?: string;
  options?: string | null;
  dateFormat?: string | null;
  min?: number | null;
  max?: number | null;
}

interface FieldSearchDto {
  name: string;
  label: string;
}

interface AdvancedSearchDynamicProps {
  fieldSearchList: FieldSearchDto[];
  fieldDetails: FieldDetail[];
  initialFilters?: DynamicFilters;
  appliedFilters?: DynamicFilters;
  onApply: (filters: DynamicFilters) => void;
  onReset: () => void;
}

export default function AdvancedSearchDynamic({
  fieldSearchList,
  fieldDetails,
  initialFilters = {},
  appliedFilters = {},
  onApply,
  onReset,
}: AdvancedSearchDynamicProps) {
  const [filters, setFilters] = useState<DynamicFilters>(initialFilters);

  useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  // Map field details by name for quick lookup
  const fieldDetailsMap = useMemo(() => {
    const map: Record<string, FieldDetail> = {};
    fieldDetails.forEach((field) => {
      map[field.name] = field;
    });
    return map;
  }, [fieldDetails]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    const emptyFilters: DynamicFilters = {};
    fieldSearchList.forEach((field) => {
      emptyFilters[field.name] = "";
    });
    setFilters(emptyFilters);
    onReset();
  };

  const renderField = (searchField: FieldSearchDto) => {
    const fieldDetail = fieldDetailsMap[searchField.name];
    if (!fieldDetail) return null;

    const { dataType, placeholder, options, dateFormat } = fieldDetail;
    const value = filters[searchField.name] || "";

    switch (dataType) {
      case "TEXT":
      case "TEXTAREA":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) =>
              handleInputChange(searchField.name, e.target.value)
            }
            placeholder={
              placeholder || `Nhập ${searchField.label.toLowerCase()}`
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "NUMBER":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) =>
              handleInputChange(searchField.name, e.target.value)
            }
            placeholder={
              placeholder || `Nhập ${searchField.label.toLowerCase()}`
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "DATE":
        return (
          <input
            type="date"
            value={value ? new Date(value).toISOString().split("T")[0] : ""}
            onChange={(e) => {
              handleInputChange(
                searchField.name,
                e.target.value ? new Date(e.target.value).toISOString() : ""
              );
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "DATETIME":
        return (
          <input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ""}
            onChange={(e) => {
              handleInputChange(
                searchField.name,
                e.target.value ? new Date(e.target.value).toISOString() : ""
              );
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "SELECT":
      case "CHECKBOX":
        try {
          const optionsList = options ? JSON.parse(options) : [];
          return (
            <select
              value={value}
              onChange={(e) =>
                handleInputChange(searchField.name, e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                -- Chọn {searchField.label.toLowerCase()} --
              </option>
              {optionsList.map((option: string, idx: number) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } catch {
          return (
            <input
              type="text"
              value={value}
              onChange={(e) =>
                handleInputChange(searchField.name, e.target.value)
              }
              placeholder={
                placeholder || `Nhập ${searchField.label.toLowerCase()}`
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        }

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) =>
              handleInputChange(searchField.name, e.target.value)
            }
            placeholder={
              placeholder || `Nhập ${searchField.label.toLowerCase()}`
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fieldSearchList.map((searchField) => (
          <div key={searchField.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {searchField.label}
            </label>
            {renderField(searchField)}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
        <Button
          onClick={handleReset}
          variant="outline"
          className="h-9 px-4 text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Đặt lại
        </Button>
        <Button
          onClick={handleApply}
          className="h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Search className="w-4 h-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>
    </div>
  );
}
