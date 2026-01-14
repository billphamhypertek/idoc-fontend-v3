"use client";

import FilterField from "@/components/common/FilterFiled";
import TextEditor from "@/components/common/TextEditor";
import type { FormField } from "@/components/form-config/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker, CustomTimePicker } from "@/components/ui/calendar";
import React from "react";
import {
  Controller,
  useForm,
  type Control,
  type FieldError,
  type RegisterOptions,
} from "react-hook-form";
import { MultiSelect } from "../ui/mutil-select";
import { sendGet } from "@/api";
import {
  useGetApiEndpointListQuery,
  useGetApiPreviewData,
} from "@/hooks/data/form-config.data";
import {
  useDownloadAttachmentQuery,
  useAddAttachmentQuery,
  useDeleteAttachmentQuery,
} from "@/hooks/data/form-dynamic.data";
import { formatDateWithFormat } from "@/utils/datetime.utils";
import { parseCssToStyle, saveFile } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { AnyARecord } from "dns";
import { useParams } from "next/navigation";
import { Download, Plus, Trash2 } from "lucide-react";
import { queryKeys } from "@/definitions";
import { useQueryClient } from "@tanstack/react-query";

// API function to fetch options
const fetchFieldOptions = async (
  api: any,
  previewDataMutation: any
): Promise<any[]> => {
  try {
    // Use the API object from the mock data
    if (!api || !api.api) return [];

    // For demo purposes, return mock data based on the API endpoint
    // In production, this would be an actual API call
    const data = await previewDataMutation.mutateAsync({ apiUrl: api.api });
    const options = data;
    return options;
  } catch (error) {
    console.error("Error fetching field options:", error);
    return [];
  }
};

interface DynamicFormFieldProps {
  field: FormField;
  control: Control<Record<string, any>>;
  error?: FieldError;
  valueId?: string;
  pageType?: "insert" | "update";
}

