"use client";
import React, { useState } from "react";
import { Edit, Eye, FileText, Copy, Trash2, Plus } from "lucide-react";
import FieldPreview from "@/components/form-config/FieldPreview";
import { CustomDatePicker, CustomTimePicker } from "@/components/ui/calendar";
import TableCellWithActions from "@/components/common/TableCellWithActions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetApiEndpointListQuery,
  useGetApiPreviewData,
} from "@/hooks/data/form-config.data";
import { formatDateYMD } from "@/utils/datetime.utils";
import type {
  FieldType,
  FormField,
  FormRow,
} from "@/components/form-config/types";

interface FormCanvasProps {
  formRows: FormRow[];
  viewMode: "editor" | "preview";
  setViewMode: (v: "editor" | "preview") => void;
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  dragOverRowId: string | null;
  setDragOverRowId: (id: string | null) => void;
  dragOverPosition: "left" | "right" | "between" | null;
  setDragOverPosition: (pos: "left" | "right" | "between" | null) => void;
  dragOverFieldIndex: number | null;
  setDragOverFieldIndex: (idx: number | null) => void;
  handleAddField: (
    field: FormField,
    targetRowId?: string,
    position?: "left" | "right" | "new"
  ) => void;
  handleDeleteField: (fieldId: string) => void;
  setFormRows: (rows: FormRow[]) => void;
  formIsUse?: boolean;
}

