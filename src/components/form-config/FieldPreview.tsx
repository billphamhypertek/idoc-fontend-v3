"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import TextEditor from "@/components/common/TextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormField } from "@/components/form-config/types";

export default function FieldPreview({
  field,
  viewMode = "editor",
}: {
  field: FormField;
  viewMode?: "editor" | "preview";
}) {
  const baseInputClass =
    "w-full h-[38px] px-3 py-1.5 bg-white border border-[#d1d5db] rounded text-sm text-[#1f2937] transition-all duration-200 disabled:opacity-100 disabled:cursor-default";

  switch (field.type) {
    case "TEXT":
      return (
        <input
          type="text"
          placeholder={field.placeholder || field.title}
          disabled
          className={baseInputClass}
        />
      );
    case "NUMBER":
      return (
        <input
          type="number"
          placeholder={field.placeholder || field.title}
          disabled
          className={baseInputClass}
        />
      );
    case "DATE":
      const dateFormat = field.dateFormat || "dd/mm/yyyy";
      return (
        <input
          type="text"
          placeholder={field.placeholder || dateFormat}
          disabled
          className={baseInputClass}
        />
      );
    case "DATETIME":
      const dateTimeFormat = field.dateFormat
        ? `${field.dateFormat} HH:mm`
        : "dd/mm/yyyy HH:mm";
      return (
        <input
          type="text"
          placeholder={field.placeholder || dateTimeFormat}
          disabled
          className={baseInputClass}
        />
      );
    case "TEXTAREA":
      const getTextareaHeightClass = (height?: string) => {
        switch (height) {
          case "small":
            return "h-[38px]";
          case "medium":
            return "h-[80px]";
          case "large":
            return "h-[120px]";
          case "auto":
          default:
            return "min-h-[84px]";
        }
      };
      return (
        <textarea
          placeholder={field.placeholder || field.title}
          disabled
          rows={3}
          className={`w-full px-3 py-1.5 bg-white border border-[#d1d5db] rounded text-sm text-[#1f2937] transition-all duration-200 disabled:opacity-100 disabled:cursor-default resize-none`}
        />
      );
    case "LINK":
      return (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder={field.linkUrl || "https://example.com"}
            disabled
            className={baseInputClass}
          />
        </div>
      );
    case "FILE":
      return (
        <div className="relative">
          <input
            type="file"
            disabled
            accept={field.acceptedTypes}
            multiple={field.allowMultiple}
            className="w-full h-[38px] px-3 py-1.5 bg-white border border-[#d1d5db] rounded text-sm text-[#1f2937] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 disabled:opacity-100 disabled:cursor-default"
          />
          {field.max && (
            <span className="text-xs text-gray-500 mt-1 block">
              Max size: {field.max}MB
            </span>
          )}
        </div>
      );
    case "EDITOR":
      const getEditorHeight = (height?: string) => {
        switch (height) {
          case "small":
            return "100px";
          case "medium":
            return "200px";
          case "large":
            return "300px";
          case "auto":
          default:
            return "200px";
        }
      };
      return (
        <TextEditor
          value=""
          onChange={() => {}}
          placeholder={field.placeholder || "Rich text editor content..."}
          readOnly={true}
          toolbar="minimal"
        />
      );
    case "SELECT":
      return (
        <Select disabled={viewMode === "editor"}>
          <SelectTrigger className="h-[38px] bg-white border-[#d1d5db]">
            <SelectValue placeholder={field.placeholder || field.title} />
          </SelectTrigger>
          <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
            {field.options && field.options.length > 0 ? (
              field.options.map((opt, idx) => (
                <SelectItem key={idx} value={opt}>
                  {opt}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-options" disabled>
                Chưa có option nào
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    case "CHECKBOX":
      return (
        <div className="space-y-2">
          {field.options && field.options.length > 0 ? (
            field.options.map((text, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  disabled
                  defaultChecked={idx === 0}
                  className="w-4 h-4 border-[#d1d5db] rounded disabled:opacity-100 disabled:cursor-default"
                />
                <Label className="text-sm text-gray-700">{text}</Label>
              </div>
            ))
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 border-[#d1d5db] rounded disabled:opacity-100 disabled:cursor-default"
              />
              <Label className="text-sm text-gray-400 italic">
                Chưa có option nào
              </Label>
            </div>
          )}
        </div>
      );
    case "RADIO":
      return (
        <div className="space-y-2">
          {field.options && field.options.length > 0 ? (
            field.options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  disabled
                  defaultChecked={idx === 0}
                  className="w-4 h-4 border-[#d1d5db] disabled:opacity-100 disabled:cursor-default"
                />
                <Label className="text-sm text-gray-700">{opt}</Label>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 italic">
              Chưa có option nào
            </div>
          )}
        </div>
      );
    case "TABLE":
      return (
        <div className="border border-[#d1d5db] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#d1d5db]">
                {field.tableColumns?.map((col, idx) => (
                  <th
                    key={col.name || idx}
                    className="px-3 py-2 text-left font-medium text-gray-700 border-r border-[#d1d5db] last:border-r-0"
                  >
                    {col.label || `Cột ${idx + 1}`}
                  </th>
                ))}
                {(!field.tableColumns || field.tableColumns.length === 0) && (
                  <th className="px-3 py-2 text-left font-medium text-gray-700">
                    Cột
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {field.tableRows?.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-[#d1d5db] last:border-b-0"
                >
                  {field.tableColumns?.map((col) => (
                    <td
                      key={col.name}
                      className="px-3 py-2 border-r border-[#d1d5db] last:border-r-0"
                    >
                      {col.type === "checkbox" ? (
                        <input type="checkbox" disabled className="w-4 h-4" />
                      ) : (
                        <span className="text-gray-500">
                          {JSON.stringify(row)}
                        </span>
                      )}
                    </td>
                  ))}
                  {(!field.tableColumns || field.tableColumns.length === 0) && (
                    <span className="text-gray-500">{JSON.stringify(row)}</span>
                  )}
                </tr>
              ))}
              {(!field.tableRows || field.tableRows.length === 0) && (
                <tr>
                  <td
                    colSpan={field.tableColumns?.length || 1}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    Chưa có hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}
