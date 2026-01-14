"use client";
import React from "react";
import BasicFieldProperties from "@/components/form-config/BasicFieldProperties";
import FieldProperties from "@/components/form-config/FieldProperties";
import LayoutStylingProperties from "@/components/form-config/LayoutStylingProperties";
import type {
  FieldType,
  FormField,
  FormRow,
} from "@/components/form-config/types";
import {
  FileText,
  CheckSquare,
  Calendar,
  CalendarClock,
  Hash,
  Type,
  Copy,
  Trash2,
  Link as LinkIcon,
  Upload,
  Edit,
} from "lucide-react";

interface PropertiesPanelProps {
  selectedField: FormField | undefined;
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  formFields: FormField[];
  formRows: FormRow[];
  setFormRows: (rows: FormRow[]) => void;
  handleFieldPropertyUpdate: (
    fieldId: string,
    updates: Partial<FormField>
  ) => void;
  handleDeleteField: (fieldId: string) => void;
  findFieldInRows: (
    fieldId: string
  ) => { row: FormRow; field: FormField; fieldIndex: number } | null;
  formName: string;
  formIsUse?: boolean;
}

export default function PropertiesPanel({
  selectedField,
  selectedFieldId,
  setSelectedFieldId,
  formFields,
  formRows,
  setFormRows,
  handleFieldPropertyUpdate,
  handleDeleteField,
  findFieldInRows,
  formName,
  formIsUse = false,
}: PropertiesPanelProps) {
  const getFieldTypeInfo = (type: FieldType) => {
    const typeMap: Record<FieldType, { icon: any; description: string }> = {
      TEXT: { icon: Type, description: "Text" },
      NUMBER: { icon: Hash, description: "Number" },
      DATE: { icon: Calendar, description: "Date" },
      DATETIME: { icon: CalendarClock, description: "DateTime" },
      TEXTAREA: { icon: FileText, description: "Textarea" },
      CHECKBOX: { icon: CheckSquare, description: "Checkbox" },
      RADIO: { icon: CheckSquare, description: "Radio" },
      SELECT: { icon: FileText, description: "Select" },
      TABLE: { icon: FileText, description: "Table" },
      LINK: { icon: LinkIcon, description: "Link" },
      FILE: { icon: Upload, description: "File" },
      EDITOR: { icon: Edit, description: "Editor" },
      LABEL: { icon: FileText, description: "Label" },
    };
    return typeMap[type] || { icon: Type, description: String(type) };
  };

  return (
    <div className="p-4">
      {selectedField ? (
        <div className="space-y-4">
          {/* Basic Information Section */}
          <BasicFieldProperties
            field={selectedField}
            onChange={handleFieldPropertyUpdate}
            formIsUse={formIsUse}
          />

          {/* Type-specific properties */}
          <FieldProperties
            field={selectedField}
            onChange={handleFieldPropertyUpdate}
            formIsUse={formIsUse}
          />

          {/* Layout & Styling Section */}
          <LayoutStylingProperties
            field={selectedField}
            onChange={handleFieldPropertyUpdate}
          />

          {/* Advanced Options Section - Moved to BasicFieldProperties */}
        </div>
      ) : formFields.length ? (
        // Tree Form View
        <div
          className="overflow-hidden overflow-y-auto overflow-x-hidden treeview-scrollbar-hide"
          style={{ minHeight: "400px", maxHeight: "calc(100vh - 350px)" }}
        >
          <div className="flex items-center py-2 px-3 rounded-lg cursor-default bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center flex-shrink-0 mr-3">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base font-semibold text-gray-900 leading-tight">
                {formName || "MyForm"}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                Form Configuration
              </span>
            </div>
          </div>
          <div className="ml-4 space-y-1">
            {formFields.map((field, index) => {
              const fieldInfo = getFieldTypeInfo(field.type);
              const IconComponent = fieldInfo.icon;
              const isSelected = selectedFieldId === field.id;
              const isLast = index === formFields.length - 1;
              return (
                <div key={field.id} className="relative group">
                  <div
                    className={`absolute top-0 w-px bg-gray-200 -left-[12px] ${
                      isLast ? "h-1/2" : "h-full"
                    }`}
                  />
                  <div className="absolute -left-[12px] top-1/2 -translate-y-1/2 w-3 h-px bg-gray-200" />

                  <div
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
                      isSelected
                        ? "bg-blue-50 border border-blue-200 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mr-3 shadow-sm transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300"
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 transition-colors duration-200 ${
                          isSelected ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <span
                        className={`text-sm font-medium leading-tight truncate ${
                          isSelected ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {field.title || field.id}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
                        {fieldInfo.description}
                      </span>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const clonedField: FormField = {
                            ...field,
                            id: Date.now().toString(),
                          };
                          const fieldLocation = findFieldInRows(field.id);
                          if (fieldLocation) {
                            const rowIndex = formRows.findIndex(
                              (r) => r.id === fieldLocation.row.id
                            );
                            const newRow: FormRow = {
                              id: `row-${Date.now()}`,
                              fields: [clonedField],
                            };
                            const newRows = [...formRows];
                            newRows.splice(rowIndex + 1, 0, newRow);
                            setFormRows(newRows);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 relative group/btn"
                        title="Clone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {!formIsUse && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(field.id);
                            if (selectedFieldId === field.id) {
                              setSelectedFieldId(null);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200 relative group/btn"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6">
          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Chưa chọn form</p>
          <p className="text-xs mt-0.5">
            Nhấn vào một form trong danh sách để bắt đầu
          </p>
        </div>
      )}
    </div>
  );
}