export default function FormCanvas({
  formRows,
  viewMode,
  setViewMode,
  selectedFieldId,
  setSelectedFieldId,
  dragOverRowId,
  setDragOverRowId,
  dragOverPosition,
  setDragOverPosition,
  dragOverFieldIndex,
  setDragOverFieldIndex,
  handleAddField,
  handleDeleteField,
  setFormRows,
  formIsUse = false,
}: FormCanvasProps) {
  const [draggedField, setDraggedField] = useState<{
    fieldId: string;
    rowId: string;
  } | null>(null);
  const dragOverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [resizingState, setResizingState] = useState<{
    rowId: string;
    resizingFieldId: string;
    startX: number;
    rowWidth: number;
    containerWidth: number;
    startWidthPercent: number;
  } | null>(null);

  // Helper functions for date/datetime parsing
  const parseDateString = (value?: string | null): Date | null => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const parseDateTimeString = (value?: string | null): Date | null => {
    if (!value) return null;
    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    if (!year || !month || !day) return null;

    return new Date(
      year,
      month - 1,
      day,
      isNaN(hour) ? 0 : hour,
      isNaN(minute) ? 0 : minute
    );
  };

  const formatDateTimeLocal = (
    date: Date | null | undefined
  ): string | undefined => {
    if (!date) return undefined;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  // API hooks for table select columns
  const { data: apiEndpointData } = useGetApiEndpointListQuery();
  const previewDataMutation = useGetApiPreviewData();

  // Track loaded APIs to avoid duplicate calls
  const [loadedApis, setLoadedApis] = React.useState<Set<number>>(new Set());

  // Auto-load API preview data for select columns
  React.useEffect(() => {
    const selectColumnsWithApi = formRows
      .flatMap((row) => row.fields)
      .filter((field) =>
        field.tableColumns?.some((col) => col.type === "select" && col.apiId)
      )
      .flatMap(
        (field) =>
          field.tableColumns?.filter(
            (col) => col.type === "select" && col.apiId
          ) || []
      );

    selectColumnsWithApi.forEach((col) => {
      if (col.apiId && apiEndpointData?.objList) {
        const apiId =
          typeof col.apiId === "number" ? col.apiId : parseInt(col.apiId);
        if (!loadedApis.has(apiId)) {
          const selectedApi = apiEndpointData.objList.find(
            (api) => api.id === apiId
          );
          if (selectedApi?.api) {
            setLoadedApis((prev) => new Set(prev).add(apiId));
            previewDataMutation.mutate(
              { apiUrl: selectedApi.api },
              {
                onSuccess: (data) => {
                  // Update options for the specific table column
                  const options = data
                    .slice(0, 5)
                    .map(
                      (item: any) =>
                        item.name || item.label || item.value || item
                    );
                  const newRows = formRows.map((row) => ({
                    ...row,
                    fields: row.fields.map((field) => {
                      if (
                        field.tableColumns?.some(
                          (tableCol) => tableCol.apiId === col.apiId
                        )
                      ) {
                        const updatedTableColumns = field.tableColumns?.map(
                          (tableCol) => {
                            if (tableCol.apiId === col.apiId) {
                              return {
                                ...tableCol,
                                options: options.length > 0 ? options : [],
                              };
                            }
                            return tableCol;
                          }
                        );
                        return {
                          ...field,
                          tableColumns: updatedTableColumns,
                        };
                      }
                      return field;
                    }),
                  }));
                  setFormRows(newRows);
                },
                onError: (error) => {
                  console.error(
                    "Error loading API data for table column:",
                    error
                  );
                },
              }
            );
          }
        }
      }
    });
  }, [formRows, apiEndpointData, loadedApis]);

  // Tính toán phần trăm width thực tế cho 1 field trong 1 row
  const getFieldWidthPercent = (row: FormRow, field: FormField): number => {
    const fields = row.fields.filter((f) => !f.hidden);

    // 1. Tính base width (ưu tiên inputWidth, nếu không có thì chia đều theo số field)
    let baseWidth = 100 / Math.max(1, fields.length);
    if (typeof field.inputWidth === "number" && !isNaN(field.inputWidth)) {
      baseWidth = field.inputWidth;
    }

    // 2. Áp dụng multiplier từ thuộc tính size
    let multiplier = 1;
    if (field.size) {
      switch (field.size) {
        case "half":
          multiplier = 0.5;
          break;
        case "third":
          multiplier = 0.3333;
          break;
        case "quarter":
          multiplier = 0.25;
          break;
        case "full":
        default:
          multiplier = 1;
          break;
      }
    }

    return Math.max(5, Math.min(100, baseWidth * multiplier));
  };

  // Sắp xếp lại các field vào các row sao cho tổng width mỗi row <= 100
  const reflowRowsByWidth = (rows: FormRow[]): FormRow[] => {
    return rows.map((row) => {
      const visibleFields = row.fields.filter((f) => !f.hidden);
      if (visibleFields.length === 0) return row;

      // Calculate total width using getFieldWidthPercent which handles defaults
      const totalWidth = visibleFields.reduce((sum, field) => {
        return sum + getFieldWidthPercent(row, field);
      }, 0);

      // If total width is reasonable (<= 105%), keep the row as is
      if (totalWidth <= 105) {
        return row;
      }

      // Smart balance for 2 fields: if one has a custom width, adjust the other
      if (visibleFields.length === 2) {
        const definedIdx = visibleFields.findIndex(
          (f) => typeof f.inputWidth === "number"
        );
        if (definedIdx !== -1) {
          const definedWidth = visibleFields[definedIdx].inputWidth!;
          const clampedWidth = Math.max(5, Math.min(95, definedWidth));
          const otherIdx = 1 - definedIdx;

          return {
            ...row,
            fields: row.fields.map((f) => {
              if (f.id === visibleFields[definedIdx].id)
                return { ...f, inputWidth: clampedWidth };
              if (f.id === visibleFields[otherIdx].id)
                return { ...f, inputWidth: 100 - clampedWidth };
              return f;
            }),
          };
        }
      }

      // Fallback: scale proportionally
      const scaleFactor = 100 / totalWidth;
      return {
        ...row,
        fields: row.fields.map((field) => ({
          ...field,
          inputWidth: Math.max(
            5,
            getFieldWidthPercent(row, field) * scaleFactor
          ),
        })),
      };
    });
  };

  const startResize = (
    e: React.MouseEvent<HTMLDivElement>,
    row: FormRow,
    fieldIndex: number
  ) => {
    if (viewMode !== "editor") return;

    e.preventDefault();
    e.stopPropagation();

    const dropZone = document.querySelector(".drop-zone-fields") as HTMLElement;

    if (!dropZone) return;

    const containerRect = dropZone.getBoundingClientRect();
    const rowRect = (
      e.currentTarget.closest(".form-row") as HTMLElement
    ).getBoundingClientRect();

    const resizingField = row.fields[fieldIndex];

    setResizingState({
      rowId: row.id,
      resizingFieldId: resizingField.id,
      startX: e.clientX,
      rowWidth: rowRect.width,
      containerWidth: containerRect.width,
      startWidthPercent: getFieldWidthPercent(row, resizingField),
    });
  };

  React.useEffect(() => {
    if (!resizingState) return;

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      if (!resizingState) return;
      const deltaX = event.clientX - resizingState.startX;
      const startWidthPx =
        (resizingState.startWidthPercent / 100) * resizingState.containerWidth;
      let nextWidthPx = startWidthPx + deltaX;
      const MIN_PX = (5 / 100) * resizingState.containerWidth;
      const MAX_PX = resizingState.containerWidth;

      nextWidthPx = Math.max(MIN_PX, Math.min(MAX_PX, nextWidthPx));

      let nextWidthPercent = (nextWidthPx / resizingState.containerWidth) * 100;

      const updatedRows = formRows.map((row) => {
        if (row.id !== resizingState.rowId) return row;

        const visibleFields = row.fields.filter((f) => !f.hidden);
        const currentIndex = visibleFields.findIndex(
          (f) => f.id === resizingState.resizingFieldId
        );

        // Giới hạn width để không vượt quá 100% tổng cộng
        if (currentIndex !== -1) {
          // Tính tổng width của các fields khác (không phải field đang resize)
          let totalOtherWidth = 0;
          visibleFields.forEach((field, index) => {
            if (index !== currentIndex) {
              totalOtherWidth += getFieldWidthPercent(row, field);
            }
          });

          // Giới hạn max width cho field đang resize
          const maxAllowed = 100 - totalOtherWidth;
          nextWidthPercent = Math.min(
            Math.max(5, nextWidthPercent),
            maxAllowed
          );
        }

        return {
          ...row,
          fields: row.fields.map((field) =>
            field.id === resizingState.resizingFieldId
              ? { ...field, inputWidth: nextWidthPercent }
              : field
          ),
        };
      });

      setFormRows(updatedRows);
    };

    const handleMouseUp = () => {
      // Sau khi kết thúc resize, reflow lại các row theo width
      const newRows = reflowRowsByWidth(formRows);
      setFormRows(newRows);
      setResizingState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingState, setFormRows, formRows]);

  // Handle field reordering via drag and drop
  const handleFieldDrop = (
    targetRowId: string,
    targetPosition: "left" | "right" | "between",
    targetFieldIndex?: number
  ) => {
    if (!draggedField) return;

    const sourceRowIndex = formRows.findIndex(
      (r) => r.id === draggedField.rowId
    );
    const targetRowIndex = formRows.findIndex((r) => r.id === targetRowId);

    if (sourceRowIndex === -1 || targetRowIndex === -1) return;

    const sourceRow = formRows[sourceRowIndex];
    const sourceFieldIndex = sourceRow.fields.findIndex(
      (f) => f.id === draggedField.fieldId
    );

    if (sourceFieldIndex === -1) return;

    const field = sourceRow.fields[sourceFieldIndex];
    const newRows = [...formRows];

    // Helper to balance widths if they exceed 100%
    const balanceFields = (fields: FormField[]): FormField[] => {
      if (fields.length <= 1) return fields;

      const totalWidth = fields.reduce(
        (sum, f) => sum + (f.inputWidth ?? 100 / fields.length),
        0
      );

      // Only balance if total width exceeds 105%
      if (totalWidth > 105) {
        // If we have exactly 2 fields and at least one has a custom width,
        // try to preserve the custom width and give the remainder to the other.
        if (fields.length === 2) {
          const definedIdx = fields.findIndex(
            (f) => typeof f.inputWidth === "number"
          );
          if (definedIdx !== -1) {
            const definedWidth = fields[definedIdx].inputWidth!;
            const clampedWidth = Math.max(5, Math.min(95, definedWidth));
            const otherIdx = 1 - definedIdx;

            const newFields = [...fields];
            newFields[definedIdx] = {
              ...fields[definedIdx],
              inputWidth: clampedWidth,
            };
            newFields[otherIdx] = {
              ...fields[otherIdx],
              inputWidth: 100 - clampedWidth,
            };
            return newFields;
          }
        }

        // Fallback: scale proportionally
        const scaleFactor = 100 / totalWidth;
        return fields.map((f) => ({
          ...f,
          inputWidth: Math.max(
            5,
            (f.inputWidth ?? 100 / fields.length) * scaleFactor
          ),
        }));
      }
      return fields;
    };

    // Case 1: Moving within the same row
    if (draggedField.rowId === targetRowId) {
      if (targetPosition === "between") {
        const updatedSourceFields = sourceRow.fields.filter(
          (f) => f.id !== field.id
        );
        if (updatedSourceFields.length === 0) return;

        newRows[sourceRowIndex] = {
          ...sourceRow,
          fields: updatedSourceFields,
        };

        const newRow: FormRow = {
          id: `row-${Date.now()}`,
          fields: [{ ...field }],
        };
        newRows.splice(sourceRowIndex, 0, newRow);
      } else if (targetFieldIndex !== undefined) {
        const updatedFields = [...sourceRow.fields];
        const currentIndex = updatedFields.findIndex((f) => f.id === field.id);

        if (currentIndex !== -1) {
          updatedFields.splice(currentIndex, 1);
          // Adjust target index if we removed an item before it
          let insertIdx = targetFieldIndex;
          if (targetPosition === "right") insertIdx++;
          if (currentIndex < insertIdx) insertIdx--;

          updatedFields.splice(insertIdx, 0, field);

          // Update orderNumber for all fields in the row based on their new positions
          const updatedFieldsWithOrder = updatedFields.map((f, idx) => ({
            ...f,
            orderNumber: sourceRowIndex + 1, // All fields in same row have same orderNumber
          }));

          newRows[sourceRowIndex] = {
            ...sourceRow,
            fields: balanceFields(updatedFieldsWithOrder),
          };
        }
      }
    } else {
      // Case 2: Moving to a different row
      const targetRow = formRows[targetRowIndex];

      if (targetPosition === "between") {
        // Create new row
        const updatedSourceFields = sourceRow.fields.filter(
          (f) => f.id !== field.id
        );
        newRows[sourceRowIndex] = {
          ...sourceRow,
          fields: updatedSourceFields,
        };

        let adjustedTargetIndex = targetRowIndex;
        if (updatedSourceFields.length === 0) {
          newRows.splice(sourceRowIndex, 1);
          if (sourceRowIndex < targetRowIndex) adjustedTargetIndex--;
        }

        const newRow: FormRow = {
          id: `row-${Date.now()}`,
          fields: [{ ...field }],
        };
        newRows.splice(adjustedTargetIndex, 0, newRow);
      } else if (targetFieldIndex !== undefined) {
        // Add to existing row at specific position
        const updatedSourceFields = sourceRow.fields.filter(
          (f) => f.id !== field.id
        );
        newRows[sourceRowIndex] = {
          ...sourceRow,
          fields: updatedSourceFields,
        };

        let adjustedTargetIndex = targetRowIndex;
        if (updatedSourceFields.length === 0) {
          newRows.splice(sourceRowIndex, 1);
          if (sourceRowIndex < targetRowIndex) adjustedTargetIndex--;
        }

        const currentTargetRow = newRows[adjustedTargetIndex];
        const updatedTargetFields = [...currentTargetRow.fields];

        let insertIdx = targetFieldIndex;
        if (targetPosition === "right") insertIdx++;

        updatedTargetFields.splice(insertIdx, 0, field);

        // Update orderNumber for all fields in the target row
        const updatedTargetFieldsWithOrder = updatedTargetFields.map((f) => ({
          ...f,
          orderNumber: adjustedTargetIndex + 1,
        }));

        newRows[adjustedTargetIndex] = {
          ...currentTargetRow,
          fields: balanceFields(updatedTargetFieldsWithOrder),
        };
      }
    }

    setFormRows(newRows);
    setDraggedField(null);
  };

  const updateTableRows = (
    fieldId: string,
    updater: (rows: Record<string, any>[]) => Record<string, any>[]
  ) => {
    let hasChanges = false;
    const nextRows = formRows.map((row) => {
      let rowChanged = false;
      const nextFields = row.fields.map((f) => {
        if (f.id !== fieldId) return f;
        rowChanged = true;
        const currentRows = Array.isArray(f.tableRows) ? [...f.tableRows] : [];
        const updatedRows = updater(currentRows);
        return {
          ...f,
          tableRows: updatedRows.length > 0 ? updatedRows : undefined,
        };
      });
      if (!rowChanged) {
        return row;
      }
      hasChanges = true;
      return {
        ...row,
        fields: nextFields,
      };
    });

    if (hasChanges) {
      setFormRows(nextRows);
    }
  };

  const handleAddTableRow = (
    field: FormField,
    insertAfterIndex: number | null = null
  ) => {
    if (viewMode !== "editor") return;

    // Create default values for each column based on type
    const newRowData: Record<string, any> = {};
    field.tableColumns?.forEach((col) => {
      if (col.name) {
        switch (col.type) {
          case "checkbox":
            newRowData[col.name] = false;
            break;
          case "select":
            newRowData[col.name] = "";
            break;
          case "date":
            newRowData[col.name] = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            break;
          case "datetime":
            newRowData[col.name] = new Date().toISOString(); // ISO string
            break;
          case "text":
          default:
            newRowData[col.name] = "";
            break;
        }
      }
    });

    updateTableRows(field.id, (rows) => {
      const nextRows = [...rows];
      const insertIndex =
        typeof insertAfterIndex === "number" && insertAfterIndex >= 0
          ? insertAfterIndex + 1
          : nextRows.length;
      nextRows.splice(insertIndex, 0, newRowData);
      return nextRows;
    });
  };

  const handleEditTableRow = (field: FormField, rowIndex: number) => {
    if (viewMode !== "editor") return;
    if (typeof window === "undefined") return;
    // Note: Edit functionality is now handled inline per cell
    // This function is kept for compatibility but doesn't do anything
  };

  const handleDeleteTableRow = (field: FormField, rowIndex: number) => {
    if (viewMode !== "editor") return;
    if (typeof window === "undefined") return;
    const confirmed = window.confirm("Bạn có chắc muốn xóa hàng này?");
    if (!confirmed) return;

    updateTableRows(field.id, (rows) =>
      rows.filter((_, idx) => idx !== rowIndex)
    );
  };

  return (
    <>
      {/* View Mode Buttons (Vertical) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col">
        <button
          onClick={() => setViewMode("editor")}
          className={`w-8 h-8 flex items-center justify-center transition-all relative group ${
            viewMode === "editor"
              ? "bg-[#17c495] text-white rounded-t"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600 rounded-t"
          }`}
          title="Editor"
          role="button"
          tabIndex={0}
          aria-label="Editor"
        >
          <Edit className="w-3 h-3" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-2 bg-black/80 text-white text-sm px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Editor
          </div>
        </button>
        <button
          onClick={() => setViewMode("preview")}
          className={`w-8 h-8 flex items-center justify-center transition-all relative group ${
            viewMode === "preview"
              ? "bg-[#17c495] text-white rounded-b"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600 rounded-b"
          }`}
          title="Preview"
          role="button"
          tabIndex={0}
          aria-label="Preview"
        >
          <Eye className="w-3 h-3" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-2 bg-black/80 text-white text-sm px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Preview
          </div>
        </button>
      </div>

      <div
        className="p-6"
        onClick={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).closest(".form-preview-container") ===
              null
          ) {
            if (viewMode === "editor") {
              setSelectedFieldId(null);
            }
          }
        }}
      >
        <div className="max-w-[540px] mx-auto">
          <div
            className="bg-white rounded-lg shadow-lg p-6 form-preview-container"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.classList.add(
                  "ring-2",
                  "ring-blue-400",
                  "ring-dashed"
                );
              }
            }}
            onDragLeave={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.classList.remove(
                  "ring-2",
                  "ring-blue-400",
                  "ring-dashed"
                );
              }
            }}
            onDrop={(e) => {
              if ((e.target as HTMLElement).closest(".form-row") === null) {
                e.preventDefault();
                e.stopPropagation();
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.classList.remove(
                    "ring-2",
                    "ring-blue-400",
                    "ring-dashed"
                  );
                }
                try {
                  const data = JSON.parse(
                    e.dataTransfer.getData("application/json")
                  ) as {
                    type?: FieldType;
                    label?: string;
                    description?: string;
                  };
                  if (data && data.type) {
                    const newField: FormField = {
                      id: Date.now().toString(),
                      type: data.type,
                      title: data.label || "New Field",
                      placeholder: `Nhập ${(data.label || "giá trị").toLowerCase()}`,
                      required: false,
                      options:
                        data.type === "SELECT" || data.type === "RADIO"
                          ? ["Tùy chọn 1", "Tùy chọn 2", "Tùy chọn 3"]
                          : undefined,
                      checkboxText:
                        data.type === "CHECKBOX"
                          ? ["Tôi đồng ý với điều khoản"]
                          : undefined,
                    };
                    handleAddField(newField);
                    setSelectedFieldId(newField.id);
                  }
                } catch (error) {
                  console.error("Error parsing drag data:", error);
                }
              }
            }}
            onClick={(e) => {
              if (
                e.target === e.currentTarget ||
                (e.target as HTMLElement).closest(".form-field-item") === null
              ) {
                if (viewMode === "editor") {
                  setSelectedFieldId(null);
                }
              }
            }}
          >
            {formRows.length === 0 ? (
              <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-lg drop-zone-empty">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Chưa có trường nào trong form</p>
                <p className="text-xs mt-0.5">
                  Kéo thả trường từ danh sách bên trái hoặc nhấn vào trường để
                  thêm
                </p>
              </div>
            ) : (
              <div className="drop-zone-fields space-y-2">
                {formRows.map((row) => (
                  <div
                    key={row.id}
                    className={`form-row relative flex gap-2`}
                    onDragOver={(e) => {
                      if (viewMode === "editor") {
                        e.preventDefault();
                        e.stopPropagation();

                        // Throttle drag over updates
                        if (dragOverTimeoutRef.current) return;

                        dragOverTimeoutRef.current = setTimeout(() => {
                          dragOverTimeoutRef.current = null;
                        }, 50);

                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;

                        // Check if dragging between rows (top 15px)
                        if (y < 15) {
                          if (
                            dragOverRowId !== row.id ||
                            dragOverPosition !== "between" ||
                            dragOverFieldIndex !== null
                          ) {
                            setDragOverRowId(row.id);
                            setDragOverPosition("between");
                            setDragOverFieldIndex(null);
                          }
                        } else {
                          // Row with any number of fields
                          const x = e.clientX - rect.left;
                          const width = rect.width;

                          let currentX = 0;
                          let targetIdx = row.fields.length - 1;
                          let targetPos: "left" | "right" = "right";

                          for (let i = 0; i < row.fields.length; i++) {
                            const fieldWidth =
                              (getFieldWidthPercent(row, row.fields[i]) / 100) *
                              width;
                            if (x < currentX + fieldWidth) {
                              targetIdx = i;
                              // Determine if we are on the left or right half of THIS field
                              targetPos =
                                x < currentX + fieldWidth / 2
                                  ? "left"
                                  : "right";
                              break;
                            }
                            currentX += fieldWidth;
                          }

                          if (
                            dragOverRowId !== row.id ||
                            dragOverPosition !== targetPos ||
                            dragOverFieldIndex !== targetIdx
                          ) {
                            setDragOverRowId(row.id);
                            setDragOverPosition(targetPos);
                            setDragOverFieldIndex(targetIdx);
                          }
                        }
                      }
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverRowId(null);
                        setDragOverPosition(null);
                        setDragOverFieldIndex(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // Clear timeout
                      if (dragOverTimeoutRef.current) {
                        clearTimeout(dragOverTimeoutRef.current);
                        dragOverTimeoutRef.current = null;
                      }

                      const dataType =
                        e.dataTransfer.types.includes("text/plain");

                      // Check if it's a field being moved
                      if (dataType && draggedField) {
                        if (dragOverPosition) {
                          handleFieldDrop(
                            row.id,
                            dragOverPosition,
                            dragOverFieldIndex ?? undefined
                          );
                        }
                      } else if (
                        e.dataTransfer.types.includes("application/json")
                      ) {
                        // New field from sidebar
                        try {
                          const data = JSON.parse(
                            e.dataTransfer.getData("application/json")
                          ) as {
                            type?: FieldType;
                            label?: string;
                            description?: string;
                          };
                          if (data && data.type) {
                            if (dragOverPosition === "between") {
                              const newField: FormField = {
                                id: Date.now().toString(),
                                type: data.type,
                                title: data.label || "New Field",
                                placeholder: `Nhập ${(data.label || "giá trị").toLowerCase()}`,
                                required: false,
                                options:
                                  data.type === "SELECT" ||
                                  data.type === "RADIO"
                                    ? ["Tùy chọn 1", "Tùy chọn 2", "Tùy chọn 3"]
                                    : undefined,
                                checkboxText:
                                  data.type === "CHECKBOX"
                                    ? ["Tôi đồng ý với điều khoản"]
                                    : undefined,
                              };
                              handleAddField(newField);
                              setSelectedFieldId(newField.id);
                            } else if (dragOverPosition) {
                              const position = dragOverPosition;
                              const newField: FormField = {
                                id: Date.now().toString(),
                                type: data.type,
                                title: data.label || "New Field",
                                placeholder: `Nhập ${(data.label || "giá trị").toLowerCase()}`,
                                required: false,
                                options:
                                  data.type === "SELECT" ||
                                  data.type === "RADIO"
                                    ? ["Tùy chọn 1", "Tùy chọn 2", "Tùy chọn 3"]
                                    : undefined,
                                checkboxText:
                                  data.type === "CHECKBOX"
                                    ? ["Tôi đồng ý với điều khoản"]
                                    : undefined,
                              };
                              handleAddField(newField, row.id, position);
                              setSelectedFieldId(newField.id);
                            }
                          }
                        } catch (error) {
                          console.error("Error parsing drag data:", error);
                        }
                      }

                      setDragOverRowId(null);
                      setDragOverPosition(null);
                      setDragOverFieldIndex(null);
                    }}
                  >
                    {row.fields.map((field, fieldIndex) => {
                      // Skip rendering if field is hidden
                      if (field.hidden) {
                        return null;
                      }

                      return (
                        <div
                          key={field.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (viewMode === "editor") {
                              setSelectedFieldId(field.id);
                            }
                          }}
                          className={`form-field-item relative group flex-none transition-all duration-150 ${
                            selectedFieldId === field.id &&
                            viewMode === "editor"
                              ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-50 rounded-md"
                              : ""
                          } ${
                            dragOverRowId === row.id &&
                            dragOverFieldIndex === fieldIndex &&
                            dragOverPosition !== "between" &&
                            draggedField?.fieldId !== field.id
                              ? "ring-2 ring-dashed ring-blue-400"
                              : ""
                          } ${draggedField?.fieldId === field.id ? "dragging" : ""}`}
                          style={{
                            width: `${getFieldWidthPercent(row, field)}%`,
                            maxWidth: `${getFieldWidthPercent(row, field)}%`,
                            flex: "0 0 auto",
                          }}
                        >
                          {/* Khung resize hiển thị rõ hơn khi field được chọn */}
                          {viewMode === "editor" &&
                            selectedFieldId === field.id && (
                              <div className="pointer-events-none absolute inset-[-3px] rounded-md border-2 border-blue-400/80 border-dashed" />
                            )}

                          {viewMode === "editor" && (
                            <div className="absolute -top-2 right-0 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rowIndex = formRows.findIndex(
                                    (r) => r.id === row.id
                                  );
                                  const clonedField: FormField = {
                                    ...field,
                                    id: Date.now().toString(),
                                    orderNumber: rowIndex + 2, // Next row after current
                                  };
                                  const newRow: FormRow = {
                                    id: `row-${Date.now()}`,
                                    fields: [clonedField],
                                  };
                                  const newRows = [...formRows];
                                  newRows.splice(rowIndex + 1, 0, newRow);

                                  // Update orderNumber for all rows after insertion
                                  const updatedRows = newRows.map((r, idx) => ({
                                    ...r,
                                    fields: r.fields.map((f) => ({
                                      ...f,
                                      orderNumber: idx + 1,
                                    })),
                                  }));

                                  setFormRows(updatedRows);
                                }}
                                className="w-4 h-4 bg-[#17c495] text-white rounded flex items-center justify-center hover:bg-[#15b085] transition-colors"
                                title="Clone"
                              >
                                <Copy className="w-2.5 h-2.5" />
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
                                  className="w-4 h-4 bg-[#17c495] text-white rounded flex items-center justify-center hover:bg-[#15b085] transition-colors ml-0.5"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}

                          <div>
                            <label className="block text-sm text-gray-900 mb-1">
                              {field.title}
                              {field.description && (
                                <span className="text-gray-500 ml-1">
                                  ({field.description})
                                </span>
                              )}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            <div className="mt-0.5">
                              {field.type === "TABLE" ? (
                                (() => {
                                  const tableColumns = field.tableColumns ?? [];
                                  const tableRows = field.tableRows ?? [];
                                  const hasColumns = tableColumns.length > 0;
                                  const showActionColumn = !!field.editable;
                                  const canModifyTable =
                                    showActionColumn && viewMode === "editor";
                                  // Function to check if column allows add/delete rows
                                  const canColumnAddDeleteRows = (col: any) =>
                                    !!col.allowAddDeleteRowsCell &&
                                    viewMode === "editor";
                                  const actionButtonClass =
                                    "w-6 h-6 flex items-center justify-center rounded bg-[#17c495] text-white hover:bg-[#15b085] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

                                  const getColumnOptions = (col: any) => {
                                    if (col.apiId && apiEndpointData?.objList) {
                                      const api = apiEndpointData.objList.find(
                                        (api: any) => api.id === col.apiId
                                      );
                                      if (api && previewDataMutation.data) {
                                        return previewDataMutation.data
                                          .slice(0, 5)
                                          .map((item: any) => item.name);
                                      }
                                    }
                                    return col.options || [];
                                  };

                                  return (
                                    <div className="border border-[#d1d5db] rounded overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="bg-gray-50 border-b border-[#d1d5db]">
                                            {tableColumns.map((col, idx) => (
                                              <th
                                                key={col.name || idx}
                                                className="px-3 py-2 text-left font-medium text-gray-700 border-r border-[#d1d5db] last:border-r-0"
                                              >
                                                {col.label || `Cột ${idx + 1}`}
                                              </th>
                                            ))}
                                            {!hasColumns && (
                                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                                Cột
                                              </th>
                                            )}
                                            {showActionColumn && (
                                              <th className="px-3 py-2 text-right font-medium text-gray-700 w-[120px] border-l border-[#d1d5db]">
                                                Thao tác
                                              </th>
                                            )}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {tableRows.length > 0 ? (
                                            tableRows.map((rowData, rowIdx) => (
                                              <tr
                                                key={rowIdx}
                                                className="border-b border-[#d1d5db] last:border-b-0"
                                              >
                                                {tableColumns.map(
                                                  (col, colIdx) => (
                                                    <td
                                                      key={col.name}
                                                      className="px-3 py-2 border-r border-[#d1d5db] last:border-r-0"
                                                    >
                                                      {(() => {
                                                        switch (col.type) {
                                                          case "checkbox":
                                                            const checkboxElement =
                                                              (
                                                                <input
                                                                  type="checkbox"
                                                                  checked={
                                                                    rowData[
                                                                      col.name
                                                                    ] ===
                                                                      true ||
                                                                    rowData[
                                                                      col.name
                                                                    ] ===
                                                                      "true" ||
                                                                    rowData[
                                                                      col.name
                                                                    ] === "1"
                                                                  }
                                                                  className="w-4 h-4"
                                                                  onChange={(
                                                                    e
                                                                  ) => {
                                                                    const newValue =
                                                                      e.target
                                                                        .checked;
                                                                    updateTableRows(
                                                                      field.id,
                                                                      (
                                                                        rows
                                                                      ) => {
                                                                        const nextRows =
                                                                          [
                                                                            ...rows,
                                                                          ];
                                                                        nextRows[
                                                                          rowIdx
                                                                        ] = {
                                                                          ...(nextRows[
                                                                            rowIdx
                                                                          ] as Record<
                                                                            string,
                                                                            any
                                                                          >),
                                                                          [col.name]:
                                                                            newValue,
                                                                        };
                                                                        return nextRows;
                                                                      }
                                                                    );
                                                                  }}
                                                                />
                                                              );

                                                            if (
                                                              canColumnAddDeleteRows(
                                                                col
                                                              )
                                                            ) {
                                                              return (
                                                                <TableCellWithActions
                                                                  onAdd={() =>
                                                                    handleAddTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                  onDelete={() =>
                                                                    handleDeleteTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                >
                                                                  {
                                                                    checkboxElement
                                                                  }
                                                                </TableCellWithActions>
                                                              );
                                                            }

                                                            return checkboxElement;
                                                          case "select":
                                                            const options =
                                                              getColumnOptions(
                                                                col
                                                              );
                                                            const selectElement =
                                                              (
                                                                <Select
                                                                  value={
                                                                    rowData[
                                                                      col.name
                                                                    ] || ""
                                                                  }
                                                                  onValueChange={(
                                                                    value
                                                                  ) => {
                                                                    updateTableRows(
                                                                      field.id,
                                                                      (
                                                                        rows
                                                                      ) => {
                                                                        const nextRows =
                                                                          [
                                                                            ...rows,
                                                                          ];
                                                                        nextRows[
                                                                          rowIdx
                                                                        ] = {
                                                                          ...nextRows[
                                                                            rowIdx
                                                                          ],
                                                                          [col.name]:
                                                                            value,
                                                                        };
                                                                        return nextRows;
                                                                      }
                                                                    );
                                                                  }}
                                                                >
                                                                  <SelectTrigger className="h-7 text-xs">
                                                                    <SelectValue placeholder="Chọn..." />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                    {options.map(
                                                                      (
                                                                        option: string,
                                                                        optIdx: number
                                                                      ) => (
                                                                        <SelectItem
                                                                          key={
                                                                            optIdx
                                                                          }
                                                                          value={
                                                                            option
                                                                          }
                                                                        >
                                                                          {
                                                                            option
                                                                          }
                                                                        </SelectItem>
                                                                      )
                                                                    )}
                                                                  </SelectContent>
                                                                </Select>
                                                              );

                                                            if (
                                                              canColumnAddDeleteRows(
                                                                col
                                                              )
                                                            ) {
                                                              return (
                                                                <TableCellWithActions
                                                                  onAdd={() =>
                                                                    handleAddTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                  onDelete={() =>
                                                                    handleDeleteTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                >
                                                                  {
                                                                    selectElement
                                                                  }
                                                                </TableCellWithActions>
                                                              );
                                                            }

                                                            return selectElement;

                                                          case "date":
                                                            const dateElement =
                                                              (
                                                                <CustomDatePicker
                                                                  selected={
                                                                    rowData[
                                                                      col.name
                                                                    ]
                                                                      ? parseDateString(
                                                                          rowData[
                                                                            col
                                                                              .name
                                                                          ]
                                                                        )
                                                                      : null
                                                                  }
                                                                  onChange={(
                                                                    date
                                                                  ) => {
                                                                    const dateStr =
                                                                      date
                                                                        ? formatDateYMD(
                                                                            date
                                                                          )
                                                                        : "";
                                                                    updateTableRows(
                                                                      field.id,
                                                                      (
                                                                        rows
                                                                      ) => {
                                                                        const nextRows =
                                                                          [
                                                                            ...rows,
                                                                          ];
                                                                        nextRows[
                                                                          rowIdx
                                                                        ] = {
                                                                          ...nextRows[
                                                                            rowIdx
                                                                          ],
                                                                          [col.name]:
                                                                            dateStr,
                                                                        };
                                                                        return nextRows;
                                                                      }
                                                                    );
                                                                  }}
                                                                  placeholder="Chọn ngày"
                                                                  className="h-7 text-xs"
                                                                />
                                                              );

                                                            if (
                                                              canColumnAddDeleteRows(
                                                                col
                                                              )
                                                            ) {
                                                              return (
                                                                <TableCellWithActions
                                                                  onAdd={() =>
                                                                    handleAddTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                  onDelete={() =>
                                                                    handleDeleteTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                >
                                                                  {dateElement}
                                                                </TableCellWithActions>
                                                              );
                                                            }

                                                            return dateElement;
                                                          case "datetime":
                                                            const datetimeValue =
                                                              rowData[col.name]
                                                                ? parseDateTimeString(
                                                                    rowData[
                                                                      col.name
                                                                    ]
                                                                  )
                                                                : null;
                                                            const datetimeElement =
                                                              (
                                                                <div className="flex gap-1">
                                                                  <CustomDatePicker
                                                                    selected={
                                                                      datetimeValue
                                                                    }
                                                                    onChange={(
                                                                      date
                                                                    ) => {
                                                                      if (
                                                                        !date
                                                                      ) {
                                                                        updateTableRows(
                                                                          field.id,
                                                                          (
                                                                            rows
                                                                          ) => {
                                                                            const nextRows =
                                                                              [
                                                                                ...rows,
                                                                              ];
                                                                            nextRows[
                                                                              rowIdx
                                                                            ] =
                                                                              {
                                                                                ...nextRows[
                                                                                  rowIdx
                                                                                ],
                                                                                [col.name]:
                                                                                  "",
                                                                              };
                                                                            return nextRows;
                                                                          }
                                                                        );
                                                                        return;
                                                                      }
                                                                      const current =
                                                                        parseDateTimeString(
                                                                          rowData[
                                                                            col
                                                                              .name
                                                                          ]
                                                                        ) ||
                                                                        new Date();
                                                                      const merged =
                                                                        new Date(
                                                                          date.getFullYear(),
                                                                          date.getMonth(),
                                                                          date.getDate(),
                                                                          current.getHours(),
                                                                          current.getMinutes()
                                                                        );
                                                                      const datetimeStr =
                                                                        formatDateTimeLocal(
                                                                          merged
                                                                        );
                                                                      updateTableRows(
                                                                        field.id,
                                                                        (
                                                                          rows
                                                                        ) => {
                                                                          const nextRows =
                                                                            [
                                                                              ...rows,
                                                                            ];
                                                                          nextRows[
                                                                            rowIdx
                                                                          ] = {
                                                                            ...nextRows[
                                                                              rowIdx
                                                                            ],
                                                                            [col.name]:
                                                                              datetimeStr ||
                                                                              "",
                                                                          };
                                                                          return nextRows;
                                                                        }
                                                                      );
                                                                    }}
                                                                    placeholder="Ngày"
                                                                    className="h-7 text-xs flex-1"
                                                                  />
                                                                  <CustomTimePicker
                                                                    selected={
                                                                      datetimeValue
                                                                    }
                                                                    onChange={(
                                                                      time
                                                                    ) => {
                                                                      if (
                                                                        !time
                                                                      ) {
                                                                        updateTableRows(
                                                                          field.id,
                                                                          (
                                                                            rows
                                                                          ) => {
                                                                            const nextRows =
                                                                              [
                                                                                ...rows,
                                                                              ];
                                                                            nextRows[
                                                                              rowIdx
                                                                            ] =
                                                                              {
                                                                                ...nextRows[
                                                                                  rowIdx
                                                                                ],
                                                                                [col.name]:
                                                                                  "",
                                                                              };
                                                                            return nextRows;
                                                                          }
                                                                        );
                                                                        return;
                                                                      }
                                                                      const current =
                                                                        parseDateTimeString(
                                                                          rowData[
                                                                            col
                                                                              .name
                                                                          ]
                                                                        ) ||
                                                                        new Date();
                                                                      const merged =
                                                                        new Date(
                                                                          current.getFullYear(),
                                                                          current.getMonth(),
                                                                          current.getDate(),
                                                                          time.getHours(),
                                                                          time.getMinutes()
                                                                        );
                                                                      const datetimeStr =
                                                                        formatDateTimeLocal(
                                                                          merged
                                                                        );
                                                                      updateTableRows(
                                                                        field.id,
                                                                        (
                                                                          rows
                                                                        ) => {
                                                                          const nextRows =
                                                                            [
                                                                              ...rows,
                                                                            ];
                                                                          nextRows[
                                                                            rowIdx
                                                                          ] = {
                                                                            ...nextRows[
                                                                              rowIdx
                                                                            ],
                                                                            [col.name]:
                                                                              datetimeStr ||
                                                                              "",
                                                                          };
                                                                          return nextRows;
                                                                        }
                                                                      );
                                                                    }}
                                                                    className="h-7 text-xs flex-1"
                                                                    placeholder="Giờ"
                                                                  />
                                                                </div>
                                                              );

                                                            if (
                                                              canColumnAddDeleteRows(
                                                                col
                                                              )
                                                            ) {
                                                              return (
                                                                <TableCellWithActions
                                                                  onAdd={() =>
                                                                    handleAddTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                  onDelete={() =>
                                                                    handleDeleteTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                >
                                                                  {
                                                                    datetimeElement
                                                                  }
                                                                </TableCellWithActions>
                                                              );
                                                            }

                                                            return datetimeElement;
                                                          case "text":
                                                          default:
                                                            const textElement =
                                                              (
                                                                <Input
                                                                  value={
                                                                    rowData[
                                                                      col.name
                                                                    ] || ""
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) => {
                                                                    updateTableRows(
                                                                      field.id,
                                                                      (
                                                                        rows
                                                                      ) => {
                                                                        const nextRows =
                                                                          [
                                                                            ...rows,
                                                                          ];
                                                                        nextRows[
                                                                          rowIdx
                                                                        ] = {
                                                                          ...nextRows[
                                                                            rowIdx
                                                                          ],
                                                                          [col.name]:
                                                                            e
                                                                              .target
                                                                              .value,
                                                                        };
                                                                        return nextRows;
                                                                      }
                                                                    );
                                                                  }}
                                                                  placeholder="Nhập..."
                                                                  className="h-7 text-xs"
                                                                />
                                                              );

                                                            if (
                                                              canColumnAddDeleteRows(
                                                                col
                                                              )
                                                            ) {
                                                              return (
                                                                <TableCellWithActions
                                                                  onAdd={() =>
                                                                    handleAddTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                  onDelete={() =>
                                                                    handleDeleteTableRow(
                                                                      field,
                                                                      rowIdx
                                                                    )
                                                                  }
                                                                >
                                                                  {textElement}
                                                                </TableCellWithActions>
                                                              );
                                                            }

                                                            return textElement;
                                                        }
                                                      })()}
                                                    </td>
                                                  )
                                                )}
                                                {!hasColumns && (
                                                  <td className="px-3 py-2 text-gray-500">
                                                    {JSON.stringify(rowData)}
                                                  </td>
                                                )}
                                                {showActionColumn && (
                                                  <td className="px-3 py-2 border-l border-[#d1d5db]">
                                                    <div className="flex justify-end gap-1.5">
                                                      {(canModifyTable ||
                                                        field.tableColumns?.some(
                                                          (col) =>
                                                            canColumnAddDeleteRows(
                                                              col
                                                            )
                                                        )) && (
                                                        <button
                                                          type="button"
                                                          className={
                                                            actionButtonClass
                                                          }
                                                          disabled={
                                                            !canModifyTable &&
                                                            !field.tableColumns?.some(
                                                              (col) =>
                                                                canColumnAddDeleteRows(
                                                                  col
                                                                )
                                                            )
                                                          }
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                              !canModifyTable &&
                                                              !field.tableColumns?.some(
                                                                (col) =>
                                                                  canColumnAddDeleteRows(
                                                                    col
                                                                  )
                                                              )
                                                            )
                                                              return;
                                                            handleAddTableRow(
                                                              field,
                                                              rowIdx
                                                            );
                                                          }}
                                                          title="Thêm hàng sau"
                                                        >
                                                          <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                      {(canModifyTable ||
                                                        field.tableColumns?.some(
                                                          (col) =>
                                                            canColumnAddDeleteRows(
                                                              col
                                                            )
                                                        )) && (
                                                        <button
                                                          type="button"
                                                          className={
                                                            actionButtonClass
                                                          }
                                                          disabled={
                                                            !canModifyTable
                                                          }
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!canModifyTable)
                                                              return;
                                                            handleEditTableRow(
                                                              field,
                                                              rowIdx
                                                            );
                                                          }}
                                                          title="Chỉnh sửa hàng"
                                                        >
                                                          <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                      {(canModifyTable ||
                                                        field.tableColumns?.some(
                                                          (col) =>
                                                            canColumnAddDeleteRows(
                                                              col
                                                            )
                                                        )) && (
                                                        <button
                                                          type="button"
                                                          className={
                                                            actionButtonClass
                                                          }
                                                          disabled={
                                                            !canModifyTable &&
                                                            !field.tableColumns?.some(
                                                              (col) =>
                                                                canColumnAddDeleteRows(
                                                                  col
                                                                )
                                                            )
                                                          }
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                              !canModifyTable &&
                                                              !field.tableColumns?.some(
                                                                (col) =>
                                                                  canColumnAddDeleteRows(
                                                                    col
                                                                  )
                                                              )
                                                            )
                                                              return;
                                                            handleDeleteTableRow(
                                                              field,
                                                              rowIdx
                                                            );
                                                          }}
                                                          title="Xóa hàng"
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                    </div>
                                                  </td>
                                                )}
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td
                                                colSpan={
                                                  hasColumns
                                                    ? tableColumns.length
                                                    : 1
                                                }
                                                className="px-3 py-4 text-center text-gray-400"
                                              >
                                                Chưa có hàng nào
                                              </td>
                                              {showActionColumn && (
                                                <td className="px-3 py-2 border-l border-[#d1d5db]">
                                                  <div className="flex justify-end">
                                                    {/* Show add button if any column allows it */}
                                                    {(canModifyTable ||
                                                      field.tableColumns?.some(
                                                        (col) =>
                                                          canColumnAddDeleteRows(
                                                            col
                                                          )
                                                      )) && (
                                                      <button
                                                        type="button"
                                                        className={
                                                          actionButtonClass
                                                        }
                                                        disabled={
                                                          !canModifyTable &&
                                                          !field.tableColumns?.some(
                                                            (col) =>
                                                              canColumnAddDeleteRows(
                                                                col
                                                              )
                                                          )
                                                        }
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          if (
                                                            !canModifyTable &&
                                                            !field.tableColumns?.some(
                                                              (col) =>
                                                                canColumnAddDeleteRows(
                                                                  col
                                                                )
                                                            )
                                                          )
                                                            return;
                                                          handleAddTableRow(
                                                            field
                                                          );
                                                        }}
                                                        title="Thêm hàng mới"
                                                      >
                                                        <Plus className="w-3.5 h-3.5" />
                                                      </button>
                                                    )}
                                                  </div>
                                                </td>
                                              )}
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                })()
                              ) : (
                                <FieldPreview
                                  field={field}
                                  viewMode={viewMode}
                                />
                              )}
                            </div>
                          </div>

                          {/* Resize handles - chỉ hiển thị 2 góc phải khi field được chọn */}
                          {viewMode === "editor" &&
                            selectedFieldId === field.id && (
                              <>
                                <div
                                  className="absolute top-0 right-[-6px] bottom-0 w-4 cursor-col-resize z-40 group/resize"
                                  onMouseDown={(e) =>
                                    startResize(e, row, fieldIndex)
                                  }
                                >
                                  {/* visual indicator */}
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-1 rounded-full bg-blue-500 opacity-60 group-hover/resize:opacity-100 transition-opacity" />
                                </div>
                              </>
                            )}

                          {viewMode === "editor" && !resizingState && (
                            <div
                              className="absolute inset-y-0 left-0 right-2 cursor-move z-[5]"
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", field.id);

                                // Create a cleaner drag image
                                const canvas = document.createElement("canvas");
                                canvas.width = 1;
                                canvas.height = 1;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  ctx.clearRect(0, 0, 1, 1);
                                }
                                e.dataTransfer.setDragImage(canvas, 0, 0);

                                setDraggedField({
                                  fieldId: field.id,
                                  rowId: row.id,
                                });
                              }}
                              onDragEnd={(e) => {
                                // Clear timeout
                                if (dragOverTimeoutRef.current) {
                                  clearTimeout(dragOverTimeoutRef.current);
                                  dragOverTimeoutRef.current = null;
                                }

                                setDraggedField(null);
                                setDragOverRowId(null);
                                setDragOverPosition(null);
                                setDragOverFieldIndex(null);
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                    {viewMode === "editor" && dragOverRowId === row.id && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {dragOverPosition === "between" && (
                          <div
                            className="absolute -top-1.5 left-0 right-0 h-1.5 bg-blue-500 shadow-lg drag-indicator"
                            style={{ borderRadius: "2px" }}
                          ></div>
                        )}
                        {dragOverPosition !== "between" &&
                          dragOverFieldIndex !== null && (
                            <div
                              className="absolute top-0 bottom-0 w-1.5 bg-blue-500 shadow-lg drag-indicator"
                              style={{
                                borderRadius: "2px",
                                left: (() => {
                                  let leftOffset = 0;
                                  for (let i = 0; i < dragOverFieldIndex; i++) {
                                    leftOffset += getFieldWidthPercent(
                                      row,
                                      row.fields[i]
                                    );
                                  }
                                  if (dragOverPosition === "right") {
                                    leftOffset += getFieldWidthPercent(
                                      row,
                                      row.fields[dragOverFieldIndex]
                                    );
                                  }
                                  return `calc(${leftOffset}% - ${dragOverPosition === "right" ? "6px" : "0px"})`;
                                })(),
                              }}
                            ></div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
