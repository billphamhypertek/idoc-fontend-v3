"use client";
import React from "react";
import type { FieldType, FormField } from "@/components/form-config/types";

interface FieldTypeMeta {
  type: FieldType;
  label: string;
  description: string;
  icon: any;
}

interface FieldTypesSidebarProps {
  fieldTypes: FieldTypeMeta[];
  onAddField: (field: FormField) => void;
}

export default function FieldTypesSidebar({
  fieldTypes,
  onAddField,
}: FieldTypesSidebarProps) {
  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Danh sách trường
      </h3>
      <div className="space-y-1">
        {fieldTypes.map((fieldType) => {
          const IconComponent = fieldType.icon;
          return (
            <button
              key={fieldType.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({
                    type: fieldType.type,
                    label: fieldType.label,
                    description: fieldType.description,
                  })
                );
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.opacity = "0.5";
                }
              }}
              onDragEnd={(e) => {
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
              onClick={() => {
                const newField: FormField = {
                  id: Date.now().toString(),
                  type: fieldType.type,
                  title: fieldType.label,
                  placeholder: `Nhập ${fieldType.label.toLowerCase()}`,
                  required: false,
                  options:
                    fieldType.type === "SELECT" || fieldType.type === "RADIO"
                      ? ["Tùy chọn 1", "Tùy chọn 2", "Tùy chọn 3"]
                      : undefined,
                  checkboxText:
                    fieldType?.type === "CHECKBOX"
                      ? ["Tôi đồng ý với điều khoản"]
                      : undefined,
                };
                onAddField(newField);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 text-left group cursor-grab active:cursor-grabbing -mx-[6px]"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-600 flex-shrink-0">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-semibold text-sm leading-[18px] group-hover:text-gray-900">
                  {fieldType.label}
                </div>
                <div className="text-gray-500 text-[13px] leading-[17.875px] mt-0.5">
                  {fieldType.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
