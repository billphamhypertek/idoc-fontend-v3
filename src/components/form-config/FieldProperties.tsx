"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormField } from "@/components/form-config/types";
import { Plus, Trash2 } from "lucide-react";
import { CustomDatePicker, CustomTimePicker } from "@/components/ui/calendar";
import { Checkbox } from "../ui/checkbox";
import {
  FORM_FIELD_TYPE_SPECIFIC_CONFIG,
  type TypeSpecificPropertyKey,
} from "@/definitions/constants/formConfig.constant";
import {
  useGetApiEndpointListQuery,
  useGetApiPreviewData,
} from "@/hooks/data/form-config.data";
import { formatDateYMD } from "@/utils/datetime.utils";

interface FieldPropertiesProps {
  field: FormField;
  onChange: (fieldId: string, updates: Partial<FormField>) => void;
  formIsUse?: boolean;
}

export default function FieldProperties({
  field,
  onChange,
  formIsUse = false,
}: FieldPropertiesProps) {
  // Local state for options text to allow free typing
  const [optionsText, setOptionsText] = useState(
    field.options?.join("\n") || ""
  );
  // Local state for table column options text
  const [tableColumnOptionsText, setTableColumnOptionsText] = useState<{
    [key: number]: string;
  }>({});
  // Local state for table rows text to allow free typing
  const [tableRowsText, setTableRowsText] = useState(
    field.tableRows
      ?.map((row) =>
        Object.keys(row)
          .filter(
            (key) =>
              row[key] !== undefined && row[key] !== null && row[key] !== ""
          )
          .map((key) => `${key}: ${row[key]}`)
          .join(", ")
      )
      .join("\n") || ""
  );
  // Fetch API endpoint list
  const { data: apiEndpointData } = useGetApiEndpointListQuery();
  const apiList = apiEndpointData?.objList || [];
  // Mutation to fetch preview data
  const previewDataMutation = useGetApiPreviewData();

  // When apiId changes, fetch preview data
  useEffect(() => {
    if (field.apiId) {
      const selectedApi = apiList.find((api) => api.id === field.apiId);
      if (selectedApi?.api) {
        // Load preview data from the selected API
        previewDataMutation.mutate(
          { apiUrl: selectedApi.api },
          {
            onSuccess: (data) => {
              const options = data.slice(0, 5).map((item) => item.name);
              onChange(field.id, {
                options: options.length > 0 ? options : [],
              });
            },
            onError: (error) => {
              console.error("Error loading preview data:", error);
            },
          }
        );
      }
    }
  }, [field.apiId]);
  // Sync optionsText when field changes
  useEffect(() => {
    setOptionsText(field.options?.join("\n") || "");
  }, [field.id, field.options]);

  // Sync table column options text when field changes
  useEffect(() => {
    const newTableColumnOptionsText: { [key: number]: string } = {};
    field.tableColumns?.forEach((col, idx) => {
      if (col.type === "select") {
        newTableColumnOptionsText[idx] = col.options?.join("\n") || "";
      }
    });
    setTableColumnOptionsText(newTableColumnOptionsText);
  }, [field.tableColumns]);

  // Sync table rows text when field changes
  useEffect(() => {
    const newTableRowsText =
      field.tableRows
        ?.map((row) =>
          Object.keys(row)
            .filter(
              (key) =>
                row[key] !== undefined && row[key] !== null && row[key] !== ""
            )
            .map((key) => `${key}: ${row[key]}`)
            .join(", ")
        )
        .join("\n") || "";
    setTableRowsText(newTableRowsText);
  }, [field.id, field.tableRows]);

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

  // Config các thuộc tính nâng cao cho từng type
  const typeSpecificConfig = FORM_FIELD_TYPE_SPECIFIC_CONFIG[field.type] || [];
  const isTypeSpecificEnabled = (key: TypeSpecificPropertyKey) =>
    typeSpecificConfig.includes(key);

  switch (field.type) {
    case "TEXT":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Text
          </h4>
          {isTypeSpecificEnabled("maxlength") && (
            <div className="space-y-1.5">
              <Label
                htmlFor="fieldMaxlength"
                className="text-sm font-medium text-gray-700"
              >
                Độ dài tối đa
              </Label>
              <Input
                id="fieldMaxlength"
                type="number"
                value={field.maxLength || ""}
                onChange={(e) =>
                  onChange(field.id, {
                    maxLength: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Quy định độ dài ký tự"
                max={255}
                className="h-9"
                disabled={formIsUse}
              />
              <p className="text-xs text-gray-500 mt-1">
                Độ dài tối đa 255 ký tự
              </p>
            </div>
          )}
        </div>
      );

    case "TEXTAREA":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Textarea
          </h4>
          {isTypeSpecificEnabled("maxlength") && (
            <div className="space-y-1.5">
              <Label
                htmlFor="fieldMaxlength"
                className="text-sm font-medium text-gray-700"
              >
                Độ dài tối đa
              </Label>
              <Input
                id="fieldMaxlength"
                type="number"
                value={field.maxLength || ""}
                onChange={(e) =>
                  onChange(field.id, {
                    maxLength: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Quy định độ dài ký tự"
                className="h-9"
                disabled={formIsUse}
              />
            </div>
          )}
        </div>
      );

    case "NUMBER":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Number
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("min") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldmin"
                  className="text-sm font-medium text-gray-700"
                >
                  Giá trị nhỏ nhất
                </Label>
                <Input
                  id="fieldMin"
                  type="number"
                  value={field.min}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    onChange(field.id, {
                      min: isNaN(value) ? undefined : value?.toString(),
                    });
                  }}
                  placeholder="Nhập số giá trị nhỏ nhất"
                  className="h-9"
                  disabled={formIsUse}
                />
              </div>
            )}
            {isTypeSpecificEnabled("max") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldMax"
                  className="text-sm font-medium text-gray-700"
                >
                  Giá trị lớn nhất
                </Label>
                <Input
                  id="fieldMaxValue"
                  type="number"
                  value={parseInt(field?.max || "")}
                  onChange={(e) =>
                    onChange(field.id, {
                      max: e.target.value ? e.target.value : undefined,
                    })
                  }
                  placeholder="Nhập số giá trị lớn nhất"
                  className="h-9"
                  disabled={formIsUse}
                />
              </div>
            )}
          </div>
        </div>
      );

    case "DATE":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Date
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("dateFormat") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldDateFormat"
                  className="text-sm font-medium text-gray-700"
                >
                  Định dạng ngày
                </Label>
                <Select
                  value={field.dateFormat || "dd/MM/yyyy"}
                  onValueChange={(value) =>
                    onChange(field.id, {
                      dateFormat: value as
                        | "dd/MM/yyyy"
                        | "dd-MM-yyyy"
                        | "dd.MM.yyyy",
                    })
                  }
                  disabled={formIsUse}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                    <SelectItem value="dd-MM-yyyy">dd-MM-yyyy</SelectItem>
                    <SelectItem value="dd.MM.yyyy">dd.MM.yyyy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {isTypeSpecificEnabled("min") && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fieldmin"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ngày nhỏ nhất
                  </Label>
                  <CustomDatePicker
                    id="fieldmin"
                    selected={parseDateString(field.min)}
                    onChange={(date) =>
                      onChange(field.id, {
                        min: date ? formatDateYMD(date) : undefined,
                      })
                    }
                    placeholder="Chọn ngày nhỏ nhất"
                    className="h-9"
                    disabled={formIsUse}
                  />
                </div>
              )}
              {isTypeSpecificEnabled("max") && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fieldmax"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ngày lớn nhất
                  </Label>
                  <CustomDatePicker
                    id="fieldmax"
                    selected={parseDateString(field.max)}
                    onChange={(date) =>
                      onChange(field.id, {
                        max: date ? formatDateYMD(date) : undefined,
                      })
                    }
                    placeholder="Chọn ngày lớn nhất"
                    className="h-9"
                    disabled={formIsUse}
                  />
                </div>
              )}
            </div>
            {isTypeSpecificEnabled("disableDates") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldDisableDates"
                  className="text-sm font-medium text-gray-700"
                >
                  Vô hiệu hóa ngày
                </Label>
                <Textarea
                  id="fieldDisableDates"
                  value={field.disableDates?.join("\n") || ""}
                  onChange={(e) => {
                    const dates = e.target.value.split("\n");
                    onChange(field.id, {
                      disableDates: dates.length > 0 ? dates : undefined,
                    });
                  }}
                  onBlur={(e) => {
                    // Parse and clean up on blur (when user leaves the field)
                    const text = e.target.value;
                    const options = text
                      .split("\n")
                      .map((line) => line.trim())
                      .filter((line) => line.length > 0);

                    onChange(field.id, {
                      disableDates: options.length > 0 ? options : [],
                    });
                  }}
                  placeholder="Mỗi dòng một ngày (dd-MM-yyyy)"
                  rows={3}
                  className="text-sm"
                  disabled={formIsUse}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ẩn một số ngày do setting
                </p>
              </div>
            )}
          </div>
        </div>
      );

    case "DATETIME": {
      const min = parseDateTimeString(field.min);
      const max = parseDateTimeString(field.max);

      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính DateTime
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("dateFormat") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldDateFormat"
                  className="text-sm font-medium text-gray-700"
                >
                  Định dạng ngày giờ
                </Label>
                <Select
                  value={field.dateFormat || "dd/MM/yyyy HH:mm"}
                  onValueChange={(value) =>
                    onChange(field.id, {
                      dateFormat: value as
                        | "dd/MM/yyyy HH:mm"
                        | "dd-MM-yyyy HH:mm"
                        | "dd.MM.yyyy HH:mm",
                    })
                  }
                  disabled={formIsUse}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy HH:mm">
                      dd/MM/yyyy HH:mm
                    </SelectItem>
                    <SelectItem value="dd-MM-yyyy HH:mm">
                      dd-MM-yyyy HH:mm
                    </SelectItem>
                    <SelectItem value="dd.MM.yyyy HH:mm">
                      dd.MM.yyyy HH:mm
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-3">
              {isTypeSpecificEnabled("min") && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fieldmin"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ngày giờ nhỏ nhất
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    <CustomDatePicker
                      id="fieldminDate"
                      selected={min}
                      onChange={(date) => {
                        if (!date) {
                          onChange(field.id, { min: undefined });
                          return;
                        }
                        const current =
                          parseDateTimeString(field.min) || new Date();
                        const merged = new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                          current.getHours(),
                          current.getMinutes()
                        );
                        onChange(field.id, {
                          min: formatDateTimeLocal(merged),
                        });
                      }}
                      placeholder="Chọn ngày"
                      className="h-9"
                      disabled={formIsUse}
                    />
                    <CustomTimePicker
                      selected={min}
                      onChange={(time) => {
                        if (!time) {
                          onChange(field.id, { min: undefined });
                          return;
                        }
                        const current =
                          parseDateTimeString(field.min) || new Date();
                        const merged = new Date(
                          current.getFullYear(),
                          current.getMonth(),
                          current.getDate(),
                          time.getHours(),
                          time.getMinutes()
                        );
                        onChange(field.id, {
                          min: formatDateTimeLocal(merged),
                        });
                      }}
                      className="h-9"
                      placeholder="Chọn giờ"
                      disabled={formIsUse}
                    />
                  </div>
                </div>
              )}
              {isTypeSpecificEnabled("max") && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fieldmax"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ngày giờ lớn nhất
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    <CustomDatePicker
                      id="fieldmaxDate"
                      selected={max}
                      onChange={(date) => {
                        if (!date) {
                          onChange(field.id, { max: undefined });
                          return;
                        }
                        const current =
                          parseDateTimeString(field.max) || new Date();
                        const merged = new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                          current.getHours(),
                          current.getMinutes()
                        );
                        onChange(field.id, {
                          max: formatDateTimeLocal(merged),
                        });
                      }}
                      placeholder="Chọn ngày"
                      className="h-9"
                      disabled={formIsUse}
                    />
                    <CustomTimePicker
                      selected={max}
                      onChange={(time) => {
                        if (!time) {
                          onChange(field.id, { max: undefined });
                          return;
                        }
                        const current =
                          parseDateTimeString(field.max) || new Date();
                        const merged = new Date(
                          current.getFullYear(),
                          current.getMonth(),
                          current.getDate(),
                          time.getHours(),
                          time.getMinutes()
                        );
                        onChange(field.id, {
                          max: formatDateTimeLocal(merged),
                        });
                      }}
                      placeholder="Chọn giờ"
                      disabled={formIsUse}
                    />
                  </div>
                </div>
              )}
            </div>
            {isTypeSpecificEnabled("disableDates") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldDisableDates"
                  className="text-sm font-medium text-gray-700"
                >
                  Vô hiệu hóa datetime
                </Label>
                <Textarea
                  id="fieldDisableDates"
                  value={field.disableDates?.join("\n") || ""}
                  onChange={(e) => {
                    const dateTimes = e.target.value
                      .split("\n")
                      .filter((d) => d.trim());
                    onChange(field.id, {
                      disableDates:
                        dateTimes.length > 0 ? dateTimes : undefined,
                    });
                  }}
                  placeholder="Mỗi dòng một datetime"
                  rows={3}
                  className="text-sm"
                  disabled={formIsUse}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ẩn một số ngày do setting
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "CHECKBOX":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Checkbox
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("checkboxOptions") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldoptions"
                  className="text-sm font-medium text-gray-700"
                >
                  Tùy chọn Checkbox
                </Label>
                <Textarea
                  id="fieldoptions"
                  value={field.options?.join("\n") || ""}
                  onChange={(e) => {
                    // Just update the display value, don't parse yet
                    const text = e.target.value;
                    const lines = text.split("\n");
                    onChange(field.id, {
                      options: lines,
                    });
                  }}
                  disabled={!!field.apiId || formIsUse}
                  onBlur={(e) => {
                    // Parse and clean up on blur (when user leaves the field)
                    const text = e.target.value;
                    const options = text
                      .split("\n")
                      .map((line) => line.trim())
                      .filter((line) => line.length > 0);

                    onChange(field.id, {
                      options: options.length > 0 ? options : [],
                    });
                  }}
                  placeholder="Mỗi dòng một checkbox&#10;Ví dụ:&#10;Tùy chọn 1&#10;Tùy chọn 2&#10;Tùy chọn 3"
                  rows={5}
                  className="text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập mỗi dòng một checkbox option. Hiện có{" "}
                  {field.options?.length || 0} option(s)
                </p>
              </div>
            )}
          </div>
          {/* API Endpoint */}

          <div className="space-y-1.5">
            <Label
              htmlFor="fieldApiEndpoint"
              className="text-sm font-medium text-gray-700"
            >
              API Endpoint
            </Label>
            <Select
              value={field.apiId?.toString() || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  onChange(field.id, {
                    apiId: undefined,
                    options: ["tùy chọn 1", "tùy chọn 2", "tùy chọn 3"],
                  });
                } else {
                  onChange(field.id, {
                    apiId: value ? parseInt(value) : undefined,
                  });
                }
              }}
              disabled={formIsUse}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Chọn API" />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">
                  <span className="text-gray-500">Không sử dụng API</span>
                </SelectItem>
                {apiList.map((api) => (
                  <SelectItem key={api.id} value={api.id.toString()}>
                    {api.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {previewDataMutation.isPending
                ? "Đang tải dữ liệu preview..."
                : field.apiId
                  ? `Đã tải ${field.options?.length || 0} option từ API`
                  : "Chọn API để lấy dữ liệu cho trường này"}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="fieldRefer"
              className="text-sm font-medium text-gray-700"
            >
              Link tham chiếu (Refer)
            </Label>
            <Input
              id="fieldRefer"
              value={field.refer || ""}
              onChange={(e) =>
                onChange(field.id, {
                  refer: e.target.value,
                })
              }
              placeholder="Nhập link tham chiếu"
              className="h-9"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link để xem chi tiết hoặc quản lý dữ liệu từ API
            </p>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 mt-3">
            <Label
              htmlFor="fieldAllowOther"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Cho phép nhập giá trị khác
            </Label>
            <Checkbox
              id="fieldAllowOther"
              checked={field.allowOther || false}
              onCheckedChange={(v) =>
                onChange(field.id, {
                  allowOther: Boolean(v),
                })
              }
              disabled={formIsUse}
            />
          </div>
        </div>
      );

    case "RADIO":
    case "SELECT":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính {field.type === "RADIO" ? "Radio" : "Select"}
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("options") && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Thêm option
                  {field.apiId && (
                    <span className="ml-2 text-xs text-blue-600">
                      (Tự động từ API)
                    </span>
                  )}
                </Label>
                <Textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  onBlur={(e) => {
                    const text = e.target.value;
                    setOptionsText(text);

                    // Parse và lưu options (filter empty lines)
                    const options = text
                      .split("\n")
                      .map((line) => line.trim())
                      .filter((line) => line.length > 0);

                    onChange(field.id, {
                      options: options.length > 0 ? options : [],
                    });
                  }}
                  placeholder="Mỗi dòng một option&#10;Ví dụ:&#10;Tùy chọn 1&#10;Tùy chọn 2&#10;Tùy chọn 3"
                  rows={5}
                  className="text-sm font-mono"
                  disabled={!!field.apiId || formIsUse}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {field.apiId
                    ? `Hiển thị 5 option đầu tiên từ API (tổng ${field.options?.length || 0} option). Không thể chỉnh sửa thủ công.`
                    : `Nhập mỗi dòng một option. Hiện có ${field.options?.filter((opt) => opt.trim().length > 0).length || 0} option(s)`}
                </p>
              </div>
            )}
          </div>
          {/* API Endpoint */}

          <div className="space-y-1.5">
            <Label
              htmlFor="fieldApiEndpoint"
              className="text-sm font-medium text-gray-700"
            >
              API Endpoint
            </Label>
            <Select
              value={field.apiId?.toString() || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  onChange(field.id, {
                    apiId: undefined,
                    options: ["tùy chọn 1", "tùy chọn 2", "tùy chọn 3"],
                  });
                } else {
                  onChange(field.id, {
                    apiId: value ? parseInt(value) : undefined,
                  });
                }
              }}
              disabled={formIsUse}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Chọn API" />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">
                  <span className="text-gray-500">Không sử dụng API</span>
                </SelectItem>
                {apiList.map((api) => (
                  <SelectItem key={api.id} value={api.id.toString()}>
                    {api.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {previewDataMutation.isPending
                ? "Đang tải dữ liệu preview..."
                : field.apiId
                  ? `Đã tải ${field.options?.length || 0} option từ API`
                  : "Chọn API để lấy dữ liệu cho trường này"}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="fieldRefer"
              className="text-sm font-medium text-gray-700"
            >
              Link tham chiếu (Refer)
            </Label>
            <Input
              id="fieldRefer"
              value={field.refer || ""}
              onChange={(e) =>
                onChange(field.id, {
                  refer: e.target.value,
                })
              }
              placeholder="Nhập link tham chiếu"
              className="h-9"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link để xem chi tiết hoặc quản lý dữ liệu từ API
            </p>
          </div>
          {field.type === "SELECT" && (
            <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
              <Label
                htmlFor="fieldAllowMultiple"
                className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
              >
                Cho phép chọn nhiều
              </Label>
              <Checkbox
                id="fieldAllowMultiple"
                checked={field.allowMultiple !== false}
                onCheckedChange={(v) =>
                  onChange(field.id, {
                    allowMultiple: Boolean(v),
                  })
                }
              />
            </div>
          )}
        </div>
      );

    case "LINK":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Link
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("linkText") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldLinkText"
                  className="text-sm font-medium text-gray-700"
                >
                  Link Text
                </Label>
                <Input
                  id="fieldLinkText"
                  value={field.linkText || ""}
                  onChange={(e) =>
                    onChange(field.id, { linkText: e.target.value })
                  }
                  placeholder="Nhập text hiển thị"
                  className="h-9"
                  disabled={formIsUse}
                />
              </div>
            )}
            {isTypeSpecificEnabled("linkUrl") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldLinkUrl"
                  className="text-sm font-medium text-gray-700"
                >
                  Link URL
                </Label>
                <Input
                  id="fieldLinkUrl"
                  type="url"
                  value={field.linkUrl || ""}
                  onChange={(e) =>
                    onChange(field.id, { linkUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="h-9"
                  disabled={formIsUse}
                />
              </div>
            )}
            {isTypeSpecificEnabled("linkTarget") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldLinkTarget"
                  className="text-sm font-medium text-gray-700"
                >
                  Mở trong tab
                </Label>
                <Select
                  value={field.linkTarget || "_self"}
                  onValueChange={(value) =>
                    onChange(field.id, {
                      linkTarget: value as "_blank" | "_self",
                    })
                  }
                  disabled={formIsUse}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Tab</SelectItem>
                    <SelectItem value="_blank">New Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      );

    case "FILE":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính File
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("acceptedTypes") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldAcceptedTypes"
                  className="text-sm font-medium text-gray-700"
                >
                  Định dạng file
                </Label>
                <Input
                  id="fieldAcceptedTypes"
                  value={field.acceptedTypes || ""}
                  onChange={(e) =>
                    onChange(field.id, { acceptedTypes: e.target.value })
                  }
                  placeholder=".pdf,.doc,.docx"
                  className="h-9"
                  disabled={formIsUse}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ví dụ: .pdf,.doc,.docx hoặc image/*
                </p>
              </div>
            )}
            {isTypeSpecificEnabled("max") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldMaxFileSize"
                  className="text-sm font-medium text-gray-700"
                >
                  Kích thước tối đa (MB)
                </Label>
                <Input
                  id="fieldMaxFileSize"
                  type="number"
                  value={parseInt(field.max || "")}
                  onChange={(e) =>
                    onChange(field.id, {
                      max: e.target.value ? e.target.value : undefined,
                    })
                  }
                  placeholder="10"
                  className="h-9"
                  disabled={formIsUse}
                />
              </div>
            )}
            {isTypeSpecificEnabled("multipleFiles") && (
              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <Label
                  htmlFor="fieldMultiple"
                  className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                >
                  Cho phép tải nhiều file
                </Label>
                <input
                  type="checkbox"
                  id="fieldMultiple"
                  checked={field.allowMultiple || false}
                  onChange={(e) =>
                    onChange(field.id, { allowMultiple: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      );

    case "EDITOR":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Editor
          </h4>
          <div className="space-y-3">
            {isTypeSpecificEnabled("maxlength") && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="fieldMaxlength"
                  className="text-sm font-medium text-gray-700"
                >
                  Độ dài tối đa
                </Label>
                <Input
                  id="fieldMaxlength"
                  type="number"
                  value={field.maxLength || ""}
                  onChange={(e) =>
                    onChange(field.id, {
                      maxLength: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Quy định độ dài ký tự"
                  className="h-9"
                  disabled={formIsUse}
                />
              </div>
            )}

            {isTypeSpecificEnabled("editorReadonly") && (
              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <Label
                  htmlFor="fieldReadonly"
                  className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                >
                  Readonly
                </Label>
                <Checkbox
                  id="fieldReadonly"
                  checked={field.readonly || false}
                  onCheckedChange={(v) =>
                    onChange(field.id, {
                      readonly: Boolean(v),
                    })
                  }
                  disabled={formIsUse}
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Rich text editor với các tính năng định dạng văn bản
            </p>
          </div>
        </div>
      );

    case "TABLE":
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Thuộc tính Table
          </h4>
          <div className="space-y-4">
            {isTypeSpecificEnabled("tableColumns") && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Thêm cột
                </Label>
                <div className="space-y-2">
                  {(field.tableColumns || []).map((col, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 flex-col bg-white p-2 rounded border border-gray-200"
                    >
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-xs text-gray-600">
                          Field Name (fieldName){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={col.name || ""}
                          onChange={(e) => {
                            const newColumns = [...(field.tableColumns || [])];
                            newColumns[idx].name = e.target.value;
                            onChange(field.id, { tableColumns: newColumns });
                          }}
                          placeholder="field_name"
                          className="h-9"
                          disabled={formIsUse}
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-xs text-gray-600">
                          Label (Tên hiển thị)
                        </Label>
                        <Input
                          value={col.label || ""}
                          onChange={(e) => {
                            const newColumns = [...(field.tableColumns || [])];
                            newColumns[idx].label = e.target.value;
                            onChange(field.id, { tableColumns: newColumns });
                          }}
                          placeholder="Tên cột"
                          className="h-9"
                          disabled={formIsUse}
                        />
                      </div>
                      <div className="flex items-start flex-col gap-2">
                        <div className="space-y-1.5 w-full">
                          <Label className="text-xs text-gray-600">Type</Label>
                          <Select
                            value={col.type}
                            onValueChange={(value) => {
                              const newColumns = [
                                ...(field.tableColumns || []),
                              ];
                              newColumns[idx].type = value as
                                | "text"
                                | "checkbox"
                                | "select"
                                | "date"
                                | "datetime";

                              // Reset options and apiId when changing type
                              if (value !== "select") {
                                newColumns[idx].options = undefined;
                                newColumns[idx].apiId = undefined;
                              }

                              // Set default dateFormat for date/datetime columns
                              if (value === "date") {
                                newColumns[idx].dateFormat = "DD/MM/YYYY";
                              } else if (value === "datetime") {
                                newColumns[idx].dateFormat = "DD/MM/YYYY HH:mm";
                              } else {
                                newColumns[idx].dateFormat = undefined;
                              }

                              onChange(field.id, { tableColumns: newColumns });
                            }}
                            disabled={formIsUse}
                          >
                            <SelectTrigger className="w-full h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="datetime">DateTime</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Select options configuration for select type */}
                        {col.type === "select" && (
                          <div className="flex-1 space-y-1.5 w-full">
                            <Label className="text-xs text-gray-600">
                              Options
                            </Label>
                            <div className="space-y-2">
                              <Textarea
                                value={tableColumnOptionsText[idx] || ""}
                                onChange={(e) => {
                                  const newText = e.target.value;
                                  setTableColumnOptionsText((prev) => ({
                                    ...prev,
                                    [idx]: newText,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const text = e.target.value;
                                  const newColumns = [
                                    ...(field.tableColumns || []),
                                  ];
                                  const lines = text
                                    .split("\n")
                                    .map((line) => line.trim())
                                    .filter((line) => line.length > 0);
                                  newColumns[idx].options =
                                    lines.length > 0 ? lines : undefined;
                                  onChange(field.id, {
                                    tableColumns: newColumns,
                                  });
                                }}
                                placeholder="Mỗi dòng một option&#10;Ví dụ:&#10;Tùy chọn 1&#10;Tùy chọn 2&#10;Tùy chọn 3"
                                rows={4}
                                className="text-xs resize-none"
                                disabled={!!col.apiId || formIsUse}
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  hoặc
                                </span>
                                <Select
                                  value={col.apiId?.toString() || "none"}
                                  onValueChange={(value) => {
                                    const newColumns = [
                                      ...(field.tableColumns || []),
                                    ];
                                    if (value === "none") {
                                      newColumns[idx].apiId = undefined;
                                      // Set default options when disabling API
                                      newColumns[idx].options = [
                                        "Tùy chọn 1",
                                        "Tùy chọn 2",
                                        "Tùy chọn 3",
                                      ];
                                    } else {
                                      newColumns[idx].apiId = parseInt(value);
                                      newColumns[idx].options = undefined; // Clear manual options
                                    }
                                    onChange(field.id, {
                                      tableColumns: newColumns,
                                    });
                                  }}
                                  disabled={formIsUse}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Chọn API" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      Không sử dụng API
                                    </SelectItem>
                                    {apiList.map((api) => (
                                      <SelectItem
                                        key={api.id}
                                        value={api.id.toString()}
                                      >
                                        {api.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <p className="text-xs text-gray-500">
                                {col.apiId
                                  ? `Sử dụng API để lấy dữ liệu`
                                  : `Hiện có ${col.options?.length || 0} option`}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Date format configuration for date/datetime type */}
                        {(col.type === "date" || col.type === "datetime") && (
                          <div className="flex-1 space-y-1.5 w-full">
                            <Label className="text-xs text-gray-600">
                              Định dạng ngày
                            </Label>
                            <Select
                              value={
                                col.dateFormat ||
                                (col.type === "datetime"
                                  ? "DD/MM/YYYY HH:mm"
                                  : "DD/MM/YYYY")
                              }
                              onValueChange={(value) => {
                                const newColumns = [
                                  ...(field.tableColumns || []),
                                ];
                                newColumns[idx].dateFormat = value;
                                onChange(field.id, {
                                  tableColumns: newColumns,
                                });
                              }}
                              disabled={formIsUse}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {col.type === "date" ? (
                                  <>
                                    <SelectItem value="dd/MM/yyyy">
                                      dd/MM/yyyy
                                    </SelectItem>
                                    <SelectItem value="dd-MM-yyyy">
                                      dd-MM-yyyy
                                    </SelectItem>
                                    <SelectItem value="dd.MM.yyyy">
                                      dd.MM.yyyy
                                    </SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="dd/MM/yyyy HH:mm">
                                      dd/MM/yyyy HH:mm
                                    </SelectItem>
                                    <SelectItem value="dd-MM-yyyy HH:mm">
                                      dd-MM-yyyy HH:mm
                                    </SelectItem>
                                    <SelectItem value="dd.MM.yyyy HH:mm">
                                      dd.MM.yyyy HH:mm
                                    </SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Allow Add/Delete rows in cell for this column */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`fieldAllowAddDeleteRowsCell-${idx}`}
                            checked={col.allowAddDeleteRowsCell || false}
                            onCheckedChange={(v) => {
                              const newColumns = [
                                ...(field.tableColumns || []),
                              ];
                              newColumns[idx].allowAddDeleteRowsCell =
                                Boolean(v);
                              onChange(field.id, { tableColumns: newColumns });
                            }}
                          />
                          <Label
                            htmlFor={`fieldAllowAddDeleteRowsCell-${idx}`}
                            className="text-xs text-gray-600 cursor-pointer"
                          >
                            Cho phép thêm/xóa hàng
                          </Label>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newColumns = (
                              field.tableColumns || []
                            ).filter((_, i) => i !== idx);
                            onChange(field.id, {
                              tableColumns:
                                newColumns.length > 0 ? newColumns : undefined,
                            });
                          }}
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newColumns = [
                        ...(field.tableColumns || []),
                        {
                          name: "",
                          label: "",
                          type: "text" as const,
                          options: undefined,
                          apiId: undefined,
                          dateFormat: undefined,
                        },
                      ];
                      onChange(field.id, { tableColumns: newColumns });
                    }}
                    className="w-full h-9 border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm cột
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Table Rows Input */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Dữ liệu hàng mẫu
            </Label>
            <Textarea
              value={tableRowsText}
              onChange={(e) => {
                // Just update the display value, don't parse yet
                setTableRowsText(e.target.value);
              }}
              onBlur={(e) => {
                // Parse and update field when user leaves the field
                const text = e.target.value;
                setTableRowsText(text);

                try {
                  // Simple text format: "key1: value1, key2: value2"
                  const lines = text.split("\n").filter((line) => line.trim());
                  const tableRows = lines
                    .map((line) => {
                      const pairs = line.split(",").map((pair) => pair.trim());
                      const row: Record<string, any> = {};
                      pairs.forEach((pair) => {
                        const colonIndex = pair.indexOf(":");
                        if (colonIndex > 0) {
                          const key = pair.substring(0, colonIndex).trim();
                          const value = pair.substring(colonIndex + 1).trim();
                          if (key) {
                            row[key] = value || "";
                          }
                        }
                      });
                      return row;
                    })
                    .filter((row) => Object.keys(row).length > 0);

                  onChange(field.id, {
                    tableRows: tableRows.length > 0 ? tableRows : undefined,
                  });
                } catch (error) {
                  console.error("Error parsing table rows:", error);
                  // Keep current value on error
                }
              }}
              placeholder="Mỗi dòng một hàng với format: key: value, key: value&#10;name: Tên 1, age: 25&#10;name:Tên 2, age: 30"
              rows={4}
              className="text-sm font-mono"
              disabled={formIsUse}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: key1: value1, key2: value2. Mỗi dòng một hàng.
            </p>
          </div>

          {/* Editable for Table */}
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 mt-3">
            <Label
              htmlFor="fieldEditable"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Cho phép chỉnh sửa
            </Label>
            <Checkbox
              id="fieldEditable"
              checked={field.editable || false}
              onCheckedChange={(v) =>
                onChange(field.id, {
                  editable: Boolean(v),
                })
              }
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
