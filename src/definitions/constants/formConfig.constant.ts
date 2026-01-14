/**
 * Cấu hình field cho form-builder
 *
 * - BASIC: các thuộc tính chung (required, label, ...)
 * - TYPE_SPECIFIC: thuộc tính nâng cao theo từng type (maxlength, minValue, ...)
 * - LAYOUT: các setting về layout / hiển thị (apiEndpoint, css, ...)
 *
 * Mục tiêu: gom cấu hình một chỗ, các component `BasicFieldProperties`,
 * `FieldProperties`, `LayoutStylingProperties` chỉ việc đọc config để biết
 * field nào được phép hiển thị.
 */

// Lưu ý: union type này cần đồng bộ với `FieldType` trong
// `src/components/form-config/types.ts`
export type FormBuilderFieldType =
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

/**
 * BASIC CONFIG - các field cơ bản dùng trong `BasicFieldProperties`
 */
export type BasicPropertyKey =
  | "required"
  | "unique"
  | "label"
  | "fieldName"
  | "placeholder"
  | "description"
  | "disabled";

export const FORM_FIELD_BASIC_CONFIG: Record<
  FormBuilderFieldType,
  BasicPropertyKey[]
> = {
  TEXT: [
    "required",
    "unique",
    "label",
    "fieldName",
    "placeholder",
    "description",
    "disabled",
  ],
  TEXTAREA: [
    "required",
    "unique",
    "label",
    "fieldName",
    "placeholder",
    "description",
    "disabled",
  ],
  NUMBER: [
    "required",
    "unique",
    "label",
    "fieldName",
    "placeholder",
    "description",
    "disabled",
  ],
  DATE: [
    "required",
    "unique",
    "label",
    "fieldName",
    "placeholder",
    "description",
    "disabled",
  ],
  DATETIME: [
    "required",
    "unique",
    "label",
    "fieldName",
    "placeholder",
    "description",
    "disabled",
  ],
  CHECKBOX: [
    "required",
    "unique",
    "label",
    "fieldName",
    "description",
    "disabled",
  ],
  RADIO: [
    "required",
    "unique",
    "label",
    "fieldName",
    "description",
    "disabled",
  ],
  SELECT: [
    "required",
    "unique",
    "label",
    "fieldName",
    "description",
    "disabled",
  ],
  TABLE: [
    "required",
    "unique",
    "label",
    "fieldName",
    "description",
    "disabled",
  ],
  LINK: ["required", "unique", "label", "fieldName", "description", "disabled"],
  FILE: ["required", "unique", "label", "fieldName", "disabled"],
  EDITOR: [
    "required",
    "unique",
    "label",
    "fieldName",
    "placeholder",
    "description",
    "disabled",
  ],
  LABEL: ["unique", "label", "fieldName", "description", "disabled"],
};

/**
 * TYPE SPECIFIC CONFIG - các thuộc tính nâng cao theo từng type,
 * được dùng trong `FieldProperties` để bật/tắt từng nhóm UI.
 */
export type TypeSpecificPropertyKey =
  | "maxlength"
  | "min"
  | "max"
  | "dateFormat"
  | "disableDates"
  | "checkboxOptions"
  | "checkboxSelectedByDefault"
  | "checkboxAlign"
  | "options"
  | "radioSelectedByDefault"
  | "tableColumns"
  | "tableRows"
  | "linkText"
  | "linkUrl"
  | "linkTarget"
  | "acceptedTypes"
  | "multipleFiles"
  | "editorReadonly";

export const FORM_FIELD_TYPE_SPECIFIC_CONFIG: Record<
  FormBuilderFieldType,
  TypeSpecificPropertyKey[]
> = {
  TEXT: ["maxlength"],
  TEXTAREA: ["maxlength"],
  NUMBER: ["min", "max"],
  DATE: ["dateFormat", "min", "max", "disableDates"],
  DATETIME: ["dateFormat", "min", "max", "disableDates"],
  CHECKBOX: ["checkboxOptions", "checkboxSelectedByDefault", "checkboxAlign"],
  RADIO: ["options", "radioSelectedByDefault"],
  SELECT: ["options"],
  TABLE: ["tableColumns", "tableRows"],
  LINK: ["linkText", "linkUrl", "linkTarget"],
  FILE: ["acceptedTypes", "max", "multipleFiles"],
  EDITOR: ["maxlength"],
  LABEL: [],
};

/**
 * LAYOUT CONFIG - các setting về layout / hiển thị, dùng trong
 * `LayoutStylingProperties`
 */
export type LayoutPropertyKey = "apiEndpoint" | "css" | "size";

export const FORM_FIELD_LAYOUT_CONFIG: Record<
  FormBuilderFieldType,
  LayoutPropertyKey[]
> = {
  TEXT: ["css", "size"],
  TEXTAREA: ["css", "size"],
  NUMBER: ["css", "size"],
  DATE: ["css", "size"],
  DATETIME: ["css", "size"],
  CHECKBOX: ["apiEndpoint", "css", "size"],
  RADIO: ["apiEndpoint", "css", "size"],
  SELECT: ["apiEndpoint", "css", "size"],
  TABLE: ["css", "size"],
  LINK: ["css", "size"],
  FILE: ["css", "size"],
  EDITOR: ["css", "size"],
  LABEL: ["css", "size"],
};
