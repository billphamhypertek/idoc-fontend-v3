"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { FormRow, FormField } from "@/components/form-config/types";
import { DynamicFormField } from "./DynamicFormField";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DynamicFormProps {
  rows: FormRow[];
  defaultValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  viewOnly?: boolean;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showActionButtons?: boolean;
  pageType?: "insert" | "update";
}

// Tính toán width (%) cho từng field để bám theo layout builder
const getFieldWidthPercent = (row: FormRow, field: FormField): number => {
  const fields = row.fields.filter((f) => !f.readonly);

  const getSafeCustom = (value?: number | string) => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return !isNaN(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const thisCustom = getSafeCustom(
    (field as any).inputWidth || field.inputWidth
  );

  if (fields.length === 1) {
    if (thisCustom !== undefined) {
      return Math.max(10, Math.min(100, thisCustom));
    }

    switch (field.size) {
      case "half":
        return 50;
      case "third":
        return 33.33;
      case "quarter":
        return 25;
      case "full":
      default:
        return 100;
    }
  }

  if (thisCustom !== undefined) {
    return Math.max(5, Math.min(100, thisCustom));
  }

  if (field.size) {
    switch (field.size) {
      case "half":
        return 50;
      case "third":
        return 33.33;
      case "quarter":
        return 25;
      case "full":
      default:
        return 100;
    }
  }

  if (fields.length > 0) {
    return 100 / fields.length;
  }

  return 100;
};

export default function DynamicForm({
  rows,
  defaultValues,
  onSubmit,
  viewOnly = false,
  isSubmitting = false,
  submitButtonText = "Gửi form",
  showActionButtons = true,
  pageType = "insert",
}: DynamicFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    mode: "onBlur",
    shouldUnregister: false,
  });
  const router = useRouter();

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Helper function to format date according to field's dateFormat
  const formatDateValue = (value: string, format: string): string => {
    if (!value) return value;

    // Parse the date from yyyy-mm-dd format (HTML date input default)
    const parts = value.split("-");
    if (parts.length !== 3) return value;

    const [year, month, day] = parts;

    // Format according to the specified format
    switch (format.toUpperCase()) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY/MM/DD":
        return `${year}/${month}/${day}`;
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`;
      case "MM-DD-YYYY":
        return `${month}-${day}-${year}`;
      case "YYYY-MM-DD":
      default:
        return value; // Keep original format
    }
  };

  // Helper function to format datetime according to field's dateFormat
  const formatDateTimeValue = (value: string, format: string): string => {
    if (!value) return value;

    // Parse datetime-local format: yyyy-mm-ddThh:mm
    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) return value;

    const [year, month, day] = datePart.split("-");

    // Format date part according to the specified format
    let formattedDate: string;
    switch (format.toUpperCase()) {
      case "DD/MM/YYYY":
        formattedDate = `${day}/${month}/${year}`;
        break;
      case "MM/DD/YYYY":
        formattedDate = `${month}/${day}/${year}`;
        break;
      case "YYYY/MM/DD":
        formattedDate = `${year}/${month}/${day}`;
        break;
      case "DD-MM-YYYY":
        formattedDate = `${day}-${month}-${year}`;
        break;
      case "MM-DD-YYYY":
        formattedDate = `${month}-${day}-${year}`;
        break;
      case "YYYY-MM-DD":
      default:
        formattedDate = datePart;
    }

    return `${formattedDate} ${timePart}`;
  };

  const handleInternalSubmit = (values: Record<string, any>) => {
    if (onSubmit) {
      // Values are already in the correct format (yyyy-mm-dd for DATE, yyyy-mm-ddTHH:mm for DATETIME)
      // No need to transform, just submit as is
      console.log("value", values);
      onSubmit(values);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleInternalSubmit)}
      className="space-y-4"
      noValidate
    >
      {rows.map((row) => (
        <div key={row.id} className="flex flex-nowrap gap-3">
          {row.fields.map((field) => {
            const width = getFieldWidthPercent(row, field);
            const name = field.name || field.id;
            const error = (errors as any)[name];

            return field?.hidden ? null : (
              <div
                key={field.id}
                style={{ flexBasis: `${width}%`, maxWidth: `${width}%` }}
                className="min-w-[120px]"
              >
                <DynamicFormField
                  field={{ ...field, readonly: field.readonly || viewOnly }}
                  control={control}
                  error={error}
                  pageType={pageType}
                />
              </div>
            );
          })}
        </div>
      ))}
      {showActionButtons && (
        <div className="pt-4 border-t border-gray-200 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-[100px]"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          {!viewOnly && (
            <Button
              type="submit"
              disabled={isSubmitting || viewOnly}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 w-[100px]"
            >
              {isSubmitting ? "Đang load" : submitButtonText}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
