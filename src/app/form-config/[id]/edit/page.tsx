"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import SelectCustom from "@/components/common/SelectCustom";
import FieldTypesSidebar from "@/components/form-config/FieldTypesSidebar";
import FormCanvas from "@/components/form-config/FormCanvas";
import PropertiesPanel from "@/components/form-config/PropertiesPanel";
import type {
  FieldType,
  FormField,
  FormRow,
} from "@/components/form-config/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useGetFormConfigDetailQuery,
  useGetFormConfigTypeListQuery,
  useUpdateFormConfig,
} from "@/hooks/data/form-config.data";
import {
  useAddAttachment,
  useGetTemplate,
  useDownloadTemplate,
  useUpdateAttachment,
} from "@/hooks/data/template-form.data";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import type { ApiFieldResponse } from "@/services/form-config.service";
import {
  Calendar,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Download,
  Edit,
  FileText,
  Hash,
  Link as LinkIcon,
  Plus,
  Save,
  Type,
  Upload,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ToastUtils } from "@/utils/toast.utils";
import { saveFile } from "@/utils/common.utils";
import templateFormService from "@/services/template-form.service";

const fieldTypes = [
  {
    type: "TEXT" as FieldType,
    label: "Text",
    description: "Single line text input",
    icon: Type,
  },
  {
    type: "NUMBER" as FieldType,
    label: "Number",
    description: "Numeric input field",
    icon: Hash,
  },
  {
    type: "DATE" as FieldType,
    label: "Date",
    description: "Date picker input",
    icon: Calendar,
  },
  {
    type: "DATETIME" as FieldType,
    label: "DateTime",
    description: "Date and time picker",
    icon: CalendarClock,
  },
  {
    type: "TEXTAREA" as FieldType,
    label: "Textarea",
    description: "Multi-line text input",
    icon: FileText,
  },
  {
    type: "CHECKBOX" as FieldType,
    label: "Checkbox",
    description: "Checkbox input",
    icon: CheckSquare,
  },
  {
    type: "RADIO" as FieldType,
    label: "Radio",
    description: "Radio button input",
    icon: CheckSquare,
  },
  {
    type: "SELECT" as FieldType,
    label: "Select",
    description: "Dropdown select input",
    icon: FileText,
  },
  {
    type: "TABLE" as FieldType,
    label: "Table",
    description: "Table input",
    icon: FileText,
  },
  {
    type: "LINK" as FieldType,
    label: "Link",
    description: "Hyperlink field",
    icon: LinkIcon,
  },
  {
    type: "FILE" as FieldType,
    label: "File",
    description: "File upload field",
    icon: Upload,
  },
  {
    type: "EDITOR" as FieldType,
    label: "CKEditor",
    description: "Rich text editor",
    icon: Edit,
  },
  {
    type: "LABEL" as FieldType,
    label: "Label",
    description: "Label field",
    icon: FileText,
  },
];

