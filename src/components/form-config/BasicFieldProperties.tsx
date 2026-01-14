"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FORM_FIELD_BASIC_CONFIG,
  type BasicPropertyKey,
} from "@/definitions/constants/formConfig.constant";
import type { FormField } from "./types";
import { useState, useEffect } from "react";

interface BasicFieldPropertiesProps {
  field: FormField;
  onChange: (fieldId: string, updates: Partial<FormField>) => void;
  formIsUse?: boolean;
  onValidationError?: (hasError: boolean) => void;
  onValidateFields?: (validateFn: () => boolean) => void;
}

export default function BasicFieldProperties({
  field,
  onChange,
  formIsUse = false,
  onValidationError,
  onValidateFields,
}: BasicFieldPropertiesProps) {
  const [fieldNameError, setFieldNameError] = useState<string>("");

  // Lấy config cho field type hiện tại
  const allowedFields = FORM_FIELD_BASIC_CONFIG[field.type] || [];

  // Helper function để check xem field có được phép hiển thị không
  const isFieldAllowed = (fieldName: BasicPropertyKey) =>
    allowedFields.includes(fieldName);

  // Validate field name
  const validateFieldName = (value: string) => {
    if (!value.trim()) {
      setFieldNameError("Tên trường là bắt buộc");
      onValidationError?.(true);
      return false;
    }

    // Validate field name format: chỉ cho phép chữ cái, số và dấu gạch dưới
    const validFieldNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!validFieldNamePattern.test(value)) {
      setFieldNameError(
        "Tên trường chỉ được chứa chữ cái, số và dấu gạch dưới (_), không được có khoảng trắng hoặc ký tự đặc biệt"
      );
      onValidationError?.(true);
      return false;
    }

    setFieldNameError("");
    onValidationError?.(false);
    return true;
  };

  // Handle field name change with validation
  const handleFieldNameChange = (value: string) => {
    onChange(field.id, {
      name: value,
    });

    // Real-time validation
    if (value.trim()) {
      const validFieldNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      if (!validFieldNamePattern.test(value)) {
        setFieldNameError(
          "Tên trường chỉ được chứa chữ cái, số và dấu gạch dưới (_)"
        );
        onValidationError?.(true);
      } else {
        setFieldNameError("");
        onValidationError?.(false);
      }
    } else {
      // Clear error when field is empty (will show error on blur)
      setFieldNameError("");
      onValidationError?.(false);
    }
  };

  // Handle field name blur to validate
  const handleFieldNameBlur = () => {
    validateFieldName(field.name || "");
  };

  // Function to validate all fields (can be called from parent)
  const validateAllFields = () => {
    let hasError = false;

    if (isFieldAllowed("fieldName")) {
      const isValid = validateFieldName(field.name || "");
      if (!isValid) hasError = true;
    }

    return !hasError;
  };

  // Expose validation function to parent
  useEffect(() => {
    if (onValidationError) {
      const isValid = !fieldNameError;
      onValidationError(!isValid);
    }
  }, [fieldNameError, onValidationError]);

  // Expose validate function to parent
  useEffect(() => {
    if (onValidateFields) {
      onValidateFields(validateAllFields);
    }
  }, [onValidateFields, validateAllFields]);

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Thông tin cơ bản
      </h4>
      <div className="space-y-3">
        {/* Required */}
        {isFieldAllowed("required") && (
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <Label
              htmlFor="fieldRequired"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Yêu cầu
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fieldRequired"
                checked={field.required}
                onCheckedChange={(v) =>
                  onChange(field.id, {
                    required: Boolean(v),
                  })
                }
              />
              <Label
                htmlFor="fieldRequired"
                className="text-xs text-gray-600 cursor-pointer"
              >
                Bắt buộc
              </Label>
            </div>
          </div>
        )}

        {/* Unique */}
        {isFieldAllowed("unique") && (
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <Label
              htmlFor="fieldUnique"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Không được trùng
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fieldUnique"
                checked={field.unique}
                disabled={formIsUse}
                onCheckedChange={(v) =>
                  onChange(field.id, {
                    unique: Boolean(v),
                  })
                }
              />
              <Label
                htmlFor="fieldUnique"
                className="text-xs text-gray-600 cursor-pointer"
              >
                Unique
              </Label>
            </div>
          </div>
        )}

        {/* Label */}
        {isFieldAllowed("label") && (
          <div className="space-y-1.5">
            <Label
              htmlFor="fieldLabel"
              className="text-sm font-medium text-gray-700"
            >
              Nhãn (Label)
            </Label>
            <Input
              id="fieldLabel"
              value={field.title}
              onChange={(e) =>
                onChange(field.id, {
                  title: e.target.value,
                })
              }
              disabled={formIsUse}
              placeholder="Nhập nhãn trường"
              maxLength={255}
              className="h-9"
            />
          </div>
        )}

        {/* Field Name */}
        {isFieldAllowed("fieldName") && (
          <div className="space-y-1.5">
            <Label
              htmlFor="fieldName"
              className="text-sm font-medium text-gray-700"
            >
              Tên trường <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fieldName"
              value={field.name || ""}
              onChange={(e) => handleFieldNameChange(e.target.value)}
              onBlur={handleFieldNameBlur}
              placeholder="Nhập tên trường"
              maxLength={255}
              className={`h-9 ${fieldNameError ? "border-red-500" : ""}`}
              disabled={formIsUse}
            />
            {fieldNameError && (
              <p className="text-xs text-red-500 mt-1">{fieldNameError}</p>
            )}
          </div>
        )}

        {/* Placeholder */}
        {isFieldAllowed("placeholder") && (
          <div className="space-y-1.5">
            <Label
              htmlFor="fieldPlaceholder"
              className="text-sm font-medium text-gray-700"
            >
              Placeholder
            </Label>
            <Input
              id="fieldPlaceholder"
              value={field.placeholder || ""}
              onChange={(e) =>
                onChange(field.id, {
                  placeholder: e.target.value,
                })
              }
              placeholder="Nhập placeholder"
              className="h-9"
            />
          </div>
        )}

        {/* Description */}
        {isFieldAllowed("description") && (
          <div className="space-y-1.5">
            <Label
              htmlFor="fieldDescription"
              className="text-sm font-medium text-gray-700"
            >
              Mô tả (Description)
            </Label>
            <Input
              id="fieldDescription"
              value={field.description || ""}
              onChange={(e) =>
                onChange(field.id, {
                  description: e.target.value,
                })
              }
              placeholder="Nhập mô tả"
              className="h-9"
            />
            <p className="text-xs text-gray-500 mt-1">
              {`Hiển thị dưới dạng "(nội dung mô tả)"`}
            </p>
          </div>
        )}

        {/* Disabled */}
        {isFieldAllowed("disabled") && (
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <Label
              htmlFor="fieldDisabled"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Disable (Ẩn trường)
            </Label>
            <Checkbox
              id="fieldDisabled"
              checked={field.hidden || false}
              onCheckedChange={(v) =>
                onChange(field.id, {
                  hidden: Boolean(v),
                })
              }
            />
          </div>
        )}
        {field.type !== "TABLE" && (
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <Label
              htmlFor="fieldShowOnList"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Hiển thị trong danh sách
            </Label>
            <Checkbox
              id="fieldShowOnList"
              checked={field.showOnList || false}
              onCheckedChange={(v) =>
                onChange(field.id, {
                  showOnList: Boolean(v),
                })
              }
            />
          </div>
        )}

        <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
          <Label
            htmlFor="fieldIsSearch"
            className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
          >
            Có thể tìm kiếm
          </Label>
          <Checkbox
            id="fieldIsSearch"
            checked={field.isSearch || false}
            onCheckedChange={(v) =>
              onChange(field.id, {
                isSearch: Boolean(v),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
