"use client";

import type { FormField, FormRow } from "@/components/form-config/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDynamicFormQuery } from "@/hooks/data/form-dynamic.data";
import {
  useCreateValueDynamic,
  useGetValueDynamicDetail,
  useUpdateValueDynamic,
} from "@/hooks/data/value-dynamic.data";
import { ToastUtils } from "@/utils/toast.utils";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import DynamicForm from "./DynamicForm";

// Convert API fields to FormRow structure (demo)
const convertApiFieldsToRows = (fields: any[]): FormRow[] => {
  const rows: FormRow[] = [];

  // Group fields by orderNumber
  const fieldsByOrderNumber: { [key: number]: any[] } = {};

  fields.forEach((field) => {
    const orderNumber = field.orderNumber || 1;
    if (!fieldsByOrderNumber[orderNumber]) {
      fieldsByOrderNumber[orderNumber] = [];
    }
    fieldsByOrderNumber[orderNumber].push(field);
  });

  // Convert each group to a row
  Object.keys(fieldsByOrderNumber)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((orderNumber) => {
      const fieldsInGroup = fieldsByOrderNumber[parseInt(orderNumber)];

      const formFields: FormField[] = fieldsInGroup.map((field) => {
        const inputWidth =
          typeof field.inputWidth === "string"
            ? parseFloat(field.inputWidth)
            : field.inputWidth || 100;

        // Parse JSON strings for complex fields
        let parsedOptions = field.options;
        if (field.options && typeof field.options === "string") {
          try {
            parsedOptions = JSON.parse(field.options);
          } catch (e) {
            console.warn("Failed to parse options for field:", field.name);
            parsedOptions = [];
          }
        }

        let parsedFieldConfig = field.fieldConfig;
        if (field.fieldConfig && typeof field.fieldConfig === "string") {
          try {
            parsedFieldConfig = JSON.parse(field.fieldConfig);
          } catch (e) {
            console.warn("Failed to parse fieldConfig for field:", field.name);
            parsedFieldConfig = {};
          }
        }

        // Use field.tableColumns if available (from API/backend), otherwise normalize from parsedFieldConfig
        let tableColumns = field.tableColumns || [];
        if (!tableColumns.length && parsedFieldConfig?.tableColumns) {
          // Fallback to old logic if field.tableColumns is not available
          tableColumns = parsedFieldConfig.tableColumns.map((col: any) => {
            // If column has old structure (id, name, type), convert to new structure
            if (col.id && !col.label) {
              return {
                name: col.name || "",
                label: col.name || "",
                type: col.type || "text",
                ...col,
              };
            }
            // If column already has new structure (name, label, type), use as is
            return {
              name: col.name || "",
              label: col.label || col.name || "",
              type: col.type || "text",
              ...col,
            };
          });
        }

        return {
          id: field.id?.toString() || field.name,
          type: field.dataType as any,
          title: field.title,
          name: field.name,
          placeholder: field.placeholder,
          description: field.description,
          required: field.required,
          hidden: field.hidden,
          readonly: false,
          inputWidth: inputWidth,
          maxLength: field.maxLength,
          min: field.min,
          max: field.max,
          dateFormat: field.dateFormat,
          disableDates: field.disableDates || [],
          options: parsedOptions,
          apiId: field.apiId,
          allowMultiple: field.allowMultiple,
          acceptedTypes: field.acceptedTypes,
          linkText: field.linkText,
          linkUrl: field.linkUrl,
          linkTarget: field.linkTarget,
          fieldConfig: {
            ...parsedFieldConfig,
            tableColumns: tableColumns,
          },
          tableColumns: tableColumns,
          tableRows: field.tableRows || parsedFieldConfig?.tableRows || [],
          editable:
            field.editable !== undefined
              ? field.editable
              : parsedFieldConfig?.editable || false,
          isSearch: field.isSearch,
          showOnList: field.showOnList,
          unique: field.unique,
          css: field.css,
          orderNumber: field.orderNumber,
          formDynamicId: field.formDynamicId,
          api: field.api,
        } as FormField;
      });

      const row: FormRow = {
        id: `row-${orderNumber}`,
        fields: formFields,
      };

      rows.push(row);
    });

  return rows;
};