export function DynamicFormField({
  field,
  control,
  error,
  valueId,
  pageType = "insert",
}: DynamicFormFieldProps) {
  const name = field.name || field.id;
  const previewDataMutation = useGetApiPreviewData();
  const params = useParams();
  const formId = params?.id ? String(params.id as string) : "";
  const queryClient = useQueryClient();
  // State used for search in select (single + multi)
  const [selectSearch, setSelectSearch] = React.useState<string>("");
  const [showSelectSuggestions, setShowSelectSuggestions] =
    React.useState<boolean>(false);
  const [hasStartedEditing, setHasStartedEditing] =
    React.useState<boolean>(false);
  const [hasCleared, setHasCleared] = React.useState<boolean>(false);
  const [isClearing, setIsClearing] = React.useState<boolean>(false);

  // State for table cell selects - using separate states like single select
  const [tableSelectSearch, setTableSelectSearch] = React.useState<{
    [key: string]: string;
  }>({});
  const [tableShowSuggestions, setTableShowSuggestions] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [tableHasStartedEditing, setTableHasStartedEditing] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [tableHasCleared, setTableHasCleared] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [tableIsClearing, setTableIsClearing] = React.useState<{
    [key: string]: boolean;
  }>({});

  // State for checkbox "other" option
  const [checkboxOtherValue, setCheckboxOtherValue] =
    React.useState<string>("");

  // Reset states when form value changes externally
  React.useEffect(() => {
    if (control._formValues[name] !== undefined) {
      setHasStartedEditing(false);
      setHasCleared(false);
      setSelectSearch("");
    }
  }, [control._formValues[name], name]);

  // Sync checkbox "other" value from form when loading default values
  React.useEffect(() => {
    const otherFieldName = `${name}_other`;
    const otherValue = control._formValues[otherFieldName];
    if (otherValue && typeof otherValue === "string") {
      setCheckboxOtherValue(otherValue);
    }
  }, [control._formValues, name]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSelectSuggestions) {
        const target = event.target as Element;
        // Check if click is outside the filter field container
        const filterField = target.closest(".filter-field-container");
        if (!filterField) {
          setShowSelectSuggestions(false);
        }
      }
    };

    if (showSelectSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSelectSuggestions]);

  // Handle both API format and internal format
  const fieldType = (field as any).dataType || field.type;
  const fieldId = field.id || (field as any).id?.toString() || name;
  const apiData = (field as any).api; // Get API object from mock data
  // Fetch API endpoint list
  const { data: apiEndpointData } = useGetApiEndpointListQuery();
  const apiList = apiEndpointData?.objList || [];

  // State for API options
  const [apiOptions, setApiOptions] = React.useState<AnyARecord[] | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] =
    React.useState<boolean>(false);

  // State for table column API options
  const [tableColumnApiOptions, setTableColumnApiOptions] = React.useState<
    Record<string, AnyARecord[]>
  >({});
  const [tableColumnLoadingStates, setTableColumnLoadingStates] =
    React.useState<Record<string, boolean>>({});

  // Track if table column options have been loaded for this field
  const [tableColumnOptionsLoaded, setTableColumnOptionsLoaded] =
    React.useState<boolean>(false);

  // Parse disableDates from string to array if needed
  const disableDates = React.useMemo(() => {
    if (!field.disableDates) return [];

    if (typeof field.disableDates === "string") {
      try {
        return JSON.parse(field.disableDates);
      } catch (e) {
        console.warn("Failed to parse disableDates for field:", field.name);
        return [];
      }
    }

    return field.disableDates;
  }, [field.disableDates]);

  // Refs object to store input refs by field name
  const inputRefs = React.useRef<
    Record<string, React.RefObject<HTMLInputElement>>
  >({});

  // Get or create input ref for this field
  const getInputRef = (fieldName: string) => {
    if (!inputRefs.current[fieldName]) {
      inputRefs.current[fieldName] = React.createRef<HTMLInputElement>();
    }
    return inputRefs.current[fieldName];
  };

  // We'll create download mutation dynamically for each file
  const [downloadFileName, setDownloadFileName] = React.useState<string>("");
  const downloadAttachmentMutation =
    useDownloadAttachmentQuery(downloadFileName);

  // Fetch options from API if api object is provided and has API endpoint
  React.useEffect(() => {
    if (
      apiData &&
      apiData.api &&
      ["SELECT", "RADIO", "CHECKBOX"].includes(fieldType)
    ) {
      setIsLoadingOptions(true);
      fetchFieldOptions(apiData, previewDataMutation)
        .then((options) => {
          setApiOptions(options);
        })
        .finally(() => {
          setIsLoadingOptions(false);
        });
    }
  }, [apiData?.api, fieldType]); // Only depend on apiData.api and fieldType
  // Track loaded columns to prevent duplicate API calls
  const loadedColumnsRef = React.useRef<Set<string>>(new Set());

  // Reset loaded columns and options loaded flag when field changes
  React.useEffect(() => {
    loadedColumnsRef.current.clear();
    setTableColumnOptionsLoaded(false);
  }, [field.id]);

  // Fetch API options for table columns
  React.useEffect(() => {
    if (
      fieldType === "TABLE" &&
      apiList.length > 0 &&
      !tableColumnOptionsLoaded
    ) {
      // Parse table config to get columns
      const tableConfig = (field as any).fieldConfig;
      let parsedConfig: any = field.fieldConfig;

      if (typeof tableConfig === "string") {
        try {
          parsedConfig = JSON.parse(tableConfig);
        } catch (e) {
          console.warn("Failed to parse table config for field:", field.name);
          parsedConfig = {};
        }
      }

      // Prioritize field.tableColumns over parsedConfig.tableColumns
      const columns =
        field.tableColumns ||
        (parsedConfig &&
        typeof parsedConfig === "object" &&
        parsedConfig.tableColumns
          ? parsedConfig.tableColumns
          : []);

      if (columns.length > 0) {
        columns.forEach((col: any) => {
          if (col.type === "select" && col.apiId) {
            const columnKey = `${col.apiId}-${col.name || "unnamed"}`;

            // Skip if already loaded for this column
            if (loadedColumnsRef.current.has(columnKey)) {
              return;
            }

            loadedColumnsRef.current.add(columnKey);
            setTableColumnLoadingStates((prev) => ({
              ...prev,
              [columnKey]: true,
            }));

            // Use the apiId as endpoint or construct proper API URL
            const api = apiList.find((api) => api.id === col.apiId);
            const apiUrl = api?.api;

            fetchFieldOptions({ api: apiUrl }, previewDataMutation)
              .then((options) => {
                setTableColumnApiOptions((prev) => ({
                  ...prev,
                  [columnKey]: options,
                }));
              })
              .catch((error) => {
                setTableColumnApiOptions((prev) => ({
                  ...prev,
                  [columnKey]: [],
                }));
              })
              .finally(() => {
                setTableColumnLoadingStates((prev) => ({
                  ...prev,
                  [columnKey]: false,
                }));
              });
          }
        });

        // Mark as loaded to prevent re-fetching
        setTableColumnOptionsLoaded(true);
      }
    }
  }, [fieldType, field, previewDataMutation, tableColumnOptionsLoaded]);

  // Mutations for file operations
  const addAttachmentMutation = useAddAttachmentQuery(
    formId || "",
    fieldId || ""
  );
  const deleteAttachmentMutation = useDeleteAttachmentQuery();

  // Get options - prioritize API over field.options
  const getOptions = (): Array<{ id: string; name: string }> => {
    if (apiOptions && apiOptions.length > 0) {
      return apiOptions.map((option: any, index) => {
        if (typeof option === "object" && option.id && option.label) {
          return { id: option.label, name: option.label };
        } else if (typeof option === "object" && option.id && option.name) {
          return { id: option.name, name: option.name };
        } else {
          return { id: option.toString(), name: option.toString() };
        }
      });
    }

    // Fallback to field.options (handle both string and array formats)
    const fieldOptions = (field as any).options;
    if (Array.isArray(fieldOptions)) {
      return fieldOptions.map((option: any, index) => {
        if (typeof option === "object" && option.id && option.label) {
          return { id: option.label, name: option.label };
        } else if (typeof option === "object" && option.id && option.name) {
          return { id: option.name, name: option.name };
        } else {
          return { id: option.toString(), name: option.toString() };
        }
      });
    }
    if (typeof fieldOptions === "string") {
      try {
        const parsed = JSON.parse(fieldOptions);
        if (Array.isArray(parsed)) {
          return parsed.map((option: any, index) => {
            if (typeof option === "object" && option.id && option.label) {
              return { id: option.label, name: option.label };
            } else if (typeof option === "object" && option.id && option.name) {
              return { id: option.name, name: option.name };
            } else {
              return { id: option.toString(), name: option.toString() };
            }
          });
        }
      } catch (e) {
        console.warn("Failed to parse options for field:", field.name);
        return [];
      }
    }

    return [];
  };

  const rules: RegisterOptions = {};

  if (field.required) {
    rules.required = "Trường này là bắt buộc";
  }

  if (
    field.maxLength &&
    field.maxLength > 0 &&
    ["TEXT", "TEXTAREA", "EDITOR"].includes(fieldType)
  ) {
    rules.maxLength = {
      value: field.maxLength,
      message: `Tối đa ${field.maxLength} ký tự`,
    };
  }

  // File validation rules
  if (fieldType === "FILE") {
    if (field.max) {
      rules.validate = (files: FileList | null) => {
        if (!files || files.length === 0) return true;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > Number(field.max)!) {
            return `File ${file.name} vượt quá dung lượng tối đa ${field.max}MB`;
          }
        }
        return true;
      };
    }

    if (field.acceptedTypes) {
      rules.validate = (files: FileList | null) => {
        if (!files || files.length === 0) return true;

        const acceptedTypes = field
          .acceptedTypes!.split(",")
          .map((type) => type.trim());
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

          const isAccepted = acceptedTypes.some((acceptedType) => {
            if (acceptedType.startsWith(".")) {
              return fileExtension === acceptedType.toLowerCase();
            } else {
              return file.type === acceptedType;
            }
          });

          if (!isAccepted) {
            return `File ${file.name} không được chấp nhận. Chỉ chấp nhận: ${field.acceptedTypes}`;
          }
        }
        return true;
      };
    }
  }

  // Date validation rules
  if (fieldType === "DATE" || fieldType === "DATETIME") {
    if (field.min) {
      rules.min = {
        value: field.min,
        message: `Ngày không được sớm hơn ${field.min}`,
      };
    }
    if (field.max) {
      rules.max = {
        value: field.max,
        message: `Ngày không được muộn hơn ${field.max}`,
      };
    }

    // Disable specific dates validation
    if (disableDates.length > 0) {
      rules.validate = (value: string | undefined) => {
        if (!value) return true;

        if (fieldType === "DATETIME") {
          // For DATETIME fields, check both date and date-time combinations
          const dateStr = value.split("T")[0]; // Get date part for DATETIME
          const dateTimeStr = value.replace("T", " "); // Convert "T" to space for comparison

          // Check exact date-time match
          if (disableDates.includes(dateTimeStr)) {
            return "Thời gian này đã bị vô hiệu hóa";
          }

          // Also check if just the date is disabled
          if (disableDates.includes(dateStr)) {
            return "Ngày này đã bị vô hiệu hóa";
          }
        } else {
          // For DATE fields, only check date
          const selectedDate = value.split("T")[0]; // Get date part
          if (disableDates.includes(selectedDate)) {
            return "Ngày này đã bị vô hiệu hóa";
          }
        }

        return true;
      };
    }
  }

  // Link field validation
  if (fieldType === "LINK") {
    rules.validate = (value: string | undefined) => {
      if (!value) return true;

      try {
        const url = new URL(value);
        // Basic URL validation - you can enhance this based on requirements
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return "Vui lòng nhập một URL hợp lệ (ví dụ: https://example.com)";
      }
    };
  }

  // Number validation rules (enhanced)
  if (fieldType === "NUMBER") {
    // Handle both string and number min/max from API
    const minValue =
      typeof field.min === "string" ? parseFloat(field.min) : field.min;
    const maxValue =
      typeof field.max === "string" ? parseFloat(field.max) : field.max;

    if (typeof minValue === "number" && !isNaN(minValue)) {
      rules.min = {
        value: minValue,
        message: `Giá trị nhỏ nhất là ${minValue}`,
      };
    }
    if (typeof maxValue === "number" && !isNaN(maxValue)) {
      rules.max = {
        value: maxValue,
        message: `Giá trị lớn nhất là ${maxValue}`,
      };
    }
  }

  // Helpers for date & datetime
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

    // Expected format: yyyy-MM-dd hh:mm:00
    const [datePart, timePart] = value.trim().split(" ");
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return null;
    }

    return new Date(
      year,
      month - 1,
      day,
      Number.isNaN(hour) ? 0 : hour,
      Number.isNaN(minute) ? 0 : minute,
      0
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
    return `${year}-${month}-${day} ${hour}:${minute}:00`;
  };

  const errorText = error?.message && (
    <p className="mt-1 text-xs text-red-500">{error.message}</p>
  );

  // Process label style for fields that support CSS
  const labelStyle = React.useMemo(() => {
    if (!field.css) return undefined;

    // Handle both string and object formats
    if (typeof field.css === "string") {
      try {
        return parseCssToStyle(field.css);
      } catch (e) {
        console.warn("Failed to parse CSS string for field:", field.name);
        return undefined;
      }
    } else if (typeof field.css === "object") {
      return field.css;
    }

    return undefined;
  }, [field.css]);

  const commonLabel = (overrideStyle?: React.CSSProperties) => (
    <Label
      className="block text-sm font-medium text-gray-700 mb-1"
      style={overrideStyle || labelStyle}
    >
      {field.title}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
      {field.description && (
        <span className="text-xs text-gray-500 ml-1">
          ({field.description})
        </span>
      )}
    </Label>
  );

  switch (fieldType) {
    case "TEXT":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => (
              <Input
                {...rhfField}
                value={rhfField.value ?? ""}
                onChange={rhfField.onChange}
                onBlur={rhfField.onBlur}
                name={rhfField.name}
                ref={rhfField.ref}
                disabled={field.readonly}
                maxLength={
                  field.maxLength && field.maxLength > 0
                    ? field.maxLength
                    : undefined
                }
                placeholder={field.placeholder || field.title}
                className="h-9"
              />
            )}
          />
          {errorText}
        </div>
      );

    case "TEXTAREA":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => (
              <Textarea
                {...rhfField}
                value={rhfField.value ?? ""}
                onChange={rhfField.onChange}
                onBlur={rhfField.onBlur}
                name={rhfField.name}
                ref={rhfField.ref}
                disabled={field.readonly}
                placeholder={field.placeholder || field.title}
                rows={3}
                className="text-sm"
              />
            )}
          />
          {errorText}
        </div>
      );

    case "NUMBER":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => (
              <Input
                value={rhfField.value ?? ""}
                onChange={rhfField.onChange}
                onBlur={rhfField.onBlur}
                name={rhfField.name}
                ref={rhfField.ref}
                type="number"
                disabled={field.readonly}
                placeholder={field.placeholder || field.title}
                className="h-9"
              />
            )}
          />
          {errorText}
        </div>
      );

    case "DATE":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => {
              const selectedDate = parseDateString(
                rhfField.value as string | undefined
              );

              const handleDateSelect = (date: Date | null) => {
                if (!date) {
                  rhfField.onChange("");
                  return;
                }

                // Check if selected date is in disabled dates (check with display format)
                const dateStrDisplay = formatDateWithFormat(
                  date,
                  field.dateFormat
                );
                if (disableDates.includes(dateStrDisplay)) {
                  return; // Don't allow selection of disabled dates
                }

                // Always save as yyyy-mm-dd for API
                rhfField.onChange(
                  date ? formatDateWithFormat(date, "yyyy-mm-dd") : ""
                );
              };

              return (
                <CustomDatePicker
                  selected={selectedDate}
                  onChange={handleDateSelect}
                  placeholder={field.placeholder || field.title || "Chọn ngày"}
                  readOnly={field.readonly}
                  className="w-full"
                  disableDates={disableDates}
                />
              );
            }}
          />
          {errorText}
        </div>
      );

    case "DATETIME":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => {
              const current = parseDateTimeString(
                rhfField.value as string | undefined
              );

              const handleDateChange = (date: Date | null) => {
                if (!date) {
                  rhfField.onChange("");
                  return;
                }

                // Check if selected date-time combination is in disabled dates (with display format)
                // For DATETIME fields, disableDates can contain date-time strings
                const dateTimeStrDisplay =
                  formatDateWithFormat(date, field.dateFormat) +
                  " " +
                  `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

                // Check exact date-time match
                if (disableDates.includes(dateTimeStrDisplay)) {
                  return; // Don't allow selection of disabled date-time
                }

                // Also check if just the date is disabled (for backward compatibility)
                const dateStrDisplay = formatDateWithFormat(
                  date,
                  field.dateFormat
                );
                if (disableDates.includes(dateStrDisplay)) {
                  return; // Don't allow selection of disabled date
                }

                const base = current || new Date();
                const merged = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  base.getHours(),
                  base.getMinutes()
                );
                // formatDateTimeLocal always returns yyyy-mm-dd HH:mm:00 format
                rhfField.onChange(formatDateTimeLocal(merged));
              };

              const handleTimeChange = (time: Date | null) => {
                if (!time) {
                  rhfField.onChange("");
                  return;
                }
                const base = current || new Date();
                const merged = new Date(
                  base.getFullYear(),
                  base.getMonth(),
                  base.getDate(),
                  time.getHours(),
                  time.getMinutes()
                );

                // Check if selected date-time combination is in disabled dates (with display format)
                const dateTimeStrDisplay =
                  formatDateWithFormat(merged, field.dateFormat) +
                  " " +
                  `${merged.getHours().toString().padStart(2, "0")}:${merged.getMinutes().toString().padStart(2, "0")}`;

                // Check exact date-time match
                if (disableDates.includes(dateTimeStrDisplay)) {
                  return; // Don't allow selection of disabled date-time
                }

                // Also check if just the date is disabled (for backward compatibility)
                const dateStrDisplay = formatDateWithFormat(
                  merged,
                  field.dateFormat
                );
                if (disableDates.includes(dateStrDisplay)) {
                  return; // Don't allow selection of disabled date
                }

                // formatDateTimeLocal always returns yyyy-mm-dd HH:mm:00 format
                rhfField.onChange(formatDateTimeLocal(merged));
              };

              const disableDate = disableDates?.map(
                (el: any) => el?.split(" ")?.[0]
              );
              const disableTime = disableDates?.map(
                (el: any) => el?.split(" ")?.[1]
              );

              return (
                <div className="grid grid-cols-2 gap-2">
                  <CustomDatePicker
                    selected={current}
                    onChange={handleDateChange}
                    placeholder={
                      field.placeholder || field.title || "Chọn ngày"
                    }
                    readOnly={field.readonly}
                    className="w-full"
                    disableDates={disableDate}
                    dateFormat={field.dateFormat}
                  />
                  <CustomTimePicker
                    selected={current}
                    onChange={handleTimeChange}
                    placeholder="Chọn giờ"
                    className="w-full"
                    disabled={field.readonly}
                  />
                </div>
              );
            }}
          />
          {errorText}
        </div>
      );

    case "SELECT":
      return (
        <div>
          {commonLabel({})}
          {isLoadingOptions ? (
            <div className="w-full min-h-9 flex items-center justify-center text-gray-500 text-sm">
              Đang tải options...
            </div>
          ) : /* Multi select - check if field has isSearch or multiple property */
          field.allowMultiple ? (
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: rhfField }) => {
                const valueArray: string[] = Array.isArray(rhfField.value)
                  ? rhfField.value
                  : [];
                const options = getOptions();

                return (
                  <MultiSelect
                    options={options}
                    value={options.filter((opt) => valueArray.includes(opt.id))}
                    onChange={(vals) =>
                      rhfField.onChange(vals.map((val) => val.id))
                    }
                    placeholder={
                      field.placeholder || field.title || "Chọn nhiều giá trị"
                    }
                    className="w-full min-h-9"
                    showNumberOfItems
                    disabled={field.readonly}
                  />
                );
              }}
            />
          ) : (
            // Single select
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: rhfField }) => {
                const options = getOptions();
                const selectedOption = options.find(
                  (opt) => opt.id === rhfField.value
                );
                const inputValue = hasCleared
                  ? selectSearch
                  : hasStartedEditing || selectSearch !== ""
                    ? selectSearch
                    : selectedOption?.name || "";
                const filteredOptions = options.filter((opt) =>
                  opt.name.toLowerCase().includes(inputValue.toLowerCase())
                );

                return (
                  <div className="flex items-center gap-2 filter-field-container">
                    <div className="flex-1">
                      <FilterField
                        label=""
                        field={`${name}-search`}
                        value={inputValue}
                        placeholder={
                          field.placeholder || field.title || "Chọn giá trị"
                        }
                        type="text"
                        withSuggestions={true}
                        showSuggestions={showSelectSuggestions}
                        suggestions={filteredOptions.map((opt) => opt.name)}
                        onChange={(_, v) => {
                          setSelectSearch(v);
                          if (v === "") {
                            setHasCleared(true);
                            // Clear form field value when user clears by typing
                            rhfField.onChange("");
                            // Show suggestions when clearing by typing
                            setShowSelectSuggestions(true);
                          } else {
                            // Show suggestions when typing
                            setShowSelectSuggestions(true);
                            if (!hasStartedEditing) {
                              setHasStartedEditing(true);
                            }
                          }
                        }}
                        onFocus={() => {
                          setShowSelectSuggestions(true);
                        }}
                        onBlur={() => {
                          // Don't close suggestions immediately if we're clearing
                          if (!isClearing) {
                            setTimeout(() => {
                              setShowSelectSuggestions(false);
                            }, 200);
                          }
                        }}
                        onClear={(_) => {
                          setSelectSearch("");
                          setHasCleared(true);
                          setIsClearing(true);
                          // Clear form field value when clicking clear button
                          rhfField.onChange("");
                          // Don't show suggestions when clicking clear button
                          setShowSelectSuggestions(false);
                          // Reset clearing flag after a short delay
                          setTimeout(() => setIsClearing(false), 100);
                        }}
                        onSelectSuggestion={(_, v) => {
                          const selectedOption = options.find(
                            (opt) => opt.name === v
                          );
                          if (selectedOption) {
                            rhfField.onChange(selectedOption.id);
                          }
                          setSelectSearch(v);
                          setHasStartedEditing(false);
                          setHasCleared(false);
                          setShowSelectSuggestions(false);
                        }}
                        showClear={true}
                        disabled={field.readonly}
                      />
                    </div>
                  </div>
                );
              }}
            />
          )}
          {errorText}
        </div>
      );

    case "CHECKBOX":
      return (
        <div>
          {commonLabel({})}
          {isLoadingOptions ? (
            <div className="w-full min-h-9 flex items-center justify-center text-gray-500 text-sm">
              Đang tải options...
            </div>
          ) : (
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: rhfField }) => {
                const selectedIds: string[] = Array.isArray(rhfField.value)
                  ? rhfField.value
                  : [];

                const handleCheckboxChange = (
                  optionId: string,
                  checked: boolean
                ) => {
                  if (checked) {
                    // Add option ID to array
                    const newSelectedIds = [...selectedIds, optionId];
                    rhfField.onChange(newSelectedIds);
                  } else {
                    // Remove option ID from array
                    const newSelectedIds = selectedIds.filter(
                      (id) => id !== optionId
                    );
                    rhfField.onChange(newSelectedIds);
                  }
                };

                const handleOtherChange = (value: string) => {
                  setCheckboxOtherValue(value);

                  // Lưu giá trị "other" vào field riêng
                  const otherFieldName = `${name}_other`;
                  control._formValues[otherFieldName] = value;
                };

                const isOtherSelected = selectedIds
                  .map((value) => value.toLowerCase())
                  .includes("khác");

                return (
                  <div className="space-y-2">
                    {getOptions().map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={selectedIds.includes(option.id)}
                          onCheckedChange={(val) =>
                            handleCheckboxChange(option.id, Boolean(val))
                          }
                          disabled={field.readonly}
                        />
                        <Label className="text-sm text-gray-700">
                          {option.name}
                        </Label>
                      </div>
                    ))}
                    {field.allowOther && isOtherSelected && (
                      <div className="mt-3 pl-6">
                        <Input
                          value={checkboxOtherValue}
                          onChange={(e) => handleOtherChange(e.target.value)}
                          placeholder="Khác (nhập giá trị)"
                          disabled={field.readonly}
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                );
              }}
            />
          )}
          {errorText}
        </div>
      );

    case "RADIO":
      return (
        <div>
          {commonLabel({})}
          {isLoadingOptions ? (
            <div className="w-full min-h-9 flex items-center justify-center text-gray-500 text-sm">
              Đang tải options...
            </div>
          ) : (
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: rhfField }) => (
                <div className="space-y-2">
                  {getOptions().map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        className="w-4 h-4"
                        value={option.id}
                        checked={rhfField.value === option.id}
                        onChange={() => rhfField.onChange(option.id)}
                        disabled={field.readonly}
                      />
                      <span className="text-sm text-gray-700">
                        {option.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            />
          )}
          {errorText}
        </div>
      );

    case "LINK":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => (
              <Input
                value={rhfField.value ?? ""}
                onChange={rhfField.onChange}
                onBlur={rhfField.onBlur}
                name={rhfField.name}
                ref={rhfField.ref}
                type="url"
                disabled={field.readonly}
                placeholder={field.placeholder || field.linkUrl || "https://"}
                className="h-9"
              />
            )}
          />
          {errorText}
        </div>
      );

    case "FILE":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => {
              const inputRef = getInputRef(name);

              // Check if there's an existing file value (could be string, object, or array)
              const existingFile = rhfField.value;
              const existingFiles = Array.isArray(existingFile)
                ? existingFile
                : existingFile
                  ? [existingFile]
                  : [];
              const hasExistingFile = existingFiles.length > 0;

              const handleDownload = (fileName: string) => {
                setDownloadFileName(fileName);
                setTimeout(() => {
                  downloadAttachmentMutation.mutate(undefined, {
                    onSuccess: (data) => {
                      if (fileName && data) {
                        saveFile(fileName, data);
                      }
                    },
                    onError: (error) => {
                      ToastUtils.error("Tải file thất bại");
                      console.error("Download error:", error);
                    },
                  });
                }, 0);
              };

              const handleDeleteFile = (fileIndex: number) => {
                const fileToDelete = existingFiles[fileIndex];
                if (!fileToDelete) return;

                // Check if file has id (uploaded to server)
                const hasServerId =
                  typeof fileToDelete === "object" && fileToDelete.id;

                if (hasServerId) {
                  // File on server - call API to delete
                  const attachmentId = fileToDelete.id;

                  deleteAttachmentMutation.mutate(attachmentId, {
                    onSuccess: async () => {
                      ToastUtils.success("Xóa file thành công");

                      // Refetch data to get updated file list from server
                      if (pageType === "update" && formId) {
                        await queryClient.invalidateQueries({
                          queryKey: [
                            queryKeys.valueDynamic.detail,
                            Number(formId),
                          ],
                        });
                      } else {
                        // For insert mode, update local state
                        const newFiles = existingFiles.filter(
                          (_, index) => index !== fileIndex
                        );

                        // Update form value
                        if (field.allowMultiple) {
                          rhfField.onChange(
                            newFiles.length > 0 ? newFiles : null
                          );
                        } else {
                          rhfField.onChange(null);
                        }

                        // Reset input only if no files remain
                        if (newFiles.length === 0 && inputRef.current) {
                          inputRef.current.value = "";
                        }
                      }
                    },
                    onError: (error) => {
                      ToastUtils.error("Xóa file thất bại");
                      console.error("Delete file error:", error);
                    },
                  });
                } else {
                  // Local file - just remove from state, no API call
                  const newFiles = existingFiles.filter(
                    (_, index) => index !== fileIndex
                  );

                  // Update form value - set to null if no files left
                  if (field.allowMultiple) {
                    rhfField.onChange(newFiles.length > 0 ? newFiles : null);
                  } else {
                    rhfField.onChange(null);
                  }

                  // Reset input only if no files remain
                  if (newFiles.length === 0 && inputRef.current) {
                    inputRef.current.value = "";
                  }
                }
              };

              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const files = e.target.files;
                if (!files || files.length === 0) {
                  rhfField.onChange(files);
                  return;
                }

                // Logic based on pageType
                if (pageType === "insert") {
                  // INSERT MODE: If allowMultiple=false, replace local file without API call
                  if (!field.allowMultiple && existingFiles.length > 0) {
                    // Simply replace the file in state (no API call needed for local files)
                    processFileUpload(files, rhfField, inputRef);
                    return;
                  }
                } else if (pageType === "update") {
                  // UPDATE MODE: This shouldn't happen because input is disabled
                  // But if somehow triggered, prevent upload if file exists
                  if (!field.allowMultiple && existingFiles.length > 0) {
                    ToastUtils.error(
                      "Vui lòng xóa file cũ trước khi upload file mới"
                    );
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                    return;
                  }
                }

                // Proceed with normal upload
                processFileUpload(files, rhfField, inputRef);
              };

              const processFileUpload = (
                files: FileList,
                rhfField: any,
                inputRef: React.RefObject<HTMLInputElement>
              ) => {
                // Validate each file
                const validFiles: File[] = [];
                const errors: string[] = [];

                for (let i = 0; i < files.length; i++) {
                  const file = files[i];

                  // Check file size
                  if (field.max) {
                    const fileSizeMB = file.size / (1024 * 1024);
                    if (fileSizeMB > Number(field.max)) {
                      errors.push(
                        `File ${file.name} vượt quá dung lượng tối đa ${field.max}MB`
                      );
                      continue;
                    }
                  }

                  // Check file type
                  if (field.acceptedTypes) {
                    const acceptedTypes = field.acceptedTypes
                      .split(",")
                      .map((type) => type.trim());
                    const fileExtension =
                      "." + file.name.split(".").pop()?.toLowerCase();

                    const isAccepted = acceptedTypes.some((acceptedType) => {
                      if (acceptedType.startsWith(".")) {
                        return fileExtension === acceptedType.toLowerCase();
                      } else {
                        return file.type === acceptedType;
                      }
                    });

                    if (!isAccepted) {
                      errors.push(
                        `File ${file.name} không được chấp nhận. Chỉ chấp nhận: ${field.acceptedTypes}`
                      );
                      continue;
                    }
                  }

                  validFiles.push(file);
                }

                // Show errors if any
                if (errors.length > 0) {
                  ToastUtils.error(errors.join("\n"));
                  // Clear input by resetting it through ref
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                  return;
                }

                // Create new FileList with only valid files
                if (validFiles.length > 0) {
                  const dataTransfer = new DataTransfer();
                  validFiles.forEach((file) => dataTransfer.items.add(file));

                  // If we have valueId, upload file to server
                  if (formId && validFiles.length > 0) {
                    const formData = new FormData();
                    validFiles.forEach((file) => {
                      formData.append("files", file);
                    });
                    formData.append("fieldName", name);

                    addAttachmentMutation.mutate(formData, {
                      onSuccess: async (response) => {
                        ToastUtils.success("Upload file thành công");

                        // Refetch detail data if in update mode
                        if (pageType === "update" && formId) {
                          await queryClient.invalidateQueries({
                            queryKey: [
                              queryKeys.valueDynamic.detail,
                              Number(formId),
                            ],
                          });
                        } else {
                          // For insert mode, update form field with server response
                          const uploadedFiles = response?.data || [];
                          // Keep the full file object if it has an ID, otherwise fallback to name
                          const uploadedFilesData = uploadedFiles.map(
                            (file: any) => {
                              if (typeof file === "object" && file.id) {
                                return file;
                              }
                              return file.name || file;
                            }
                          );

                          if (field.allowMultiple) {
                            // For multiple files, combine with existing files
                            // Re-get current value to ensure we have latest state
                            const currentValue = rhfField.value;
                            const currentFiles = Array.isArray(currentValue)
                              ? currentValue
                              : currentValue
                                ? [currentValue]
                                : [];
                            const newFiles = [
                              ...currentFiles,
                              ...uploadedFilesData,
                            ];
                            rhfField.onChange(newFiles);
                          } else {
                            // For single file, replace
                            rhfField.onChange(uploadedFilesData[0] || null);
                          }
                        }

                        // Reset input
                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }
                      },
                      onError: (error) => {
                        ToastUtils.error("Upload file thất bại");
                        console.error("Upload file error:", error);
                        // Clear input by resetting it through ref
                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }
                      },
                    });
                  } else {
                    // No valueId, just update local form state
                    if (field.allowMultiple) {
                      // For multiple files, combine with existing files
                      const currentValue = rhfField.value;
                      const currentFiles = Array.isArray(currentValue)
                        ? currentValue
                        : currentValue
                          ? [currentValue]
                          : [];
                      const newFilesList = [
                        ...currentFiles,
                        ...Array.from(dataTransfer.files),
                      ];
                      rhfField.onChange(newFilesList);
                    } else {
                      // For single file, replace existing file
                      rhfField.onChange(dataTransfer.files[0] || null);
                    }

                    // Reset input
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }
                } else {
                  // Clear input by resetting it through ref
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                  rhfField.onChange(null);
                }
              };

              return (
                <div className="space-y-2">
                  {/* Display existing files if present */}
                  {hasExistingFile &&
                    existingFiles.map((file, index) => {
                      const isServerFile = typeof file === "object" && file.id;
                      const isLocalFile = file instanceof File;

                      // Get fileName based on file type
                      let fileName = "Unknown file";
                      if (isLocalFile) {
                        fileName = file.name;
                      } else if (typeof file === "object") {
                        fileName =
                          file.displayName || file.name || "Unknown file";
                      } else if (typeof file === "string") {
                        fileName = file;
                      }

                      const fileSize = isLocalFile
                        ? file.size
                        : typeof file === "object"
                          ? file.size
                          : 0;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">
                              {fileName}
                            </span>
                            {fileSize > 0 && (
                              <span className="text-xs text-gray-500">
                                ({(fileSize / 1024).toFixed(1)} KB)
                              </span>
                            )}
                            {isServerFile && (
                              <span className="text-xs text-green-600">
                                • Đã tải lên
                              </span>
                            )}
                            {isLocalFile && (
                              <span className="text-xs text-blue-600">
                                • Chưa tải lên
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isServerFile && fileName && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownload(
                                    typeof file === "object" && file.name
                                      ? file.name
                                      : fileName
                                  )
                                }
                                disabled={downloadAttachmentMutation.isPending}
                                className="text-blue-600 hover:text-blue-800 text-sm underline disabled:opacity-50"
                              >
                                <Download size={18} />
                              </button>
                            )}
                            {!field.readonly &&
                              (formId ? existingFiles[index]?.id : true) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(index)}
                                  disabled={
                                    isServerFile &&
                                    deleteAttachmentMutation.isPending
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm underline disabled:opacity-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}

                  {/* File input for new uploads */}
                  {!field.readonly && (
                    <div className="space-y-2">
                      <Input
                        ref={inputRef}
                        type="file"
                        disabled={
                          field.readonly ||
                          (!field.allowMultiple && hasExistingFile)
                        }
                        multiple={field.allowMultiple}
                        accept={field.acceptedTypes}
                        onChange={handleChange}
                        placeholder={
                          hasExistingFile
                            ? field.allowMultiple
                              ? `Thêm file (${existingFiles.length} file hiện tại)`
                              : "Thay đổi file"
                            : "Chọn file"
                        }
                      />
                      {addAttachmentMutation.isPending && (
                        <div className="text-sm text-blue-600">
                          Đang upload file...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }}
          />
          {field.max && (
            <p className="mt-1 text-xs text-gray-500">
              Dung lượng tối đa: {field.max}MB
            </p>
          )}
          {errorText}
        </div>
      );

    case "LABEL":
      return <div>{commonLabel()}</div>;

    case "EDITOR":
      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: rhfField }) => (
              <TextEditor
                value={rhfField.value ?? ""}
                onChange={(val) => rhfField.onChange(val)}
                placeholder={field.placeholder || field.title}
                readOnly={field.readonly}
                toolbar="basic"
                disabled={field.readonly}
              />
            )}
            disabled={field.readonly}
          />
          {errorText}
        </div>
      );

    case "TABLE":
      // Parse fieldConfig from string if needed
      const tableConfig = (field as any).fieldConfig;
      let parsedConfig: any = field.fieldConfig;

      if (typeof tableConfig === "string") {
        try {
          parsedConfig = JSON.parse(tableConfig);
        } catch (e) {
          console.warn("Failed to parse table config for field:", field.name);
          parsedConfig = {};
        }
      }

      // Prioritize field.tableColumns over parsedConfig.tableColumns
      const tableColumns =
        field.tableColumns ||
        (parsedConfig &&
        typeof parsedConfig === "object" &&
        parsedConfig.tableColumns
          ? parsedConfig.tableColumns
          : []);
      const tableRows =
        parsedConfig &&
        typeof parsedConfig === "object" &&
        parsedConfig.tableRows
          ? parsedConfig.tableRows
          : field.tableRows || [];

      // Check if field is editable
      const isEditable =
        parsedConfig?.editable === true || (field as any).editable === true;

      return (
        <div>
          {commonLabel({})}
          <Controller
            name={name}
            control={control}
            render={({ field: rhfField }) => {
              // Initialize table data from tableRows if not present
              const tableData = rhfField.value ?? {
                rows: tableRows.map((row: any) => {
                  const rowObj: any = {};
                  if (Array.isArray(row)) {
                    // If row is an array, use array values
                    row.forEach((value, idx) => {
                      rowObj[idx] = value;
                    });
                  } else {
                    // If row is a single value, put it in column 0
                    rowObj[0] = row;
                  }
                  return rowObj;
                }),
              };

              const updateCellData = (
                rowIdx: number,
                colIdx: number,
                value: any
              ) => {
                const newData = { ...tableData };
                if (!newData.rows) newData.rows = [];
                if (!newData.rows[rowIdx]) newData.rows[rowIdx] = {};

                // Use column name if available, otherwise use index
                const colName = tableColumns[colIdx]?.name || colIdx;
                newData.rows[rowIdx][colName] = value;

                rhfField.onChange(newData);
              };

              // Helper to add multiple table rows from textarea input
              const addMultipleTableRows = (
                lines: string[],
                currentRowIdx: number
              ) => {
                if (!lines.length) return;

                const newData = { ...tableData };
                if (!newData.rows) newData.rows = [];

                // Replace current row and add additional rows from lines
                const newRows = lines.map((line, index) => {
                  const newRow: any = {};
                  tableColumns.forEach((col: any, colIdx: number) => {
                    const colName = col.name || colIdx;
                    if (colIdx === 0) {
                      // First column gets the line content
                      newRow[colName] = [line];
                    } else {
                      // Other columns get default values
                      switch (col.type) {
                        case "checkbox":
                          newRow[colName] = false;
                          break;
                        case "select":
                          newRow[colName] = "";
                          break;
                        case "date":
                          newRow[colName] = new Date()
                            .toISOString()
                            .split("T")[0];
                          break;
                        case "datetime":
                          newRow[colName] = formatDateTimeLocal(new Date());
                          break;
                        case "text":
                        default:
                          newRow[colName] = [""];
                          break;
                      }
                    }
                  });
                  return newRow;
                });

                // Replace current row and add new rows
                newData.rows.splice(currentRowIdx, 1, ...newRows);

                rhfField.onChange(newData);
              };

              const addTableRow = (insertAfterIndex?: number) => {
                const newData = { ...tableData };
                if (!newData.rows) newData.rows = [];

                const newRow: any = {};
                // Initialize empty row with all columns using column names
                tableColumns.forEach((col: any, idx: number) => {
                  const colName = col.name || idx;
                  newRow[colName] = "";
                });
                if (tableColumns.length === 0) {
                  newRow[0] = "";
                }

                if (typeof insertAfterIndex === "number") {
                  newData.rows.splice(insertAfterIndex + 1, 0, newRow);
                } else {
                  newData.rows.push(newRow);
                }

                rhfField.onChange(newData);
              };

              const deleteTableRow = (rowIdx: number) => {
                const newData = { ...tableData };
                if (!newData.rows) return;

                // Only delete if there's more than 1 row
                if (newData.rows.length > 1) {
                  newData.rows.splice(rowIdx, 1);
                  rhfField.onChange(newData);
                }
                // If only 1 row, don't delete - let user keep at least one row
              };

              // Cell-level row operations for allowAddDeleteRowsCell
              const addCellRow = (
                rowIdx: number,
                colIdx: number,
                column: any
              ) => {
                const newData = { ...tableData };
                if (!newData.rows) newData.rows = [];

                const currentCell = newData.rows[rowIdx][column.name || colIdx];
                const cellArray = Array.isArray(currentCell)
                  ? currentCell
                  : currentCell
                    ? [currentCell]
                    : [];

                // Add empty row to cell
                cellArray.push("");
                newData.rows[rowIdx][column.name || colIdx] = cellArray;

                rhfField.onChange(newData);
              };

              const deleteCellRow = (
                rowIdx: number,
                colIdx: number,
                cellRowIdx: number,
                column: any
              ) => {
                const newData = { ...tableData };
                if (!newData.rows) return;

                const currentCell = newData.rows[rowIdx][column.name || colIdx];
                const cellArray = Array.isArray(currentCell)
                  ? currentCell
                  : currentCell
                    ? [currentCell]
                    : [];

                // Remove specific row from cell
                if (cellArray.length > 1) {
                  cellArray.splice(cellRowIdx, 1);
                } else {
                  // If only one row, clear the cell
                  newData.rows[rowIdx][column.name || colIdx] = "";
                }

                rhfField.onChange(newData);
              };

              return (
                <div className="border border-[#d1d5db] rounded">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-[#d1d5db]">
                        {tableColumns.map((col: any, idx: number) => (
                          <th
                            key={col.name || idx}
                            className="px-3 py-2 text-left font-medium text-gray-700 border-r border-[#d1d5db] last:border-r-0"
                          >
                            {col.label || `Cột ${idx + 1}`}
                          </th>
                        ))}
                        {tableColumns.length === 0 && (
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Cột
                          </th>
                        )}
                        {isEditable && !field.readonly && (
                          <th className="px-3 py-2 text-center font-medium text-gray-700 w-[100px] border-l border-[#d1d5db]">
                            Thao tác
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(tableData.rows || tableRows).map(
                        (row: any, rowIdx: number) => (
                          <tr
                            key={rowIdx}
                            className="border-b border-[#d1d5db] last:border-b-0"
                          >
                            {tableColumns.map((col: any, colIdx: number) => {
                              // Try to get cell value by column name first, then fallback to index
                              const colName = col.name || colIdx;
                              const cellValue =
                                tableData.rows?.[rowIdx]?.[colName] !==
                                undefined
                                  ? tableData.rows?.[rowIdx]?.[colName]
                                  : tableData.rows?.[rowIdx]?.[colIdx];

                              const stringifyCell = (v: any): string => {
                                if (Array.isArray(v)) {
                                  // Handle array of values - join with newlines for display
                                  return v
                                    .map((item) => {
                                      if (
                                        typeof item === "object" &&
                                        item !== null
                                      ) {
                                        // Handle objects by extracting common properties
                                        return (
                                          item.name ||
                                          item.label ||
                                          item.id ||
                                          JSON.stringify(item)
                                        );
                                      }
                                      return String(item || "");
                                    })
                                    .join("\n");
                                }
                                if (typeof v === "object" && v !== null) {
                                  // Handle single object values
                                  return (
                                    v.name ||
                                    v.label ||
                                    v.id ||
                                    JSON.stringify(v)
                                  );
                                }
                                return String(v || "");
                              };

                              const parseLinesClean = (s: string): string[] =>
                                s
                                  .split(/\r?\n/)
                                  .map((t) => t.trim())
                                  .filter((t) => t !== "");

                              // Get select state for this cell
                              const cellKey = `${rowIdx}-${colIdx}`;
                              const selectSearch =
                                tableSelectSearch[cellKey] || "";
                              const showSuggestions =
                                tableShowSuggestions[cellKey] || false;
                              const hasStartedEditing =
                                tableHasStartedEditing[cellKey] || false;
                              const hasCleared =
                                tableHasCleared[cellKey] || false;
                              const isClearing =
                                tableIsClearing[cellKey] || false;

                              // Create a unique key for FilterField to force re-render when cleared
                              const filterFieldKey = `${cellKey}-${isClearing ? "clearing" : "normal"}`;

                              const updateTableSelectSearch = (
                                value: string
                              ) => {
                                setTableSelectSearch((prev) => ({
                                  ...prev,
                                  [cellKey]: value,
                                }));
                              };
                              const updateTableShowSuggestions = (
                                value: boolean
                              ) => {
                                setTableShowSuggestions((prev) => ({
                                  ...prev,
                                  [cellKey]: value,
                                }));
                              };
                              const updateTableHasStartedEditing = (
                                value: boolean
                              ) => {
                                setTableHasStartedEditing((prev) => ({
                                  ...prev,
                                  [cellKey]: value,
                                }));
                              };
                              const updateTableHasCleared = (
                                value: boolean
                              ) => {
                                setTableHasCleared((prev) => ({
                                  ...prev,
                                  [cellKey]: value,
                                }));
                              };
                              const updateTableIsClearing = (
                                value: boolean
                              ) => {
                                setTableIsClearing((prev) => ({
                                  ...prev,
                                  [cellKey]: value,
                                }));
                              };

                              // Get options for select column - prioritize API over static options
                              const getColumnOptions = (): Array<{
                                id: string;
                                name: string;
                              }> => {
                                const columnKey = `${col.apiId}-${col.name || "unnamed"}`;

                                // If API options are available, use them
                                if (
                                  tableColumnApiOptions[columnKey] &&
                                  tableColumnApiOptions[columnKey].length > 0
                                ) {
                                  const apiOptions =
                                    tableColumnApiOptions[columnKey];

                                  return apiOptions.map(
                                    (option: any, index: number) => {
                                      // Handle different API response formats
                                      if (typeof option === "string") {
                                        return { id: option, name: option };
                                      } else if (
                                        typeof option === "object" &&
                                        option !== null
                                      ) {
                                        return {
                                          id:
                                            option.name ||
                                            option.label ||
                                            option.value ||
                                            option.title ||
                                            `Option ${index + 1}`,
                                          name:
                                            option.name ||
                                            option.label ||
                                            option.value ||
                                            option.title ||
                                            `Option ${index + 1}`,
                                        };
                                      } else {
                                        return {
                                          id: String(
                                            option || `Option ${index + 1}`
                                          ),
                                          name: String(
                                            option || `Option ${index + 1}`
                                          ),
                                        };
                                      }
                                    }
                                  );
                                }

                                // Fallback to static options
                                if (col.options && Array.isArray(col.options)) {
                                  return col.options.map(
                                    (option: any, index: number) => {
                                      if (typeof option === "string") {
                                        return { id: option, name: option };
                                      } else if (
                                        typeof option === "object" &&
                                        option !== null
                                      ) {
                                        return {
                                          id:
                                            option.name ||
                                            option.label ||
                                            option.value ||
                                            `Static ${index + 1}`,
                                          name:
                                            option.name ||
                                            option.label ||
                                            option.value ||
                                            `Static ${index + 1}`,
                                        };
                                      } else {
                                        return {
                                          id: String(
                                            option || `Static ${index + 1}`
                                          ),
                                          name: String(
                                            option || `Static ${index + 1}`
                                          ),
                                        };
                                      }
                                    }
                                  );
                                }

                                return [];
                              };

                              const options = getColumnOptions();

                              const isLoadingColumnOptions =
                                tableColumnLoadingStates[
                                  `${col.apiId}-${col.name || "unnamed"}`
                                ] || false;

                              // Render cell content based on column type
                              const renderCellContent = () => {
                                switch (col.type) {
                                  case "checkbox":
                                    return (
                                      <Checkbox
                                        checked={!!cellValue}
                                        onCheckedChange={(val) =>
                                          updateCellData(rowIdx, colIdx, [
                                            Boolean(val),
                                          ])
                                        }
                                        disabled={field.readonly}
                                      />
                                    );

                                  case "select":
                                    if (isEditable) {
                                      if (isLoadingColumnOptions) {
                                        return (
                                          <div className="w-full min-h-8 flex items-center justify-center text-gray-500 text-sm">
                                            Đang tải options...
                                          </div>
                                        );
                                      }

                                      const selectedOption = options.find(
                                        (opt) =>
                                          opt.id === stringifyCell(cellValue)
                                      );

                                      // Use selectState.showSuggestions directly

                                      // Determine input value for display and filtering
                                      const inputValue = hasCleared
                                        ? selectSearch
                                        : hasStartedEditing ||
                                            selectSearch !== ""
                                          ? selectSearch
                                          : selectedOption?.name || "";

                                      // Filter options based on input value
                                      const filteredOptions =
                                        inputValue === ""
                                          ? options // Show all options when input is empty
                                          : options.filter((opt) =>
                                              opt.name
                                                .toLowerCase()
                                                .includes(
                                                  inputValue.toLowerCase()
                                                )
                                            );
                                      return (
                                        <div className="flex items-center gap-2 filter-field-container">
                                          <div className="flex-1">
                                            <FilterField
                                              key={filterFieldKey}
                                              label=""
                                              field={`${name}-table-${rowIdx}-${colIdx}`}
                                              value={inputValue}
                                              placeholder=""
                                              type="text"
                                              withSuggestions={true}
                                              showSuggestions={showSuggestions}
                                              disabled={field.readonly}
                                              suggestions={filteredOptions.map(
                                                (opt) => opt.name
                                              )}
                                              onChange={(_, v) => {
                                                updateTableSelectSearch(v);
                                                if (v === "") {
                                                  updateTableHasCleared(true);
                                                  updateCellData(
                                                    rowIdx,
                                                    colIdx,
                                                    [""]
                                                  );
                                                  // Show suggestions when clearing by typing
                                                  updateTableShowSuggestions(
                                                    true
                                                  );
                                                } else {
                                                  // Show suggestions when typing
                                                  updateTableShowSuggestions(
                                                    true
                                                  );
                                                  if (!hasStartedEditing) {
                                                    updateTableHasStartedEditing(
                                                      true
                                                    );
                                                  }
                                                }
                                              }}
                                              onFocus={() => {
                                                updateTableShowSuggestions(
                                                  true
                                                );
                                              }}
                                              onBlur={() => {
                                                // Don't close suggestions immediately if we're clearing
                                                if (!isClearing) {
                                                  setTimeout(() => {
                                                    updateTableShowSuggestions(
                                                      false
                                                    );
                                                  }, 200);
                                                }
                                              }}
                                              onClear={(_) => {
                                                updateTableSelectSearch("");
                                                updateTableHasCleared(true);
                                                updateTableIsClearing(true);
                                                updateTableShowSuggestions(
                                                  false
                                                );
                                                // Clear cell data
                                                updateCellData(rowIdx, colIdx, [
                                                  "",
                                                ]);
                                                // Reset clearing flag after a short delay
                                                setTimeout(
                                                  () =>
                                                    updateTableIsClearing(
                                                      false
                                                    ),
                                                  100
                                                );
                                              }}
                                              onSelectSuggestion={(_, v) => {
                                                const selectedOption =
                                                  options.find(
                                                    (opt) => opt.name === v
                                                  );
                                                if (selectedOption) {
                                                  updateCellData(
                                                    rowIdx,
                                                    colIdx,
                                                    [selectedOption.id]
                                                  );
                                                }
                                                updateTableSelectSearch(v);
                                                updateTableHasStartedEditing(
                                                  false
                                                );
                                                updateTableHasCleared(false);
                                                updateTableShowSuggestions(
                                                  false
                                                );
                                              }}
                                              showClear={true}
                                              className="h-8 text-sm"
                                            />
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      const options = getColumnOptions();
                                      const selectedOption = options.find(
                                        (opt) =>
                                          opt.id === stringifyCell(cellValue)
                                      );
                                      return (
                                        <span className="px-3 py-1 text-sm">
                                          {selectedOption?.name ||
                                            stringifyCell(cellValue)}
                                        </span>
                                      );
                                    }

                                  case "date":
                                    if (isEditable) {
                                      const selectedDate = cellValue
                                        ? parseDateString(cellValue.toString())
                                        : null;

                                      return (
                                        <CustomDatePicker
                                          selected={selectedDate}
                                          onChange={(date: Date | null) => {
                                            const dateStr = date
                                              ? formatDateWithFormat(
                                                  date,
                                                  col.dateFormat || "yyyy-mm-dd"
                                                )
                                              : "";
                                            updateCellData(rowIdx, colIdx, [
                                              dateStr,
                                            ]);
                                          }}
                                          placeholder=""
                                          readOnly={field.readonly}
                                          className="w-full h-8"
                                          dateFormat={col.dateFormat}
                                        />
                                      );
                                    } else {
                                      // Format date for display
                                      const displayValue = cellValue
                                        ? (() => {
                                            const date = parseDateString(
                                              cellValue.toString()
                                            );
                                            return date
                                              ? formatDateWithFormat(
                                                  date,
                                                  col.dateFormat || "yyyy-mm-dd"
                                                )
                                              : cellValue;
                                          })()
                                        : "";
                                      return (
                                        <span className="px-3 py-1 text-sm">
                                          {displayValue}
                                        </span>
                                      );
                                    }

                                  case "datetime":
                                    if (isEditable) {
                                      const current = cellValue
                                        ? parseDateTimeString(
                                            cellValue.toString()
                                          )
                                        : null;

                                      return (
                                        <div className="grid grid-cols-2 gap-1">
                                          <CustomDatePicker
                                            selected={current}
                                            onChange={(date: Date | null) => {
                                              if (!date) {
                                                updateCellData(rowIdx, colIdx, [
                                                  "",
                                                ]);
                                                return;
                                              }
                                              const base =
                                                current || new Date();
                                              const merged = new Date(
                                                date.getFullYear(),
                                                date.getMonth(),
                                                date.getDate(),
                                                base.getHours(),
                                                base.getMinutes()
                                              );
                                              updateCellData(rowIdx, colIdx, [
                                                formatDateTimeLocal(merged),
                                              ]);
                                            }}
                                            placeholder=""
                                            readOnly={field.readonly}
                                            className="w-full h-8"
                                            dateFormat={col.dateFormat}
                                          />
                                          <CustomTimePicker
                                            selected={current}
                                            onChange={(time: Date | null) => {
                                              if (!time) {
                                                updateCellData(rowIdx, colIdx, [
                                                  "",
                                                ]);
                                                return;
                                              }
                                              const base =
                                                current || new Date();
                                              const merged = new Date(
                                                base.getFullYear(),
                                                base.getMonth(),
                                                base.getDate(),
                                                time.getHours(),
                                                time.getMinutes()
                                              );
                                              updateCellData(rowIdx, colIdx, [
                                                formatDateTimeLocal(merged),
                                              ]);
                                            }}
                                            placeholder=""
                                            className="w-full h-8"
                                            disabled={field.readonly}
                                            dateFormat={col.dateFormat}
                                          />
                                        </div>
                                      );
                                    } else {
                                      // Format datetime for display
                                      const displayValue = cellValue
                                        ? (() => {
                                            const date = parseDateTimeString(
                                              cellValue.toString()
                                            );
                                            return date
                                              ? formatDateWithFormat(
                                                  date,
                                                  col.dateFormat ||
                                                    "yyyy-mm-dd HH:MM"
                                                )
                                              : cellValue;
                                          })()
                                        : "";
                                      return (
                                        <span className="px-3 py-1 text-sm">
                                          {displayValue}
                                        </span>
                                      );
                                    }

                                  case "text":
                                  default:
                                    if (isEditable) {
                                      return (
                                        <Input
                                          type="text"
                                          value={stringifyCell(cellValue)}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            // Check if this is multi-line content
                                            if (value.includes("\n")) {
                                              // Split into array for multi-line content
                                              const lines = value
                                                .split("\n")
                                                .filter(
                                                  (line) => line.trim() !== ""
                                                );
                                              updateCellData(
                                                rowIdx,
                                                colIdx,
                                                lines.length > 0 ? lines : [""]
                                              );
                                            } else {
                                              // For single line, still save as array to maintain consistency
                                              updateCellData(rowIdx, colIdx, [
                                                value,
                                              ]);
                                            }
                                          }}
                                          disabled={field.readonly}
                                          placeholder=""
                                          className="w-full px-3 py-1 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                      );
                                    } else {
                                      return (
                                        <div className="px-2 py-1 text-sm whitespace-pre-line">
                                          {stringifyCell(cellValue)}
                                        </div>
                                      );
                                    }
                                }
                              };

                              // Check if this column should show add/delete actions
                              const shouldShowActions =
                                col.allowAddDeleteRowsCell &&
                                isEditable &&
                                !field.readonly;

                              // Check if cell has array value or multi-line content (for display purposes)
                              const hasArrayValue =
                                Array.isArray(cellValue) &&
                                cellValue.length > 0;

                              // Check if cell value contains multi-line content
                              const hasMultiLineContent = () => {
                                const cellStr = stringifyCell(cellValue);
                                return (
                                  cellStr.includes("\n") &&
                                  cellStr.trim().length > 0
                                );
                              };

                              // Render cell with multiple rows support
                              const renderCellWithRows = () => {
                                // Handle multi-line content by splitting into lines
                                let cellArray: any[] = [];

                                if (Array.isArray(cellValue)) {
                                  cellArray = cellValue;
                                } else if (cellValue) {
                                  const cellStr = stringifyCell(cellValue);
                                  if (cellStr.includes("\n")) {
                                    // Split multi-line content into individual lines
                                    cellArray = cellStr
                                      .split("\n")
                                      .filter((line) => line.trim() !== "");
                                  } else {
                                    cellArray = [cellValue];
                                  }
                                } else {
                                  cellArray = [""];
                                }

                                return (
                                  <div className="w-full">
                                    {cellArray.map((value, cellRowIdx) => {
                                      // Create unique key for each cell row to avoid state conflicts
                                      const cellRowKey = `${rowIdx}-${colIdx}-${cellRowIdx}`;
                                      const selectSearch =
                                        tableSelectSearch[cellRowKey] || "";
                                      const showSuggestions =
                                        tableShowSuggestions[cellRowKey] ||
                                        false;
                                      const hasStartedEditing =
                                        tableHasStartedEditing[cellRowKey] ||
                                        false;
                                      const hasCleared =
                                        tableHasCleared[cellRowKey] || false;
                                      const isClearing =
                                        tableIsClearing[cellRowKey] || false;

                                      const updateTableSelectSearch = (
                                        value: string
                                      ) => {
                                        setTableSelectSearch((prev) => ({
                                          ...prev,
                                          [cellRowKey]: value,
                                        }));
                                      };
                                      const updateTableShowSuggestions = (
                                        value: boolean
                                      ) => {
                                        setTableShowSuggestions((prev) => ({
                                          ...prev,
                                          [cellRowKey]: value,
                                        }));
                                      };
                                      const updateTableHasStartedEditing = (
                                        value: boolean
                                      ) => {
                                        setTableHasStartedEditing((prev) => ({
                                          ...prev,
                                          [cellRowKey]: value,
                                        }));
                                      };
                                      const updateTableHasCleared = (
                                        value: boolean
                                      ) => {
                                        setTableHasCleared((prev) => ({
                                          ...prev,
                                          [cellRowKey]: value,
                                        }));
                                      };
                                      const updateTableIsClearing = (
                                        value: boolean
                                      ) => {
                                        setTableIsClearing((prev) => ({
                                          ...prev,
                                          [cellRowKey]: value,
                                        }));
                                      };

                                      // Create a unique key for FilterField to force re-render when cleared
                                      const filterFieldKey = `${cellRowKey}-${isClearing ? "clearing" : "normal"}`;

                                      return (
                                        <div
                                          key={cellRowIdx}
                                          className="flex items-center gap-1 mb-1 last:mb-0"
                                        >
                                          {shouldShowActions &&
                                          cellRowIdx === 0 ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                addCellRow(rowIdx, colIdx, col)
                                              }
                                              className="p-1 w-5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                              title="Thêm dòng"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                          ) : (
                                            <div className="w-5"></div>
                                          )}
                                          <div className="flex-1">
                                            {col.type === "text" ||
                                            !col.type ? (
                                              isEditable ? (
                                                <Input
                                                  type="text"
                                                  value={stringifyCell(value)}
                                                  onChange={(e) => {
                                                    const newCellArray = [
                                                      ...cellArray,
                                                    ];
                                                    newCellArray[cellRowIdx] =
                                                      e.target.value;
                                                    updateCellData(
                                                      rowIdx,
                                                      colIdx,
                                                      newCellArray
                                                    );
                                                  }}
                                                  disabled={field.readonly}
                                                  placeholder=""
                                                  className="w-full px-2 py-1 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                              ) : (
                                                <div className="px-2 py-1 text-sm whitespace-pre-line">
                                                  {stringifyCell(value)}
                                                </div>
                                              )
                                            ) : (
                                              // For other types, render the original content with unique state
                                              <div className="px-2 py-1">
                                                {(() => {
                                                  switch (col.type) {
                                                    case "select":
                                                      if (isEditable) {
                                                        if (
                                                          isLoadingColumnOptions
                                                        ) {
                                                          return (
                                                            <div className="w-full min-h-8 flex items-center justify-center text-gray-500 text-sm">
                                                              Đang tải
                                                              options...
                                                            </div>
                                                          );
                                                        }

                                                        const selectedOption =
                                                          options.find(
                                                            (opt) =>
                                                              opt.id ===
                                                              stringifyCell(
                                                                value
                                                              )
                                                          );

                                                        // Determine input value for display and filtering
                                                        const inputValue =
                                                          hasCleared
                                                            ? selectSearch
                                                            : hasStartedEditing ||
                                                                selectSearch !==
                                                                  ""
                                                              ? selectSearch
                                                              : selectedOption?.name ||
                                                                "";

                                                        // Filter options based on input value
                                                        const filteredOptions =
                                                          inputValue === ""
                                                            ? options // Show all options when input is empty
                                                            : options.filter(
                                                                (opt) =>
                                                                  opt.name
                                                                    .toLowerCase()
                                                                    .includes(
                                                                      inputValue.toLowerCase()
                                                                    )
                                                              );
                                                        return (
                                                          <div className="flex items-center gap-2 filter-field-container">
                                                            <div className="flex-1">
                                                              <FilterField
                                                                key={
                                                                  filterFieldKey
                                                                }
                                                                label=""
                                                                field={
                                                                  cellRowKey
                                                                }
                                                                value={
                                                                  inputValue
                                                                }
                                                                withSuggestions={
                                                                  true
                                                                }
                                                                showSuggestions={
                                                                  showSuggestions
                                                                }
                                                                disabled={
                                                                  field.readonly
                                                                }
                                                                suggestions={filteredOptions.map(
                                                                  (opt) =>
                                                                    opt.name
                                                                )}
                                                                onChange={(
                                                                  _,
                                                                  v
                                                                ) => {
                                                                  updateTableSelectSearch(
                                                                    v
                                                                  );
                                                                  if (
                                                                    v === ""
                                                                  ) {
                                                                    const newCellArray =
                                                                      [
                                                                        ...cellArray,
                                                                      ];
                                                                    newCellArray[
                                                                      cellRowIdx
                                                                    ] = "";
                                                                    updateCellData(
                                                                      rowIdx,
                                                                      colIdx,
                                                                      newCellArray
                                                                    );
                                                                    // Show suggestions when clearing by typing
                                                                    updateTableShowSuggestions(
                                                                      true
                                                                    );
                                                                  } else {
                                                                    // Show suggestions when typing
                                                                    updateTableShowSuggestions(
                                                                      true
                                                                    );
                                                                    if (
                                                                      !hasStartedEditing
                                                                    ) {
                                                                      updateTableHasStartedEditing(
                                                                        true
                                                                      );
                                                                    }
                                                                  }
                                                                }}
                                                                onFocus={() => {
                                                                  updateTableShowSuggestions(
                                                                    true
                                                                  );
                                                                }}
                                                                onBlur={() => {
                                                                  // Don't close suggestions immediately if we're clearing
                                                                  if (
                                                                    isClearing
                                                                  ) {
                                                                    setTimeout(
                                                                      () => {
                                                                        updateTableShowSuggestions(
                                                                          false
                                                                        );
                                                                      },
                                                                      200
                                                                    );
                                                                  }
                                                                }}
                                                                onClear={() => {
                                                                  updateTableSelectSearch(
                                                                    ""
                                                                  );
                                                                  updateTableHasCleared(
                                                                    true
                                                                  );
                                                                  updateTableIsClearing(
                                                                    true
                                                                  );
                                                                  updateTableShowSuggestions(
                                                                    false
                                                                  );
                                                                  // Clear cell data
                                                                  const newCellArray =
                                                                    [
                                                                      ...cellArray,
                                                                    ];
                                                                  newCellArray[
                                                                    cellRowIdx
                                                                  ] = "";
                                                                  updateCellData(
                                                                    rowIdx,
                                                                    colIdx,
                                                                    newCellArray
                                                                  );
                                                                  // Reset clearing flag after a short delay
                                                                  setTimeout(
                                                                    () =>
                                                                      updateTableIsClearing(
                                                                        false
                                                                      ),
                                                                    100
                                                                  );
                                                                }}
                                                                onSelectSuggestion={(
                                                                  _,
                                                                  v
                                                                ) => {
                                                                  const selectedOption =
                                                                    options.find(
                                                                      (opt) =>
                                                                        opt.name ===
                                                                        v
                                                                    );
                                                                  if (
                                                                    selectedOption
                                                                  ) {
                                                                    const newCellArray =
                                                                      [
                                                                        ...cellArray,
                                                                      ];
                                                                    newCellArray[
                                                                      cellRowIdx
                                                                    ] =
                                                                      selectedOption.id;
                                                                    updateCellData(
                                                                      rowIdx,
                                                                      colIdx,
                                                                      newCellArray
                                                                    );
                                                                  }
                                                                  updateTableSelectSearch(
                                                                    v
                                                                  );
                                                                  updateTableHasStartedEditing(
                                                                    false
                                                                  );
                                                                  updateTableHasCleared(
                                                                    false
                                                                  );
                                                                  updateTableShowSuggestions(
                                                                    false
                                                                  );
                                                                }}
                                                                showClear={true}
                                                                className="h-8 text-sm"
                                                              />
                                                            </div>
                                                          </div>
                                                        );
                                                      } else {
                                                        const options =
                                                          getColumnOptions();
                                                        // Handle multi-line values for select fields
                                                        const cellValueStr =
                                                          stringifyCell(value);
                                                        const selectedOption =
                                                          options.find(
                                                            (opt) =>
                                                              opt.id ===
                                                              cellValueStr
                                                          );
                                                        return (
                                                          <div className="px-2 py-1 text-sm whitespace-pre-line">
                                                            {selectedOption?.name ||
                                                              cellValueStr}
                                                          </div>
                                                        );
                                                      }
                                                    default:
                                                      return renderCellContent();
                                                  }
                                                })()}
                                              </div>
                                            )}
                                          </div>
                                          {shouldShowActions &&
                                            cellArray.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  deleteCellRow(
                                                    rowIdx,
                                                    colIdx,
                                                    cellRowIdx,
                                                    col
                                                  )
                                                }
                                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                title="Xóa dòng"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              };

                              // Determine if we should use multi-row rendering
                              const shouldUseMultiRowRendering =
                                hasArrayValue ||
                                shouldShowActions ||
                                hasMultiLineContent();

                              // Debug logging
                              console.log(
                                "Multi-row Decision - colName:",
                                tableColumns[colIdx]?.name || colIdx,
                                "hasArrayValue:",
                                hasArrayValue,
                                "shouldShowActions:",
                                shouldShowActions,
                                "hasMultiLineContent:",
                                hasMultiLineContent(),
                                "shouldUseMultiRowRendering:",
                                shouldUseMultiRowRendering
                              );

                              if (shouldUseMultiRowRendering) {
                                return (
                                  <td
                                    key={col.name || colIdx}
                                    className="border-r border-[#d1d5db] last:border-r-0 p-1"
                                  >
                                    {renderCellWithRows()}
                                  </td>
                                );
                              } else {
                                return (
                                  <td
                                    key={col.name || colIdx}
                                    className="border-r border-[#d1d5db] last:border-r-0 px-3 py-2"
                                  >
                                    {renderCellContent()}
                                  </td>
                                );
                              }
                            })}
                            {tableColumns.length === 0 && (
                              <td className="px-3 py-2">
                                {(() => {
                                  const raw = tableData.rows?.[rowIdx]?.[0];
                                  const stringifyCell = (v: any): string => {
                                    if (Array.isArray(v)) {
                                      // Handle array of values - join with newlines for display
                                      return v
                                        .map((item) => {
                                          if (
                                            typeof item === "object" &&
                                            item !== null
                                          ) {
                                            // Handle objects by extracting common properties
                                            return (
                                              item.name ||
                                              item.label ||
                                              item.id ||
                                              JSON.stringify(item)
                                            );
                                          }
                                          return String(item || "");
                                        })
                                        .join("\n");
                                    }
                                    if (typeof v === "object" && v !== null) {
                                      // Handle single object values
                                      return (
                                        v.name ||
                                        v.label ||
                                        v.id ||
                                        JSON.stringify(v)
                                      );
                                    }
                                    return String(v || "");
                                  };
                                  const parseLinesClean = (
                                    s: string
                                  ): string[] =>
                                    s
                                      .split(/\r?\n/)
                                      .map((t) => t.trim())
                                      .filter((t) => t !== "");
                                  return isEditable ? (
                                    <Textarea
                                      value={stringifyCell(raw)}
                                      onChange={(e) =>
                                        updateCellData(
                                          rowIdx,
                                          0,
                                          parseLinesClean(e.target.value)
                                        )
                                      }
                                      onBlur={(e) =>
                                        updateCellData(
                                          rowIdx,
                                          0,
                                          parseLinesClean(e.target.value)
                                        )
                                      }
                                      rows={1}
                                      disabled={field.readonly}
                                      placeholder=""
                                      className="text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                                    />
                                  ) : (
                                    <div className="px-2 py-1 text-sm whitespace-pre-line">
                                      {stringifyCell(raw)}
                                    </div>
                                  );
                                })()}
                              </td>
                            )}
                            {isEditable && !field.readonly && (
                              <td className="px-3 py-2 border-l border-[#d1d5db]">
                                <div className="flex justify-center gap-1">
                                  <button
                                    type="button"
                                    className="w-6 h-6 flex items-center justify-center rounded bg-[#17c495] text-white hover:bg-[#15b085] transition-colors"
                                    onClick={() => addTableRow(rowIdx)}
                                    disabled={field.readonly}
                                    title="Thêm hàng sau"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                      (tableData.rows?.length ||
                                        tableRows.length) <= 1
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                    }`}
                                    onClick={() => deleteTableRow(rowIdx)}
                                    disabled={
                                      field.readonly ||
                                      (tableData.rows?.length ||
                                        tableRows.length) <= 1
                                    }
                                    title={
                                      (tableData.rows?.length ||
                                        tableRows.length) <= 1
                                        ? "Phải giữ ít nhất 1 hàng"
                                        : "Xóa hàng"
                                    }
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      )}
                      {(tableData.rows?.length || tableRows.length) === 0 && (
                        <tr>
                          <td
                            colSpan={
                              isEditable
                                ? (tableColumns.length || 1) + 1
                                : tableColumns.length || 1
                            }
                            className="px-3 py-4 text-center text-gray-400"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>Chưa có dữ liệu nào</span>
                              {isEditable && (
                                <button
                                  type="button"
                                  className="w-6 h-6 flex items-center justify-center rounded bg-[#17c495] text-white hover:bg-[#15b085] transition-colors"
                                  onClick={() => addTableRow()}
                                  disabled={field.readonly}
                                  title="Thêm hàng"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            }}
          />
          {errorText}
        </div>
      );

    default:
      return null;
  }
}
