export type FieldType =
  | "TEXT"
  | "NUMBER"
  | "DATE"
  | "DATETIME"
  | "TEXTAREA"
  | "SELECT"
  | "CHECKBOX"
  | "RADIO"
  | "TABLE"
  | "LINK"
  | "FILE"
  | "EDITOR"
  | "LABEL";

export interface FormField {
  id: string;
  type: FieldType;
  title: string; // label hiển thị (API: title)
  name?: string; // tên field backend (API: name)
  placeholder?: string;
  description?: string;
  required: boolean;
  hidden?: boolean; // ẩn field (API: hidden)
  readonly?: boolean;
  showOnList?: boolean;
  isSearch?: boolean;
  apiId?: string | number; // API endpoint ID
  css?: string;
  size?: "full" | "half" | "third" | "quarter"; // Field width configuration (discrete)
  inputWidth?: number; // width % (API: inputWidth)
  maxLength?: number; // độ dài tối đa (API: maxLength)
  minLength?: number; // độ dài tối thiểu (API: minLength)
  min?: string;
  max?: string;
  dateFormat?: string;
  disableDates?: string[];
  checkboxText?: string[];
  options?: string[];
  tableColumns?: Array<{
    name: string;
    label: string;
    type: "text" | "checkbox" | "select" | "date" | "datetime";
    apiId?: string | number;
    options?: string[];
    allowAddDeleteRowsCell?: boolean;
    dateFormat?: string;
  }>;
  tableRows?: Record<string, any>[];
  // Link field properties
  linkText?: string;
  linkUrl?: string;
  linkTarget?: "_blank" | "_self";
  // File field properties
  acceptedTypes?: string;
  allowMultiple?: boolean; // cho phép nhiều file (API: allowMultiple)
  unique?: boolean;
  // Link reference for API endpoint fields
  refer?: string; // link tham chiếu cho các field có API endpoint
  editable?: boolean; // cho phép chỉnh sửa dữ liệu
  // API specific fields
  orderNumber?: number;
  formDynamicId?: number;
  fieldConfig?: object | string; // JSON config
  allowOther?: boolean;
}

export interface FormRow {
  id: string;
  fields: FormField[];
}