interface DynamicFormComponentProps {
  title?: string;
  viewOnly?: boolean;
  typeId: number | string;
  pageType?: "insert" | "update";
  onSuccess?: () => void;
  onError?: (error: any) => void;
  formId: number | string;
  id?: number | string;
  setPageLabel?: (label: string) => void;
}
export function DynamicFormComponent({
  title = "",
  viewOnly = false,
  typeId,
  formId,
  pageType,
  onSuccess,
  onError,
  id,
  setPageLabel,
}: DynamicFormComponentProps) {
  const router = useRouter();
  const { data: dynamicForm } = useGetDynamicFormQuery(
    Number(typeId),
    !!typeId
  );
  const [apiFields, setApiFields] = useState<any>([]);

  const { data: detailRequest } = useGetValueDynamicDetail(Number(id));

  const [formNode, setFormNode] = useState<any>(null);

  // Lấy danh sách forms từ dynamicForm (có thể là array, object có forms, hoặc single object)
  const forms = useMemo(() => {
    if (!dynamicForm?.data) return [];
    if (Array.isArray(dynamicForm.data)) {
      return dynamicForm.data;
    }
    if (dynamicForm.data.forms && Array.isArray(dynamicForm.data.forms)) {
      return dynamicForm.data.forms;
    }
    return [dynamicForm.data];
  }, [dynamicForm?.data]);

  // Tìm form hiện tại theo formId từ mảng forms
  const currentForm = useMemo(() => {
    if (!formId || forms.length === 0) return null;
    return forms.find((form: any) => form.id === Number(formId));
  }, [forms, formId]);

  // Hooks for create and update
  const createMutation = useCreateValueDynamic();
  const updateMutation = useUpdateValueDynamic();

  // Check if this is edit mode
  const isEditMode = !!id && !!detailRequest?.data;
  // Determine pageType from formId if not explicitly provided
  const currentPageType = pageType || (formId ? "update" : "insert");

  useEffect(() => {
    // Ưu tiên lấy fields từ detailRequest, sau đó từ currentForm, cuối cùng là fields mặc định
    const fieldsToUse =
      detailRequest?.data?.formDynamic?.fields || currentForm?.fields;
    const formName = detailRequest?.data?.name || currentForm?.name || "";
    if (setPageLabel) {
      setPageLabel(formName);
    }

    if (fieldsToUse) {
      const apiFields = convertApiFieldsToRows(fieldsToUse);
      setFormNode(detailRequest?.data?.formDynamic || currentForm);
      setApiFields(apiFields);
    }
  }, [
    detailRequest?.data?.formDynamic?.fields,
    currentForm?.fields,
    currentForm,
  ]);

  // Helper function to process column value based on type
  const processColumnValue = (colValue: any, columnType?: string) => {
    if (columnType === "checkbox") {
      // Checkbox: always return boolean
      return Boolean(colValue);
    } else {
      // Text: keep as array if it's array, otherwise convert to array
      return Array.isArray(colValue) ? colValue : [colValue || ""];
    }
  };

  // Process default values from detailRequest
  const processDefaultValues = () => {
    if (!detailRequest?.data?.data) return {};

    const values: Record<string, any> = { ...detailRequest.data.data };

    const fieldsToUse =
      detailRequest?.data?.formDynamic?.fields || currentForm?.fields;

    if (!Array.isArray(fieldsToUse)) return values;

    fieldsToUse.forEach((field: any) => {
      if (field.dataType !== "TABLE" || !values[field.name]) return;

      const tableValue = values[field.name];

      // Parse tableColumns
      let tableColumns: any[] = [];
      if (field.fieldConfig) {
        try {
          const parsed =
            typeof field.fieldConfig === "string"
              ? JSON.parse(field.fieldConfig)
              : field.fieldConfig;
          tableColumns = parsed?.tableColumns || [];
        } catch (e) {
          console.warn("Parse table fieldConfig failed", e);
        }
      }

      const normalizeRow = (row: any) => {
        const newRow: any = {};

        Object.keys(row).forEach((key) => {
          const value = row[key];

          // ✅ QUY TẮC SỐ 1: server trả array → giữ nguyên
          if (Array.isArray(value)) {
            newRow[key] = value;
            return;
          }

          // checkbox
          if (value === true || value === false) {
            newRow[key] = value;
            return;
          }

          // fallback: scalar → convert thành array
          newRow[key] = value !== undefined && value !== null ? [value] : [];
        });

        return newRow;
      };

      if (Array.isArray(tableValue)) {
        values[field.name] = {
          rows: tableValue.map(normalizeRow),
        };
      } else if (tableValue?.rows) {
        values[field.name] = {
          rows: tableValue.rows.map(normalizeRow),
        };
      }
    });

    return values;
  };

  const defaultValues = React.useMemo(() => {
    const values = processDefaultValues();
    return values;
  }, [
    detailRequest?.data?.data,
    detailRequest?.data?.attachment,
    detailRequest?.data?.formDynamic?.fields,
    currentForm?.fields,
  ]);

  const handleSubmit = async (values: Record<string, any>) => {
    console.log("Dynamic form submit:", values);

    try {
      // Get formId from formNode (có thể từ detailRequest hoặc currentForm)
      const dynamicFormId = formNode?.id || currentForm?.id;

      if (!dynamicFormId) {
        ToastUtils.error("Không tìm thấy ID của form");
        return;
      }

      if (isEditMode) {
        // UPDATE: Send JSON object with all fields, keep file data from detail
        const dataObject: Record<string, any> = {};

        // Get original data from detail to preserve file fields
        const originalData = detailRequest?.data?.data || {};

        Object.entries(values).forEach(([key, value]) => {
          // Skip File objects and FileList (newly uploaded files in update mode)
          if (value instanceof File || value instanceof FileList) {
            return;
          }
          // Skip object with File instance
          if (typeof value === "object" && value instanceof File) {
            return;
          }
          // Handle table fields - convert to [{columnName: [value]}]
          else if (
            typeof value === "object" &&
            value !== null &&
            value.rows &&
            Array.isArray(value.rows)
          ) {
            // Find field definition to get column names
            const field = formNode?.fields?.find((f: any) => f.name === key);
            if (field && field.dataType === "TABLE") {
              // Get tableColumns from fieldConfig
              let tableColumns: any[] = [];
              if (field.fieldConfig) {
                try {
                  const parsedConfig =
                    typeof field.fieldConfig === "string"
                      ? JSON.parse(field.fieldConfig)
                      : field.fieldConfig;
                  tableColumns = parsedConfig?.tableColumns || [];
                } catch (e) {
                  console.warn("Failed to parse table fieldConfig:", e);
                }
              }

              // Convert {rows: [{colName/index: value}]} to [{colName: value}]
              const convertedRows = value.rows.map((row: any) => {
                const newRow: any = {};

                Object.entries(row).forEach(([key, colValue]) => {
                  // Check if key is numeric index
                  const isNumericKey = !isNaN(Number(key));

                  if (isNumericKey && tableColumns.length > 0) {
                    // Map index to column name
                    const colIndex = Number(key);
                    const column = tableColumns[colIndex];
                    if (column && column.name) {
                      newRow[column.name] = processColumnValue(
                        colValue,
                        column.type
                      );
                    }
                  } else {
                    // Already using column name - find column type
                    const column = tableColumns.find(
                      (col: any) => col.name === key
                    );
                    newRow[key] = processColumnValue(colValue, column?.type);
                  }
                });

                return newRow;
              });
              dataObject[key] = convertedRows;
            } else {
              dataObject[key] = value;
            }
          }
          // Handle arrays (checkbox, multi-select)
          else if (Array.isArray(value)) {
            dataObject[key] = value;
          }
          // Handle objects (existing files from server) - keep them
          else if (typeof value === "object" && value !== null && value.name) {
            // This is a file object from server, preserve the file field from original data
            dataObject[key] = originalData[key] || value.name;
          }
          // Handle null/undefined - send them
          else if (value === null || value === undefined) {
            dataObject[key] = value;
          }
          // Handle primitive values
          else {
            dataObject[key] = value || null;
          }
        });

        // Also include file fields from original data that might not be in values
        Object.entries(originalData).forEach(([key, value]) => {
          if (!(key in dataObject) && Array.isArray(value)) {
            // Check if this is a file field by looking at form fields
            const field = formNode?.fields?.find((f: any) => f.name === key);
            if (field && field.dataType === "FILE") {
              dataObject[key] = value;
            }
          }
        });

        await updateMutation.mutateAsync({
          id: Number(id),
          formId: Number(detailRequest?.data?.formDynamic?.id),
          data: dataObject,
        });
        ToastUtils.success("Cập nhật thành công");

        // Call success callback
        onSuccess?.();

        // Navigate back to register page with formId param
        router.push(`/request/${typeId}/register?formId=${dynamicFormId}`);
      } else {
        // CREATE: Send FormData with files
        const formData = new FormData();
        const dataObject: Record<string, any> = {};
        const filesList: File[] = [];

        // Get all field names from form definition to ensure all fields are sent
        const allFieldNames = new Set<string>();
        formNode?.fields?.forEach((field: any) => {
          if (field.name) {
            allFieldNames.add(field.name);
          }
        });

        // Process values
        Object.entries(values).forEach(([key, value]) => {
          // Handle File objects
          if (value instanceof File) {
            filesList.push(value);
            dataObject[key] = [value.name];
          }
          // Handle FileList
          else if (value instanceof FileList) {
            const fileNames: string[] = [];
            Array.from(value).forEach((file) => {
              filesList.push(file);
              fileNames.push(file.name);
            });
            dataObject[key] = fileNames;
          }
          // Handle table fields - convert to [{columnName: [value]}]
          else if (
            typeof value === "object" &&
            value !== null &&
            value.rows &&
            Array.isArray(value.rows)
          ) {
            // Find field definition to get column names
            const field = formNode?.fields?.find((f: any) => f.name === key);
            if (field && field.dataType === "TABLE") {
              // Get tableColumns from fieldConfig
              let tableColumns: any[] = [];
              if (field.fieldConfig) {
                try {
                  const parsedConfig =
                    typeof field.fieldConfig === "string"
                      ? JSON.parse(field.fieldConfig)
                      : field.fieldConfig;
                  tableColumns = parsedConfig?.tableColumns || [];
                } catch (e) {
                  console.warn("Failed to parse table fieldConfig:", e);
                }
              }

              // Convert {rows: [{colName/index: value}]} to [{colName: value}]
              const convertedRows = value.rows.map((row: any) => {
                const newRow: any = {};

                Object.entries(row).forEach(([rowKey, colValue]) => {
                  // Check if key is numeric index
                  const isNumericKey = !isNaN(Number(rowKey));

                  if (isNumericKey && tableColumns.length > 0) {
                    // Map index to column name
                    const colIndex = Number(rowKey);
                    const column = tableColumns[colIndex];
                    if (column && column.name) {
                      newRow[column.name] = processColumnValue(
                        colValue,
                        column.type
                      );
                    }
                  } else {
                    // Already using column name - find column type
                    const column = tableColumns.find(
                      (col: any) => col.name === rowKey
                    );
                    newRow[rowKey] = processColumnValue(colValue, column?.type);
                  }
                });

                return newRow;
              });
              dataObject[key] = convertedRows;
            } else {
              dataObject[key] = value;
            }
          }
          // Handle arrays (checkbox, multi-select)
          else if (Array.isArray(value)) {
            dataObject[key] = value;
          }
          // Handle primitive values
          else {
            dataObject[key] = value || null;
          }
        });
        // Append all files to FormData - use "files" as key (same as DynamicFormField)
        filesList.forEach((file) => {
          formData.append("files", file);
        });
        // Append data object as JSON string
        formData.append("object", JSON.stringify(dataObject));

        await createMutation.mutateAsync({
          formId: Number(dynamicFormId),
          formData,
        });

        ToastUtils.success("Tạo mới thành công");

        // Call success callback
        onSuccess?.();

        // Navigate back to register page with formId param
        router.push(`/request/${typeId}/register?formId=${dynamicFormId}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      ToastUtils.error(
        isEditMode ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi tạo mới"
      );

      // Call error callback
      onError?.(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {detailRequest?.data?.name ||
            formNode?.name ||
            currentForm?.name ||
            title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DynamicForm
          rows={apiFields}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          viewOnly={viewOnly}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          submitButtonText={isEditMode ? "Cập nhật" : "Tạo mới"}
          pageType={currentPageType}
        />
      </CardContent>
    </Card>
  );
}
