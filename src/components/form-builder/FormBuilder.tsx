"use client";

import React, { useState, useEffect } from "react";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormElementsSidebar } from "./FormElementsSidebar";
import { FormElementItem } from "./FormElementItem";
import {
  FormElement,
  FormElementType,
  FormElementOption,
  createFormElement,
} from "./form-builder.types";
import { FormField } from "@/definitions/types/form.type";
import { FieldService } from "@/services/field.service";
import { ToastUtils } from "@/utils/toast.utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Save, Trash2 } from "lucide-react";

interface FormBuilderProps {
  catSelectedIndex: number;
  updateFieldID: number;
  UpdateField: boolean;
  onEditField: (id: number) => void;
  onRefreshFieldList?: () => void;
}

const GridLayout = WidthProvider(Responsive) as any;

const convertFormFieldToFormElement = (field: FormField): FormElement => {
  let fieldType = field.type || "text";

  // Map old field types to new FormElement types
  if (fieldType === "autocomplete") {
    fieldType = "select";
  } else if (
    ![
      "text",
      "textarea",
      "number",
      "select",
      "checkbox",
      "radio",
      "date",
      "datetime-local",
    ].includes(fieldType)
  ) {
    fieldType = "text"; // Default to text if unknown type
  }

  const type = fieldType as FormElementType;

  const element: FormElement = {
    id: field.id?.toString() || `field-${Date.now()}`,
    type,
    label: field.label || "",
    placeholder: field.placeholder,
    required: field.required || false,
    defaultValue: field.value,
    x: field.x ?? 0,
    y: field.y ?? 0,
    w: field.w ?? 6,
    h: field.h ?? 2,
    name: field.name,
  };

  if (field.min !== undefined || field.max !== undefined) {
    element.validation = {
      min: field.min,
      max: field.max,
    };
  }

  if (field.fieldOption && field.fieldOption.length > 0) {
    element.options = field.fieldOption.map((opt) => ({
      label: opt.label || opt.value || "",
      value: opt.value || opt.label || "",
    }));
  }

  return element;
};

const convertFormElementToFormField = (
  element: FormElement,
  catId: number,
  index: number = 0
): FormField => {
  const type = element.type;

  // Map FormElement types back to FormField types if needed
  // Keep original types for compatibility

  // Use name from element if user has set it, otherwise generate like FormBuilder old
  let name: string;
  if (element.name && element.name.trim()) {
    // Use user-provided name, ensure max 20 characters
    name = element.name.trim().slice(0, 20);
  } else {
    // Generate name like FormBuilder old: `${type.slice(0, 3)}${Date.now()}`
    // Then ensure max 20 characters
    const typePrefix = (type || "text").slice(0, 3);
    const timestamp = Date.now().toString();
    name = `${typePrefix}${timestamp}`;

    // Ensure name doesn't exceed 20 characters
    if (name.length > 20) {
      // Keep first 3 chars (type) and take remaining from timestamp
      const maxTimestampLength = 20 - typePrefix.length;
      name = `${typePrefix}${timestamp.slice(-maxTimestampLength)}`;
    }
  }

  const field: FormField = {
    type: type || "text",
    label: element.label || "",
    required: element.required || false,
    catId,
    x: element.x ?? 0,
    y: element.y ?? 0,
    w: element.w ?? 6,
    h: element.h ?? 2,
    name,
  };

  // Preserve id if it exists (for update/delete operations)
  if (element.id && !element.id.startsWith("element-")) {
    field.id = element.id;
  }

  // Add optional fields
  if (element.placeholder) {
    field.placeholder = element.placeholder;
  }

  if (element.defaultValue !== undefined) {
    field.value = element.defaultValue;
  }

  if (element.type === "number") {
    if (element.validation?.min !== undefined) {
      field.min = element.validation.min;
    }
    if (element.validation?.max !== undefined) {
      field.max = element.validation.max;
    }
  }

  // Set fieldOption for select, radio, checkbox
  if (
    element.type === "select" ||
    element.type === "radio" ||
    element.type === "checkbox"
  ) {
    if (element.options && element.options.length > 0) {
      field.fieldOption = element.options.map((opt) => ({
        label: opt.label || "",
        value: opt.value || "",
      }));
    } else {
      field.fieldOption = [];
    }
  } else {
    // For other field types, set empty array
    field.fieldOption = [];
  }

  return field;
};