export default function FormEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const formId = params?.id ? parseInt(params.id as string) : 0;

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<number>(0);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formIsUse, setFormIsUse] = useState<boolean>(false);
  const [formRows, setFormRows] = useState<FormRow[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<
    "left" | "right" | "between" | null
  >(null);
  const [dragOverFieldIndex, setDragOverFieldIndex] = useState<number | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");
  const [isFormInfoOpen, setIsFormInfoOpen] = useState(true);
  const [templateFile, setTemplateFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: getFormConfigTypeListQuery } = useGetFormConfigTypeListQuery();

  // Fetch form detail
  const { data: formDetail, isLoading } = useGetFormConfigDetailQuery(formId);

  // Template hooks
  const { data: templateData } = useGetTemplate(formId, true);
  const addAttachmentMutation = useAddAttachment();
  const updateAttachmentMutation = useUpdateAttachment();
  const downloadTemplateMutation = useDownloadTemplate();

  // Update form mutation
  const updateFormMutation = useUpdateFormConfig();

  // Load template file data
  useEffect(() => {
    if (templateData?.data) {
      setTemplateFile(templateData.data);
    }
  }, [templateData]);

  const safeJsonParse = (value: any, defaultValue: any) => {
    try {
      if (typeof value !== "string") return defaultValue;
      if (!value.trim()) return defaultValue;
      return JSON.parse(value);
    } catch (error) {
      console.error("JSON parse error:", value);
      return defaultValue;
    }
  };

  // Helper: Convert API field to FormField (no type mapping needed)
  const apiFieldToFormField = (apiField: ApiFieldResponse): FormField => {
    const fieldConfig = safeJsonParse(apiField.fieldConfig, {});
    const options = safeJsonParse(apiField.options, []);

    return {
      ...apiField,
      id: String(apiField.id),
      type: apiField.dataType as FieldType,
      title: apiField.title || "",
      name: apiField.name || "",
      placeholder: apiField.placeholder || "",
      required: !!apiField.required,
      hidden: !!apiField.hidden,
      showOnList: !!apiField.showOnList,
      isSearch: !!apiField.isSearch,
      inputWidth:
        apiField.inputWidth && apiField.inputWidth !== "100"
          ? parseFloat(String(apiField.inputWidth))
          : undefined,
      css: apiField.css || "",
      allowMultiple: !!apiField.allowMultiple,

      tableColumns: fieldConfig?.tableColumns || [],
      tableRows: fieldConfig?.tableRows || [],
      editable: fieldConfig?.editable || false,

      dateFormat: apiField.dateFormat,
      options: apiField.options ? JSON.parse(apiField.options) : [],
      disableDates: apiField.disableDates
        ? JSON.parse(apiField.disableDates)
        : [],
      allowOther: !!apiField.allowOther,
    };
  };

  // Helper: Convert FormField to API field (no type mapping needed)
  const formFieldToApiField = (
    field: FormField,
    orderNumber: number,
    rowFields: FormField[]
  ): Partial<ApiFieldResponse> => {
    // Kiểm tra field mới: id là timestamp (số lớn > 100000000)
    const fieldId = field.id ? parseInt(field.id) : undefined;
    const isNewField = !fieldId || fieldId > 100000000;

    // Tính tổng inputWidth của row để xác định nếu field chiếm cả hàng
    const visibleFields = rowFields.filter((f) => !f.hidden);
    const isOnlyFieldInRow = visibleFields.length === 1;

    // Xác định inputWidth: nếu field chiếm cả hàng thì 100, không thì lấy từ field.inputWidth hoặc tính chia đều
    let finalInputWidth: number;
    if (isOnlyFieldInRow) {
      finalInputWidth = field.inputWidth ? field.inputWidth : 100;
    } else if (field.inputWidth) {
      finalInputWidth = field.inputWidth;
    } else {
      // Nếu không có inputWidth, chia đều cho các field trong row
      finalInputWidth = 100 / visibleFields.length;
    }

    // Base object cho tất cả field types (Trường chung)
    const baseField: Partial<ApiFieldResponse> = {
      id: isNewField ? undefined : fieldId,
      formDynamicId: formId,
      name: field.name || "",
      title: field.title || "",
      dataType: field.type,
      inputWidth: finalInputWidth.toString(),
      orderNumber,
      css: field.css || "",
      // Thông tin cơ bản (dùng chung cho tất cả type)
      required: field.required || false,
      isSearch: field.isSearch || false,
      showOnList: field.showOnList || false,
      hidden: field.hidden || false,
      placeholder: field.placeholder || "",
      unique: field.unique || false,
      description: field.description || "",
      size: field.size,
    };

    // TEXT - Thuộc tính riêng: minLength, maxLength
    if (field.type === "TEXT") {
      return {
        ...baseField,
        maxLength: field.maxLength || 0,
      };
    }

    // NUMBER - Thuộc tính riêng: minValue, maxValue (lưu trong fieldConfig)
    if (field.type === "NUMBER") {
      return {
        ...baseField,
        min: field?.min?.toString(),
        max: field?.max?.toString(),
      };
    }

    // TEXTAREA - Thuộc tính riêng: minLength, maxLength
    if (field.type === "TEXTAREA") {
      return {
        ...baseField,
        maxLength: field.maxLength || 0,
      };
    }

    // DATE - Thuộc tính riêng: dateFormat, minDate, maxDate, disableDates
    if (field.type === "DATE") {
      return {
        ...baseField,
        dateFormat: field.dateFormat || "DD/MM/YYYY",
        min: field?.min?.toString(),
        max: field?.max?.toString(),
        disableDates: JSON.stringify(field.disableDates) || "",
      };
    }

    // DATETIME - Thuộc tính riêng: dateTimeFormat, minDateTime, maxDateTime, disableDateTimes
    if (field.type === "DATETIME") {
      return {
        ...baseField,
        dateFormat: field.dateFormat || "DD/MM/YYYY HH:mm",
        min: field?.min?.toString(),
        max: field?.max?.toString(),
        disableDates: JSON.stringify(field.disableDates) || "",
      };
    }

    // SELECT - Thuộc tính riêng: apiId, options, allowMultiple
    if (field.type === "SELECT") {
      return {
        ...baseField,
        apiId: field.apiId,
        allowMultiple: field.allowMultiple || false,
        options: JSON.stringify(field.options),
      };
    }

    // RADIO - Thuộc tính riêng: apiId, options, selectedByDefault
    if (field.type === "RADIO") {
      return {
        ...baseField,
        apiId: field.apiId,
        options: JSON.stringify(field.options),
      };
    }

    // CHECKBOX - Thuộc tính riêng: checkboxText, selectedByDefault, align
    if (field.type === "CHECKBOX") {
      return {
        ...baseField,
        apiId: field.apiId,
        options: JSON.stringify(field.options),
        allowOther: field.allowOther || false,
      };
    }

    // FILE - Thuộc tính riêng: acceptedTypes, max, allowMultiple
    if (field.type === "FILE") {
      return {
        ...baseField,
        allowMultiple: field.allowMultiple || false,
        acceptedTypes: field.acceptedTypes || "",
        max: String(field.max || 10),
      };
    }

    // TABLE - Thuộc tính riêng: tableColumns
    if (field.type === "TABLE") {
      return {
        ...baseField,
        fieldConfig: JSON.stringify({
          tableColumns: field.tableColumns,
          tableRows: field.tableRows,
          editable: field.editable,
        }),
      };
    }

    // LINK - Thuộc tính riêng: linkText, linkUrl, linkTarget
    if (field.type === "LINK") {
      return {
        ...baseField,
        linkText: field.linkText || "",
        linkUrl: field.linkUrl || "",
        linkTarget: field.linkTarget || "_blank",
      };
    }

    // EDITOR - Thuộc tính riêng: maxLength, readonly
    if (field.type === "EDITOR") {
      return {
        ...baseField,
        maxLength: field.maxLength || 0,
      };
    }

    // Default fallback
    return baseField;
  };

  // Load form data from API
  useEffect(() => {
    if (formDetail) {
      setFormName(formDetail.name || "");
      setFormDescription(formDetail.description || "");
      setFormType(formDetail.categoryId || 0);
      setFormActive(formDetail.active ?? true);
      setFormIsUse(formDetail.isUse ?? false);

      // Map API fields to FormRows
      if (formDetail.fields && formDetail.fields.length > 0) {
        const sortedFields = [...formDetail.fields].sort(
          (a, b) => a.orderNumber - b.orderNumber
        );

        const formFields = sortedFields.map(apiFieldToFormField);

        // Nhóm fields thành rows dựa trên tổng inputWidth <= 100
        const rows: FormRow[] = [];
        let currentRow: FormField[] = [];
        let currentRowWidth = 0;

        formFields.forEach((field, index) => {
          const fieldWidth = field.inputWidth || 100;

          // Nếu thêm field này vào row hiện tại mà tổng > 100, tạo row mới
          if (currentRowWidth > 0 && currentRowWidth + fieldWidth > 100) {
            // Lưu row hiện tại
            rows.push({
              id: `row-${rows.length + 1}`,
              fields: currentRow,
            });
            // Bắt đầu row mới
            currentRow = [field];
            currentRowWidth = fieldWidth;
          } else {
            // Thêm vào row hiện tại
            currentRow.push(field);
            currentRowWidth += fieldWidth;
          }
        });

        // Thêm row cuối cùng nếu còn
        if (currentRow.length > 0) {
          rows.push({
            id: `row-${rows.length + 1}`,
            fields: currentRow,
          });
        }

        setFormRows(rows);
      } else {
        setFormRows([]);
      }
    }
  }, [formDetail]);

  // Helper: Get all fields from rows (flat list)
  const getAllFields = (): FormField[] => {
    return formRows.flatMap((row) => row.fields);
  };

  // Helper: Find field in rows
  const findFieldInRows = (
    fieldId: string
  ): { row: FormRow; field: FormField; fieldIndex: number } | null => {
    for (const row of formRows) {
      const fieldIndex = row.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex !== -1) {
        return { row, field: row.fields[fieldIndex], fieldIndex };
      }
    }
    return null;
  };
  const formFields = getAllFields();

  // Handle add new field
  const handleAddField = (
    field: FormField,
    targetRowId?: string,
    position?: "left" | "right" | "new"
  ) => {
    const newField: FormField = {
      ...field,
      id: Date.now().toString(),
      orderNumber: targetRowId
        ? formRows.findIndex((r) => r.id === targetRowId) + 1
        : formRows.length + 1,
    };

    if (targetRowId && position) {
      // Add to existing row
      const rowIndex = formRows.findIndex((r) => r.id === targetRowId);
      if (rowIndex !== -1) {
        const row = formRows[rowIndex];
        const newRows = [...formRows];
        if (position === "left") {
          newRows[rowIndex] = {
            ...row,
            fields: [newField, ...row.fields],
          };
        } else {
          newRows[rowIndex] = {
            ...row,
            fields: [...row.fields, newField],
          };
        }
        setFormRows(newRows);
      }
    } else {
      // Add as new row
      const newRow: FormRow = {
        id: `row-${Date.now()}`,
        fields: [newField],
      };
      setFormRows([...formRows, newRow]);
    }

    setSelectedFieldId(newField.id);
  };

  // Handle field property update
  const handleFieldPropertyUpdate = (
    fieldId: string,
    updates: Partial<FormField>
  ) => {
    setFormRows(
      formRows.map((row) => ({
        ...row,
        fields: row.fields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
      }))
    );
  };
  // Handle delete field
  const handleDeleteField = (fieldId: string) => {
    setFormRows(
      formRows
        .map((row) => {
          const newFields = row.fields.filter((f) => f.id !== fieldId);
          if (newFields.length === 0) {
            return null; // Remove empty row
          }
          return { ...row, fields: newFields };
        })
        .filter((row): row is FormRow => row !== null)
    );
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };
  // Handle save form
  const handleSaveForm = async () => {
    // Validation
    if (!formName.trim()) {
      ToastUtils.error("Vui lòng nhập tên form!");
      return;
    }

    if (!formType) {
      ToastUtils.error("Vui lòng chọn loại form!");
      return;
    }
    console.log(templateFile);
    if (!templateFile || !templateFile.name) {
      ToastUtils.error("Vui lòng upload file mẫu!");
      return;
    }

    if (formRows.length === 0) {
      ToastUtils.error("Form phải có ít nhất 1 trường!");
      return;
    }

    // Validate all field names
    let hasEmptyFieldName = false;
    let hasInvalidFieldName = false;
    const emptyFieldNames: string[] = [];
    const invalidFieldNames: string[] = [];

    // Regex pattern: chỉ cho phép chữ cái, số và dấu gạch dưới
    const validFieldNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    formRows.forEach((row) => {
      row.fields.forEach((field) => {
        if (!field.name || field.name.trim() === "") {
          hasEmptyFieldName = true;
          emptyFieldNames.push(field.title || field.id || "Unknown field");
        } else if (!validFieldNamePattern.test(field.name)) {
          hasInvalidFieldName = true;
          invalidFieldNames.push(field.title || field.id || "Unknown field");
        }
      });
    });

    if (hasEmptyFieldName) {
      ToastUtils.error(
        `Vui lòng nhập tên trường cho: ${emptyFieldNames.join(", ")}`
      );
      return;
    }

    if (hasInvalidFieldName) {
      ToastUtils.error(
        `Tên trường chỉ được chứa chữ cái, số và dấu gạch dưới (_), không được có khoảng trắng hoặc ký tự đặc biệt. Trường không hợp lệ: ${invalidFieldNames.join(", ")}`
      );
      return;
    }

    try {
      // Convert FormRows to API fields
      const apiFields: Partial<ApiFieldResponse>[] = [];
      let currentOrderNumber = 1;

      formRows.forEach((row) => {
        // Sort fields by their position in the row (left to right)
        const sortedFields = [...row.fields].sort((a, b) => {
          // Maintain the current order in the array as left-to-right positioning
          return 0; // Keep original order since array order represents left-to-right
        });

        sortedFields.forEach((field) => {
          // Include all fields, API will handle hidden fields
          apiFields.push(
            formFieldToApiField(field, currentOrderNumber, row.fields)
          );
          currentOrderNumber++; // Tăng orderNumber tuần tự cho mỗi field
        });
      });

      await updateFormMutation.mutateAsync({
        id: formId,
        payload: {
          name: formName,
          description: formDescription,
          categoryId: formType,
          active: formActive,
          fields: apiFields as any[],
        },
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [queryKeys.formConfig.detail, formId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.formConfig.list],
      });

      // Show success message
      ToastUtils.success("Lưu form thành công!");

      // Navigate back to list
      router.push("/form-config");
    } catch (error: any) {
      console.error("Error saving form:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi lưu form";
      ToastUtils.error(errorMessage);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/form-config");
  };

  // Handle template file upload
  const handleTemplateUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Validate file type (.doc, .docx)
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".doc") && !fileName.endsWith(".docx")) {
      ToastUtils.error("Chỉ được phép upload file .doc hoặc .docx!");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Check if updating existing file or adding new one
      if (templateFile?.id) {
        // Update existing attachment
        await updateAttachmentMutation.mutateAsync({
          attachmentId: templateFile.id,
          formData,
        });
        ToastUtils.success("Cập nhật file mẫu thành công!");
      } else {
        // Add new attachment
        await addAttachmentMutation.mutateAsync({
          formId,
          formData,
        });
        ToastUtils.success("Upload file mẫu thành công!");
      }

      // Set local state to show file info immediately
      setTemplateFile({
        ...templateFile,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (error: any) {
      console.error("Error uploading template:", error);
      ToastUtils.error("Có lỗi xảy ra khi upload file mẫu!");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle template file download
  const handleTemplateDownload = async () => {
    if (!templateFile?.name) return;

    try {
      const blob = await templateFormService.downloadTemplate(
        templateFile.name
      );

      // Response should be blob
      if (blob) {
        saveFile(templateFile.name, blob);
        ToastUtils.success("Tải file thành công!");
      }
    } catch (error: any) {
      console.error("Error downloading template:", error);
      ToastUtils.error("Có lỗi xảy ra khi tải file!");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải form...</p>
        </div>
      </div>
    );
  }

  const selectedField = getAllFields().find((f) => f.id === selectedFieldId);

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbNavigation
        currentPage="Chỉnh sửa form"
        items={[
          { href: "/form-config", label: "Quản trị hệ thống" },
          { label: "Quản lý Form xử lý", href: "/form-config" },
        ]}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Chỉnh sửa form
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-9 text-sm"
            >
              <X className="w-4 h-4 mr-2" /> Hủy
            </Button>
            <Button
              onClick={handleSaveForm}
              disabled={updateFormMutation.isPending}
              className="h-9 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
            >
              {updateFormMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Lưu Form
                </>
              )}
            </Button>
          </div>
        </div>

        <Collapsible open={isFormInfoOpen} onOpenChange={setIsFormInfoOpen}>
          <div className="bg-white rounded-xl shadow-sm border mb-4">
            {/* Header */}
            <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
              <h3 className="text-sm font-semibold text-gray-900">
                Thông tin cơ bản
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isFormInfoOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="py-5 border-t">
                <div className=" w-[85%] mx-auto grid grid-cols-[4fr_4fr_1.5fr] gap-5 pt-5 text-sm">
                  {/* Tên form */}
                  <div>
                    <Label className="text-gray-700 mb-1 block">
                      Tên form <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Nhập tên form"
                      className="h-10"
                      disabled={formIsUse}
                    />
                  </div>

                  {/* Loại form */}
                  <div>
                    <Label className="text-gray-700 mb-1 block">
                      Loại form <span className="text-red-500">*</span>
                    </Label>
                    <SelectCustom
                      options={
                        getFormConfigTypeListQuery?.map((item) => ({
                          label: item.name,
                          value: item.id.toString(),
                        })) || []
                      }
                      value={formType?.toString()}
                      onChange={(val) => {
                        setFormType(Number(val || ""));
                      }}
                      placeholder="Chọn loại form"
                      // disabled={formIsUse}
                      className="h-10"
                    />
                    {formIsUse && (
                      <p className="text-xs text-amber-600 mt-1">
                        Không thể thay đổi khi form đang sử dụng
                      </p>
                    )}
                  </div>

                  {/* Trạng thái */}
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formActive}
                          onChange={(e) => setFormActive(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-9 h-5 rounded-full transition ${
                            formActive ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        />
                        <div
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            formActive ? "translate-x-4" : ""
                          }`}
                        />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Hoạt động
                      </span>
                    </label>
                  </div>

                  {/* Mô tả */}
                  <div className="col-span-3">
                    <Label className="text-gray-700 mb-1 block">Mô tả</Label>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Nhập mô tả cho form"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* File mẫu */}
                  <div className="col-span-3">
                    <Label className="text-gray-700 mb-2 block">
                      File mẫu<span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".doc,.docx"
                        disabled={
                          addAttachmentMutation.isPending ||
                          updateAttachmentMutation.isPending
                        }
                        onChange={handleTemplateUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={addAttachmentMutation.isPending}
                        className="h-9"
                      >
                        {addAttachmentMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent mr-2"></div>
                            Đang upload...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            File mẫu
                          </>
                        )}
                      </Button>

                      {templateFile && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            {templateFile.displayName ?? templateFile.name}
                            {templateFile.fileSize && (
                              <span className="text-gray-500 ml-1">
                                ({formatFileSize(templateFile.fileSize)})
                              </span>
                            )}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleTemplateDownload}
                            disabled={downloadTemplateMutation.isPending}
                            className="h-7 px-2"
                          >
                            {downloadTemplateMutation.isPending ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                            ) : (
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Form Builder Layout */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left */}
            <div className="lg:col-span-3 border-r max-h-[calc(100vh-350px)] overflow-y-auto">
              <FieldTypesSidebar
                fieldTypes={fieldTypes}
                onAddField={(newField) => handleAddField(newField)}
              />
            </div>

            {/* Middle */}
            <div className="lg:col-span-6 border-r max-h-[calc(100vh-350px)] overflow-y-auto">
              <FormCanvas
                formRows={formRows}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedFieldId={selectedFieldId}
                setSelectedFieldId={setSelectedFieldId}
                dragOverRowId={dragOverRowId}
                setDragOverRowId={setDragOverRowId}
                dragOverPosition={dragOverPosition}
                setDragOverPosition={setDragOverPosition}
                dragOverFieldIndex={dragOverFieldIndex}
                setDragOverFieldIndex={setDragOverFieldIndex}
                handleAddField={handleAddField}
                handleDeleteField={handleDeleteField}
                setFormRows={setFormRows}
                formIsUse={formIsUse}
              />
            </div>

            {/* Right */}
            <div className="lg:col-span-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <PropertiesPanel
                selectedField={selectedField}
                selectedFieldId={selectedFieldId}
                setSelectedFieldId={setSelectedFieldId}
                formFields={formFields}
                formRows={formRows}
                setFormRows={setFormRows}
                handleFieldPropertyUpdate={handleFieldPropertyUpdate}
                handleDeleteField={handleDeleteField}
                findFieldInRows={findFieldInRows}
                formName={formName}
                formIsUse={formIsUse}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