export default function FormBuilder({
  catSelectedIndex,
  updateFieldID,
  UpdateField,
  onEditField,
  onRefreshFieldList,
}: FormBuilderProps) {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );
  const [draggedElementType, setDraggedElementType] =
    useState<FormElementType | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "update" | "delete" | null;
    element: FormElement | null;
  }>({
    open: false,
    action: null,
    element: null,
  });

  // Convert elements to grid layout format
  const layout: Layout[] = elements.map((el) => ({
    i: el.id,
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
    minW: 1,
    minH: 1,
    maxW: 12,
  }));

  const handleLayoutChange = (newLayout: Layout[]) => {
    setElements((prev) =>
      prev.map((el) => {
        const layoutItem = newLayout.find((l) => l.i === el.id);
        if (layoutItem) {
          return {
            ...el,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          };
        }
        return el;
      })
    );
  };

  const handleDragStart = (type: FormElementType) => {
    setDraggedElementType(type);
  };

  const handleUpdateElement = (id: string, updates: Partial<FormElement>) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          const updated = { ...el, ...updates };
          // Update layout if width or height changed
          if (updates.w || updates.h) {
            // Layout will be updated automatically by react-grid-layout
          }
          return updated;
        }
        return el;
      })
    );
    if (selectedElement?.id === id) {
      setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const handleUpdateField = (element: FormElement) => {
    setConfirmDialog({
      open: true,
      action: "update",
      element,
    });
  };

  const handleDeleteField = (element: FormElement) => {
    setConfirmDialog({
      open: true,
      action: "delete",
      element,
    });
  };

  const confirmUpdate = async () => {
    if (!confirmDialog.element) return;

    try {
      // Use the latest selectedElement data if it matches the dialog element
      const elementToUpdate =
        selectedElement?.id === confirmDialog.element.id
          ? selectedElement
          : confirmDialog.element;

      // Convert FormElement back to FormField for update
      const field = convertFormElementToFormField(
        elementToUpdate,
        updateFieldID
      );

      // Ensure we have the original field id for update
      if (
        !field.id &&
        elementToUpdate.id &&
        !elementToUpdate.id.startsWith("element-")
      ) {
        field.id = elementToUpdate.id;
      }

      const fieldToUpdate = { ...field };
      if (fieldToUpdate.fieldOption == null) {
        fieldToUpdate.fieldOption = [];
      }

      const objEdit = {
        objects: [fieldToUpdate],
      };

      const data = await FieldService.updateField(JSON.stringify(objEdit));

      if (data) {
        ToastUtils.success("Cập nhật trường thành công!");
        // Update local state without reloading to preserve unsaved elements
        setElements((prev) =>
          prev.map((el) =>
            el.id === elementToUpdate.id ? elementToUpdate : el
          )
        );
        if (selectedElement?.id === elementToUpdate.id) {
          setSelectedElement(elementToUpdate);
        }
        // Don't reload fields to preserve unsaved elements
        if (onRefreshFieldList) {
          onRefreshFieldList();
        }
      }
    } catch (err) {
      console.error(err);
      ToastUtils.error("Cập nhật trường không thành công!");
    } finally {
      setConfirmDialog({ open: false, action: null, element: null });
    }
  };

  const confirmDelete = async () => {
    if (!confirmDialog.element) return;

    try {
      const element = confirmDialog.element;
      // Convert FormElement to FormField for delete
      const field = convertFormElementToFormField(element, updateFieldID);

      // Ensure we have the original field id for delete
      if (!field.id && element.id && !element.id.startsWith("element-")) {
        field.id = element.id;
      }

      const objDelete = {
        objects: [field],
      };

      const data = await FieldService.delField(JSON.stringify(objDelete));

      if (data) {
        ToastUtils.success("Xóa trường thành công!");
        // Remove from local state without reloading
        handleDeleteElement(element.id);
        // Don't reload fields to preserve unsaved elements
        if (onRefreshFieldList) {
          onRefreshFieldList();
        }
      }
    } catch (err) {
      console.error(err);
      ToastUtils.error("Xóa trường không thành công!");
    } finally {
      setConfirmDialog({ open: false, action: null, element: null });
    }
  };

  const loadFields = async () => {
    try {
      const fields = await FieldService.getFields(updateFieldID);
      if (fields && Array.isArray(fields)) {
        const convertedElements = fields.map((field: FormField) =>
          convertFormFieldToFormElement(field)
        );
        setElements(convertedElements);
      }
    } catch (err) {
      console.error("Error loading fields", err);
    }
  };

  useEffect(() => {
    if (UpdateField && updateFieldID > 0) {
      loadFields();
    } else {
      setElements([]);
      setSelectedElement(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [UpdateField, updateFieldID]);

  const handleClearAll = () => {
    setElements([]);
    setSelectedElement(null);
  };

  const handleSave = async () => {
    try {
      if (elements.length === 0) {
        ToastUtils.error("Vui lòng thêm ít nhất một trường!");
        return;
      }

      const fieldsToAdd = elements.map((element, index) => {
        const field = convertFormElementToFormField(
          element,
          updateFieldID,
          index
        );
        // Remove toggle if exists, ensure all required fields are present
        const { toggle, ...rest } = field;

        // Ensure all required fields are present
        // Name should already be set from convertFormElementToFormField
        // But ensure it doesn't exceed 20 characters
        const name = (rest.name || "").slice(0, 20);

        return {
          type: rest.type || "text",
          label: rest.label || "",
          required: rest.required || false,
          catId: rest.catId,
          x: rest.x ?? 0,
          y: rest.y ?? 0,
          w: rest.w ?? 6,
          h: rest.h ?? 2,
          fieldOption: rest.fieldOption || [],
          name,
          ...(rest.placeholder && { placeholder: rest.placeholder }),
          ...(rest.value !== undefined && { value: rest.value }),
          ...(rest.min !== undefined && { min: rest.min }),
          ...(rest.max !== undefined && { max: rest.max }),
        };
      });

      await FieldService.addFields({ objects: fieldsToAdd });
      ToastUtils.success("Thêm mới trường thành công!");

      // Reload fields to get the latest data after adding new fields
      await loadFields();
      setSelectedElement(null);

      if (onRefreshFieldList) {
        onRefreshFieldList();
      }
    } catch (err) {
      console.error(err);
      ToastUtils.error("Thêm mới trường không thành công!");
    }
  };

  if (!UpdateField) return null;

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Cấu hình trường động</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa tất cả
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[600px] overflow-hidden">
        {/* Sidebar - Form Elements */}
        <FormElementsSidebar onDragStart={handleDragStart} />

        <Separator orientation="vertical" />

        {/* Canvas - Form Builder Area */}
        <div className="flex-1 overflow-auto">
          <div className="h-full p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Nội dung</h2>
              <p className="text-sm text-gray-500">
                Thêm trường động cho văn bản
              </p>
            </div>

            <div
              className="form-canvas min-h-[400px] relative"
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();

                const elementType = e.dataTransfer.getData(
                  "elementType"
                ) as FormElementType;

                if (elementType && elementType.trim() !== "") {
                  // Get drop coordinates relative to the canvas
                  const canvasRect = e.currentTarget.getBoundingClientRect();
                  const dropX = e.clientX - canvasRect.left;
                  const dropY = e.clientY - canvasRect.top;

                  const cols = 12;
                  const rowHeight = 50;
                  const margin = 8;
                  const gridWidth = 1200;

                  // Calculate grid position (x, y) based on actual drop position
                  const colWidth = (gridWidth - margin * 2) / cols;
                  const gridX = Math.floor((dropX - margin) / colWidth);
                  const gridY = Math.floor(
                    (dropY - margin) / (rowHeight + margin)
                  );

                  // Default size
                  const defaultW = 6;
                  const defaultH = 2;

                  // Clamp grid position to valid range
                  let finalX = Math.max(0, Math.min(gridX, cols - defaultW));
                  let finalY = Math.max(0, gridY);

                  // Check if position is available (not overlapping with existing elements)
                  const isPositionAvailable = (
                    x: number,
                    y: number,
                    w: number,
                    h: number
                  ) => {
                    return !elements.some((el) => {
                      // Check if new element overlaps with existing element
                      return !(
                        x + w <= el.x ||
                        x >= el.x + el.w ||
                        y + h <= el.y ||
                        y >= el.y + el.h
                      );
                    });
                  };

                  // Try to find available position starting from drop position
                  let foundPosition = false;

                  // First, try the exact drop position
                  if (isPositionAvailable(finalX, finalY, defaultW, defaultH)) {
                    foundPosition = true;
                  } else {
                    // Try positions to the right in the same row
                    for (
                      let offsetX = 1;
                      offsetX <= cols - defaultW - finalX;
                      offsetX++
                    ) {
                      const testX = finalX + offsetX;
                      if (
                        testX + defaultW <= cols &&
                        isPositionAvailable(testX, finalY, defaultW, defaultH)
                      ) {
                        finalX = testX;
                        foundPosition = true;
                        break;
                      }
                    }

                    // If not found, try positions to the left
                    if (!foundPosition) {
                      for (let offsetX = 1; offsetX <= finalX; offsetX++) {
                        const testX = finalX - offsetX;
                        if (
                          testX >= 0 &&
                          isPositionAvailable(testX, finalY, defaultW, defaultH)
                        ) {
                          finalX = testX;
                          foundPosition = true;
                          break;
                        }
                      }
                    }

                    // If still not found in same row, try next row
                    if (!foundPosition) {
                      finalY += 1;
                      // Try positions around the drop X position in new row
                      for (
                        let offsetX = 0;
                        offsetX <= cols - defaultW;
                        offsetX++
                      ) {
                        const testX = Math.max(
                          0,
                          Math.min(gridX + offsetX, cols - defaultW)
                        );
                        if (
                          isPositionAvailable(testX, finalY, defaultW, defaultH)
                        ) {
                          finalX = testX;
                          foundPosition = true;
                          break;
                        }
                      }
                    }
                  }

                  // If still not found, place at the bottom
                  if (!foundPosition) {
                    const maxY =
                      elements.length > 0
                        ? Math.max(...elements.map((el) => el.y + el.h))
                        : 0;
                    finalY = maxY;
                    finalX = 0;
                  }

                  // Create new element at calculated position
                  const newElement = createFormElement(
                    elementType,
                    finalX,
                    finalY,
                    defaultW,
                    defaultH
                  );

                  setElements((prev) => [...prev, newElement]);
                  setSelectedElement(newElement);
                  setDraggedElementType(null);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {elements.length === 0 ? (
                <Card className="border-dashed h-full">
                  <CardContent className="flex min-h-[400px] items-center justify-center p-8">
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-500">
                        Form của bạn trống
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        Kéo các elements từ sidebar bên trái vào đây để bắt đầu
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <GridLayout
                  className="layout"
                  layout={layout}
                  cols={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }}
                  rowHeight={100}
                  width={1200}
                  isDraggable={true}
                  isResizable={true}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle"
                  compactType={null}
                  preventCollision={true}
                  margin={[8, 8]}
                  allowOverlap={false}
                >
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className={`relative bg-white rounded border ${
                        selectedElement?.id === element.id
                          ? "ring-2 ring-blue-500 border-blue-300"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={(e) => {
                        // Don't select if clicking on drag handle
                        if (
                          !(e.target as HTMLElement).closest(".drag-handle")
                        ) {
                          setSelectedElement(element);
                        }
                      }}
                    >
                      <FormElementItem
                        element={element}
                        onUpdate={(updates) =>
                          handleUpdateElement(element.id, updates)
                        }
                        isSelected={selectedElement?.id === element.id}
                      />
                    </div>
                  ))}
                </GridLayout>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <>
            <Separator orientation="vertical" />
            <div className="w-80 border-l bg-white p-4 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormElementItem
                    element={selectedElement}
                    onUpdate={(updates: Partial<FormElement>) =>
                      handleUpdateElement(selectedElement.id, updates)
                    }
                    onDelete={() => handleDeleteElement(selectedElement.id)}
                    onUpdateField={handleUpdateField}
                    onDeleteField={handleDeleteField}
                    isPropertiesPanel={true}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, action: null, element: null });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "update"
                ? "Xác nhận cập nhật"
                : "Xác nhận xóa"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "update"
                ? "Bạn có chắc chắn muốn cập nhật trường này không?"
                : "Bạn có chắc chắn muốn xóa trường này không? Hành động này không thể hoàn tác."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.action === "update") {
                  confirmUpdate();
                } else if (confirmDialog.action === "delete") {
                  confirmDelete();
                }
              }}
            >
              {confirmDialog.action === "update" ? "Cập nhật" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
